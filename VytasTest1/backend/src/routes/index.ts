/**
 * API Routes
 * Central routing configuration for all API endpoints
 */

import { Router, Express } from 'express';
import OrderController from '../controllers/OrderController';
import DriversController from '../controllers/DriversController';
import CustomersController from '../controllers/CustomersController';
import TrucksController from '../controllers/TrucksController';
import InventoryController from '../controllers/InventoryController';
import DeliveryZonesController from '../controllers/DeliveryZonesController';
import WarehousesController from '../controllers/WarehousesController';

const router = Router();

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ============================================================================
// Order Routes
// ============================================================================

// Create order
router.post('/orders', OrderController.createOrder.bind(OrderController));

// Get orders with filtering
router.get('/orders', OrderController.getOrders.bind(OrderController));

// Get order statistics
router.get('/orders/statistics', OrderController.getOrderStatistics.bind(OrderController));

// Get unassigned orders
router.get('/orders/unassigned', OrderController.getUnassignedOrders.bind(OrderController));

// Get order by order number
router.get('/orders/number/:orderNumber', OrderController.getOrderByNumber.bind(OrderController));

// Get orders by slot
router.get('/orders/slot/:slotId', OrderController.getOrdersBySlot.bind(OrderController));

// Get order by ID
router.get('/orders/:id', OrderController.getOrderById.bind(OrderController));

// Update order status
router.patch('/orders/:id/status', OrderController.updateOrderStatus.bind(OrderController));

// Confirm order
router.post('/orders/:id/confirm', OrderController.confirmOrder.bind(OrderController));

// Cancel order
router.post('/orders/:id/cancel', OrderController.cancelOrder.bind(OrderController));

// ============================================================================
// Driver Routes
// ============================================================================

router.get('/drivers', DriversController.getDrivers.bind(DriversController));
router.get('/drivers/:id', DriversController.getDriverById.bind(DriversController));
router.post('/drivers', DriversController.createDriver.bind(DriversController));
router.put('/drivers/:id', DriversController.updateDriver.bind(DriversController));
router.delete('/drivers/:id', DriversController.deleteDriver.bind(DriversController));

// ============================================================================
// Customer Routes
// ============================================================================

router.get('/customers', CustomersController.getCustomers.bind(CustomersController));
router.get('/customers/:id', CustomersController.getCustomerById.bind(CustomersController));
router.post('/customers', CustomersController.createCustomer.bind(CustomersController));
router.put('/customers/:id', CustomersController.updateCustomer.bind(CustomersController));
router.delete('/customers/:id', CustomersController.deleteCustomer.bind(CustomersController));

// ============================================================================
// Truck Routes
// ============================================================================

router.get('/trucks', TrucksController.getTrucks.bind(TrucksController));
router.get('/trucks/:id', TrucksController.getTruckById.bind(TrucksController));
router.post('/trucks', TrucksController.createTruck.bind(TrucksController));
router.put('/trucks/:id', TrucksController.updateTruck.bind(TrucksController));
router.delete('/trucks/:id', TrucksController.deleteTruck.bind(TrucksController));

// ============================================================================
// Inventory Routes
// ============================================================================

router.get('/inventory', InventoryController.getInventoryItems.bind(InventoryController));
router.get('/inventory/:id', InventoryController.getInventoryItemById.bind(InventoryController));
router.post('/inventory', InventoryController.createInventoryItem.bind(InventoryController));
router.put('/inventory/:id', InventoryController.updateInventoryItem.bind(InventoryController));
router.delete('/inventory/:id', InventoryController.deleteInventoryItem.bind(InventoryController));

// ============================================================================
// Delivery Zone Routes
// ============================================================================

router.get('/zones', DeliveryZonesController.getDeliveryZones.bind(DeliveryZonesController));
router.get('/zones/:id', DeliveryZonesController.getDeliveryZoneById.bind(DeliveryZonesController));
router.post('/zones', DeliveryZonesController.createDeliveryZone.bind(DeliveryZonesController));
router.put('/zones/:id', DeliveryZonesController.updateDeliveryZone.bind(DeliveryZonesController));
router.delete('/zones/:id', DeliveryZonesController.deleteDeliveryZone.bind(DeliveryZonesController));

// ============================================================================
// Warehouse Routes
// ============================================================================

router.get('/warehouses', WarehousesController.getWarehouses.bind(WarehousesController));
router.get('/warehouses/:id', WarehousesController.getWarehouseById.bind(WarehousesController));
router.post('/warehouses', WarehousesController.createWarehouse.bind(WarehousesController));
router.put('/warehouses/:id', WarehousesController.updateWarehouse.bind(WarehousesController));
router.delete('/warehouses/:id', WarehousesController.deleteWarehouse.bind(WarehousesController));

// ============================================================================
// Slot Routes (Placeholder - to be implemented)
// ============================================================================

router.get('/slots', (req, res) => {
  res.json({
    success: true,
    message: 'Slot endpoints - to be implemented',
  });
});

// ============================================================================
// Load Routes (Placeholder - to be implemented)
// ============================================================================

router.get('/loads', (req, res) => {
  res.json({
    success: true,
    message: 'Load endpoints - to be implemented',
  });
});

// ============================================================================
// Route Optimization Routes (Placeholder - to be implemented)
// ============================================================================

router.get('/routes', (req, res) => {
  res.json({
    success: true,
    message: 'Route optimization endpoints - to be implemented',
  });
});

// ============================================================================
// Error Handler
// ============================================================================

router.use((err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// ============================================================================
// Setup Routes
// ============================================================================

export const setupRoutes = (app: Express): void => {
  // API routes
  app.use('/api', router);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
    });
  });
};

export default router;

// Made with Bob
