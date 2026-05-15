/**
 * Order Controller
 * Handles HTTP requests for order management
 */

import { Request, Response } from 'express';
import OrderService from '../services/OrderService';
import { CreateOrderDTO, OrderStatus } from '../types';

export class OrderController {
  /**
   * Create a new order
   * POST /api/orders
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData: CreateOrderDTO = req.body;

      // Validate required fields
      if (!orderData.deliveryAddress || !orderData.deliveryCoordinates) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Delivery address and coordinates are required',
          },
        });
        return;
      }

      if (!orderData.items || orderData.items.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order must contain at least one item',
          },
        });
        return;
      }

      const order = await OrderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await OrderService.getOrderById(id as string);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order ${id} not found`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Get order by order number
   * GET /api/orders/number/:orderNumber
   */
  async getOrderByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params;

      const order = await OrderService.getOrderByNumber(orderNumber as string);

      if (!order) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order ${orderNumber} not found`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Get orders with filtering
   * GET /api/orders
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        customerId,
        slotId,
        zoneId,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};

      if (status) filters.status = status as OrderStatus;
      if (customerId) filters.customerId = customerId as string;
      if (slotId) filters.slotId = slotId as string;
      if (zoneId) filters.zoneId = zoneId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const orders = await OrderService.getOrders(filters);

      res.json({
        success: true,
        data: orders,
        metadata: {
          totalCount: orders.length,
        },
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status is required',
          },
        });
        return;
      }

      const order = await OrderService.updateOrderStatus(id as string, status);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Confirm order
   * POST /api/orders/:id/confirm
   */
  async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await OrderService.confirmOrder(id as string);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIRMATION_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Cancel order
   * POST /api/orders/:id/cancel
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await OrderService.cancelOrder(id as string, reason);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CANCELLATION_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Get orders by slot
   * GET /api/orders/slot/:slotId
   */
  async getOrdersBySlot(req: Request, res: Response): Promise<void> {
    try {
      const { slotId } = req.params;

      const orders = await OrderService.getOrdersBySlot(slotId as string);

      res.json({
        success: true,
        data: orders,
        metadata: {
          totalCount: orders.length,
        },
      });
    } catch (error) {
      console.error('Error fetching orders by slot:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Get unassigned orders
   * GET /api/orders/unassigned
   */
  async getUnassignedOrders(req: Request, res: Response): Promise<void> {
    try {
      const { zoneId, slotId } = req.query;

      const filters: any = {};
      if (zoneId) filters.zoneId = zoneId as string;
      if (slotId) filters.slotId = slotId as string;

      const orders = await OrderService.getUnassignedOrders(filters);

      res.json({
        success: true,
        data: orders,
        metadata: {
          totalCount: orders.length,
        },
      });
    } catch (error) {
      console.error('Error fetching unassigned orders:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Get order statistics
   * GET /api/orders/statistics
   */
  async getOrderStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, zoneId } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (zoneId) filters.zoneId = zoneId as string;

      const statistics = await OrderService.getOrderStatistics(filters);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: (error as Error).message,
        },
      });
    }
  }
}

export default new OrderController();

// Made with Bob
