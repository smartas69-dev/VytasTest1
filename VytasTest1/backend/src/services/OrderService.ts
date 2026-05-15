/**
 * Order Service
 * Handles order creation, updates, and lifecycle management
 */

import { prisma } from '../config/database';
import { deleteCache, CacheKeys } from '../config/redis';
import {
  Order,
  CreateOrderDTO,
  OrderStatus,
  OrderWithItems,
} from '../types';
import InventoryService from './InventoryService';
import SlotService from './SlotService';

export class OrderService {
  /**
   * Create a new order with inventory reservation
   */
  async createOrder(data: CreateOrderDTO): Promise<OrderWithItems> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    let totalWeight = 0;
    let totalVolume = 0;

    // Fetch inventory items to calculate totals
    const itemsWithDetails = await Promise.all(
      data.items.map(async (item) => {
        const inventoryItem = await InventoryService.getInventoryItemById(
          item.inventoryItemId
        );

        if (!inventoryItem) {
          throw new Error(`Inventory item ${item.inventoryItemId} not found`);
        }

        totalWeight += inventoryItem.weightKg * item.quantity;
        totalVolume += inventoryItem.volumeM3 * item.quantity;

        return {
          ...item,
          unitPrice: inventoryItem.unitPrice,
          totalPrice: inventoryItem.unitPrice
            ? inventoryItem.unitPrice * item.quantity
            : undefined,
        };
      })
    );

