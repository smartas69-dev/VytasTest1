/**
 * Drivers Controller
 * Handles driver management operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DriversController {
  /**
   * Get all drivers
   */
  async getDrivers(req: Request, res: Response): Promise<void> {
    try {
      const { status, search } = req.query;

      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { licenseNumber: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const drivers = await prisma.driver.findMany({
        where,
        orderBy: { lastName: 'asc' },
        include: {
          currentTruck: true,
        },
      });

      res.json({
        success: true,
        data: drivers,
        metadata: { totalCount: drivers.length },
      });
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_DRIVERS_ERROR',
          message: error.message || 'Failed to fetch drivers',
        },
      });
    }
  }

  /**
   * Get driver by ID
   */
  async getDriverById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const driver = await prisma.driver.findUnique({
        where: { id },
        include: {
          currentTruck: true,
          truckLoads: {
            include: {
              truck: true,
              slot: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!driver) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DRIVER_NOT_FOUND',
            message: 'Driver not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: driver,
      });
    } catch (error: any) {
      console.error('Error fetching driver:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_DRIVER_ERROR',
          message: error.message || 'Failed to fetch driver',
        },
      });
    }
  }

  /**
   * Create driver
   */
  async createDriver(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, firstName, lastName, email, phone, licenseNumber, licenseExpiry, status } = req.body;

      // Validate required fields
      if (!employeeId || !firstName || !lastName || !email || !licenseNumber || !licenseExpiry) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Employee ID, first name, last name, email, license number, and license expiry are required',
          },
        });
        return;
      }

      const driver = await prisma.driver.create({
        data: {
          employeeId,
          firstName,
          lastName,
          email,
          phone,
          licenseNumber,
          licenseExpiry: new Date(licenseExpiry),
          status: status || 'available',
        },
      });

      res.status(201).json({
        success: true,
        data: driver,
      });
    } catch (error: any) {
      console.error('Error creating driver:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_DRIVER_ERROR',
          message: error.message || 'Failed to create driver',
        },
      });
    }
  }

  /**
   * Update driver
   */
  async updateDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { firstName, lastName, email, phone, licenseNumber, licenseExpiry, status } = req.body;

      const driver = await prisma.driver.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(licenseNumber && { licenseNumber }),
          ...(licenseExpiry && { licenseExpiry: new Date(licenseExpiry) }),
          ...(status && { status }),
        },
      });

      res.json({
        success: true,
        data: driver,
      });
    } catch (error: any) {
      console.error('Error updating driver:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_DRIVER_ERROR',
          message: error.message || 'Failed to update driver',
        },
      });
    }
  }

  /**
   * Delete driver
   */
  async deleteDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await prisma.driver.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: 'Driver deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_DRIVER_ERROR',
          message: error.message || 'Failed to delete driver',
        },
      });
    }
  }
}

export default new DriversController();

// Made with Bob