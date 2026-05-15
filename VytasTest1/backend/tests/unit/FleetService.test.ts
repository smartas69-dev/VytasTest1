import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { FleetService } from '../../src/services/FleetService';
import { TruckStatus, DriverStatus, TruckType } from '../../src/types';

// Mock Prisma Client
vi.mock('../../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock Redis
vi.mock('../../src/config/redis', () => ({
  setCache: vi.fn(),
  getCache: vi.fn().mockResolvedValue(null),
  deleteCache: vi.fn(),
  CacheKeys: {
    truck: (id: string) => `truck:${id}`,
    driver: (id: string) => `driver:${id}`,
    truckAvailability: (id: string) => `truck:availability:${id}`,
  },
  CacheTTL: {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
  },
}));

// Import mocked prisma
import { prisma } from '../../src/config/database';

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('FleetService', () => {
  let fleetService: FleetService;

  beforeEach(() => {
    mockReset(mockPrisma);
    fleetService = new FleetService();
  });

  describe('createTruck', () => {
    it('should create a new truck successfully', async () => {
      const truckData = {
        registrationNumber: 'ABC-123',
        type: TruckType.VAN,
        maxWeightKg: 1000,
        maxVolumeM3: 15,
        hasRefrigeration: false,
        hasLiftGate: true,
      };

      const mockTruck = {
        id: 'truck-1',
        ...truckData,
        status: TruckStatus.AVAILABLE,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        currentLocation: null,
        warehouseId: null,
        fuelType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.truck.create.mockResolvedValue(mockTruck as any);

      const result = await fleetService.createTruck(truckData);

      expect(result.id).toBe('truck-1');
      expect(result.registrationNumber).toBe('ABC-123');
      expect(result.status).toBe(TruckStatus.AVAILABLE);
      expect(mockPrisma.truck.create).toHaveBeenCalled();
    });

    it('should throw error if registration number already exists', async () => {
      const truckData = {
        registrationNumber: 'ABC-123',
        type: TruckType.VAN,
        maxWeightKg: 1000,
        maxVolumeM3: 15,
      };

      mockPrisma.truck.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`registrationNumber`)')
      );

      await expect(fleetService.createTruck(truckData)).rejects.toThrow();
    });
  });

  describe('createDriver', () => {
    it('should create a new driver successfully', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const driverData = {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        maxHoursPerDay: 8,
      };

      const mockDriver = {
        id: 'driver-1',
        ...driverData,
        status: DriverStatus.AVAILABLE,
        currentTruckId: null,
        shiftStart: null,
        shiftEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.driver.create.mockResolvedValue(mockDriver as any);

      const result = await fleetService.createDriver(driverData);

      expect(result.id).toBe('driver-1');
      expect(result.firstName).toBe('John');
      expect(result.status).toBe(DriverStatus.AVAILABLE);
      expect(mockPrisma.driver.create).toHaveBeenCalled();
    });

    it('should throw error if license is expired', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const driverData = {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: pastDate,
      };

      await expect(fleetService.createDriver(driverData)).rejects.toThrow(
        'License expiry date must be in the future'
      );
    });
  });

  describe('getTrucks', () => {
    it('should return all trucks with optional filters', async () => {
      const mockTrucks = [
        {
          id: 'truck-1',
          registrationNumber: 'ABC-123',
          type: TruckType.VAN,
          maxWeightKg: 1000,
          maxVolumeM3: 15,
          currentWeightKg: 0,
          currentVolumeM3: 0,
          status: TruckStatus.AVAILABLE,
          hasRefrigeration: false,
          hasLiftGate: true,
          currentLocation: null,
          warehouseId: null,
          fuelType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.truck.findMany.mockResolvedValue(mockTrucks as any);

      const result = await fleetService.getTrucks({ status: TruckStatus.AVAILABLE });

      expect(result).toHaveLength(1);
      expect(result[0].registrationNumber).toBe('ABC-123');
      expect(mockPrisma.truck.findMany).toHaveBeenCalled();
    });
  });

  describe('getAvailableTrucks', () => {
    it('should return available trucks with requirements', async () => {
      const mockTrucks = [
        {
          id: 'truck-1',
          registrationNumber: 'ABC-123',
          type: TruckType.VAN,
          maxWeightKg: 1000,
          maxVolumeM3: 15,
          currentWeightKg: 0,
          currentVolumeM3: 0,
          status: TruckStatus.AVAILABLE,
          hasRefrigeration: false,
          hasLiftGate: true,
          currentLocation: null,
          warehouseId: 'warehouse-1',
          fuelType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.truck.findMany.mockResolvedValue(mockTrucks as any);

      const result = await fleetService.getAvailableTrucks({
        minWeightCapacity: 500,
        warehouseId: 'warehouse-1',
      });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TruckStatus.AVAILABLE);
      expect(mockPrisma.truck.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no trucks available', async () => {
      mockPrisma.truck.findMany.mockResolvedValue([]);

      const result = await fleetService.getAvailableTrucks();

      expect(result).toEqual([]);
    });
  });

  describe('getDrivers', () => {
    it('should return all drivers with optional filters', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockDrivers = [
        {
          id: 'driver-1',
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          licenseNumber: 'DL123456',
          licenseExpiry: futureDate,
          status: DriverStatus.AVAILABLE,
          currentTruckId: null,
          shiftStart: null,
          shiftEnd: null,
          maxHoursPerDay: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.driver.findMany.mockResolvedValue(mockDrivers as any);

      const result = await fleetService.getDrivers({ status: DriverStatus.AVAILABLE });

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
      expect(mockPrisma.driver.findMany).toHaveBeenCalled();
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return available drivers with valid licenses', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockDrivers = [
        {
          id: 'driver-1',
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          licenseNumber: 'DL123456',
          licenseExpiry: futureDate,
          status: DriverStatus.AVAILABLE,
          currentTruckId: null,
          shiftStart: null,
          shiftEnd: null,
          maxHoursPerDay: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.driver.findMany.mockResolvedValue(mockDrivers as any);

      const result = await fleetService.getAvailableDrivers();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(DriverStatus.AVAILABLE);
      expect(mockPrisma.driver.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no drivers available', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);

      const result = await fleetService.getAvailableDrivers();

      expect(result).toEqual([]);
    });
  });

  describe('assignDriverToTruck', () => {
    it('should assign driver to truck successfully', async () => {
      const driverId = 'driver-1';
      const truckId = 'truck-1';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockDriver = {
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status: DriverStatus.AVAILABLE,
        currentTruckId: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTruck = {
        id: truckId,
        registrationNumber: 'ABC-123',
        type: TruckType.VAN,
        maxWeightKg: 1000,
        maxVolumeM3: 15,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        status: TruckStatus.AVAILABLE,
        hasRefrigeration: false,
        hasLiftGate: true,
        currentLocation: null,
        warehouseId: null,
        fuelType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedDriver = {
        ...mockDriver,
        currentTruckId: truckId,
        status: DriverStatus.ON_DUTY,
      };

      mockPrisma.driver.findUnique.mockResolvedValue(mockDriver as any);
      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.driver.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          driver: {
            update: vi.fn().mockResolvedValue(updatedDriver),
          },
          truck: {
            update: vi.fn().mockResolvedValue(mockTruck),
          },
        });
      });

      const result = await fleetService.assignDriverToTruck(driverId, truckId);

      expect(result.driver.currentTruckId).toBe(truckId);
      expect(result.driver.status).toBe(DriverStatus.ON_DUTY);
      expect(result.truck.id).toBe(truckId);
    });

    it('should throw error if driver not found', async () => {
      const driverId = 'driver-1';
      const truckId = 'truck-1';

      mockPrisma.driver.findUnique.mockResolvedValue(null);

      await expect(
        fleetService.assignDriverToTruck(driverId, truckId)
      ).rejects.toThrow('Driver driver-1 not found');
    });

    it('should throw error if truck not found', async () => {
      const driverId = 'driver-1';
      const truckId = 'truck-1';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      mockPrisma.driver.findUnique.mockResolvedValue({
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status: DriverStatus.AVAILABLE,
        currentTruckId: null,
        phone: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockPrisma.truck.findUnique.mockResolvedValue(null);

      await expect(
        fleetService.assignDriverToTruck(driverId, truckId)
      ).rejects.toThrow('Truck truck-1 not found');
    });

    it('should throw error if driver not available', async () => {
      const driverId = 'driver-1';
      const truckId = 'truck-1';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      mockPrisma.driver.findUnique.mockResolvedValue({
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status: DriverStatus.ON_DUTY,
        currentTruckId: 'truck-2',
        phone: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        fleetService.assignDriverToTruck(driverId, truckId)
      ).rejects.toThrow('Driver driver-1 is not available');
    });
  });

  describe('unassignDriverFromTruck', () => {
    it('should unassign driver from truck successfully', async () => {
      const driverId = 'driver-1';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockDriver = {
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status: DriverStatus.ON_DUTY,
        currentTruckId: 'truck-1',
        phone: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedDriver = {
        ...mockDriver,
        currentTruckId: null,
        status: DriverStatus.AVAILABLE,
      };

      mockPrisma.driver.findUnique.mockResolvedValue(mockDriver as any);
      mockPrisma.driver.update.mockResolvedValue(updatedDriver as any);

      const result = await fleetService.unassignDriverFromTruck(driverId);

      expect(result.currentTruckId).toBeNull();
      expect(result.status).toBe(DriverStatus.AVAILABLE);
      expect(mockPrisma.driver.update).toHaveBeenCalled();
    });

    it('should throw error if driver not assigned to any truck', async () => {
      const driverId = 'driver-1';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      mockPrisma.driver.findUnique.mockResolvedValue({
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status: DriverStatus.AVAILABLE,
        currentTruckId: null,
        phone: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await expect(
        fleetService.unassignDriverFromTruck(driverId)
      ).rejects.toThrow('Driver driver-1 is not assigned to any truck');
    });
  });

  describe('updateTruckStatus', () => {
    it('should update truck status successfully', async () => {
      const truckId = 'truck-1';
      const status = TruckStatus.MAINTENANCE;

      const mockTruck = {
        id: truckId,
        registrationNumber: 'ABC-123',
        type: TruckType.VAN,
        maxWeightKg: 1000,
        maxVolumeM3: 15,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        status,
        hasRefrigeration: false,
        hasLiftGate: true,
        currentLocation: null,
        warehouseId: null,
        fuelType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.truck.update.mockResolvedValue(mockTruck as any);

      const result = await fleetService.updateTruckStatus(truckId, status);

      expect(result.status).toBe(TruckStatus.MAINTENANCE);
      expect(mockPrisma.truck.update).toHaveBeenCalled();
    });
  });

  describe('updateDriverStatus', () => {
    it('should update driver status successfully', async () => {
      const driverId = 'driver-1';
      const status = DriverStatus.ON_DUTY;
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockDriver = {
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status,
        currentTruckId: 'truck-1',
        phone: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.driver.update.mockResolvedValue(mockDriver as any);

      const result = await fleetService.updateDriverStatus(driverId, status);

      expect(result.status).toBe(DriverStatus.ON_DUTY);
      expect(mockPrisma.driver.update).toHaveBeenCalled();
    });
  });

  describe('getFleetStatistics', () => {
    it('should return fleet statistics', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockTrucks = [
        {
          id: 'truck-1',
          status: TruckStatus.AVAILABLE,
          maxWeightKg: 1000,
          maxVolumeM3: 15,
          currentWeightKg: 500,
          currentVolumeM3: 7.5,
        },
        {
          id: 'truck-2',
          status: TruckStatus.IN_TRANSIT,
          maxWeightKg: 1200,
          maxVolumeM3: 18,
          currentWeightKg: 600,
          currentVolumeM3: 9,
        },
        {
          id: 'truck-3',
          status: TruckStatus.MAINTENANCE,
          maxWeightKg: 1000,
          maxVolumeM3: 15,
          currentWeightKg: 0,
          currentVolumeM3: 0,
        },
      ];

      const mockDrivers = [
        { id: 'driver-1', status: DriverStatus.AVAILABLE },
        { id: 'driver-2', status: DriverStatus.ON_DUTY },
        { id: 'driver-3', status: DriverStatus.OFF_DUTY },
      ];

      mockPrisma.truck.findMany.mockResolvedValue(mockTrucks as any);
      mockPrisma.driver.findMany.mockResolvedValue(mockDrivers as any);

      const result = await fleetService.getFleetStatistics();

      expect(result.totalTrucks).toBe(3);
      expect(result.availableTrucks).toBe(1);
      expect(result.inTransitTrucks).toBe(1);
      expect(result.maintenanceTrucks).toBe(1);
      expect(result.totalDrivers).toBe(3);
      expect(result.availableDrivers).toBe(1);
      expect(result.onDutyDrivers).toBe(1);
      expect(result.averageTruckUtilization).toBeGreaterThan(0);
    });

    it('should return zero statistics when no fleet exists', async () => {
      mockPrisma.truck.findMany.mockResolvedValue([]);
      mockPrisma.driver.findMany.mockResolvedValue([]);

      const result = await fleetService.getFleetStatistics();

      expect(result.totalTrucks).toBe(0);
      expect(result.availableTrucks).toBe(0);
      expect(result.totalDrivers).toBe(0);
      expect(result.averageTruckUtilization).toBe(0);
    });
  });

  describe('getTruckById', () => {
    it('should return truck by ID', async () => {
      const truckId = 'truck-1';

      const mockTruck = {
        id: truckId,
        registrationNumber: 'ABC-123',
        type: TruckType.VAN,
        maxWeightKg: 1000,
        maxVolumeM3: 15,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        status: TruckStatus.AVAILABLE,
        hasRefrigeration: false,
        hasLiftGate: true,
        currentLocation: null,
        warehouseId: null,
        fuelType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);

      const result = await fleetService.getTruckById(truckId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(truckId);
      expect(mockPrisma.truck.findUnique).toHaveBeenCalled();
    });

    it('should return null if truck not found', async () => {
      const truckId = 'truck-1';

      mockPrisma.truck.findUnique.mockResolvedValue(null);

      const result = await fleetService.getTruckById(truckId);

      expect(result).toBeNull();
    });
  });

  describe('getDriverById', () => {
    it('should return driver by ID', async () => {
      const driverId = 'driver-1';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const mockDriver = {
        id: driverId,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        licenseNumber: 'DL123456',
        licenseExpiry: futureDate,
        status: DriverStatus.AVAILABLE,
        currentTruckId: null,
        phone: null,
        shiftStart: null,
        shiftEnd: null,
        maxHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.driver.findUnique.mockResolvedValue(mockDriver as any);

      const result = await fleetService.getDriverById(driverId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(driverId);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalled();
    });

    it('should return null if driver not found', async () => {
      const driverId = 'driver-1';

      mockPrisma.driver.findUnique.mockResolvedValue(null);

      const result = await fleetService.getDriverById(driverId);

      expect(result).toBeNull();
    });
  });
});

// Made with Bob
