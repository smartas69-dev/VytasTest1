import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup runs before all tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
});

// Cleanup after each test
afterEach(() => {
  // Clear any mocks
  vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  // Cleanup resources if needed
});

// Global test utilities
global.testUtils = {
  createMockDate: (dateString: string) => new Date(dateString),
  createMockId: (prefix: string, num: number) => `${prefix}-${num}`,
};

// Extend global namespace for TypeScript
declare global {
  var testUtils: {
    createMockDate: (dateString: string) => Date;
    createMockId: (prefix: string, num: number) => string;
  };
}

// Made with Bob
