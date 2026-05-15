/**
 * Inventory Management Service
 * Handles inventory items, stock levels, reservations, and transactions
 */

import { prisma } from '../config/database';
import { setCache, getCache, deleteCache, CacheKeys, CacheTTL } from '../config/redis';
import {
  InventoryItem,
  CreateInventoryItemDTO,
  InventoryTransaction,
  StockAdjustmentDTO,
  TransactionType,
} from '../types';

export class InventoryService {
  /**
   * Get all inventory items with optional filtering
   */
  async getInventoryItems(filters?: {
    category?: string;
    lowStock?: boolean;
    requiresRefrigeration?: boolean;
  }): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        category: filters?.category,
        requiresRefrigeration: filters?.requiresRefrigeration,
        ...(filters?.lowStock && {
          stockQuantity: {
            lte: prisma.inventoryItem.fields.reservedQuantity,
          },
        }),
      },
      orderBy: { sku: 'asc' },
    });

    return items.map(this.convertInventoryDecimals);
  }

  /**
   * Get inventory item by ID with caching
   */
  async getInventoryItemById(itemId: string): Promise<InventoryItem | null> {
    // Try cache first
    const cacheKey = CacheKeys.inventory(itemId);
    const cached = await getCache<InventoryItem>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (item) {
      const converted = this.convertInventoryDecimals(item);
      await setCache(cacheKey, converted, CacheTTL.MEDIUM);
      return converted;
    }

    return null;
  }

  /**
   * Get inventory item by SKU with caching
   */
  async getInventoryItemBySku(sku: string): Promise<InventoryItem | null> {
    // Try cache first
    const cacheKey = CacheKeys.inventoryStock(sku);
    const cached = await getCache<InventoryItem>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const item = await prisma.inventoryItem.findUnique({
      where: { sku },
    });

    if (item) {
      const converted = this.convertInventoryDecimals(item);
      await setCache(cacheKey, converted, CacheTTL.MEDIUM);
      return converted;
    }

    return null;
  }

  /**
   * Create a new inventory item
   */
  async createInventoryItem(data: CreateInventoryItemDTO): Promise<InventoryItem> {
    // Validate SKU is unique
    const existing = await prisma.inventoryItem.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new Error(`Inventory item with SKU ${data.sku} already exists`);
    }

    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        stockQuantity: data.stockQuantity || 0,
        reservedQuantity: 0,
        isFragile: data.isFragile || false,
        requiresRefrigeration: data.requiresRefrigeration || false,
      },
    });

    return this.convertInventoryDecimals(item);
  }

  /**
   * Check availability of items
   */
  async checkAvailability(
    itemId: string,
    quantity: number
  ): Promise<{
    available: boolean;
    stockQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
  }> {
    const item = await this.getInventoryItemById(itemId);

    if (!item) {
      throw new Error(`Inventory item ${itemId} not found`);
    }

    const availableQuantity = item.stockQuantity - item.reservedQuantity;
    const available = availableQuantity >= quantity;

    return {
      available,
      stockQuantity: item.stockQuantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity,
    };
  }

  /**
   * Reserve items (for orders)
   */
  async reserveItems(
    itemId: string,
    quantity: number,
    referenceId: string,
    referenceType: string = 'order'
  ): Promise<InventoryItem> {
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Lock the item row for update
      const item = await tx.inventoryItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error(`Inventory item ${itemId} not found`);
      }

      const availableQuantity = item.stockQuantity - item.reservedQuantity;

      if (availableQuantity < quantity) {
        throw new Error(
          `Insufficient stock for item ${item.sku}. Available: ${availableQuantity}, Requested: ${quantity}`
        );
      }

      // Update reserved quantity
      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          reservedQuantity: {
            increment: quantity,
          },
        },
      });

      // Create transaction record
      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: itemId,
          transactionType: TransactionType.RESERVED,
          quantity,
          referenceType,
          referenceId,
          notes: `Reserved ${quantity} units for ${referenceType} ${referenceId}`,
        },
      });

      return updated;
    });

    // Invalidate cache
    await this.invalidateItemCache(itemId);

    return this.convertInventoryDecimals(result);
  }

  /**
   * Release reserved items (cancel order)
   */
  async releaseReservation(
    itemId: string,
    quantity: number,
    referenceId: string,
    referenceType: string = 'order'
  ): Promise<InventoryItem> {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error(`Inventory item ${itemId} not found`);
      }

      if (item.reservedQuantity < quantity) {
        throw new Error(
          `Cannot release ${quantity} units. Only ${item.reservedQuantity} units are reserved`
        );
      }

      // Update reserved quantity
      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          reservedQuantity: {
            decrement: quantity,
          },
        },
      });

      // Create transaction record
      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: itemId,
          transactionType: TransactionType.RELEASED,
          quantity,
          referenceType,
          referenceId,
          notes: `Released ${quantity} units from ${referenceType} ${referenceId}`,
        },
      });

      return updated;
    });

    // Invalidate cache
    await this.invalidateItemCache(itemId);

    return this.convertInventoryDecimals(result);
  }

  /**
   * Update stock levels (adjust inventory)
   */
  async updateStock(data: StockAdjustmentDTO): Promise<InventoryItem> {
    const { itemId, quantity, transactionType, warehouseId, notes } = data;

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error(`Inventory item ${itemId} not found`);
      }

      let updated;

      switch (transactionType) {
        case TransactionType.IN:
          // Stock in (receiving)
          updated = await tx.inventoryItem.update({
            where: { id: itemId },
            data: {
              stockQuantity: {
                increment: quantity,
              },
            },
          });
          break;

        case TransactionType.OUT:
          // Stock out (fulfillment)
          if (item.stockQuantity < quantity) {
            throw new Error(
              `Insufficient stock. Available: ${item.stockQuantity}, Requested: ${quantity}`
            );
          }
          updated = await tx.inventoryItem.update({
            where: { id: itemId },
            data: {
              stockQuantity: {
                decrement: quantity,
              },
              reservedQuantity: {
                decrement: Math.min(quantity, item.reservedQuantity),
              },
            },
          });
          break;

        case TransactionType.ADJUSTMENT:
          // Manual adjustment (can be positive or negative)
          const newQuantity = item.stockQuantity + quantity;
          if (newQuantity < 0) {
            throw new Error(`Stock adjustment would result in negative stock`);
          }
          updated = await tx.inventoryItem.update({
            where: { id: itemId },
            data: {
              stockQuantity: newQuantity,
            },
          });
          break;

        default:
          throw new Error(`Invalid transaction type: ${transactionType}`);
      }

      // Create transaction record
      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: itemId,
          transactionType,
          quantity: Math.abs(quantity),
          warehouseId,
          notes: notes || `${transactionType} transaction`,
        },
      });

      return updated;
    });

    // Invalidate cache
    await this.invalidateItemCache(itemId);

    return this.convertInventoryDecimals(result);
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold: number = 10): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        stockQuantity: {
          lte: threshold,
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    return items.map(this.convertInventoryDecimals);
  }

  /**
   * Get out of stock items
   */
  async getOutOfStockItems(): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        stockQuantity: 0,
      },
      orderBy: { sku: 'asc' },
    });

    return items.map(this.convertInventoryDecimals);
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(
    itemId: string,
    quantity: number,
    fromWarehouseId: string,
    toWarehouseId: string,
    notes?: string
  ): Promise<{
    item: InventoryItem;
    outTransaction: InventoryTransaction;
    inTransaction: InventoryTransaction;
  }> {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new Error(`Inventory item ${itemId} not found`);
      }

      // Validate warehouses exist
      const [fromWarehouse, toWarehouse] = await Promise.all([
        tx.warehouse.findUnique({ where: { id: fromWarehouseId } }),
        tx.warehouse.findUnique({ where: { id: toWarehouseId } }),
      ]);

      if (!fromWarehouse) {
        throw new Error(`Source warehouse ${fromWarehouseId} not found`);
      }

      if (!toWarehouse) {
        throw new Error(`Destination warehouse ${toWarehouseId} not found`);
      }

      // Create OUT transaction for source warehouse
      const outTransaction = await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: itemId,
          transactionType: TransactionType.OUT,
          quantity,
          warehouseId: fromWarehouseId,
          referenceType: 'transfer',
          referenceId: toWarehouseId,
          notes: notes || `Transfer to ${toWarehouse.name}`,
        },
      });

      // Create IN transaction for destination warehouse
      const inTransaction = await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: itemId,
          transactionType: TransactionType.IN,
          quantity,
          warehouseId: toWarehouseId,
          referenceType: 'transfer',
          referenceId: fromWarehouseId,
          notes: notes || `Transfer from ${fromWarehouse.name}`,
        },
      });

      return {
        item,
        outTransaction,
        inTransaction,
      };
    });

    // Invalidate cache
    await this.invalidateItemCache(itemId);

    return {
      item: this.convertInventoryDecimals(result.item),
      outTransaction: result.outTransaction as InventoryTransaction,
      inTransaction: result.inTransaction as InventoryTransaction,
    };
  }

  /**
   * Get inventory transaction history
   */
  async getTransactionHistory(
    itemId: string,
    limit: number = 50
  ): Promise<InventoryTransaction[]> {
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { inventoryItemId: itemId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions as InventoryTransaction[];
  }

  /**
   * Get inventory metrics
   */
  async getInventoryMetrics(): Promise<{
    totalItems: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalReserved: number;
    categories: Record<string, number>;
  }> {
    const items = await prisma.inventoryItem.findMany();

    const totalItems = items.length;
    const totalStockValue = items.reduce(
      (sum, item) => sum + Number(item.unitPrice || 0) * item.stockQuantity,
      0
    );
    const lowStockItems = items.filter((item) => item.stockQuantity <= 10).length;
    const outOfStockItems = items.filter((item) => item.stockQuantity === 0).length;
    const totalReserved = items.reduce((sum, item) => sum + item.reservedQuantity, 0);

    // Group by category
    const categories: Record<string, number> = {};
    items.forEach((item) => {
      const category = item.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      totalItems,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      totalReserved,
      categories,
    };
  }

  /**
   * Bulk check availability for multiple items
   */
  async bulkCheckAvailability(
    items: Array<{ itemId: string; quantity: number }>
  ): Promise<
    Array<{
      itemId: string;
      sku: string;
      available: boolean;
      availableQuantity: number;
      requestedQuantity: number;
    }>
  > {
    const results = await Promise.all(
      items.map(async ({ itemId, quantity }) => {
        const item = await this.getInventoryItemById(itemId);

        if (!item) {
          return {
            itemId,
            sku: 'UNKNOWN',
            available: false,
            availableQuantity: 0,
            requestedQuantity: quantity,
          };
        }

        const availableQuantity = item.stockQuantity - item.reservedQuantity;
        const available = availableQuantity >= quantity;

        return {
          itemId,
          sku: item.sku,
          available,
          availableQuantity,
          requestedQuantity: quantity,
        };
      })
    );

    return results;
  }

  /**
   * Bulk reserve items (for orders with multiple items)
   */
  async bulkReserveItems(
    items: Array<{ itemId: string; quantity: number }>,
    referenceId: string,
    referenceType: string = 'order'
  ): Promise<InventoryItem[]> {
    // First check if all items are available
    const availability = await this.bulkCheckAvailability(items);
    const unavailable = availability.filter((a) => !a.available);

    if (unavailable.length > 0) {
      const details = unavailable
        .map((a) => `${a.sku}: need ${a.requestedQuantity}, have ${a.availableQuantity}`)
        .join('; ');
      throw new Error(`Insufficient stock for items: ${details}`);
    }

    // Reserve all items in a single transaction
    const result = await prisma.$transaction(
      items.map(({ itemId, quantity }) =>
        prisma.inventoryItem.update({
          where: { id: itemId },
          data: {
            reservedQuantity: {
              increment: quantity,
            },
          },
        })
      )
    );

    // Create transaction records
    await Promise.all(
      items.map(({ itemId, quantity }) =>
        prisma.inventoryTransaction.create({
          data: {
            inventoryItemId: itemId,
            transactionType: TransactionType.RESERVED,
            quantity,
            referenceType,
            referenceId,
            notes: `Reserved ${quantity} units for ${referenceType} ${referenceId}`,
          },
        })
      )
    );

    // Invalidate caches
    await Promise.all(items.map(({ itemId }) => this.invalidateItemCache(itemId)));

    return result.map(this.convertInventoryDecimals);
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Convert Prisma Decimal fields to numbers for InventoryItem
   */
  private convertInventoryDecimals(item: any): InventoryItem {
    return {
      ...item,
      weightKg: Number(item.weightKg),
      volumeM3: Number(item.volumeM3),
      unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
    } as InventoryItem;
  }

  /**
   * Invalidate item cache
   */
  private async invalidateItemCache(itemId: string): Promise<void> {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (item) {
      await deleteCache(CacheKeys.inventory(itemId));
      await deleteCache(CacheKeys.inventoryStock(item.sku));
    }
  }
}

export default new InventoryService();

// Made with Bob
