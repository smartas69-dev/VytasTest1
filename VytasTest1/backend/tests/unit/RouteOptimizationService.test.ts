import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { RouteOptimizationService } from '../../src/services/RouteOptimizationService';

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
    route: (id: string) => `route:${id}`,
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

describe('RouteOptimizationService', () => {
  let routeOptimizationService: RouteOptimizationService;

  beforeEach(() => {
    mockReset(mockPrisma);
    routeOptimizationService = new RouteOptimizationService();
  });

  describe('optimizeRoute', () => {
    it('should optimize route successfully', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            name: 'Main Warehouse',
            coordinates: '40.7128,-74.0060', // New York
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              orderNumber: 'ORD-001',
              deliveryAddress: '123 Main St',
              deliveryCoordinates: '40.7589,-73.9851', // Times Square
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              orderNumber: 'ORD-002',
              deliveryAddress: '456 Park Ave',
              deliveryCoordinates: '40.7614,-73.9776', // Central Park
              estimatedDurationMinutes: 20,
            },
          },
          {
            sequenceNumber: 3,
            order: {
              id: 'order-3',
              orderNumber: 'ORD-003',
              deliveryAddress: '789 Broadway',
              deliveryCoordinates: '40.7505,-73.9934', // Union Square
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      expect(result.loadId).toBe(loadId);
      expect(result.route.waypoints).toHaveLength(3);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.metrics.algorithm).toBe('Nearest Neighbor + 2-opt');
      expect(result.metrics.improvementPercentage).toBeDefined();
      expect(result.route.waypoints[0].sequenceNumber).toBe(1);
      expect(result.route.waypoints[0].estimatedArrival).toBeDefined();
    });

    it('should throw error if load not found', async () => {
      const loadId = 'load-1';

      mockPrisma.truckLoad.findUnique.mockResolvedValue(null);

      await expect(routeOptimizationService.optimizeRoute(loadId)).rejects.toThrow(
        'Load load-1 not found'
      );
    });

    it('should throw error if load has no warehouse information', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: null,
        },
        loadItems: [],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      await expect(routeOptimizationService.optimizeRoute(loadId)).rejects.toThrow(
        'Load load-1 has no warehouse information'
      );
    });

    it('should throw error if load has no delivery points', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      await expect(routeOptimizationService.optimizeRoute(loadId)).rejects.toThrow(
        'Load load-1 has no delivery points'
      );
    });

    it('should handle different coordinate formats', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '{"latitude":40.7128,"longitude":-74.0060}', // JSON format
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              orderNumber: 'ORD-001',
              deliveryAddress: '123 Main St',
              deliveryCoordinates: 'POINT(-73.9851 40.7589)', // POINT format
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      expect(result.route.waypoints).toHaveLength(1);
      expect(result.route.waypoints[0].coordinates.latitude).toBeCloseTo(40.7589, 4);
      expect(result.route.waypoints[0].coordinates.longitude).toBeCloseTo(-73.9851, 4);
    });

    it('should calculate improvement percentage correctly', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: '123 Main St',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              deliveryAddress: '456 Park Ave',
              deliveryCoordinates: '40.7614,-73.9776',
              estimatedDurationMinutes: 20,
            },
          },
          {
            sequenceNumber: 3,
            order: {
              id: 'order-3',
              deliveryAddress: '789 Broadway',
              deliveryCoordinates: '40.7505,-73.9934',
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      expect(result.metrics.improvementPercentage).toBeDefined();
      expect(result.metrics.improvementPercentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRouteSummary', () => {
    it('should return route summary', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: '123 Main St',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              deliveryAddress: '456 Park Ave',
              deliveryCoordinates: '40.7614,-73.9776',
              estimatedDurationMinutes: 20,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.getRouteSummary(loadId);

      expect(result.totalStops).toBe(2);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.estimatedStartTime).toBeInstanceOf(Date);
      expect(result.estimatedEndTime).toBeInstanceOf(Date);
      expect(result.estimatedEndTime.getTime()).toBeGreaterThan(
        result.estimatedStartTime.getTime()
      );
    });
  });

  describe('compareRoutes', () => {
    it('should compare optimized vs naive routes', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              orderNumber: 'ORD-001',
              deliveryAddress: '123 Main St',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              orderNumber: 'ORD-002',
              deliveryAddress: '456 Park Ave',
              deliveryCoordinates: '40.7614,-73.9776',
              estimatedDurationMinutes: 20,
            },
          },
          {
            sequenceNumber: 3,
            order: {
              id: 'order-3',
              orderNumber: 'ORD-003',
              deliveryAddress: '789 Broadway',
              deliveryCoordinates: '40.7505,-73.9934',
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.compareRoutes(loadId);

      expect(result.optimized).toBeDefined();
      expect(result.naive).toBeDefined();
      expect(result.improvement).toBeDefined();
      expect(result.naive.totalDistance).toBeGreaterThan(0);
      expect(result.naive.totalDuration).toBeGreaterThan(0);
      expect(result.improvement.distanceSaved).toBeGreaterThanOrEqual(0);
      expect(result.improvement.timeSaved).toBeGreaterThanOrEqual(0);
      expect(result.improvement.percentageImprovement).toBeGreaterThanOrEqual(0);
    });

    it('should show improvement when optimization is effective', async () => {
      const loadId = 'load-1';

      // Create a scenario where optimization should help
      // Points arranged in a way that naive order is suboptimal
      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060', // Start point
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: 'Far North',
              deliveryCoordinates: '40.8000,-73.9500', // Far north
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              deliveryAddress: 'Close',
              deliveryCoordinates: '40.7200,-74.0000', // Close to start
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 3,
            order: {
              id: 'order-3',
              deliveryAddress: 'Middle',
              deliveryCoordinates: '40.7500,-73.9700', // Middle distance
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.compareRoutes(loadId);

      // Optimized route should be better or equal to naive
      expect(result.optimized.totalDistance).toBeLessThanOrEqual(
        result.naive.totalDistance
      );
      expect(result.improvement.percentageImprovement).toBeGreaterThanOrEqual(0);
    });

    it('should throw error if load not found', async () => {
      const loadId = 'load-1';

      mockPrisma.truckLoad.findUnique.mockResolvedValue(null);

      await expect(routeOptimizationService.compareRoutes(loadId)).rejects.toThrow();
    });
  });

  describe('validateRoute', () => {
    it('should validate route successfully with no errors', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: '123 Main St',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              deliveryAddress: '456 Park Ave',
              deliveryCoordinates: '40.7614,-73.9776',
              estimatedDurationMinutes: 20,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.validateRoute(loadId);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return warning if route distance exceeds 200km', async () => {
      const loadId = 'load-1';

      // Create a route with very distant points
      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060', // New York
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: 'Far location',
              deliveryCoordinates: '42.3601,-71.0589', // Boston (far away)
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.validateRoute(loadId);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('exceeds 200km');
    });

    it('should return warning if route duration exceeds 8 hours', async () => {
      const loadId = 'load-1';

      // Create many stops to exceed 8 hours
      const loadItems = Array.from({ length: 20 }, (_, i) => ({
        sequenceNumber: i + 1,
        order: {
          id: `order-${i + 1}`,
          deliveryAddress: `Address ${i + 1}`,
          deliveryCoordinates: `${40.7 + i * 0.01},${-74.0 + i * 0.01}`,
          estimatedDurationMinutes: 30, // 30 min per stop
        },
      }));

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems,
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.validateRoute(loadId);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes('exceeds 8 hours'))).toBe(true);
    });

    it('should return error if route optimization fails', async () => {
      const loadId = 'load-1';

      mockPrisma.truckLoad.findUnique.mockResolvedValue(null);

      const result = await routeOptimizationService.validateRoute(loadId);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Route optimization failed');
    });
  });

  describe('Haversine distance calculation', () => {
    it('should calculate distance between two points correctly', async () => {
      const loadId = 'load-1';

      // Known distance: New York to Times Square is approximately 4-5 km
      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060', // New York
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: 'Times Square',
              deliveryCoordinates: '40.7589,-73.9851', // Times Square
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      // Distance should be reasonable (between 3-6 km for this route)
      expect(result.totalDistance).toBeGreaterThan(3);
      expect(result.totalDistance).toBeLessThan(10);
    });
  });

  describe('Route optimization with multiple stops', () => {
    it('should optimize route with 5 stops', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: 'Stop 1',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              deliveryAddress: 'Stop 2',
              deliveryCoordinates: '40.7614,-73.9776',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 3,
            order: {
              id: 'order-3',
              deliveryAddress: 'Stop 3',
              deliveryCoordinates: '40.7505,-73.9934',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 4,
            order: {
              id: 'order-4',
              deliveryAddress: 'Stop 4',
              deliveryCoordinates: '40.7480,-73.9862',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 5,
            order: {
              id: 'order-5',
              deliveryAddress: 'Stop 5',
              deliveryCoordinates: '40.7580,-73.9855',
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      expect(result.route.waypoints).toHaveLength(5);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.totalDuration).toBeGreaterThan(0);
      
      // Check that all waypoints have sequence numbers
      result.route.waypoints.forEach((wp, index) => {
        expect(wp.sequenceNumber).toBe(index + 1);
        expect(wp.estimatedArrival).toBeInstanceOf(Date);
      });
    });

    it('should handle single stop route', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: 'Single Stop',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      expect(result.route.waypoints).toHaveLength(1);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.metrics.improvementPercentage).toBe(0); // No improvement possible with 1 stop
    });
  });

  describe('Estimated arrival times', () => {
    it('should calculate arrival times for all waypoints', async () => {
      const loadId = 'load-1';

      const mockLoad = {
        id: loadId,
        truck: {
          id: 'truck-1',
          warehouse: {
            id: 'warehouse-1',
            coordinates: '40.7128,-74.0060',
          },
        },
        loadItems: [
          {
            sequenceNumber: 1,
            order: {
              id: 'order-1',
              deliveryAddress: 'Stop 1',
              deliveryCoordinates: '40.7589,-73.9851',
              estimatedDurationMinutes: 15,
            },
          },
          {
            sequenceNumber: 2,
            order: {
              id: 'order-2',
              deliveryAddress: 'Stop 2',
              deliveryCoordinates: '40.7614,-73.9776',
              estimatedDurationMinutes: 20,
            },
          },
        ],
      };

      mockPrisma.truckLoad.findUnique.mockResolvedValue(mockLoad as any);

      const result = await routeOptimizationService.optimizeRoute(loadId);

      // First stop should have earlier arrival than second
      const firstArrival = result.route.waypoints[0].estimatedArrival!;
      const secondArrival = result.route.waypoints[1].estimatedArrival!;

      expect(firstArrival).toBeInstanceOf(Date);
      expect(secondArrival).toBeInstanceOf(Date);
      expect(secondArrival.getTime()).toBeGreaterThan(firstArrival.getTime());
    });
  });
});

// Made with Bob
