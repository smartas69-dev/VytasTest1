/**
 * Customers Controller
 * Handles customer management operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CustomersController {
  /**
   * Get all customers
   */
  async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;

      const where: any = {};
      
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const customers = await prisma.customer.findMany({
        where,
        orderBy: { lastName: 'asc' },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      });

      res.json({
        success: true,
        data: customers,
        metadata: { totalCount: customers.length },
      });
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CUSTOMERS_ERROR',
          message: error.message || 'Failed to fetch customers',
        },
      });
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: 'Customer not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CUSTOMER_ERROR',
          message: error.message || 'Failed to fetch customer',
        },
      });
    }
  }

  /**
   * Create customer
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName, lastName, phone, defaultAddress, defaultCoordinates } = req.body;

      // Validate required fields
      if (!email || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, first name, and last name are required',
          },
        });
        return;
      }

      const customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          defaultAddress,
          defaultCoordinates,
        },
      });

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_CUSTOMER_ERROR',
          message: error.message || 'Failed to create customer',
        },
      });
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { email, firstName, lastName, phone, defaultAddress, defaultCoordinates } = req.body;

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...(email && { email }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(defaultAddress !== undefined && { defaultAddress }),
          ...(defaultCoordinates !== undefined && { defaultCoordinates }),
        },
      });

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      console.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_CUSTOMER_ERROR',
          message: error.message || 'Failed to update customer',
        },
      });
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await prisma.customer.delete({
        where: { id },
      });

      res.json({
        success: true,
        data: { message: 'Customer deleted successfully' },
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_CUSTOMER_ERROR',
          message: error.message || 'Failed to delete customer',
        },
      });
    }
  }
}

export default new CustomersController();

// Made with Bob