import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SlotService } from '../../src/services/SlotService';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Mock Prisma Client
vi.mock('../../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('SlotService', () => {
  let slotService: SlotService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    // Import the mocked prisma
    const { prisma } = require('../../src/config/database');
    prismaMock = prisma as DeepMockProxy<PrismaClient>;
    slotService = new SlotService();
  });

  afterEach(() => {
    mockReset(prismaMock);
  });

  describe('generateSlots', () => {
    it('should generate time slots for a given date range', async () => {
      // Arrange
      const startDate = new Date('2026-05-15');
      const endDate = new Date('2026-05-16');
      const zoneId = 'zone-1';
      const slotsPerDay = 8;

      const mockZone = {
        id: zoneId,
        name: 'Downtown',
        capacity: 50,
        peakHourStart: 12,
        peakHourEnd: 14,
        peakPriceSurcharge: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.deliveryZone.findUnique.mockResolvedValue(mockZone);
      prismaMock.timeSlot.createMany.mockResolvedValue({ count: 16 });

      // Act
      const result = await slotService.generateSlots(startDate, endDate, zoneId, slotsPerDay);

      // Assert
      expect(result.count).toBe(16); // 2 days × 8 slots
      expect(prismaMock.deliveryZone.findUnique).toHaveBeenCalledWith({
        where: { id: zoneId },
      });
      expect(prismaMock.timeSlot.createMany).toHaveBeenCalled();
    });

    it('should throw error if zone not found', async () => {
      // Arrange
      const startDate = new Date('2026-05-15');
      const endDate = new Date('2026-05-16');
      const zoneId = 'invalid-zone';

      prismaMock.deliveryZone.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        slotService.generateSlots(startDate, endDate, zoneId)
      ).rejects.toThrow('Delivery zone not found');
    });

    it('should apply peak hour pricing correctly', async () => {
      // Arrange
      const startDate = new Date('2026-05-15');
      const endDate = new Date('2026-05-15');
      const zoneId = 'zone-1';

      const mockZone = {
        id: zoneId,
        name: 'Downtown',
        capacity: 50,
        peakHourStart: 12,
        peakHourEnd: 14,
        peakPriceSurcharge: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.deliveryZone.findUnique.mockResolvedValue(mockZone);
      
      let capturedSlots: any[] = [];
      prismaMock.timeSlot.createMany.mockImplementation((args: any) => {
        capturedSlots = args.data;
        return Promise.resolve({ count: capturedSlots.length });
      });

      // Act
      await slotService.generateSlots(startDate, endDate, zoneId);

      // Assert
      const peakSlots = capturedSlots.filter((slot: any) => slot.isPeakTime);
      expect(peakSlots.length).toBeGreaterThan(0);
      peakSlots.forEach((slot: any) => {
        expect(slot.basePrice).toBeGreaterThan(0);
      });
    });
  });

  describe('reserveSlot', () => {
    it('should successfully reserve an available slot', async () => {
      // Arrange
      const slotId = 'slot-1';
      const customerId = 'customer-1';

      const mockSlot = {
        id: slotId,
        date: new Date('2026-05-15'),
        startTime: '09:00',
        endTime: '10:00',
        capacity: 50,
        availableCapacity: 50,
        basePrice: 10,
        isPeakTime: false,
        zoneId: 'zone-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockReservation = {
        id: 'reservation-1',
        slotId,
        customerId,
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.timeSlot.findUnique.mockResolvedValue(mockSlot);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });
      prismaMock.reservation.create.mockResolvedValue(mockReservation);
      prismaMock.timeSlot.update.mockResolvedValue({
        ...mockSlot,
        availableCapacity: 49,
      });

      // Act
      const result = await slotService.reserveSlot(slotId, customerId);

      // Assert
      expect(result.id).toBe('reservation-1');
      expect(result.status).toBe('pending');
      expect(prismaMock.reservation.create).toHaveBeenCalled();
    });

    it('should throw error if slot is full', async () => {
      // Arrange
      const slotId = 'slot-1';
      const customerId = 'customer-1';

      const mockSlot = {
        id: slotId,
        date: new Date('2026-05-15'),
        startTime: '09:00',
        endTime: '10:00',
        capacity: 50,
        availableCapacity: 0, // Full
        basePrice: 10,
        isPeakTime: false,
        zoneId: 'zone-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.timeSlot.findUnique.mockResolvedValue(mockSlot);

      // Act & Assert
      await expect(
        slotService.reserveSlot(slotId, customerId)
      ).rejects.toThrow('Time slot is full');
    });

    it('should throw error if slot not found', async () => {
      // Arrange
      const slotId = 'invalid-slot';
      const customerId = 'customer-1';

      prismaMock.timeSlot.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        slotService.reserveSlot(slotId, customerId)
      ).rejects.toThrow('Time slot not found');
    });
  });

  describe('confirmReservation', () => {
    it('should successfully confirm a pending reservation', async () => {
      // Arrange
      const reservationId = 'reservation-1';

      const mockReservation = {
        id: reservationId,
        slotId: 'slot-1',
        customerId: 'customer-1',
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockConfirmedReservation = {
        ...mockReservation,
        status: 'confirmed' as const,
      };

      prismaMock.reservation.findUnique.mockResolvedValue(mockReservation);
      prismaMock.reservation.update.mockResolvedValue(mockConfirmedReservation);

      // Act
      const result = await slotService.confirmReservation(reservationId);

      // Assert
      expect(result.status).toBe('confirmed');
      expect(prismaMock.reservation.update).toHaveBeenCalledWith({
        where: { id: reservationId },
        data: { status: 'confirmed' },
      });
    });

    it('should throw error if reservation not found', async () => {
      // Arrange
      const reservationId = 'invalid-reservation';

      prismaMock.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        slotService.confirmReservation(reservationId)
      ).rejects.toThrow('Reservation not found');
    });

    it('should throw error if reservation is expired', async () => {
      // Arrange
      const reservationId = 'reservation-1';

      const mockReservation = {
        id: reservationId,
        slotId: 'slot-1',
        customerId: 'customer-1',
        status: 'pending' as const,
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.reservation.findUnique.mockResolvedValue(mockReservation);

      // Act & Assert
      await expect(
        slotService.confirmReservation(reservationId)
      ).rejects.toThrow('Reservation has expired');
    });
  });

  describe('releaseExpiredReservations', () => {
    it('should release expired reservations and restore capacity', async () => {
      // Arrange
      const mockExpiredReservations = [
        {
          id: 'reservation-1',
          slotId: 'slot-1',
          customerId: 'customer-1',
          status: 'pending' as const,
          expiresAt: new Date(Date.now() - 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'reservation-2',
          slotId: 'slot-2',
          customerId: 'customer-2',
          status: 'pending' as const,
          expiresAt: new Date(Date.now() - 2000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.reservation.findMany.mockResolvedValue(mockExpiredReservations);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });
      prismaMock.reservation.updateMany.mockResolvedValue({ count: 2 });
      prismaMock.timeSlot.update.mockResolvedValue({} as any);

      // Act
      const result = await slotService.releaseExpiredReservations();

      // Assert
      expect(result.releasedCount).toBe(2);
      expect(prismaMock.reservation.updateMany).toHaveBeenCalled();
    });

    it('should return zero if no expired reservations', async () => {
      // Arrange
      prismaMock.reservation.findMany.mockResolvedValue([]);

      // Act
      const result = await slotService.releaseExpiredReservations();

      // Assert
      expect(result.releasedCount).toBe(0);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available slots for a date and zone', async () => {
      // Arrange
      const date = new Date('2026-05-15');
      const zoneId = 'zone-1';

      const mockSlots = [
        {
          id: 'slot-1',
          date,
          startTime: '09:00',
          endTime: '10:00',
          capacity: 50,
          availableCapacity: 30,
          basePrice: 10,
          isPeakTime: false,
          zoneId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'slot-2',
          date,
          startTime: '10:00',
          endTime: '11:00',
          capacity: 50,
          availableCapacity: 45,
          basePrice: 10,
          isPeakTime: false,
          zoneId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.timeSlot.findMany.mockResolvedValue(mockSlots);

      // Act
      const result = await slotService.getAvailableSlots(date, zoneId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].availableCapacity).toBeGreaterThan(0);
      expect(prismaMock.timeSlot.findMany).toHaveBeenCalledWith({
        where: {
          date: expect.any(Date),
          zoneId,
          availableCapacity: { gt: 0 },
        },
        orderBy: { startTime: 'asc' },
      });
    });

    it('should return empty array if no slots available', async () => {
      // Arrange
      const date = new Date('2026-05-15');
      const zoneId = 'zone-1';

      prismaMock.timeSlot.findMany.mockResolvedValue([]);

      // Act
      const result = await slotService.getAvailableSlots(date, zoneId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});

// Made with Bob
