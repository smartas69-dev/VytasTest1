/**
 * Fleet Management Service
 * Handles truck and driver management, availability, and assignments
 */

import { prisma } from '../config/database';
import { setCache, getCache, deleteCache, CacheKeys, CacheTTL } from '../config/redis';
import {
  Truck,
  Driver,
  CreateTruckDTO,
  CreateDriverDTO,
  TruckStatus,
  DriverStatus,
  TruckAvailability,
  TruckType,
} from '../types';

export class FleetService {
  /**
   * Get all trucks with optional filtering
   */
  async getTrucks(filters?: {
    status?: TruckStatus;
    type?: TruckType;
    warehouseId?: string;
    hasRefrigeration?: boolean;
  }): Promise<Truck[]> {
    const trucks = await prisma.truck.findMany({
      where: {
        status: filters?.status,
        type: filters?.type,
        warehouseId: filters?.warehouseId,
        hasRefrigeration: filters?.hasRefrigeration,
      },
      orderBy: { registrationNumber: 'asc' },
    });

    return trucks.map(this.convertTruckDecimals);
  }

  /**
   * Get truck by ID with caching
   */
  async getTruckById(truckId: string): Promise<Truck | null> {
    // Try cache first
    const cacheKey = CacheKeys.truck(truckId);
    const cached = await getCache<Truck>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const truck = await prisma.truck.findUnique({
      where: { id: truckId },
    });

    if (truck) {
      const converted = this.convertTruckDecimals(truck);
      await setCache(cacheKey, converted, CacheTTL.MEDIUM);
      return converted;
    }

    return null;
  }

  /**
   * Create a new truck
   */
  async createTruck(data: CreateTruckDTO): Promise<Truck> {
    const truck = await prisma.truck.create({
      data: {
        ...data,
        status: TruckStatus.AVAILABLE,
        currentWeightKg: 0,
        currentVolumeM3: 0,
      },
    });

    return this.convertTruckDecimals(truck);
  }

  /**
   * Update truck status
   */
  async updateTruckStatus(truckId: string, status: TruckStatus): Promise<Truck> {
    const truck = await prisma.truck.update({
      where: { id: truckId },
      data: { status },
    });

    // Invalidate cache
    await deleteCache(CacheKeys.truck(truckId));
    await deleteCache(CacheKeys.truckAvailability(truckId));

    return this.convertTruckDecimals(truck);
  }

  /**
   * Get truck availability with capacity information
   */
  async getTruckAvailability(truckId: string): Promise<TruckAvailability> {
    // Try cache first
    const cacheKey = CacheKeys.truckAvailability(truckId);
    const cached = await getCache<TruckAvailability>(cacheKey);

    if (cached) {
      return cached;
    }

    const truck = await this.getTruckById(truckId);

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const isAvailable = truck.status === TruckStatus.AVAILABLE;
    const currentLoad = (truck.currentWeightKg / truck.maxWeightKg) * 100;

    const availability: TruckAvailability = {
      truckId: truck.id,
      isAvailable,
      currentLoad,
      availableCapacity: {
        weight: truck.maxWeightKg - truck.currentWeightKg,
        volume: truck.maxVolumeM3 - truck.currentVolumeM3,
      },
      nextAvailableTime: isAvailable ? new Date() : undefined,
    };

    // Cache for 2 minutes
    await setCache(cacheKey, availability, 120);

    return availability;
  }

  /**
   * Check if truck can accommodate load
   */
  async checkLoadCapacity(
    truckId: string,
    requiredWeight: number,
    requiredVolume: number
  ): Promise<{
    canAccommodate: boolean;
    weightAvailable: number;
    volumeAvailable: number;
    weightUtilization: number;
    volumeUtilization: number;
  }> {
    const truck = await this.getTruckById(truckId);

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const weightAvailable = truck.maxWeightKg - truck.currentWeightKg;
    const volumeAvailable = truck.maxVolumeM3 - truck.currentVolumeM3;

    const canAccommodate = 
      weightAvailable >= requiredWeight && 
      volumeAvailable >= requiredVolume;

    const weightUtilization = 
      ((truck.currentWeightKg + requiredWeight) / truck.maxWeightKg) * 100;
    const volumeUtilization = 
      ((truck.currentVolumeM3 + requiredVolume) / truck.maxVolumeM3) * 100;

    return {
      canAccommodate,
      weightAvailable,
      volumeAvailable,
      weightUtilization,
      volumeUtilization,
    };
  }

