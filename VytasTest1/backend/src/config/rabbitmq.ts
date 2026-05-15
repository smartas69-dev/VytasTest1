/**
 * RabbitMQ Configuration
 * Setup message queue for async processing
 */

import * as amqp from 'amqplib';

type Connection = amqp.Connection;
type Channel = amqp.Channel;
type ConsumeMessage = amqp.ConsumeMessage;

// RabbitMQ connection URL
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';

// Queue names
export const QUEUES = {
  LOAD_OPTIMIZATION: 'load_optimization',
  ROUTE_OPTIMIZATION: 'route_optimization',
  INVENTORY_UPDATE: 'inventory_update',
  NOTIFICATION: 'notification',
  RESERVATION_CLEANUP: 'reservation_cleanup',
};

// Exchange names
export const EXCHANGES = {
  DELIVERY: 'delivery_exchange',
  NOTIFICATIONS: 'notifications_exchange',
};

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * Connect to RabbitMQ
 */
export const connectRabbitMQ = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to RabbitMQ...');
    
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Setup connection event handlers
    connection.on('error', (error: Error) => {
      console.error('❌ RabbitMQ connection error:', error);
    });

    connection.on('close', () => {
      console.log('🔌 RabbitMQ connection closed');
      // Attempt to reconnect after delay
      setTimeout(connectRabbitMQ, 5000);
    });

    // Assert queues
    await assertQueues();
    
    // Assert exchanges
    await assertExchanges();

    console.log('✅ RabbitMQ connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    // Retry connection after delay
    setTimeout(connectRabbitMQ, 5000);
  }
};

/**
 * Assert all required queues
 */
const assertQueues = async (): Promise<void> => {
  if (!channel) throw new Error('Channel not initialized');

  for (const queueName of Object.values(QUEUES)) {
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000, // 24 hours
        'x-max-length': 10000,
      },
    });
  }
};

/**
 * Assert all required exchanges
 */
const assertExchanges = async (): Promise<void> => {
  if (!channel) throw new Error('Channel not initialized');

  for (const exchangeName of Object.values(EXCHANGES)) {
    await channel.assertExchange(exchangeName, 'topic', {
      durable: true,
    });
  }
};

/**
 * Get the current channel
 */
export const getChannel = (): Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ first.');
  }
  return channel;
};

/**
 * Publish a message to a queue
 */
export const publishToQueue = async (
  queueName: string,
  message: any,
  options?: {
    priority?: number;
    expiration?: string;
    persistent?: boolean;
  }
): Promise<boolean> => {
  try {
    const ch = getChannel();
    const content = Buffer.from(JSON.stringify(message));
    
    return ch.sendToQueue(queueName, content, {
      persistent: options?.persistent ?? true,
      priority: options?.priority,
      expiration: options?.expiration,
    });
  } catch (error) {
    console.error('Error publishing to queue:', error);
    throw error;
  }
};

/**
 * Publish a message to an exchange
 */
export const publishToExchange = async (
  exchangeName: string,
  routingKey: string,
  message: any,
  options?: {
    priority?: number;
    expiration?: string;
    persistent?: boolean;
  }
): Promise<boolean> => {
  try {
    const ch = getChannel();
    const content = Buffer.from(JSON.stringify(message));
    
    return ch.publish(exchangeName, routingKey, content, {
      persistent: options?.persistent ?? true,
      priority: options?.priority,
      expiration: options?.expiration,
    });
  } catch (error) {
    console.error('Error publishing to exchange:', error);
    throw error;
  }
};

/**
 * Consume messages from a queue
 */
export const consumeQueue = async (
  queueName: string,
  handler: (message: any) => Promise<void>,
  options?: {
    prefetch?: number;
    noAck?: boolean;
  }
): Promise<void> => {
  try {
    const ch = getChannel();
    
    // Set prefetch count
    await ch.prefetch(options?.prefetch ?? 1);
    
    await ch.consume(
      queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          
          // Acknowledge message if not auto-ack
          if (!options?.noAck) {
            ch.ack(msg);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject and requeue message
          ch.nack(msg, false, true);
        }
      },
      {
        noAck: options?.noAck ?? false,
      }
    );
    
    console.log(`📥 Consuming messages from queue: ${queueName}`);
  } catch (error) {
    console.error('Error consuming queue:', error);
    throw error;
  }
};

/**
 * Bind a queue to an exchange
 */
export const bindQueueToExchange = async (
  queueName: string,
  exchangeName: string,
  routingKey: string
): Promise<void> => {
  try {
    const ch = getChannel();
    await ch.bindQueue(queueName, exchangeName, routingKey);
    console.log(`🔗 Bound queue ${queueName} to exchange ${exchangeName} with key ${routingKey}`);
  } catch (error) {
    console.error('Error binding queue to exchange:', error);
    throw error;
  }
};

/**
 * Get queue message count
 */
export const getQueueMessageCount = async (queueName: string): Promise<number> => {
  try {
    const ch = getChannel();
    const queueInfo = await ch.checkQueue(queueName);
    return queueInfo.messageCount;
  } catch (error) {
    console.error('Error getting queue message count:', error);
    return 0;
  }
};

/**
 * Purge all messages from a queue
 */
export const purgeQueue = async (queueName: string): Promise<void> => {
  try {
    const ch = getChannel();
    await ch.purgeQueue(queueName);
    console.log(`🗑️ Purged queue: ${queueName}`);
  } catch (error) {
    console.error('Error purging queue:', error);
    throw error;
  }
};

/**
 * Close RabbitMQ connection
 */
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    console.log('🔄 Closing RabbitMQ connection...');
    
    if (channel) {
      await channel.close();
      channel = null;
    }
    
    if (connection) {
      await connection.close();
      connection = null;
    }
    
    console.log('✅ RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};

/**
 * Health check function for RabbitMQ connection
 */
export const checkRabbitMQHealth = async (): Promise<boolean> => {
  try {
    return connection !== null && channel !== null;
  } catch (error) {
    console.error('RabbitMQ health check failed:', error);
    return false;
  }
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
  await closeRabbitMQ();
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Message type definitions for type safety
 */
export interface LoadOptimizationMessage {
  loadId: string;
  truckId: string;
  orderIds: string[];
  timestamp: Date;
}

export interface RouteOptimizationMessage {
  loadId: string;
  warehouseCoordinates: {
    latitude: number;
    longitude: number;
  };
  deliveryPoints: Array<{
    orderId: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
  timestamp: Date;
}

export interface InventoryUpdateMessage {
  itemId: string;
  quantity: number;
  transactionType: 'in' | 'out' | 'reserved' | 'released';
  timestamp: Date;
}

export interface NotificationMessage {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface ReservationCleanupMessage {
  reservationId: string;
  slotId: string;
  timestamp: Date;
}

export default {
  connect: connectRabbitMQ,
  close: closeRabbitMQ,
  getChannel,
  publishToQueue,
  publishToExchange,
  consumeQueue,
  bindQueueToExchange,
  getQueueMessageCount,
  purgeQueue,
  checkHealth: checkRabbitMQHealth,
  QUEUES,
  EXCHANGES,
};

// Made with Bob
