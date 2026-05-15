# 🧪 Testing Guide - Last Mile Delivery System

Complete guide for testing the Last Mile Delivery System.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Setup](#setup)
4. [Running Tests](#running-tests)
5. [Test Structure](#test-structure)
6. [Writing Tests](#writing-tests)
7. [Coverage Reports](#coverage-reports)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Last Mile Delivery System uses a comprehensive testing strategy with multiple test types:

- **Unit Tests** - Test individual functions and methods
- **Integration Tests** - Test service interactions and API endpoints
- **E2E Tests** - Test complete user workflows
- **Component Tests** - Test React components

### Testing Goals

| Test Type | Coverage Goal | Status |
|-----------|---------------|--------|
| Unit Tests | 85%+ | 🟡 In Progress (20%) |
| Integration Tests | 80%+ | ⏳ Pending |
| E2E Tests | Critical Paths | ⏳ Pending |
| Component Tests | 75%+ | ⏳ Pending |

---

## 🛠️ Testing Stack

### Backend Testing
- **Vitest** - Fast, modern test runner
- **vitest-mock-extended** - Advanced mocking for Prisma
- **@vitest/coverage-v8** - Code coverage reporting
- **@vitest/ui** - Visual test interface

### Frontend Testing (Planned)
- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **MSW** - API mocking

### E2E Testing (Planned)
- **Playwright** - Browser automation
- **@playwright/test** - E2E test framework

---

## 🚀 Setup

### 1. Install Dependencies

```bash
# Backend tests
cd backend
npm install

# Frontend tests (when implemented)
cd frontend
npm install
```

### 2. Environment Setup

Tests use a separate test database. Configure in `backend/.env.test`:

```env
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
REDIS_URL="redis://localhost:6379/1"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
NODE_ENV=test
```

### 3. Test Database Setup

```bash
# Create test database
createdb test_db

# Run migrations
cd backend
DATABASE_URL="postgresql://test:test@localhost:5432/test_db" npx prisma migrate deploy
```

---

## 🏃 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test SlotService.test.ts

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run tests in CI mode
npm test -- --run
```

### Frontend Tests (When Implemented)

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run component tests
npm test -- components/

# Generate coverage
npm run test:coverage
```

### E2E Tests (When Implemented)

```bash
# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- booking.spec.ts
```

---

## 📁 Test Structure

### Backend Test Organization

```
backend/
├── tests/
│   ├── setup.ts                 # Global test setup
│   ├── unit/                    # Unit tests
│   │   ├── SlotService.test.ts
│   │   ├── OrderService.test.ts
│   │   ├── FleetService.test.ts
│   │   ├── InventoryService.test.ts
│   │   ├── LoadOptimizationService.test.ts
│   │   └── RouteOptimizationService.test.ts
│   ├── integration/             # Integration tests
│   │   ├── api/
│   │   │   ├── orders.test.ts
│   │   │   └── slots.test.ts
│   │   └── services/
│   │       └── order-flow.test.ts
│   └── e2e/                     # End-to-end tests
│       ├── booking-flow.test.ts
│       └── admin-flow.test.ts
├── vitest.config.ts             # Vitest configuration
└── package.json
```

### Frontend Test Organization (Planned)

```
frontend/
├── tests/
│   ├── setup.ts
│   ├── components/
│   │   ├── customer/
│   │   ├── admin/
│   │   └── driver/
│   ├── store/
│   │   └── ordersApi.test.ts
│   └── integration/
│       └── booking-flow.test.tsx
├── vitest.config.ts
└── package.json
```

---

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SlotService } from '../../src/services/SlotService';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('SlotService', () => {
  let slotService: SlotService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    const { prisma } = require('../../src/config/database');
    prismaMock = prisma as DeepMockProxy<PrismaClient>;
    slotService = new SlotService();
  });

  afterEach(() => {
    mockReset(prismaMock);
  });

  describe('reserveSlot', () => {
    it('should successfully reserve an available slot', async () => {
      // Arrange
      const slotId = 'slot-1';
      const customerId = 'customer-1';
      
      const mockSlot = {
        id: slotId,
        availableCapacity: 50,
        // ... other properties
      };

      prismaMock.timeSlot.findUnique.mockResolvedValue(mockSlot);
      prismaMock.reservation.create.mockResolvedValue({
        id: 'reservation-1',
        status: 'pending',
        // ... other properties
      });

      // Act
      const result = await slotService.reserveSlot(slotId, customerId);

      // Assert
      expect(result.id).toBe('reservation-1');
      expect(result.status).toBe('pending');
      expect(prismaMock.reservation.create).toHaveBeenCalled();
    });

    it('should throw error if slot is full', async () => {
      // Arrange
      const slotId = 'slot-1';
      const customerId = 'customer-1';
      
      prismaMock.timeSlot.findUnique.mockResolvedValue({
        id: slotId,
        availableCapacity: 0, // Full
      });

      // Act & Assert
      await expect(
        slotService.reserveSlot(slotId, customerId)
      ).rejects.toThrow('Time slot is full');
    });
  });
});
```

### Integration Test Example (Template)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Orders API', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        customerId: 'customer-1',
        timeSlotId: 'slot-1',
        deliveryAddress: '123 Main St',
        items: [
          { inventoryItemId: 'item-1', quantity: 2 }
        ],
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
    });
  });
});
```

### Component Test Example (Template)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../src/store';
import SlotCalendar from '../../src/components/customer/SlotCalendar';

describe('SlotCalendar', () => {
  it('should render available slots', () => {
    render(
      <Provider store={store}>
        <SlotCalendar zoneId="zone-1" onSlotSelect={vi.fn()} />
      </Provider>
    );

    expect(screen.getByText(/Select Time Slot/i)).toBeInTheDocument();
  });

  it('should call onSlotSelect when slot is clicked', () => {
    const onSlotSelect = vi.fn();
    
    render(
      <Provider store={store}>
        <SlotCalendar zoneId="zone-1" onSlotSelect={onSlotSelect} />
      </Provider>
    );

    const slot = screen.getByText(/09:00 - 10:00/i);
    fireEvent.click(slot);

    expect(onSlotSelect).toHaveBeenCalledWith(expect.objectContaining({
      startTime: '09:00',
      endTime: '10:00',
    }));
  });
});
```

---

## 📊 Coverage Reports

### Generating Coverage

```bash
# Backend coverage
cd backend
npm run test:coverage

# View HTML report
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,      // 80% of lines covered
    functions: 80,  // 80% of functions covered
    branches: 75,   // 75% of branches covered
    statements: 80, // 80% of statements covered
  },
}
```

### Coverage Reports

- **Text** - Console output
- **JSON** - Machine-readable format
- **HTML** - Interactive web interface

---

## 🎯 Best Practices

### 1. Test Organization

✅ **DO:**
- Group related tests with `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test one thing per test

