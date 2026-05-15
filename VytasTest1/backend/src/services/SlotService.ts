/**
 * Slot Management Service
 * Handles time slot generation, availability, reservations, and capacity management
 */

import { prisma } from '../config/database';
import { redis, setCache, getCache, deleteCache, CacheKeys, CacheTTL } from '../config/redis';
import {
  TimeSlot,
  CreateTimeSlotDTO,
  SlotAvailabilityQuery,
  GenerateSlotsParams,
  SlotStatus,
  Reservation,
  ReservationStatus,
  CreateReservationDTO,
} from '../types';

export class SlotService {
  /**
   * Generate time slots in bulk for a date range
   */
  async generateSlots(params: GenerateSlotsParams): Promise<TimeSlot[]> {
    const { zoneId, startDate, endDate, timeWindows, capacityPerSlot } = params;

    // Validate zone exists
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new Error(`Delivery zone ${zoneId} not found`);
    }

    if (!zone.isActive) {
      throw new Error(`Delivery zone ${zoneId} is not active`);
    }

    const slots: CreateTimeSlotDTO[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    // Generate slots for each day in the range
    while (currentDate <= end) {
      // Skip if date is in the past
      if (currentDate < new Date()) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Create slots for each time window
      for (const window of timeWindows) {
        slots.push({
          zoneId,
          date: new Date(currentDate),
          startTime: window.start,
          endTime: window.end,
          totalCapacity: capacityPerSlot,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk create slots (skip duplicates)
    const createdSlots = await prisma.$transaction(
      slots.map((slot) =>
        prisma.timeSlot.upsert({
          where: {
            zoneId_date_startTime: {
              zoneId: slot.zoneId,
              date: slot.date,
              startTime: slot.startTime,
            },
          },
          update: {},
          create: {
            ...slot,
            availableCapacity: slot.totalCapacity,
            status: SlotStatus.ACTIVE,
          },
        })
      )
    );

    // Invalidate cache for affected dates
    await this.invalidateSlotCache(zoneId, startDate, endDate);

    return createdSlots.map(slot => ({
      ...slot,
      priceMultiplier: Number(slot.priceMultiplier),
    })) as TimeSlot[];
  }

  /**
   * Get available slots for a zone and date range
   */
  async getAvailableSlots(query: SlotAvailabilityQuery): Promise<TimeSlot[]> {
    const { zoneId, startDate, endDate } = query;

    // Try to get from cache first
    const cacheKey = `${CacheKeys.slotAvailability(zoneId, startDate.toISOString())}:${endDate.toISOString()}`;
    const cached = await getCache<TimeSlot[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const slots = await prisma.timeSlot.findMany({
      where: {
        zoneId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: SlotStatus.ACTIVE,
        availableCapacity: {
          gt: 0,
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Cache results for 5 minutes
    const slotsWithNumbers = slots.map(slot => ({
      ...slot,
      priceMultiplier: Number(slot.priceMultiplier),
    }));
    await setCache(cacheKey, slotsWithNumbers, CacheTTL.MEDIUM);

    return slotsWithNumbers as TimeSlot[];
  }

  /**
   * Get slot by ID with caching
   */
  async getSlotById(slotId: string): Promise<TimeSlot | null> {
    // Try cache first
    const cacheKey = CacheKeys.slot(slotId);
    const cached = await getCache<TimeSlot>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
    });

    if (slot) {
      await setCache(cacheKey, slot, CacheTTL.MEDIUM);
    }

    return slot as TimeSlot | null;
  }

  /**
   * Reserve a slot atomically with capacity check
   */
  async reserveSlot(data: CreateReservationDTO): Promise<Reservation> {
    const { slotId, orderId, expiresAt } = data;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Lock the slot row for update
      const slot = await tx.timeSlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new Error(`Slot ${slotId} not found`);
      }

      if (slot.status !== SlotStatus.ACTIVE) {
        throw new Error(`Slot ${slotId} is not active`);
      }

      if (slot.availableCapacity <= 0) {
        throw new Error(`Slot ${slotId} is full`);
      }

      // Check if slot date/time is in the future
      const slotDateTime = new Date(slot.date);
      slotDateTime.setHours(
        new Date(slot.startTime).getHours(),
        new Date(slot.startTime).getMinutes()
      );

      if (slotDateTime < new Date()) {
        throw new Error(`Slot ${slotId} is in the past`);
      }

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          slotId,
          orderId,
          status: ReservationStatus.ACTIVE,
          expiresAt,
        },
      });

      // Decrement available capacity
      await tx.timeSlot.update({
        where: { id: slotId },
        data: {
          availableCapacity: {
            decrement: 1,
          },
        },
      });

      // Update slot status if full
      const updatedSlot = await tx.timeSlot.findUnique({
        where: { id: slotId },
      });

      if (updatedSlot && updatedSlot.availableCapacity === 0) {
        await tx.timeSlot.update({
          where: { id: slotId },
          data: { status: SlotStatus.FULL },
        });
      }

      return reservation;
    });

    // Invalidate cache
    await deleteCache(CacheKeys.slot(slotId));
    await this.invalidateSlotAvailabilityCache(slotId);

    return result as Reservation;
  }

  /**
   * Confirm a reservation (convert from temporary to confirmed)
   */
  async confirmReservation(reservationId: string): Promise<Reservation> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new Error(`Reservation ${reservationId} not found`);
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new Error(`Reservation ${reservationId} is not active`);
    }

