/**
 * API Routes
 * Central routing configuration for all API endpoints
 */

import { Router, Express } from 'express';
import OrderController from '../controllers/OrderController';

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
// Slot Routes (Placeholder - to be implemented)
// ============================================================================

router.get('/slots', (req, res) => {
  res.json({
    success: true,
    message: 'Slot endpoints - to be implemented',
  });
});

// ============================================================================
// Fleet Routes (Placeholder - to be implemented)
// ============================================================================

router.get('/trucks', (req, res) => {
  res.json({
    success: true,
    message: 'Fleet endpoints - to be implemented',
  });
});

router.get('/drivers', (req, res) => {
  res.json({
    success: true,
    message: 'Driver endpoints - to be implemented',
  });
});

// ============================================================================
// Inventory Routes (Placeholder - to be implemented)
// ============================================================================

router.get('/inventory', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory endpoints - to be implemented',
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
