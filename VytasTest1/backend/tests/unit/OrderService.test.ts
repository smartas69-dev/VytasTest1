import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OrderService } from '../../src/services/OrderService';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Mock Prisma Client
vi.mock('../../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('OrderService', () => {
  let orderService: OrderService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    const { prisma } = require('../../src/config/database');
    prismaMock = prisma as DeepMockProxy<PrismaClient>;
    orderService = new OrderService();
  });

  afterEach(() => {
    mockReset(prismaMock);
  });

  describe('createOrder', () => {
    it('should successfully create an order with items', async () => {
      // Arrange
      const orderData = {
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        items: [
          { inventoryItemId: 'item-1', quantity: 2 },
          { inventoryItemId: 'item-2', quantity: 1 },
        ],
      };

      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD-000001',
        customerId: orderData.customerId,
        timeSlotId: orderData.timeSlotId,
        deliveryAddress: orderData.deliveryAddress,
        deliveryZone: orderData.deliveryZone,
        contactName: orderData.contactName,
        contactEmail: orderData.contactEmail,
        contactPhone: orderData.contactPhone,
        status: 'pending' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });
      prismaMock.order.create.mockResolvedValue(mockOrder);

      // Act
      const result = await orderService.createOrder(orderData);

      // Assert
      expect(result.id).toBe('order-1');
      expect(result.status).toBe('pending');
      expect(prismaMock.order.create).toHaveBeenCalled();
    });

    it('should throw error if customer not found', async () => {
      // Arrange
      const orderData = {
        customerId: 'invalid-customer',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        items: [],
      };

      prismaMock.customer.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.createOrder(orderData)).rejects.toThrow('Customer not found');
    });

    it('should calculate total price correctly', async () => {
      // Arrange
      const orderData = {
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        items: [
          { inventoryItemId: 'item-1', quantity: 2 }, // 2 × $10 = $20
          { inventoryItemId: 'item-2', quantity: 3 }, // 3 × $15 = $45
        ],
      };

      const mockItems = [
        { id: 'item-1', price: 10, weight: 5, volume: 0.5 },
        { id: 'item-2', price: 15, weight: 8, volume: 0.8 },
      ];

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });

      let capturedOrderData: any;
      prismaMock.order.create.mockImplementation((args: any) => {
        capturedOrderData = args.data;
        return Promise.resolve({
          ...capturedOrderData,
          id: 'order-1',
          orderNumber: 'ORD-000001',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Act
      await orderService.createOrder(orderData);

      // Assert
      expect(capturedOrderData.totalPrice).toBe(65); // $20 + $45
    });
  });

  describe('confirmOrder', () => {
    it('should successfully confirm a pending order', async () => {
      // Arrange
      const orderId = 'order-1';

      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-000001',
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        status: 'pending' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockConfirmedOrder = {
        ...mockOrder,
        status: 'confirmed' as const,
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.order.update.mockResolvedValue(mockConfirmedOrder);

      // Act
      const result = await orderService.confirmOrder(orderId);

      // Assert
      expect(result.status).toBe('confirmed');
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'confirmed' },
      });
    });

    it('should throw error if order not found', async () => {
      // Arrange
      const orderId = 'invalid-order';

      prismaMock.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.confirmOrder(orderId)).rejects.toThrow('Order not found');
    });

    it('should throw error if order is already confirmed', async () => {
      // Arrange
      const orderId = 'order-1';

      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-000001',
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        status: 'confirmed' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(orderService.confirmOrder(orderId)).rejects.toThrow(
        'Order is already confirmed'
      );
    });
  });

  describe('cancelOrder', () => {
    it('should successfully cancel an order and release resources', async () => {
      // Arrange
      const orderId = 'order-1';
      const reason = 'Customer requested cancellation';

      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-000001',
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        status: 'pending' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCancelledOrder = {
        ...mockOrder,
        status: 'cancelled' as const,
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });
      prismaMock.order.update.mockResolvedValue(mockCancelledOrder);

      // Act
      const result = await orderService.cancelOrder(orderId, reason);

      // Assert
      expect(result.status).toBe('cancelled');
      expect(prismaMock.order.update).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      // Arrange
      const orderId = 'invalid-order';
      const reason = 'Test';

      prismaMock.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId, reason)).rejects.toThrow('Order not found');
    });

    it('should throw error if order is already delivered', async () => {
      // Arrange
      const orderId = 'order-1';
      const reason = 'Test';

      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-000001',
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        status: 'delivered' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(orderService.cancelOrder(orderId, reason)).rejects.toThrow(
        'Cannot cancel delivered order'
      );
    });
  });

  describe('getOrderStatistics', () => {
    it('should return order statistics', async () => {
      // Arrange
      const mockOrders = [
        { status: 'pending', totalPrice: 100 },
        { status: 'confirmed', totalPrice: 150 },
        { status: 'delivered', totalPrice: 200 },
        { status: 'cancelled', totalPrice: 50 },
      ];

      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);

      // Act
      const result = await orderService.getOrderStatistics();

      // Assert
      expect(result.totalOrders).toBe(4);
      expect(result.pendingOrders).toBe(1);
      expect(result.confirmedOrders).toBe(1);
      expect(result.deliveredOrders).toBe(1);
      expect(result.cancelledOrders).toBe(1);
      expect(result.totalRevenue).toBe(450); // 100 + 150 + 200 (excluding cancelled)
    });

    it('should return zero statistics if no orders', async () => {
      // Arrange
      prismaMock.order.findMany.mockResolvedValue([]);

      // Act
      const result = await orderService.getOrderStatistics();

      // Assert
      expect(result.totalOrders).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('getOrderById', () => {
    it('should return order with items', async () => {
      // Arrange
      const orderId = 'order-1';

      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-000001',
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        status: 'pending' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: 'item-1',
            orderId,
            inventoryItemId: 'inv-1',
            quantity: 2,
            price: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder as any);

      // Act
      const result = await orderService.getOrderById(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(orderId);
      expect(result?.items).toHaveLength(1);
    });

    it('should return null if order not found', async () => {
      // Arrange
      const orderId = 'invalid-order';

      prismaMock.order.findUnique.mockResolvedValue(null);

      // Act
      const result = await orderService.getOrderById(orderId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should successfully update order status', async () => {
      // Arrange
      const orderId = 'order-1';
      const newStatus = 'in_transit';

      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-000001',
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        deliveryZone: 'Downtown',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '+1-555-0101',
        status: 'confirmed' as const,
        totalPrice: 100,
        totalWeight: 50,
        totalVolume: 2,
        requiresSignature: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        status: newStatus as any,
      };

      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.order.update.mockResolvedValue(mockUpdatedOrder);

      // Act
      const result = await orderService.updateOrderStatus(orderId, newStatus);

      // Assert
      expect(result.status).toBe(newStatus);
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });

    it('should throw error if order not found', async () => {
      // Arrange
      const orderId = 'invalid-order';
      const newStatus = 'in_transit';

      prismaMock.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(orderService.updateOrderStatus(orderId, newStatus)).rejects.toThrow(
        'Order not found'
      );
    });
  });
});

// Made with Bob
