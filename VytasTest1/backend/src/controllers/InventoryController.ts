/**
 * Inventory Controller
 * Handles inventory item management operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class InventoryController {
  /**
   * Get all inventory items
   */
  async getInventoryItems(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, inStock } = req.query;

      const where: any = {};
      
      if (category) {
        where.category = category;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { sku: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      if (inStock === 'true') {
        where.stockQuantity = { gt: 0 };
      }

      const items = await prisma.inventoryItem.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: items,
        metadata: { totalCount: items.length },
      });
    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_INVENTORY_ERROR',
          message: error.message || 'Failed to fetch inventory items',
        },
      });
    }
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const item = await prisma.inventoryItem.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              order: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          inventoryTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Inventory item not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      console.error('Error fetching inventory item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ITEM_ERROR',
          message: error.message || 'Failed to fetch inventory item',
        },
      });
    }
  }

  /**
   * Create inventory item
   */
  async createInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const {
        sku,
        name,
        description,
        category,
        weightKg,
        volumeM3,
        dimensionsCm,
        isFragile,
        requiresRefrigeration,
        stockQuantity,
        unitPrice,
      } = req.body;

      // Validate required fields
      if (!sku || !name || !weightKg || !volumeM3) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'SKU, name, weight, and volume are required',
          },
        });
        return;
      }

      const item = await prisma.inventoryItem.create({
        data: {
          sku,
          name,
          description,
          category,
          weightKg,
          volumeM3,
          dimensionsCm,
          isFragile: isFragile || false,
          requiresRefrigeration: requiresRefrigeration || false,
          stockQuantity: stockQuantity || 0,
          unitPrice,
        },
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ITEM_ERROR',
          message: error.message || 'Failed to create inventory item',
        },
      });
    }
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const {
        sku,
        name,
        description,
        category,
        weightKg,
        volumeM3,
        dimensionsCm,
        isFragile,
        requiresRefrigeration,
        stockQuantity,
        unitPrice,
      } = req.body;

      const item = await prisma.inventoryItem.update({
        where: { id },
        data: {
          ...(sku && { sku }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(weightKg && { weightKg }),
          ...(volumeM3 && { volumeM3 }),
          ...(dimensionsCm !== undefined && { dimensionsCm }),
          ...(isFragile !== undefined && { isFragile }),
          ...(requiresRefrigeration !== undefined && { requiresRefrigeration }),
          ...(stockQuantity !== undefined && { stockQuantity }),
          ...(unitPrice !== undefined && { unitPrice }),
        },
      });

      res.json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ITEM_ERROR',
          message: error.message || 'Failed to update inventory item',
        },
      });
    }
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await prisma.inventoryItem.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: 'Inventory item deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ITEM_ERROR',
          message: error.message || 'Failed to delete inventory item',
        },
      });
    }
  }
}

export default new InventoryController();

// Made with Bob