  /**
   * Update truck load (current weight and volume)
   */
  async updateTruckLoad(
    truckId: string,
    weightKg: number,
    volumeM3: number
  ): Promise<Truck> {
    const truck = await this.getTruckById(truckId);

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    // Validate capacity
    if (weightKg > truck.maxWeightKg) {
      throw new Error(`Weight ${weightKg}kg exceeds truck capacity ${truck.maxWeightKg}kg`);
    }

    if (volumeM3 > truck.maxVolumeM3) {
      throw new Error(`Volume ${volumeM3}m³ exceeds truck capacity ${truck.maxVolumeM3}m³`);
    }

    const updated = await prisma.truck.update({
      where: { id: truckId },
      data: {
        currentWeightKg: weightKg,
        currentVolumeM3: volumeM3,
      },
    });

    // Invalidate cache
    await deleteCache(CacheKeys.truck(truckId));
    await deleteCache(CacheKeys.truckAvailability(truckId));

    return this.convertTruckDecimals(updated);
  }

  /**
   * Get available trucks for a specific requirement
   */
  async getAvailableTrucks(requirements?: {
    minWeightCapacity?: number;
    minVolumeCapacity?: number;
    requiresRefrigeration?: boolean;
    warehouseId?: string;
  }): Promise<Truck[]> {
    const trucks = await prisma.truck.findMany({
      where: {
        status: TruckStatus.AVAILABLE,
        warehouseId: requirements?.warehouseId,
        hasRefrigeration: requirements?.requiresRefrigeration ? true : undefined,
        maxWeightKg: requirements?.minWeightCapacity 
          ? { gte: requirements.minWeightCapacity }
          : undefined,
        maxVolumeM3: requirements?.minVolumeCapacity
          ? { gte: requirements.minVolumeCapacity }
          : undefined,
      },
      orderBy: [
        { maxWeightKg: 'desc' },
        { maxVolumeM3: 'desc' },
      ],
    });

    return trucks.map(this.convertTruckDecimals);
  }

  /**
   * Get truck utilization metrics
   */
  async getTruckUtilization(truckId: string): Promise<{
    truckId: string;
    weightUtilization: number;
    volumeUtilization: number;
    overallUtilization: number;
    status: TruckStatus;
  }> {
    const truck = await this.getTruckById(truckId);

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const weightUtilization = (truck.currentWeightKg / truck.maxWeightKg) * 100;
    const volumeUtilization = (truck.currentVolumeM3 / truck.maxVolumeM3) * 100;
    const overallUtilization = Math.max(weightUtilization, volumeUtilization);

    return {
      truckId: truck.id,
      weightUtilization,
      volumeUtilization,
      overallUtilization,
      status: truck.status as TruckStatus,
    };
  }

  // ============================================================================
  // Driver Management
  // ============================================================================

  /**
   * Get all drivers with optional filtering
   */
  async getDrivers(filters?: {
    status?: DriverStatus;
    currentTruckId?: string;
  }): Promise<Driver[]> {
    const drivers = await prisma.driver.findMany({
      where: {
        status: filters?.status,
        currentTruckId: filters?.currentTruckId,
      },
      orderBy: { employeeId: 'asc' },
    });

    return drivers as Driver[];
  }

  /**
   * Get driver by ID with caching
   */
  async getDriverById(driverId: string): Promise<Driver | null> {
    // Try cache first
    const cacheKey = CacheKeys.driver(driverId);
    const cached = await getCache<Driver>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (driver) {
      await setCache(cacheKey, driver, CacheTTL.MEDIUM);
      return driver as Driver;
    }

    return null;
  }

  /**
   * Create a new driver
   */
  async createDriver(data: CreateDriverDTO): Promise<Driver> {
    // Validate license expiry is in the future
    if (data.licenseExpiry < new Date()) {
      throw new Error('License expiry date must be in the future');
    }

    const driver = await prisma.driver.create({
      data: {
        ...data,
        status: DriverStatus.AVAILABLE,
        maxHoursPerDay: data.maxHoursPerDay || 8,
      },
    });

    return driver as Driver;
  }

