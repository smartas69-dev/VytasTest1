import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { InventoryService } from '../../src/services/InventoryService';
import { TransactionType } from '../../src/types';

// Mock Prisma Client
vi.mock('../../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock Redis
vi.mock('../../src/config/redis', () => ({
  setCache: vi.fn(),
  getCache: vi.fn().mockResolvedValue(null),
  deleteCache: vi.fn(),
  CacheKeys: {
    inventory: (id: string) => `inventory:${id}`,
    inventoryStock: (sku: string) => `inventory:stock:${sku}`,
  },
  CacheTTL: {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
  },
}));

// Import mocked prisma
import { prisma } from '../../src/config/database';

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    mockReset(mockPrisma);
    inventoryService = new InventoryService();
  });

  describe('createInventoryItem', () => {
    it('should create a new inventory item successfully', async () => {
      const itemData = {
        sku: 'ITEM-001',
        name: 'Test Item',
        description: 'Test description',
        category: 'Electronics',
        weightKg: 5.5,
        volumeM3: 0.1,
        isFragile: true,
        requiresRefrigeration: false,
        stockQuantity: 100,
        unitPrice: 29.99,
      };

      const mockItem = {
        id: 'item-1',
        ...itemData,
        dimensionsCm: null,
        reservedQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);
      mockPrisma.inventoryItem.create.mockResolvedValue(mockItem as any);

      const result = await inventoryService.createInventoryItem(itemData);

      expect(result.id).toBe('item-1');
      expect(result.sku).toBe('ITEM-001');
      expect(result.stockQuantity).toBe(100);
      expect(mockPrisma.inventoryItem.create).toHaveBeenCalled();
    });

    it('should throw error if SKU already exists', async () => {
      const itemData = {
        sku: 'ITEM-001',
        name: 'Test Item',
        weightKg: 5.5,
        volumeM3: 0.1,
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue({
        id: 'existing-item',
        sku: 'ITEM-001',
      } as any);

      await expect(inventoryService.createInventoryItem(itemData)).rejects.toThrow(
        'Inventory item with SKU ITEM-001 already exists'
      );
    });
  });

  describe('getInventoryItems', () => {
    it('should return all inventory items with optional filters', async () => {
      const mockItems = [
        {
          id: 'item-1',
          sku: 'ITEM-001',
          name: 'Test Item 1',
          category: 'Electronics',
          weightKg: 5.5,
          volumeM3: 0.1,
          isFragile: false,
          requiresRefrigeration: false,
          stockQuantity: 100,
          reservedQuantity: 10,
          unitPrice: 29.99,
          description: null,
          dimensionsCm: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      const result = await inventoryService.getInventoryItems({ category: 'Electronics' });

      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('ITEM-001');
      expect(mockPrisma.inventoryItem.findMany).toHaveBeenCalled();
    });
  });

  describe('getInventoryItemById', () => {
    it('should return inventory item by ID', async () => {
      const itemId = 'item-1';

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        name: 'Test Item',
        category: 'Electronics',
        weightKg: 5.5,
        volumeM3: 0.1,
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 100,
        reservedQuantity: 10,
        unitPrice: 29.99,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      const result = await inventoryService.getInventoryItemById(itemId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(itemId);
      expect(mockPrisma.inventoryItem.findUnique).toHaveBeenCalled();
    });

    it('should return null if item not found', async () => {
      const itemId = 'item-1';

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.getInventoryItemById(itemId);

      expect(result).toBeNull();
    });
  });

  describe('getInventoryItemBySku', () => {
    it('should return inventory item by SKU', async () => {
      const sku = 'ITEM-001';

      const mockItem = {
        id: 'item-1',
        sku,
        name: 'Test Item',
        category: 'Electronics',
        weightKg: 5.5,
        volumeM3: 0.1,
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 100,
        reservedQuantity: 10,
        unitPrice: 29.99,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      const result = await inventoryService.getInventoryItemBySku(sku);

      expect(result).not.toBeNull();
      expect(result?.sku).toBe(sku);
      expect(mockPrisma.inventoryItem.findUnique).toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    it('should return availability information', async () => {
      const itemId = 'item-1';
      const quantity = 50;

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        name: 'Test Item',
        stockQuantity: 100,
        reservedQuantity: 20,
        weightKg: 5.5,
        volumeM3: 0.1,
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      const result = await inventoryService.checkAvailability(itemId, quantity);

      expect(result.available).toBe(true);
      expect(result.stockQuantity).toBe(100);
      expect(result.reservedQuantity).toBe(20);
      expect(result.availableQuantity).toBe(80);
    });

    it('should return false if insufficient stock', async () => {
      const itemId = 'item-1';
      const quantity = 100;

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        name: 'Test Item',
        stockQuantity: 100,
        reservedQuantity: 80,
        weightKg: 5.5,
        volumeM3: 0.1,
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockItem as any);

      const result = await inventoryService.checkAvailability(itemId, quantity);

      expect(result.available).toBe(false);
      expect(result.availableQuantity).toBe(20);
    });

    it('should throw error if item not found', async () => {
      const itemId = 'item-1';

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(inventoryService.checkAvailability(itemId, 10)).rejects.toThrow(
        'Inventory item item-1 not found'
      );
    });
  });

  describe('reserveItems', () => {
    it('should reserve items successfully', async () => {
      const itemId = 'item-1';
      const quantity = 10;
      const referenceId = 'order-1';

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 20,
      };

      const updatedItem = {
        ...mockItem,
        reservedQuantity: 30,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
            update: vi.fn().mockResolvedValue(updatedItem),
          },
          inventoryTransaction: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.reserveItems(itemId, quantity, referenceId);

      expect(result.reservedQuantity).toBe(30);
    });

    it('should throw error if insufficient stock', async () => {
      const itemId = 'item-1';
      const quantity = 100;
      const referenceId = 'order-1';

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 50,
        reservedQuantity: 20,
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
          },
        });
      });

      await expect(
        inventoryService.reserveItems(itemId, quantity, referenceId)
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('releaseReservation', () => {
    it('should release reserved items successfully', async () => {
      const itemId = 'item-1';
      const quantity = 10;
      const referenceId = 'order-1';

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 30,
      };

      const updatedItem = {
        ...mockItem,
        reservedQuantity: 20,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
            update: vi.fn().mockResolvedValue(updatedItem),
          },
          inventoryTransaction: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.releaseReservation(itemId, quantity, referenceId);

      expect(result.reservedQuantity).toBe(20);
    });

    it('should throw error if trying to release more than reserved', async () => {
      const itemId = 'item-1';
      const quantity = 50;
      const referenceId = 'order-1';

      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 20,
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
          },
        });
      });

      await expect(
        inventoryService.releaseReservation(itemId, quantity, referenceId)
      ).rejects.toThrow('Cannot release 50 units. Only 20 units are reserved');
    });
  });

  describe('updateStock', () => {
    it('should handle stock IN transaction', async () => {
      const itemId = 'item-1';
      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 10,
      };

      const updatedItem = {
        ...mockItem,
        stockQuantity: 150,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
            update: vi.fn().mockResolvedValue(updatedItem),
          },
          inventoryTransaction: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.updateStock({
        itemId,
        quantity: 50,
        transactionType: TransactionType.IN,
      });

      expect(result.stockQuantity).toBe(150);
    });

    it('should handle stock OUT transaction', async () => {
      const itemId = 'item-1';
      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 10,
      };

      const updatedItem = {
        ...mockItem,
        stockQuantity: 50,
        reservedQuantity: 0,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
            update: vi.fn().mockResolvedValue(updatedItem),
          },
          inventoryTransaction: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.updateStock({
        itemId,
        quantity: 50,
        transactionType: TransactionType.OUT,
      });

      expect(result.stockQuantity).toBe(50);
    });

    it('should throw error if insufficient stock for OUT transaction', async () => {
      const itemId = 'item-1';
      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 30,
        reservedQuantity: 10,
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
          },
        });
      });

      await expect(
        inventoryService.updateStock({
          itemId,
          quantity: 50,
          transactionType: TransactionType.OUT,
        })
      ).rejects.toThrow('Insufficient stock');
    });

    it('should handle ADJUSTMENT transaction', async () => {
      const itemId = 'item-1';
      const mockItem = {
        id: itemId,
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 10,
      };

      const updatedItem = {
        ...mockItem,
        stockQuantity: 110,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          inventoryItem: {
            findUnique: vi.fn().mockResolvedValue(mockItem),
            update: vi.fn().mockResolvedValue(updatedItem),
          },
          inventoryTransaction: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.updateStock({
        itemId,
        quantity: 10,
        transactionType: TransactionType.ADJUSTMENT,
      });

      expect(result.stockQuantity).toBe(110);
    });
  });

  describe('getLowStockItems', () => {
    it('should return items with stock below threshold', async () => {
      const mockItems = [
        {
          id: 'item-1',
          sku: 'ITEM-001',
          name: 'Low Stock Item',
          stockQuantity: 5,
          reservedQuantity: 0,
          weightKg: 5.5,
          volumeM3: 0.1,
          isFragile: false,
          requiresRefrigeration: false,
          unitPrice: 29.99,
          category: null,
          description: null,
          dimensionsCm: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      const result = await inventoryService.getLowStockItems(10);

      expect(result).toHaveLength(1);
      expect(result[0].stockQuantity).toBe(5);
      expect(mockPrisma.inventoryItem.findMany).toHaveBeenCalled();
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return items with zero stock', async () => {
      const mockItems = [
        {
          id: 'item-1',
          sku: 'ITEM-001',
          name: 'Out of Stock Item',
          stockQuantity: 0,
          reservedQuantity: 0,
          weightKg: 5.5,
          volumeM3: 0.1,
          isFragile: false,
          requiresRefrigeration: false,
          unitPrice: 29.99,
          category: null,
          description: null,
          dimensionsCm: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      const result = await inventoryService.getOutOfStockItems();

      expect(result).toHaveLength(1);
      expect(result[0].stockQuantity).toBe(0);
      expect(mockPrisma.inventoryItem.findMany).toHaveBeenCalled();
    });
  });

  describe('getInventoryMetrics', () => {
    it('should return comprehensive inventory metrics', async () => {
      const mockItems = [
        {
          id: 'item-1',
          sku: 'ITEM-001',
          stockQuantity: 100,
          reservedQuantity: 10,
          unitPrice: 10.0,
          category: 'Electronics',
        },
        {
          id: 'item-2',
          sku: 'ITEM-002',
          stockQuantity: 5,
          reservedQuantity: 0,
          unitPrice: 20.0,
          category: 'Electronics',
        },
        {
          id: 'item-3',
          sku: 'ITEM-003',
          stockQuantity: 0,
          reservedQuantity: 0,
          unitPrice: 15.0,
          category: 'Furniture',
        },
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems as any);

      const result = await inventoryService.getInventoryMetrics();

      expect(result.totalItems).toBe(3);
      expect(result.totalStockValue).toBe(1100); // (100*10) + (5*20) + (0*15)
      expect(result.lowStockItems).toBe(2); // items with stock <= 10
      expect(result.outOfStockItems).toBe(1);
      expect(result.totalReserved).toBe(10);
      expect(result.categories).toEqual({
        Electronics: 2,
        Furniture: 1,
      });
    });
  });

  describe('bulkCheckAvailability', () => {
    it('should check availability for multiple items', async () => {
      const items = [
        { itemId: 'item-1', quantity: 10 },
        { itemId: 'item-2', quantity: 5 },
      ];

      const mockItem1 = {
        id: 'item-1',
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 20,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item 1',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockItem2 = {
        id: 'item-2',
        sku: 'ITEM-002',
        stockQuantity: 10,
        reservedQuantity: 8,
        weightKg: 3.0,
        volumeM3: 0.05,
        name: 'Test Item 2',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 19.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockItem1 as any)
        .mockResolvedValueOnce(mockItem2 as any);

      const result = await inventoryService.bulkCheckAvailability(items);

      expect(result).toHaveLength(2);
      expect(result[0].available).toBe(true);
      expect(result[0].availableQuantity).toBe(80);
      expect(result[1].available).toBe(false);
      expect(result[1].availableQuantity).toBe(2);
    });
  });

  describe('bulkReserveItems', () => {
    it('should reserve multiple items successfully', async () => {
      const items = [
        { itemId: 'item-1', quantity: 10 },
        { itemId: 'item-2', quantity: 5 },
      ];
      const referenceId = 'order-1';

      const mockItem1 = {
        id: 'item-1',
        sku: 'ITEM-001',
        stockQuantity: 100,
        reservedQuantity: 20,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item 1',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockItem2 = {
        id: 'item-2',
        sku: 'ITEM-002',
        stockQuantity: 50,
        reservedQuantity: 10,
        weightKg: 3.0,
        volumeM3: 0.05,
        name: 'Test Item 2',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 19.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedItems = [
        { ...mockItem1, reservedQuantity: 30 },
        { ...mockItem2, reservedQuantity: 15 },
      ];

      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockItem1 as any)
        .mockResolvedValueOnce(mockItem2 as any);

      mockPrisma.$transaction.mockResolvedValue(updatedItems as any);
      mockPrisma.inventoryTransaction.create.mockResolvedValue({} as any);
      mockPrisma.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await inventoryService.bulkReserveItems(items, referenceId);

      expect(result).toHaveLength(2);
      expect(result[0].reservedQuantity).toBe(30);
      expect(result[1].reservedQuantity).toBe(15);
    });

    it('should throw error if any item has insufficient stock', async () => {
      const items = [
        { itemId: 'item-1', quantity: 100 },
        { itemId: 'item-2', quantity: 50 },
      ];
      const referenceId = 'order-1';

      const mockItem1 = {
        id: 'item-1',
        sku: 'ITEM-001',
        stockQuantity: 50,
        reservedQuantity: 20,
        weightKg: 5.5,
        volumeM3: 0.1,
        name: 'Test Item 1',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 29.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockItem2 = {
        id: 'item-2',
        sku: 'ITEM-002',
        stockQuantity: 100,
        reservedQuantity: 10,
        weightKg: 3.0,
        volumeM3: 0.05,
        name: 'Test Item 2',
        isFragile: false,
        requiresRefrigeration: false,
        unitPrice: 19.99,
        category: null,
        description: null,
        dimensionsCm: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.inventoryItem.findUnique
        .mockResolvedValueOnce(mockItem1 as any)
        .mockResolvedValueOnce(mockItem2 as any);

      await expect(
        inventoryService.bulkReserveItems(items, referenceId)
      ).rejects.toThrow('Insufficient stock for items');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history for an item', async () => {
      const itemId = 'item-1';

      const mockTransactions = [
        {
          id: 'txn-1',
          inventoryItemId: itemId,
          transactionType: TransactionType.IN,
          quantity: 100,
          referenceType: 'purchase',
          referenceId: 'PO-001',
          warehouseId: 'warehouse-1',
          notes: 'Initial stock',
          createdAt: new Date(),
        },
        {
          id: 'txn-2',
          inventoryItemId: itemId,
          transactionType: TransactionType.RESERVED,
          quantity: 10,
          referenceType: 'order',
          referenceId: 'order-1',
          warehouseId: null,
          notes: 'Reserved for order',
          createdAt: new Date(),
        },
      ];

      mockPrisma.inventoryTransaction.findMany.mockResolvedValue(mockTransactions as any);

      const result = await inventoryService.getTransactionHistory(itemId, 50);

      expect(result).toHaveLength(2);
      expect(result[0].transactionType).toBe(TransactionType.IN);
      expect(result[1].transactionType).toBe(TransactionType.RESERVED);
      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalled();
    });
  });
});

// Made with Bob