    // Create order and reserve inventory in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: data.customerId,
          slotId: data.slotId,
          deliveryAddress: data.deliveryAddress,
          deliveryCoordinates: data.deliveryCoordinates,
          zoneId: data.zoneId,
          status: OrderStatus.PENDING,
          priority: data.priority || 0,
          totalWeightKg: totalWeight,
          totalVolumeM3: totalVolume,
          specialInstructions: data.specialInstructions,
          requiresSignature: data.requiresSignature || false,
        },
        include: {
          orderItems: {
            include: {
              inventoryItem: true,
            },
          },
        },
      });

      // Create order items
      await Promise.all(
        itemsWithDetails.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            },
          })
        )
      );

      return newOrder;
    });

    // Reserve inventory items
    await InventoryService.bulkReserveItems(
      data.items.map(item => ({
        itemId: item.inventoryItemId,
        quantity: item.quantity,
      })),
      order.id,
      'order'
    );

    // Reserve slot if provided
    if (data.slotId) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await SlotService.reserveSlot({
        slotId: data.slotId,
        orderId: order.id,
        expiresAt,
      });
    }

    // Fetch complete order with items
    const completeOrder = await this.getOrderById(order.id);

    if (!completeOrder) {
      throw new Error('Failed to create order');
    }

    return completeOrder;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            inventoryItem: true,
          },
        },
        customer: true,
        slot: true,
        zone: true,
      },
    });

    if (!order) return null;

    return {
      ...order,
      totalWeightKg: order.totalWeightKg ? Number(order.totalWeightKg) : undefined,
      totalVolumeM3: order.totalVolumeM3 ? Number(order.totalVolumeM3) : undefined,
      items: order.orderItems.map((item) => ({
        ...item,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
      })),
    } as OrderWithItems;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            inventoryItem: true,
          },
        },
        customer: true,
        slot: true,
        zone: true,
      },
    });

    if (!order) return null;

    return {
      ...order,
      totalWeightKg: order.totalWeightKg ? Number(order.totalWeightKg) : undefined,
      totalVolumeM3: order.totalVolumeM3 ? Number(order.totalVolumeM3) : undefined,
      items: order.orderItems.map((item) => ({
        ...item,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
      })),
    } as OrderWithItems;
  }

  /**
   * Get orders with filtering
   */
  async getOrders(filters?: {
    status?: OrderStatus;
    customerId?: string;
    slotId?: string;
    zoneId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: filters?.status,
        customerId: filters?.customerId,
        slotId: filters?.slotId,
        zoneId: filters?.zoneId,
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      ...order,
      totalWeightKg: order.totalWeightKg ? Number(order.totalWeightKg) : undefined,
      totalVolumeM3: order.totalVolumeM3 ? Number(order.totalVolumeM3) : undefined,
    })) as Order[];
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Invalidate related caches
    if (order.slotId) {
      await deleteCache(CacheKeys.slot(order.slotId));
    }

    return {
      ...order,
      totalWeightKg: order.totalWeightKg ? Number(order.totalWeightKg) : undefined,
      totalVolumeM3: order.totalVolumeM3 ? Number(order.totalVolumeM3) : undefined,
    } as Order;
  }

  /**
   * Cancel order and rollback reservations
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error(`Order ${orderId} is already cancelled`);
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new Error(`Cannot cancel delivered order ${orderId}`);
    }

    // Release inventory reservations
    await Promise.all(
      order.items.map((item) =>
        InventoryService.releaseReservation(
          item.inventoryItemId,
          item.quantity,
          orderId,
          'order'
        )
      )
    );

    // Cancel slot reservation if exists
    if (order.slotId) {
      const reservations = await prisma.reservation.findMany({
        where: {
          orderId,
          slotId: order.slotId,
          status: 'active',
        },
      });

      await Promise.all(
        reservations.map((res) => SlotService.cancelReservation(res.id))
      );
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        specialInstructions: reason
          ? `${order.specialInstructions || ''}\nCancellation reason: ${reason}`
          : order.specialInstructions,
      },
    });

    return {
      ...updated,
      totalWeightKg: updated.totalWeightKg ? Number(updated.totalWeightKg) : undefined,
      totalVolumeM3: updated.totalVolumeM3 ? Number(updated.totalVolumeM3) : undefined,
    } as Order;
  }

  /**
   * Get orders by slot
   */
  async getOrdersBySlot(slotId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { slotId },
      orderBy: { priority: 'desc' },
    });

    return orders.map((order) => ({
      ...order,
      totalWeightKg: order.totalWeightKg ? Number(order.totalWeightKg) : undefined,
      totalVolumeM3: order.totalVolumeM3 ? Number(order.totalVolumeM3) : undefined,
    })) as Order[];
  }

  /**
   * Get unassigned orders (not in any load)
   */
  async getUnassignedOrders(filters?: {
    zoneId?: string;
    slotId?: string;
  }): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.CONFIRMED,
        zoneId: filters?.zoneId,
        slotId: filters?.slotId,
        loadItems: {
          none: {},
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    return orders.map((order) => ({
      ...order,
      totalWeightKg: order.totalWeightKg ? Number(order.totalWeightKg) : undefined,
      totalVolumeM3: order.totalVolumeM3 ? Number(order.totalVolumeM3) : undefined,
    })) as Order[];
  }

  /**
   * Confirm order (after payment/verification)
   */
  async confirmOrder(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error(`Order ${orderId} is not in pending status`);
    }

    // Confirm slot reservation if exists
    if (order.slotId) {
      const reservations = await prisma.reservation.findMany({
        where: {
          orderId,
          slotId: order.slotId,
          status: 'active',
        },
      });

      await Promise.all(
        reservations.map((res) => SlotService.confirmReservation(res.id))
      );
    }

    // Update order status
    return await this.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    zoneId?: string;
  }): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const orders = await prisma.order.findMany({
      where: {
        zoneId: filters?.zoneId,
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      include: {
        orderItems: true,
      },
    });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING).length;
    const confirmedOrders = orders.filter((o) => o.status === OrderStatus.CONFIRMED).length;
    const inTransitOrders = orders.filter((o) => o.status === OrderStatus.IN_TRANSIT).length;
    const deliveredOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;

    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce(
        (itemSum, item) => itemSum + Number(item.totalPrice || 0),
        0
      );
      return sum + orderTotal;
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inTransitOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
    };
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
  }
}

export default new OrderService();

// Made with Bob
