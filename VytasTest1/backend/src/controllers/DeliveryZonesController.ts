/**
 * Delivery Zones Controller
 * Handles delivery zone management operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DeliveryZonesController {
  /**
   * Get all delivery zones
   */
  async getDeliveryZones(req: Request, res: Response): Promise<void> {
    try {
      const { isActive } = req.query;

      const where: any = {};
      
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const zones = await prisma.deliveryZone.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { 
              timeSlots: true,
              orders: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: zones,
        metadata: { totalCount: zones.length },
      });
    } catch (error: any) {
      console.error('Error fetching delivery zones:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ZONES_ERROR',
          message: error.message || 'Failed to fetch delivery zones',
        },
      });
    }
  }

  /**
   * Get delivery zone by ID
   */
  async getDeliveryZoneById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const zone = await prisma.deliveryZone.findUnique({
        where: { id },
        include: {
          timeSlots: {
            orderBy: { date: 'desc' },
            take: 20,
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!zone) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ZONE_NOT_FOUND',
            message: 'Delivery zone not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: zone,
      });
    } catch (error: any) {
      console.error('Error fetching delivery zone:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ZONE_ERROR',
          message: error.message || 'Failed to fetch delivery zone',
        },
      });
    }
  }

  /**
   * Create delivery zone
   */
  async createDeliveryZone(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, polygon, maxDailyCapacity, isActive } = req.body;

      // Validate required fields
      if (!name || !code) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and code are required',
          },
        });
        return;
      }

      const zone = await prisma.deliveryZone.create({
        data: {
          name,
          code,
          polygon,
          maxDailyCapacity: maxDailyCapacity || 100,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      res.status(201).json({
        success: true,
        data: zone,
      });
    } catch (error: any) {
      console.error('Error creating delivery zone:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ZONE_ERROR',
          message: error.message || 'Failed to create delivery zone',
        },
      });
    }
  }

  /**
   * Update delivery zone
   */
  async updateDeliveryZone(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { name, code, polygon, maxDailyCapacity, isActive } = req.body;

      const zone = await prisma.deliveryZone.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(code && { code }),
          ...(polygon !== undefined && { polygon }),
          ...(maxDailyCapacity !== undefined && { maxDailyCapacity }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: zone,
      });
    } catch (error: any) {
      console.error('Error updating delivery zone:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ZONE_ERROR',
          message: error.message || 'Failed to update delivery zone',
        },
      });
    }
  }

  /**
   * Delete delivery zone
   */
  async deleteDeliveryZone(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await prisma.deliveryZone.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: 'Delivery zone deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting delivery zone:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ZONE_ERROR',
          message: error.message || 'Failed to delete delivery zone',
        },
      });
    }
  }
}

export default new DeliveryZonesController();

// Made with Bob