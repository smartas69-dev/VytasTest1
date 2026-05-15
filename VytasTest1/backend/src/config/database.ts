/**
 * Database Configuration
 * Prisma Client setup with connection pooling and logging
 */

import { PrismaClient } from '@prisma/client';

// Determine log level based on environment
const logLevel = process.env.NODE_ENV === 'production' 
  ? ['error', 'warn'] 
  : ['query', 'error', 'warn', 'info'];

// Create Prisma Client instance with configuration
export const prisma = new PrismaClient({
  log: logLevel as any,
  errorFormat: 'pretty',
});

// Connection event handlers
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('🔄 Disconnecting from database...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught errors
process.on('unhandledRejection', async (error) => {
  console.error('❌ Unhandled rejection:', error);
  await prisma.$disconnect();
  process.exit(1);
});

/**
 * Health check function for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Execute database operations within a transaction
 */
export const executeTransaction = async <T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback);
};

export default prisma;

// Made with Bob
