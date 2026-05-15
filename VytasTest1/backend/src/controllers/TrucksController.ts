/**
 * Trucks Controller
 * Handles truck fleet management operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TrucksController {
  /**
   * Get all trucks
   */
  async getTrucks(req: Request, res: Response): Promise<void> {
    try {
      const { status, type, warehouseId } = req.query;

      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (type) {
        where.type = type;
      }
      
      if (warehouseId) {
        where.warehouseId = warehouseId;
      }

      const trucks = await prisma.truck.findMany({
        where,
        orderBy: { registrationNumber: 'asc' },
        include: {
          warehouse: true,
          drivers: true,
        },
      });

      res.json({
        success: true,
        data: trucks,
        metadata: { totalCount: trucks.length },
      });
    } catch (error: any) {
      console.error('Error fetching trucks:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_TRUCKS_ERROR',
          message: error.message || 'Failed to fetch trucks',
        },
      });
    }
  }

  /**
   * Get truck by ID
   */
  async getTruckById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const truck = await prisma.truck.findUnique({
        where: { id },
        include: {
          warehouse: true,
          drivers: true,
          truckLoads: {
            include: {
              slot: true,
              driver: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!truck) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRUCK_NOT_FOUND',
            message: 'Truck not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: truck,
      });
    } catch (error: any) {
      console.error('Error fetching truck:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_TRUCK_ERROR',
          message: error.message || 'Failed to fetch truck',
        },
      });
    }
  }

  /**
   * Create truck
   */
  async createTruck(req: Request, res: Response): Promise<void> {
    try {
      const {
        registrationNumber,
        type,
        maxWeightKg,
        maxVolumeM3,
        fuelType,
        status,
        warehouseId,
        hasRefrigeration,
        hasLiftGate,
      } = req.body;

      // Validate required fields
      if (!registrationNumber || !type || !maxWeightKg || !maxVolumeM3) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Registration number, type, max weight, and max volume are required',
          },
        });
        return;
      }

      const truck = await prisma.truck.create({
        data: {
          registrationNumber,
          type,
          maxWeightKg,
          maxVolumeM3,
          fuelType,
          status: status || 'available',
          warehouseId,
          hasRefrigeration: hasRefrigeration || false,
          hasLiftGate: hasLiftGate || false,
        },
      });

      res.status(201).json({
        success: true,
        data: truck,
      });
    } catch (error: any) {
      console.error('Error creating truck:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_TRUCK_ERROR',
          message: error.message || 'Failed to create truck',
        },
      });
    }
  }

  /**
   * Update truck
   */
  async updateTruck(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const {
        registrationNumber,
        type,
        maxWeightKg,
        maxVolumeM3,
        fuelType,
        status,
        currentLocation,
        warehouseId,
        hasRefrigeration,
        hasLiftGate,
      } = req.body;

      const truck = await prisma.truck.update({
        where: { id },
        data: {
          ...(registrationNumber && { registrationNumber }),
          ...(type && { type }),
          ...(maxWeightKg && { maxWeightKg }),
          ...(maxVolumeM3 && { maxVolumeM3 }),
          ...(fuelType !== undefined && { fuelType }),
          ...(status && { status }),
          ...(currentLocation !== undefined && { currentLocation }),
          ...(warehouseId !== undefined && { warehouseId }),
          ...(hasRefrigeration !== undefined && { hasRefrigeration }),
          ...(hasLiftGate !== undefined && { hasLiftGate }),
        },
      });

      res.json({
        success: true,
        data: truck,
      });
    } catch (error: any) {
      console.error('Error updating truck:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_TRUCK_ERROR',
          message: error.message || 'Failed to update truck',
        },
      });
    }
  }

  /**
   * Delete truck
   */
  async deleteTruck(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await prisma.truck.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: 'Truck deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting truck:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_TRUCK_ERROR',
          message: error.message || 'Failed to delete truck',
        },
      });
    }
  }
}

export default new TrucksController();

// Made with Bob