❌ **DON'T:**
- Write tests that depend on each other
- Test implementation details
- Use real external services
- Ignore failing tests

### 2. Mocking

✅ **DO:**
- Mock external dependencies (database, APIs)
- Use `mockDeep` for Prisma mocking
- Reset mocks between tests
- Mock at the boundary

❌ **DON'T:**
- Mock everything (test real logic)
- Forget to reset mocks
- Mock internal functions
- Over-mock (makes tests brittle)

### 3. Assertions

✅ **DO:**
- Use specific assertions
- Test error cases
- Verify mock calls
- Check return values

❌ **DON'T:**
- Use generic assertions
- Only test happy paths
- Ignore edge cases
- Test too many things at once

### 4. Test Data

✅ **DO:**
- Use factory functions for test data
- Keep test data minimal
- Use realistic data
- Clean up after tests

❌ **DON'T:**
- Use production data
- Create unnecessary data
- Leave test data in database
- Use magic numbers

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Fail to Run

**Problem:** `Cannot find module 'vitest'`

**Solution:**
```bash
cd backend
npm install
```

#### 2. Database Connection Errors

**Problem:** `Can't reach database server`

**Solution:**
```bash
# Ensure test database exists
createdb test_db

# Check DATABASE_URL in .env.test
# Run migrations
npx prisma migrate deploy
```

