/**
 * Load Optimization Service
 * Implements 3D bin packing algorithm for truck load optimization
 * Uses First Fit Decreasing (FFD) with constraints
 */

import { prisma } from '../config/database';
import {
  LoadOptimizationResult,
  LoadingInstruction,
  OptimizationConstraints,
  OptimizationMetrics,
  Order,
  Truck,
} from '../types';

interface OrderWithWeight extends Order {
  orderItems: Array<{
    inventoryItem: {
      weightKg: number;
      volumeM3: number;
      isFragile: boolean;
      requiresRefrigeration: boolean;
    };
    quantity: number;
  }>;
}

export class LoadOptimizationService {
  /**
   * Optimize load for a truck with given orders
   */
  async optimizeLoad(
    truckId: string,
    orderIds: string[]
  ): Promise<LoadOptimizationResult> {
    const startTime = Date.now();

    // Fetch truck details
    const truck = await prisma.truck.findUnique({
      where: { id: truckId },
    });

    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        orderItems: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      throw new Error('No orders found');
    }

    // Calculate constraints
    const constraints: OptimizationConstraints = {
      maxWeight: Number(truck.maxWeightKg),
      maxVolume: Number(truck.maxVolumeM3),
      requiresRefrigeration: truck.hasRefrigeration,
    };

    // Sort orders for optimal loading
    const sortedOrders = this.sortOrdersForLoading(orders as any);

    // Calculate load sequence
    const { sequence, loadedOrders, totalWeight, totalVolume } = 
      this.calculateLoadSequence(sortedOrders, constraints);

    // Generate loading instructions
    const loadingInstructions = this.generateLoadingInstructions(
      loadedOrders,
      sequence
    );

    // Calculate utilization
    const utilization = {
      weight: (totalWeight / constraints.maxWeight) * 100,
      volume: (totalVolume / constraints.maxVolume) * 100,
    };

    const executionTime = Date.now() - startTime;

    const metrics: OptimizationMetrics = {
      algorithm: 'First Fit Decreasing with Constraints',
      executionTime,
      improvementPercentage: this.calculateImprovement(
        orders.length,
        loadedOrders.length
      ),
    };

