import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { LoadOptimizationService } from '../../src/services/LoadOptimizationService';
import { TruckType, TruckStatus } from '../../src/types';

// Mock Prisma Client
vi.mock('../../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Import mocked prisma
import { prisma } from '../../src/config/database';

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('LoadOptimizationService', () => {
  let loadOptimizationService: LoadOptimizationService;

  beforeEach(() => {
    mockReset(mockPrisma);
    loadOptimizationService = new LoadOptimizationService();
  });

  describe('optimizeLoad', () => {
    it('should optimize load successfully with all orders fitting', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2', 'order-3'];

      const mockTruck = {
        id: truckId,
        registrationNumber: 'ABC-123',
        type: TruckType.TRUCK,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        hasRefrigeration: true,
        hasLiftGate: true,
        status: TruckStatus.AVAILABLE,
        warehouseId: 'warehouse-1',
        currentLocation: null,
        fuelType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          priority: 1,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          totalWeightKg: 200,
          totalVolumeM3: 4,
          priority: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 20,
                volumeM3: 0.4,
                isFragile: false,
                requiresRefrigeration: true,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-3',
          orderNumber: 'ORD-003',
          totalWeightKg: 50,
          totalVolumeM3: 1,
          priority: 3,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 5,
                volumeM3: 0.1,
                isFragile: true,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.optimizeLoad(truckId, orderIds);

      expect(result.truckId).toBe(truckId);
      expect(result.orders).toHaveLength(3);
      expect(result.totalWeight).toBe(350);
      expect(result.totalVolume).toBe(7);
      expect(result.utilization.weight).toBeCloseTo(35, 1);
      expect(result.utilization.volume).toBeCloseTo(35, 1);
      expect(result.loadingInstructions).toHaveLength(3);
      expect(result.metrics.algorithm).toBe('First Fit Decreasing with Constraints');
    });

    it('should throw error if truck not found', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      mockPrisma.truck.findUnique.mockResolvedValue(null);

      await expect(
        loadOptimizationService.optimizeLoad(truckId, orderIds)
      ).rejects.toThrow('Truck truck-1 not found');
    });

    it('should throw error if no orders found', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
        hasRefrigeration: true,
      };

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue([]);

      await expect(
        loadOptimizationService.optimizeLoad(truckId, orderIds)
      ).rejects.toThrow('No orders found');
    });

    it('should exclude orders that exceed capacity', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 150,
        maxVolumeM3: 3,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.optimizeLoad(truckId, orderIds);

      expect(result.orders).toHaveLength(1);
      expect(result.totalWeight).toBe(100);
    });

    it('should skip refrigerated orders if truck lacks refrigeration', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: true,
              },
              quantity: 10,
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.optimizeLoad(truckId, orderIds);

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0]).toBe('order-1');
    });

    it('should generate proper loading instructions with positions', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2', 'order-3'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
        hasRefrigeration: true,
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalWeightKg: 200,
          totalVolumeM3: 4,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 20,
                volumeM3: 0.4,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: true,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-3',
          orderNumber: 'ORD-003',
          totalWeightKg: 50,
          totalVolumeM3: 1,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 5,
                volumeM3: 0.1,
                isFragile: true,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.optimizeLoad(truckId, orderIds);

      expect(result.loadingInstructions).toHaveLength(3);
      expect(result.loadingInstructions[0].sequenceNumber).toBe(1);
      expect(result.loadingInstructions[0].position).toContain('First delivery');
      expect(result.loadingInstructions[2].position).toContain('Last delivery');
    });
  });

  describe('validateLoadConstraints', () => {
    it('should validate load successfully with no errors', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
        hasRefrigeration: true,
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
        {
          id: 'order-2',
          totalWeightKg: 200,
          totalVolumeM3: 4,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return error if truck not found', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      mockPrisma.truck.findUnique.mockResolvedValue(null);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Truck truck-1 not found');
    });

    it('should return error if no orders found', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
      };

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue([]);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No orders found');
    });

    it('should return error if weight exceeds capacity', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 100,
        maxVolumeM3: 20,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 150,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('weight');
      expect(result.errors[0]).toContain('exceeds');
    });

    it('should return error if volume exceeds capacity', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 5,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 100,
          totalVolumeM3: 10,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('volume');
      expect(result.errors[0]).toContain('exceeds');
    });

    it('should return warning if weight is close to capacity', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 100,
        maxVolumeM3: 20,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 95,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('close to truck capacity');
    });

    it('should return error if refrigeration required but not available', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 1000,
        maxVolumeM3: 20,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: true,
              },
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.validateLoadConstraints(truckId, orderIds);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Orders require refrigeration but truck does not have refrigeration'
      );
    });
  });

  describe('getOptimalTruck', () => {
    it('should return optimal truck with best utilization', async () => {
      const orderIds = ['order-1', 'order-2'];

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 400,
          totalVolumeM3: 8,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
        {
          id: 'order-2',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
      ];

      const mockTrucks = [
        {
          id: 'truck-1',
          type: TruckType.VAN,
          maxWeightKg: 600,
          maxVolumeM3: 12,
          hasRefrigeration: false,
        },
        {
          id: 'truck-2',
          type: TruckType.TRUCK,
          maxWeightKg: 1000,
          maxVolumeM3: 20,
          hasRefrigeration: false,
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);
      mockPrisma.truck.findMany.mockResolvedValue(mockTrucks as any);

      const result = await loadOptimizationService.getOptimalTruck(orderIds);

      expect(result).not.toBeNull();
      expect(result?.truckId).toBe('truck-1');
      expect(result?.utilizationScore).toBeGreaterThan(70);
      expect(result?.reason).toContain('Best fit');
    });

    it('should return null if no orders found', async () => {
      const orderIds = ['order-1'];

      mockPrisma.order.findMany.mockResolvedValue([]);

      const result = await loadOptimizationService.getOptimalTruck(orderIds);

      expect(result).toBeNull();
    });

    it('should return null if no suitable trucks available', async () => {
      const orderIds = ['order-1'];

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 1000,
          totalVolumeM3: 20,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: false,
              },
            },
          ],
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);
      mockPrisma.truck.findMany.mockResolvedValue([]);

      const result = await loadOptimizationService.getOptimalTruck(orderIds);

      expect(result).toBeNull();
    });

    it('should filter trucks by refrigeration requirement', async () => {
      const orderIds = ['order-1'];

      const mockOrders = [
        {
          id: 'order-1',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                requiresRefrigeration: true,
              },
            },
          ],
        },
      ];

      const mockTrucks = [
        {
          id: 'truck-1',
          type: TruckType.REFRIGERATED_TRUCK,
          maxWeightKg: 500,
          maxVolumeM3: 10,
          hasRefrigeration: true,
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);
      mockPrisma.truck.findMany.mockResolvedValue(mockTrucks as any);

      const result = await loadOptimizationService.getOptimalTruck(orderIds);

      expect(result).not.toBeNull();
      expect(result?.truckId).toBe('truck-1');
    });
  });

  describe('simulateLoadOptimization', () => {
    it('should simulate load optimization successfully', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2', 'order-3'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 500,
        maxVolumeM3: 10,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          totalWeightKg: 200,
          totalVolumeM3: 4,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 20,
                volumeM3: 0.4,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-3',
          orderNumber: 'ORD-003',
          totalWeightKg: 300,
          totalVolumeM3: 6,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 30,
                volumeM3: 0.6,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.simulateLoadOptimization(truckId, orderIds);

      expect(result.totalOrders).toBe(3);
      expect(result.loadedOrders).toBeLessThanOrEqual(3);
      expect(result.canFit).toBeDefined();
      expect(result.utilizationWeight).toBeGreaterThan(0);
      expect(result.utilizationVolume).toBeGreaterThan(0);
      expect(result.unloadedOrders).toBeDefined();
    });

    it('should identify unloaded orders when capacity exceeded', async () => {
      const truckId = 'truck-1';
      const orderIds = ['order-1', 'order-2'];

      const mockTruck = {
        id: truckId,
        maxWeightKg: 150,
        maxVolumeM3: 3,
        hasRefrigeration: false,
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          totalWeightKg: 100,
          totalVolumeM3: 2,
          orderItems: [
            {
              inventoryItem: {
                weightKg: 10,
                volumeM3: 0.2,
                isFragile: false,
                requiresRefrigeration: false,
              },
              quantity: 10,
            },
          ],
        },
      ];

      mockPrisma.truck.findUnique.mockResolvedValue(mockTruck as any);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);

      const result = await loadOptimizationService.simulateLoadOptimization(truckId, orderIds);

      expect(result.canFit).toBe(false);
      expect(result.loadedOrders).toBe(1);
      expect(result.unloadedOrders).toHaveLength(1);
    });
  });

  describe('getOptimizationStats', () => {
    it('should return optimization statistics for a load', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        totalWeightKg: 500,
        totalVolumeM3: 10,
        truck: {
          id: 'truck-1',
          maxWeightKg: 1000,
          maxVolumeM3: 20,
        },
        loadItems: [
          {
            order: {
              orderItems: [
                {
                  inventoryItem: {
                    isFragile: true,
                    requiresRefrigeration: false,
                  },
                },
              ],
            },
          },
          {
            order: {
              orderItems: [
                {
                  inventoryItem: {
                    isFragile: false,
                    requiresRefrigeration: true,
                  },
                },
              ],
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await loadOptimizationService.getOptimizationStats(loadId);

      expect(result.totalOrders).toBe(2);
      expect(result.totalWeight).toBe(500);
      expect(result.totalVolume).toBe(10);
      expect(result.weightUtilization).toBe(50);
      expect(result.volumeUtilization).toBe(50);
      expect(result.hasFragileItems).toBe(true);
      expect(result.hasRefrigeratedItems).toBe(true);
    });

    it('should throw error if load not found', async () => {
      const loadId = 'load-1';

      mockPrisma.truckLoad.findUnique.mockResolvedValue(null);

      await expect(
        loadOptimizationService.getOptimizationStats(loadId)
      ).rejects.toThrow('Load load-1 not found');
    });
  });
});

// Made with Bob