#### 3. Mock Not Working

**Problem:** Mock not being called

**Solution:**
```typescript
// Ensure mock is set up before test
beforeEach(() => {
  prismaMock.order.findUnique.mockResolvedValue(mockOrder);
});

// Reset mocks after each test
afterEach(() => {
  mockReset(prismaMock);
});
```

#### 4. Timeout Errors

**Problem:** Test times out

**Solution:**
```typescript
// Increase timeout for specific test
it('should handle long operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

#### 5. Coverage Not Generated

**Problem:** Coverage report empty

**Solution:**
```bash
# Ensure coverage provider is installed
npm install --save-dev @vitest/coverage-v8

# Run with coverage flag
npm run test:coverage
```

---

## 📚 Additional Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

### Testing Guides
- [Testing Best Practices](https://testingjavascript.com/)
- [Unit Testing Principles](https://martinfowler.com/bliki/UnitTest.html)
- [Integration Testing](https://martinfowler.com/bliki/IntegrationTest.html)

### Project-Specific
- README.md - Project overview
- PROJECT_SUMMARY.md - Architecture details
- API documentation - Endpoint specifications

---

## 🎓 Testing Checklist

### Before Committing

- [ ] All tests pass locally
- [ ] New code has tests
- [ ] Coverage meets thresholds
- [ ] No console errors/warnings
- [ ] Tests are independent
- [ ] Mocks are properly reset

### Code Review

- [ ] Tests are clear and readable
- [ ] Edge cases are covered
- [ ] Error cases are tested
- [ ] Mocks are appropriate
- [ ] Test names are descriptive
- [ ] No flaky tests

---

## 📈 Current Test Status

### Unit Tests

| Service | Tests | Lines | Status |
|---------|-------|-------|--------|
| SlotService | 13 | 385 | ✅ Complete |
| OrderService | 18 | 425 | ✅ Complete |
| FleetService | 0 | 0 | ⏳ Pending |
| InventoryService | 0 | 0 | ⏳ Pending |
| LoadOptimizationService | 0 | 0 | ⏳ Pending |
| RouteOptimizationService | 0 | 0 | ⏳ Pending |

**Total:** 31 tests, 810 lines

### Integration Tests

| Area | Tests | Status |
|------|-------|--------|
| API Endpoints | 0 | ⏳ Pending |
| Service Integration | 0 | ⏳ Pending |
| Database Operations | 0 | ⏳ Pending |

### E2E Tests

| Flow | Tests | Status |
|------|-------|--------|
| Customer Booking | 0 | ⏳ Pending |
| Admin Dashboard | 0 | ⏳ Pending |
| Driver App | 0 | ⏳ Pending |

### Frontend Tests

| Component Type | Tests | Status |
|----------------|-------|--------|
| Customer Components | 0 | ⏳ Pending |
| Admin Components | 0 | ⏳ Pending |
| Driver Components | 0 | ⏳ Pending |
| Redux Store | 0 | ⏳ Pending |

---

## 🎯 Next Steps

1. **Complete Unit Tests** - Finish remaining 4 services
2. **Add Integration Tests** - Test API endpoints and service interactions
3. **Implement E2E Tests** - Test complete user workflows
4. **Add Component Tests** - Test React components
5. **Achieve Coverage Goals** - Reach 85%+ unit test coverage

---

**Last Updated:** May 14, 2026  
**Version:** 1.0.0  
**Status:** Testing Phase 4 - In Progress (20%)