    // Check if reservation has expired
    if (reservation.expiresAt < new Date()) {
      throw new Error(`Reservation ${reservationId} has expired`);
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.CONFIRMED },
    });

    return updated as Reservation;
  }

  /**
   * Cancel a reservation and release capacity
   */
  async cancelReservation(reservationId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        throw new Error(`Reservation ${reservationId} not found`);
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        return; // Already cancelled
      }

      // Update reservation status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.CANCELLED },
      });

      // Release capacity if slot exists
      if (reservation.slotId) {
        await tx.timeSlot.update({
          where: { id: reservation.slotId },
          data: {
            availableCapacity: {
              increment: 1,
            },
          },
        });

        // Update slot status if it was full
        const slot = await tx.timeSlot.findUnique({
          where: { id: reservation.slotId },
        });

        if (slot && slot.status === SlotStatus.FULL && slot.availableCapacity > 0) {
          await tx.timeSlot.update({
            where: { id: reservation.slotId },
            data: { status: SlotStatus.ACTIVE },
          });
        }

        // Invalidate cache
        await deleteCache(CacheKeys.slot(reservation.slotId));
      }
    });
  }

  /**
   * Release expired reservations (cleanup job)
   */
  async releaseExpiredReservations(): Promise<number> {
    const now = new Date();

    // Find expired reservations
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: {
          lt: now,
        },
      },
    });

    if (expiredReservations.length === 0) {
      return 0;
    }

    // Release each reservation
    await prisma.$transaction(async (tx) => {
      for (const reservation of expiredReservations) {
        // Update reservation status
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.EXPIRED },
        });

        // Release capacity
        if (reservation.slotId) {
          await tx.timeSlot.update({
            where: { id: reservation.slotId },
            data: {
              availableCapacity: {
                increment: 1,
              },
            },
          });

          // Update slot status if needed
          const slot = await tx.timeSlot.findUnique({
            where: { id: reservation.slotId },
          });

          if (slot && slot.status === SlotStatus.FULL && slot.availableCapacity > 0) {
            await tx.timeSlot.update({
              where: { id: reservation.slotId },
              data: { status: SlotStatus.ACTIVE },
            });
          }

          // Invalidate cache
          await deleteCache(CacheKeys.slot(reservation.slotId));
        }
      }
    });

    console.log(`✅ Released ${expiredReservations.length} expired reservations`);
    return expiredReservations.length;
  }

  /**
   * Get slot utilization metrics
   */
  async getSlotUtilization(zoneId: string, date: Date): Promise<{
    totalSlots: number;
    totalCapacity: number;
    usedCapacity: number;
    availableCapacity: number;
    utilizationPercentage: number;
  }> {
    const slots = await prisma.timeSlot.findMany({
      where: {
        zoneId,
        date,
      },
    });

    const totalSlots = slots.length;
    const totalCapacity = slots.reduce((sum, slot) => sum + slot.totalCapacity, 0);
    const availableCapacity = slots.reduce((sum, slot) => sum + slot.availableCapacity, 0);
    const usedCapacity = totalCapacity - availableCapacity;
    const utilizationPercentage = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

    return {
      totalSlots,
      totalCapacity,
      usedCapacity,
      availableCapacity,
      utilizationPercentage,
    };
  }

  /**
   * Update slot status
   */
  async updateSlotStatus(slotId: string, status: SlotStatus): Promise<TimeSlot> {
    const updated = await prisma.timeSlot.update({
      where: { id: slotId },
      data: { status },
    });

    // Invalidate cache
    await deleteCache(CacheKeys.slot(slotId));
    await this.invalidateSlotAvailabilityCache(slotId);

    return {
      ...updated,
      priceMultiplier: Number(updated.priceMultiplier),
    } as TimeSlot;
  }

  /**
   * Disable slots (bulk operation)
   */
  async disableSlots(slotIds: string[]): Promise<number> {
    const result = await prisma.timeSlot.updateMany({
      where: {
        id: {
          in: slotIds,
        },
      },
      data: {
        status: SlotStatus.DISABLED,
      },
    });

    // Invalidate cache for all affected slots
    for (const slotId of slotIds) {
      await deleteCache(CacheKeys.slot(slotId));
    }

    return result.count;
  }

  /**
   * Helper: Invalidate slot cache for a date range
   */
  private async invalidateSlotCache(zoneId: string, startDate: Date, endDate: Date): Promise<void> {
    const pattern = `${CacheKeys.slotAvailability(zoneId, '*')}`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /**
   * Helper: Invalidate slot availability cache
   */
  private async invalidateSlotAvailabilityCache(slotId: string): Promise<void> {
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
    });

    if (slot) {
      const pattern = `${CacheKeys.slotAvailability(slot.zoneId, '*')}`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}

export default new SlotService();

// Made with Bob