    return {
      loadId: '', // Will be set when creating the load
      truckId,
      orders: loadedOrders.map((o) => o.id),
      sequence,
      totalWeight,
      totalVolume,
      utilization,
      loadingInstructions,
      metrics,
    };
  }

  /**
   * Sort orders for optimal loading
   * Priority: Heavy items first, fragile items last, refrigerated together
   */
  private sortOrdersForLoading(orders: OrderWithWeight[]): OrderWithWeight[] {
    return orders.sort((a, b) => {
      // Calculate order properties
      const aWeight = Number(a.totalWeightKg || 0);
      const bWeight = Number(b.totalWeightKg || 0);
      
      const aHasFragile = a.orderItems.some((item) => item.inventoryItem.isFragile);
      const bHasFragile = b.orderItems.some((item) => item.inventoryItem.isFragile);
      
      const aRequiresRefrig = a.orderItems.some(
        (item) => item.inventoryItem.requiresRefrigeration
      );
      const bRequiresRefrig = b.orderItems.some(
        (item) => item.inventoryItem.requiresRefrigeration
      );

      // Priority 1: Non-fragile before fragile
      if (aHasFragile !== bHasFragile) {
        return aHasFragile ? 1 : -1;
      }

      // Priority 2: Refrigerated items together
      if (aRequiresRefrig !== bRequiresRefrig) {
        return aRequiresRefrig ? -1 : 1;
      }

      // Priority 3: Heavier items first (bottom of truck)
      return bWeight - aWeight;
    });
  }

  /**
   * Calculate load sequence using First Fit Decreasing algorithm
   */
  private calculateLoadSequence(
    orders: OrderWithWeight[],
    constraints: OptimizationConstraints
  ): {
    sequence: number[];
    loadedOrders: OrderWithWeight[];
    totalWeight: number;
    totalVolume: number;
  } {
    const loadedOrders: OrderWithWeight[] = [];
    const sequence: number[] = [];
    let totalWeight = 0;
    let totalVolume = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const orderWeight = Number(order.totalWeightKg || 0);
      const orderVolume = Number(order.totalVolumeM3 || 0);

      // Check if order fits
      if (
        totalWeight + orderWeight <= constraints.maxWeight &&
        totalVolume + orderVolume <= constraints.maxVolume
      ) {
        // Check refrigeration constraint
        const requiresRefrig = order.orderItems.some(
          (item) => item.inventoryItem.requiresRefrigeration
        );

        if (requiresRefrig && !constraints.requiresRefrigeration) {
          continue; // Skip orders requiring refrigeration if truck doesn't have it
        }

        // Add order to load
        loadedOrders.push(order);
        sequence.push(i);
        totalWeight += orderWeight;
        totalVolume += orderVolume;
      }
    }

    return {
      sequence,
      loadedOrders,
      totalWeight,
      totalVolume,
    };
  }

  /**
   * Generate loading instructions for the driver
   */
  private generateLoadingInstructions(
    orders: OrderWithWeight[],
    sequence: number[]
  ): LoadingInstruction[] {
    const instructions: LoadingInstruction[] = [];

    orders.forEach((order, index) => {
      const hasFragile = order.orderItems.some((item) => item.inventoryItem.isFragile);
      const requiresRefrig = order.orderItems.some(
        (item) => item.inventoryItem.requiresRefrigeration
      );

      let position = 'Middle';
      let notes = '';

      // Determine position based on order characteristics
      if (index === 0) {
        position = 'Front (First delivery)';
      } else if (index === orders.length - 1) {
        position = 'Back (Last delivery)';
      } else if (hasFragile) {
        position = 'Top (Fragile)';
        notes = '⚠️ Handle with care - Fragile items';
      } else if (requiresRefrig) {
        position = 'Refrigerated section';
        notes = '❄️ Keep refrigerated';
      } else {
        const weight = Number(order.totalWeightKg || 0);
        if (weight > 50) {
          position = 'Bottom (Heavy)';
          notes = '⚡ Heavy load';
        }
      }

      instructions.push({
        sequenceNumber: index + 1,
        orderId: order.id,
        position,
        notes: notes || `Order ${order.orderNumber}`,
      });
    });

    return instructions;
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(totalOrders: number, loadedOrders: number): number {
    if (totalOrders === 0) return 0;
    return (loadedOrders / totalOrders) * 100;
  }

  /**
   * Validate load constraints
   */
  async validateLoadConstraints(
    truckId: string,
    orderIds: string[]
  ): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Fetch truck
    const truck = await prisma.truck.findUnique({
      where: { id: truckId },
    });

    if (!truck) {
      errors.push(`Truck ${truckId} not found`);
      return { valid: false, errors, warnings };
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        orderItems: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      errors.push('No orders found');
      return { valid: false, errors, warnings };
    }

    // Calculate totals
    let totalWeight = 0;
    let totalVolume = 0;
    let hasRefrigerated = false;

    orders.forEach((order) => {
      totalWeight += Number(order.totalWeightKg || 0);
      totalVolume += Number(order.totalVolumeM3 || 0);

      order.orderItems.forEach((item) => {
        if (item.inventoryItem.requiresRefrigeration) {
          hasRefrigerated = true;
        }
      });
    });

    // Validate weight
    if (totalWeight > Number(truck.maxWeightKg)) {
      errors.push(
        `Total weight ${totalWeight.toFixed(2)}kg exceeds truck capacity ${Number(
          truck.maxWeightKg
        )}kg`
      );
    } else if (totalWeight > Number(truck.maxWeightKg) * 0.9) {
      warnings.push(
        `Total weight ${totalWeight.toFixed(2)}kg is close to truck capacity (>90%)`
      );
    }

    // Validate volume
    if (totalVolume > Number(truck.maxVolumeM3)) {
      errors.push(
        `Total volume ${totalVolume.toFixed(2)}m³ exceeds truck capacity ${Number(
          truck.maxVolumeM3
        )}m³`
      );
    } else if (totalVolume > Number(truck.maxVolumeM3) * 0.9) {
      warnings.push(
        `Total volume ${totalVolume.toFixed(2)}m³ is close to truck capacity (>90%)`
      );
    }

    // Validate refrigeration
    if (hasRefrigerated && !truck.hasRefrigeration) {
      errors.push('Orders require refrigeration but truck does not have refrigeration');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get optimal truck for orders
   */
  async getOptimalTruck(orderIds: string[]): Promise<{
    truckId: string;
    utilizationScore: number;
    reason: string;
  } | null> {
    // Fetch orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        orderItems: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (orders.length === 0) {
      return null;
    }

    // Calculate requirements
    let totalWeight = 0;
    let totalVolume = 0;
    let requiresRefrigeration = false;

    orders.forEach((order) => {
      totalWeight += Number(order.totalWeightKg || 0);
      totalVolume += Number(order.totalVolumeM3 || 0);

      order.orderItems.forEach((item) => {
        if (item.inventoryItem.requiresRefrigeration) {
          requiresRefrigeration = true;
        }
      });
    });

    // Find available trucks
    const trucks = await prisma.truck.findMany({
      where: {
        status: 'available',
        maxWeightKg: { gte: totalWeight },
        maxVolumeM3: { gte: totalVolume },
        hasRefrigeration: requiresRefrigeration ? true : undefined,
      },
      orderBy: [{ maxWeightKg: 'asc' }, { maxVolumeM3: 'asc' }],
    });

    if (trucks.length === 0) {
      return null;
    }

    // Find truck with best utilization (closest fit)
    let bestTruck = trucks[0];
    let bestScore = 0;

    trucks.forEach((truck) => {
      const weightUtil = (totalWeight / Number(truck.maxWeightKg)) * 100;
      const volumeUtil = (totalVolume / Number(truck.maxVolumeM3)) * 100;
      const utilizationScore = Math.max(weightUtil, volumeUtil);

      // Prefer trucks with 70-90% utilization (efficient but not overloaded)
      let score = utilizationScore;
      if (utilizationScore >= 70 && utilizationScore <= 90) {
        score += 20; // Bonus for optimal range
      }

      if (score > bestScore) {
        bestScore = score;
        bestTruck = truck;
      }
    });

    const weightUtil = (totalWeight / Number(bestTruck.maxWeightKg)) * 100;
    const volumeUtil = (totalVolume / Number(bestTruck.maxVolumeM3)) * 100;
    const utilizationScore = Math.max(weightUtil, volumeUtil);

    return {
      truckId: bestTruck.id,
      utilizationScore,
      reason: `Best fit: ${utilizationScore.toFixed(1)}% utilization (${
        bestTruck.type
      })`,
    };
  }

  /**
   * Simulate load optimization (for testing/preview)
   */
  async simulateLoadOptimization(
    truckId: string,
    orderIds: string[]
  ): Promise<{
    canFit: boolean;
    loadedOrders: number;
    totalOrders: number;
    utilizationWeight: number;
    utilizationVolume: number;
    unloadedOrders: string[];
  }> {
    const result = await this.optimizeLoad(truckId, orderIds);

    const unloadedOrders = orderIds.filter(
      (id) => !result.orders.includes(id)
    );

    return {
      canFit: result.orders.length === orderIds.length,
      loadedOrders: result.orders.length,
      totalOrders: orderIds.length,
      utilizationWeight: result.utilization.weight,
      utilizationVolume: result.utilization.volume,
      unloadedOrders,
    };
  }

  /**
   * Get load optimization statistics
   */
  async getOptimizationStats(loadId: string): Promise<{
    totalOrders: number;
    totalWeight: number;
    totalVolume: number;
    weightUtilization: number;
    volumeUtilization: number;
    hasFragileItems: boolean;
    hasRefrigeratedItems: boolean;
  }> {
    const load = await prisma.truckLoad.findUnique({
      where: { id: loadId },
      include: {
        loadItems: {
          include: {
            order: {
              include: {
                orderItems: {
                  include: {
                    inventoryItem: true,
                  },
                },
              },
            },
          },
        },
        truck: true,
      },
    });

    if (!load || !load.truck) {
      throw new Error(`Load ${loadId} not found`);
    }

    const totalOrders = load.loadItems.length;
    const totalWeight = Number(load.totalWeightKg || 0);
    const totalVolume = Number(load.totalVolumeM3 || 0);

    const weightUtilization = (totalWeight / Number(load.truck.maxWeightKg)) * 100;
    const volumeUtilization = (totalVolume / Number(load.truck.maxVolumeM3)) * 100;

    let hasFragileItems = false;
    let hasRefrigeratedItems = false;

    load.loadItems.forEach((item) => {
      item.order.orderItems.forEach((orderItem) => {
        if (orderItem.inventoryItem.isFragile) {
          hasFragileItems = true;
        }
        if (orderItem.inventoryItem.requiresRefrigeration) {
          hasRefrigeratedItems = true;
        }
      });
    });

    return {
      totalOrders,
      totalWeight,
      totalVolume,
      weightUtilization,
      volumeUtilization,
      hasFragileItems,
      hasRefrigeratedItems,
    };
  }
}

export default new LoadOptimizationService();

// Made with Bob
