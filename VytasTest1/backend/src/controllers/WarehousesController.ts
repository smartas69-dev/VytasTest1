/**
 * Warehouses Controller
 * Handles warehouse management operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class WarehousesController {
  /**
   * Get all warehouses
   */
  async getWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const { isActive } = req.query;

      const where: any = {};
      
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const warehouses = await prisma.warehouse.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { 
              trucks: true,
              inventoryTransactions: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: warehouses,
        metadata: { totalCount: warehouses.length },
      });
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_WAREHOUSES_ERROR',
          message: error.message || 'Failed to fetch warehouses',
        },
      });
    }
  }

  /**
   * Get warehouse by ID
   */
  async getWarehouseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const warehouse = await prisma.warehouse.findUnique({
        where: { id },
        include: {
          trucks: {
            orderBy: { registrationNumber: 'asc' },
          },
          inventoryTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!warehouse) {
        res.status(404).json({
          success: false,
          error: {
            code: 'WAREHOUSE_NOT_FOUND',
            message: 'Warehouse not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: warehouse,
      });
    } catch (error: any) {
      console.error('Error fetching warehouse:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_WAREHOUSE_ERROR',
          message: error.message || 'Failed to fetch warehouse',
        },
      });
    }
  }

  /**
   * Create warehouse
   */
  async createWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { name, address, coordinates, totalCapacityM3, isActive } = req.body;

      // Validate required fields
      if (!name || !address || !coordinates || !totalCapacityM3) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name, address, coordinates, and total capacity are required',
          },
        });
        return;
      }

      const warehouse = await prisma.warehouse.create({
        data: {
          name,
          address,
          coordinates,
          totalCapacityM3,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      res.status(201).json({
        success: true,
        data: warehouse,
      });
    } catch (error: any) {
      console.error('Error creating warehouse:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_WAREHOUSE_ERROR',
          message: error.message || 'Failed to create warehouse',
        },
      });
    }
  }

  /**
   * Update warehouse
   */
  async updateWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { name, address, coordinates, totalCapacityM3, usedCapacityM3, isActive } = req.body;

      const warehouse = await prisma.warehouse.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(address && { address }),
          ...(coordinates && { coordinates }),
          ...(totalCapacityM3 !== undefined && { totalCapacityM3 }),
          ...(usedCapacityM3 !== undefined && { usedCapacityM3 }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: warehouse,
      });
    } catch (error: any) {
      console.error('Error updating warehouse:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_WAREHOUSE_ERROR',
          message: error.message || 'Failed to update warehouse',
        },
      });
    }
  }

  /**
   * Delete warehouse
   */
  async deleteWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await prisma.warehouse.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: 'Warehouse deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting warehouse:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_WAREHOUSE_ERROR',
          message: error.message || 'Failed to delete warehouse',
        },
      });
    }
  }
}

export default new WarehousesController();

// Made with Bob