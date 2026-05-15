/**
 * Express Application Setup
 * Main application configuration with middleware and routes
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupRoutes } from './routes';

const app: Express = express();

// ============================================================================
// Middleware
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Routes
// ============================================================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Last Mile Delivery API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/health',
        orders: '/api/orders',
        slots: '/api/slots',
        fleet: '/api/trucks',
        drivers: '/api/drivers',
        inventory: '/api/inventory',
        loads: '/api/loads',
        routes: '/api/routes',
      },
    },
  });
});

// Setup API routes
setupRoutes(app);

// ============================================================================
// Error Handling
// ============================================================================

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
});

// ============================================================================
// Server Startup (for standalone execution)
// ============================================================================

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Last Mile Delivery API running on port ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;

// Made with Bob