  /**
   * Update driver status
   */
  async updateDriverStatus(driverId: string, status: DriverStatus): Promise<Driver> {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });

    // Invalidate cache
    await deleteCache(CacheKeys.driver(driverId));

    return driver as Driver;
  }

  /**
   * Assign driver to truck
   */
  async assignDriverToTruck(driverId: string, truckId: string): Promise<{
    driver: Driver;
    truck: Truck;
  }> {
    // Validate driver exists and is available
    const driver = await this.getDriverById(driverId);
    if (!driver) {
      throw new Error(`Driver ${driverId} not found`);
    }

    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error(`Driver ${driverId} is not available (status: ${driver.status})`);
    }

    // Validate truck exists and is available
    const truck = await this.getTruckById(truckId);
    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    if (truck.status !== TruckStatus.AVAILABLE) {
      throw new Error(`Truck ${truckId} is not available (status: ${truck.status})`);
    }

    // Check if truck already has a driver
    const existingDriver = await prisma.driver.findFirst({
      where: { currentTruckId: truckId },
    });

    if (existingDriver) {
      throw new Error(`Truck ${truckId} already has driver ${existingDriver.employeeId} assigned`);
    }

    // Perform assignment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update driver
      const updatedDriver = await tx.driver.update({
        where: { id: driverId },
        data: {
          currentTruckId: truckId,
          status: DriverStatus.ON_DUTY,
        },
      });

      // Update truck status
      const updatedTruck = await tx.truck.update({
        where: { id: truckId },
        data: {
          status: TruckStatus.AVAILABLE, // Keep available until loading starts
        },
      });

      return {
        driver: updatedDriver,
        truck: updatedTruck,
      };
    });

    // Invalidate caches
    await deleteCache(CacheKeys.driver(driverId));
    await deleteCache(CacheKeys.truck(truckId));
    await deleteCache(CacheKeys.truckAvailability(truckId));

    return {
      driver: result.driver as Driver,
      truck: this.convertTruckDecimals(result.truck),
    };
  }

  /**
   * Unassign driver from truck
   */
  async unassignDriverFromTruck(driverId: string): Promise<Driver> {
    const driver = await this.getDriverById(driverId);

    if (!driver) {
      throw new Error(`Driver ${driverId} not found`);
    }

    if (!driver.currentTruckId) {
      throw new Error(`Driver ${driverId} is not assigned to any truck`);
    }

    const truckId = driver.currentTruckId;

    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: {
        currentTruckId: null,
        status: DriverStatus.AVAILABLE,
      },
    });

    // Invalidate caches
    await deleteCache(CacheKeys.driver(driverId));
    await deleteCache(CacheKeys.truck(truckId));
    await deleteCache(CacheKeys.truckAvailability(truckId));

    return updated as Driver;
  }

  /**
   * Get available drivers
   */
  async getAvailableDrivers(): Promise<Driver[]> {
    const drivers = await prisma.driver.findMany({
      where: {
        status: DriverStatus.AVAILABLE,
        licenseExpiry: {
          gte: new Date(),
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    return drivers as Driver[];
  }

  /**
   * Check driver availability
   */
  async checkDriverAvailability(driverId: string): Promise<{
    isAvailable: boolean;
    status: DriverStatus;
    currentTruckId: string | null;
    licenseValid: boolean;
  }> {
    const driver = await this.getDriverById(driverId);

    if (!driver) {
      throw new Error(`Driver ${driverId} not found`);
    }

    const licenseValid = driver.licenseExpiry >= new Date();
    const isAvailable = 
      driver.status === DriverStatus.AVAILABLE && 
      licenseValid &&
      !driver.currentTruckId;

    return {
      isAvailable,
      status: driver.status as DriverStatus,
      currentTruckId: driver.currentTruckId || null,
      licenseValid,
    };
  }

  /**
   * Get fleet statistics
   */
  async getFleetStatistics(): Promise<{
    totalTrucks: number;
    availableTrucks: number;
    inTransitTrucks: number;
    maintenanceTrucks: number;
    totalDrivers: number;
    availableDrivers: number;
    onDutyDrivers: number;
    averageTruckUtilization: number;
  }> {
    const [trucks, drivers] = await Promise.all([
      prisma.truck.findMany(),
      prisma.driver.findMany(),
    ]);

    const totalTrucks = trucks.length;
    const availableTrucks = trucks.filter(t => t.status === TruckStatus.AVAILABLE).length;
    const inTransitTrucks = trucks.filter(t => t.status === TruckStatus.IN_TRANSIT).length;
    const maintenanceTrucks = trucks.filter(t => t.status === TruckStatus.MAINTENANCE).length;

    const totalDrivers = drivers.length;
    const availableDrivers = drivers.filter(d => d.status === DriverStatus.AVAILABLE).length;
    const onDutyDrivers = drivers.filter(d => d.status === DriverStatus.ON_DUTY).length;

    // Calculate average truck utilization
    let totalUtilization = 0;
    for (const truck of trucks) {
      const weightUtil = (Number(truck.currentWeightKg) / Number(truck.maxWeightKg)) * 100;
      const volumeUtil = (Number(truck.currentVolumeM3) / Number(truck.maxVolumeM3)) * 100;
      totalUtilization += Math.max(weightUtil, volumeUtil);
    }
    const averageTruckUtilization = totalTrucks > 0 ? totalUtilization / totalTrucks : 0;

    return {
      totalTrucks,
      availableTrucks,
      inTransitTrucks,
      maintenanceTrucks,
      totalDrivers,
      availableDrivers,
      onDutyDrivers,
      averageTruckUtilization,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Convert Prisma Decimal fields to numbers for Truck
   */
  private convertTruckDecimals(truck: any): Truck {
    return {
      ...truck,
      maxWeightKg: Number(truck.maxWeightKg),
      maxVolumeM3: Number(truck.maxVolumeM3),
      currentWeightKg: Number(truck.currentWeightKg),
      currentVolumeM3: Number(truck.currentVolumeM3),
    } as Truck;
  }
}

export default new FleetService();

// Made with Bob
