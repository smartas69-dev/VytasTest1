# Last Mile Delivery System - Complete Working Demo Plan

## Executive Summary
A complete logistics last mile delivery application with:
- ✅ Delivery slot booking and optimization
- ✅ Truck/Fleet management with load optimization
- ✅ Inventory management and tracking
- ✅ Dockerized deployment
- ✅ Full test coverage (Unit + E2E)
- ✅ Working demo with seed data

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Customer   │ │    Admin     │ │    Driver    │        │
│  │   Portal     │ │   Dashboard  │ │     App      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                   API Gateway (Express)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │     Slot     │ │    Fleet     │ │  Inventory   │        │
│  │   Service    │ │   Service    │ │   Service    │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│         │                 │                 │                │
│  ┌──────┴─────────────────┴─────────────────┴───────┐       │
│  │          Optimization Engine                      │       │
│  │  • Route Optimization  • Load Optimization        │       │
│  │  • Slot Optimization   • Inventory Allocation     │       │
│  └───────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  PostgreSQL  │ │    Redis     │ │   RabbitMQ   │        │
│  │  (Primary)   │ │   (Cache)    │ │   (Queue)    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **ORM**: Prisma 5.x
- **Validation**: Zod
- **Authentication**: JWT + bcrypt

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: Leaflet / Mapbox GL

### Database & Cache
- **Primary DB**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ 3.12

### Testing
- **Unit Tests**: Jest + ts-jest
- **API Tests**: Supertest
- **E2E Tests**: Playwright
- **Coverage**: Istanbul/nyc

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (optional)
- **Monitoring**: Prometheus + Grafana (optional)

## Complete Database Schema

### 1. Delivery Zones
```sql
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  polygon GEOMETRY(POLYGON, 4326),
  max_daily_capacity INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Time Slots
```sql
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES delivery_zones(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_capacity INTEGER NOT NULL,
  price_multiplier DECIMAL(4,2) DEFAULT 1.0,
  status VARCHAR(20) DEFAULT 'active', -- active, full, disabled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(zone_id, date, start_time)
);
```

### 3. Inventory Items
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  weight_kg DECIMAL(10,2) NOT NULL,
  volume_m3 DECIMAL(10,4) NOT NULL,
  dimensions_cm VARCHAR(50), -- "LxWxH"
  is_fragile BOOLEAN DEFAULT false,
  requires_refrigeration BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Warehouses
```sql
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT NOT NULL,
  total_capacity_m3 DECIMAL(10,2) NOT NULL,
  used_capacity_m3 DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Trucks/Vehicles
```sql
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- van, truck, refrigerated_truck
  max_weight_kg DECIMAL(10,2) NOT NULL,
  max_volume_m3 DECIMAL(10,2) NOT NULL,
  current_weight_kg DECIMAL(10,2) DEFAULT 0,
  current_volume_m3 DECIMAL(10,2) DEFAULT 0,
  fuel_type VARCHAR(20), -- diesel, electric, hybrid
  status VARCHAR(20) DEFAULT 'available', -- available, loading, in_transit, maintenance
  current_location POINT,
  warehouse_id UUID REFERENCES warehouses(id),
  has_refrigeration BOOLEAN DEFAULT false,
  has_lift_gate BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Drivers
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  license_number VARCHAR(50) NOT NULL,
  license_expiry DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- available, on_duty, off_duty, on_leave
  current_truck_id UUID REFERENCES trucks(id),
  shift_start TIME,
  shift_end TIME,
  max_hours_per_day INTEGER DEFAULT 8,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Customers
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  default_address TEXT,
  default_coordinates POINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  slot_id UUID REFERENCES time_slots(id),
  delivery_address TEXT NOT NULL,
  delivery_coordinates POINT NOT NULL,
  zone_id UUID REFERENCES delivery_zones(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, packed, loaded, in_transit, delivered, cancelled
  priority INTEGER DEFAULT 0,
  total_weight_kg DECIMAL(10,2),
  total_volume_m3 DECIMAL(10,4),
  estimated_duration_minutes INTEGER,
  special_instructions TEXT,
  requires_signature BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Order Items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Truck Loads
```sql
CREATE TABLE truck_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES trucks(id),
  driver_id UUID REFERENCES drivers(id),
  slot_id UUID REFERENCES time_slots(id),
  status VARCHAR(20) DEFAULT 'planning', -- planning, loading, loaded, in_transit, completed
  total_weight_kg DECIMAL(10,2),
  total_volume_m3 DECIMAL(10,4),
  order_count INTEGER,
  planned_route JSONB, -- Array of order IDs in sequence
  actual_route JSONB,
  estimated_distance_km DECIMAL(10,2),
  estimated_duration_minutes INTEGER,
  actual_distance_km DECIMAL(10,2),
  actual_duration_minutes INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 11. Load Items (Junction table)
```sql
CREATE TABLE load_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES truck_loads(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  sequence_number INTEGER NOT NULL,
  loaded_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 12. Reservations
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES time_slots(id),
  order_id UUID REFERENCES orders(id),
  status VARCHAR(20) DEFAULT 'active', -- active, confirmed, expired, cancelled
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. Inventory Transactions
```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id),
  transaction_type VARCHAR(20) NOT NULL, -- in, out, reserved, released, adjustment
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50), -- order, return, adjustment
  reference_id UUID,
  warehouse_id UUID REFERENCES warehouses(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Core Features Implementation

### Feature 1: Slot Management

#### Capabilities:
- Dynamic slot generation based on zone capacity
- Real-time availability tracking with Redis cache
- Automatic slot reservation with 15-minute timeout
- Dynamic pricing based on demand and time
- Bulk slot creation for multiple zones

#### Key Components:
```typescript
// services/SlotService.ts
class SlotService {
  async generateSlots(params: GenerateSlotsParams): Promise<TimeSlot[]>
  async getAvailableSlots(zoneId: string, dateRange: DateRange): Promise<TimeSlot[]>
  async reserveSlot(slotId: string, orderId: string): Promise<Reservation>
  async confirmReservation(reservationId: string): Promise<void>
  async releaseExpiredReservations(): Promise<void>
  async updateSlotCapacity(slotId: string, delta: number): Promise<void>
}
```

### Feature 2: Truck/Fleet Management

#### Capabilities:
- Real-time truck status tracking
- Load capacity monitoring (weight + volume)
- Driver assignment and scheduling
- Maintenance scheduling
- GPS tracking integration ready
- Fuel consumption tracking

#### Key Components:
```typescript
// services/FleetService.ts
class FleetService {
  async getTruckAvailability(date: Date): Promise<Truck[]>
  async assignDriverToTruck(driverId: string, truckId: string): Promise<void>
  async updateTruckStatus(truckId: string, status: TruckStatus): Promise<void>
  async checkLoadCapacity(truckId: string, weight: number, volume: number): Promise<boolean>
  async getTruckUtilization(truckId: string, period: DateRange): Promise<UtilizationStats>
}
```

### Feature 3: Inventory Management

#### Capabilities:
- Real-time stock tracking
- Automatic reservation on order creation
- Stock alerts and notifications
- Multi-warehouse support
- Batch operations for stock adjustments
- Transaction history and audit trail

#### Key Components:
```typescript
// services/InventoryService.ts
class InventoryService {
  async checkAvailability(sku: string, quantity: number): Promise<boolean>
  async reserveItems(orderId: string, items: OrderItem[]): Promise<void>
  async releaseReservation(orderId: string): Promise<void>
  async updateStock(sku: string, quantity: number, type: TransactionType): Promise<void>
  async getStockLevel(sku: string): Promise<StockInfo>
  async getLowStockItems(threshold: number): Promise<InventoryItem[]>
  async transferStock(from: string, to: string, items: TransferItem[]): Promise<void>
}
```

### Feature 4: Load Optimization

#### Capabilities:
- 3D bin packing algorithm for truck loading
- Weight distribution optimization
- Volume utilization maximization
- Fragile item handling
- Temperature-controlled item segregation
- Loading sequence optimization

#### Algorithm:
```typescript
// services/LoadOptimizationService.ts
class LoadOptimizationService {
  async optimizeLoad(truckId: string, orders: Order[]): Promise<LoadPlan>
  async calculateLoadSequence(items: OrderItem[]): Promise<LoadSequence>
  async validateLoadConstraints(truck: Truck, load: LoadPlan): Promise<ValidationResult>
  async reoptimizeLoad(loadId: string, newOrders: Order[]): Promise<LoadPlan>
}

// Algorithm Steps:
// 1. Sort items by: fragility, size, weight
// 2. Apply 3D bin packing (First Fit Decreasing)
// 3. Validate weight distribution
// 4. Optimize for delivery sequence
// 5. Generate loading instructions
```

### Feature 5: Route Optimization

#### Capabilities:
- Multi-stop route optimization
- Time window constraints
- Traffic pattern consideration
- Driver break time scheduling
- Real-time route adjustment
- Distance and time estimation

#### Algorithm:
```typescript
// services/RouteOptimizationService.ts
class RouteOptimizationService {
  async optimizeRoute(loadId: string): Promise<OptimizedRoute>
  async calculateDeliverySequence(orders: Order[]): Promise<number[]>
  async estimateRouteMetrics(route: Route): Promise<RouteMetrics>
  async reoptimizeRoute(loadId: string, completedOrders: string[]): Promise<OptimizedRoute>
}

// Algorithm: Hybrid approach
// 1. Cluster orders by geographic proximity (K-means)
// 2. Solve TSP for each cluster (2-opt heuristic)
// 3. Apply time window constraints
// 4. Optimize inter-cluster transitions
// 5. Validate driver hours and breaks
```

## API Endpoints

### Slot Management
```
GET    /api/zones                          # List all zones
GET    /api/zones/:zoneId/slots            # Get available slots
POST   /api/slots/generate                 # Generate slots (admin)
POST   /api/slots/:slotId/reserve          # Reserve a slot
POST   /api/reservations/:id/confirm       # Confirm reservation
DELETE /api/reservations/:id               # Cancel reservation
```

### Fleet Management
```
GET    /api/trucks                         # List all trucks
GET    /api/trucks/:id                     # Get truck details
POST   /api/trucks                         # Add new truck
PUT    /api/trucks/:id                     # Update truck
DELETE /api/trucks/:id                     # Remove truck
GET    /api/trucks/:id/utilization         # Get utilization stats
POST   /api/trucks/:id/assign-driver       # Assign driver
GET    /api/drivers                        # List all drivers
POST   /api/drivers                        # Add new driver
PUT    /api/drivers/:id                    # Update driver
```

### Inventory Management
```
GET    /api/inventory                      # List all items
GET    /api/inventory/:sku                 # Get item details
POST   /api/inventory                      # Add new item
PUT    /api/inventory/:sku                 # Update item
DELETE /api/inventory/:sku                 # Remove item
POST   /api/inventory/:sku/adjust          # Adjust stock
GET    /api/inventory/:sku/transactions    # Get transaction history
GET    /api/inventory/low-stock            # Get low stock items
POST   /api/inventory/transfer             # Transfer between warehouses
```

### Order Management
```
GET    /api/orders                         # List orders
GET    /api/orders/:id                     # Get order details
POST   /api/orders                         # Create order
PUT    /api/orders/:id                     # Update order
DELETE /api/orders/:id                     # Cancel order
POST   /api/orders/:id/pack                # Mark as packed
POST   /api/orders/:id/load                # Mark as loaded
```

### Load Management
```
GET    /api/loads                          # List all loads
GET    /api/loads/:id                      # Get load details
POST   /api/loads                          # Create load
PUT    /api/loads/:id                      # Update load
POST   /api/loads/:id/optimize             # Optimize load
POST   /api/loads/:id/start                # Start delivery
POST   /api/loads/:id/complete             # Complete delivery
GET    /api/loads/:id/route                # Get optimized route
```

### Analytics & Reports
```
GET    /api/analytics/dashboard            # Dashboard metrics
GET    /api/analytics/slot-utilization     # Slot utilization report
GET    /api/analytics/truck-efficiency     # Truck efficiency report
GET    /api/analytics/inventory-turnover   # Inventory turnover
GET    /api/analytics/delivery-performance # Delivery performance
```

## Project Structure

```
last-mile-delivery/
├── docker-compose.yml
├── .env.example
├── README.md
├── SETUP.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── rabbitmq.ts
│   │   ├── models/
│   │   │   ├── TimeSlot.ts
│   │   │   ├── Truck.ts
│   │   │   ├── InventoryItem.ts
│   │   │   ├── Order.ts
│   │   │   └── TruckLoad.ts
│   │   ├── services/
│   │   │   ├── SlotService.ts
│   │   │   ├── FleetService.ts
│   │   │   ├── InventoryService.ts
│   │   │   ├── OrderService.ts
│   │   │   ├── LoadOptimizationService.ts
│   │   │   └── RouteOptimizationService.ts
│   │   ├── controllers/
│   │   │   ├── SlotController.ts
│   │   │   ├── FleetController.ts
│   │   │   ├── InventoryController.ts
│   │   │   ├── OrderController.ts
│   │   │   └── LoadController.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── slots.ts
│   │   │   ├── fleet.ts
│   │   │   ├── inventory.ts
│   │   │   ├── orders.ts
│   │   │   └── loads.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers.ts
│   │   └── types/
│   │       ├── index.ts
│   │       └── api.ts
│   └── tests/
│       ├── unit/
│       │   ├── services/
│       │   └── utils/
│       ├── integration/
│       │   └── api/
│       └── e2e/
│           └── scenarios/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── common/
│       │   ├── slots/
│       │   │   ├── SlotCalendar.tsx
│       │   │   ├── SlotCard.tsx
│       │   │   └── SlotBooking.tsx
│       │   ├── fleet/
│       │   │   ├── TruckList.tsx
│       │   │   ├── TruckDetails.tsx
│       │   │   ├── DriverAssignment.tsx
│       │   │   └── LoadPlanner.tsx
│       │   ├── inventory/
│       │   │   ├── InventoryList.tsx
│       │   │   ├── StockAdjustment.tsx
│       │   │   └── LowStockAlert.tsx
│       │   ├── orders/
│       │   │   ├── OrderList.tsx
│       │   │   ├── OrderForm.tsx
│       │   │   └── OrderTracking.tsx
│       │   └── dashboard/
│       │       ├── AdminDashboard.tsx
│       │       ├── DriverDashboard.tsx
│       │       └── Analytics.tsx
│       ├── pages/
│       │   ├── CustomerBooking.tsx
│       │   ├── AdminPanel.tsx
│       │   ├── DriverApp.tsx
│       │   └── Login.tsx
│       ├── store/
│       │   ├── index.ts
│       │   ├── slices/
│       │   └── api/
│       ├── hooks/
│       ├── utils/
│       └── types/
│
└── tests/
    └── e2e/
        ├── playwright.config.ts
        └── specs/
            ├── booking-flow.spec.ts
            ├── fleet-management.spec.ts
            ├── inventory-management.spec.ts
            └── load-optimization.spec.ts
```

## Docker Configuration

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: lastmile_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://admin:admin123@postgres:5432/lastmile_db
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://admin:admin123@rabbitmq:5672
      JWT_SECRET: your-secret-key-change-in-production
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: http://localhost:3000/api
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

## Testing Strategy

### Unit Tests (Target: 85% coverage)

#### 1. Slot Service Tests
```typescript
describe('SlotService', () => {
  describe('generateSlots', () => {
    it('should generate slots for valid date range', async () => {})
    it('should respect zone capacity limits', async () => {})
    it('should apply correct time intervals', async () => {})
    it('should handle multiple zones', async () => {})
  })

  describe('reserveSlot', () => {
    it('should reserve available slot', async () => {})
    it('should fail when slot is full', async () => {})
    it('should handle concurrent reservations', async () => {})
    it('should set correct expiration time', async () => {})
  })

  describe('releaseExpiredReservations', () => {
    it('should release expired reservations', async () => {})
    it('should restore slot capacity', async () => {})
    it('should not affect active reservations', async () => {})
  })
})
```

#### 2. Fleet Service Tests
```typescript
describe('FleetService', () => {
  describe('checkLoadCapacity', () => {
    it('should validate weight capacity', async () => {})
    it('should validate volume capacity', async () => {})
    it('should consider current load', async () => {})
    it('should handle edge cases', async () => {})
  })

  describe('assignDriverToTruck', () => {
    it('should assign available driver', async () => {})
    it('should prevent double assignment', async () => {})
    it('should validate driver license', async () => {})
    it('should check shift times', async () => {})
  })
})
```

#### 3. Inventory Service Tests
```typescript
describe('InventoryService', () => {
  describe('reserveItems', () => {
    it('should reserve available items', async () => {})
    it('should fail when insufficient stock', async () => {})
    it('should handle partial availability', async () => {})
    it('should create transaction records', async () => {})
  })

  describe('updateStock', () => {
    it('should update stock correctly', async () => {})
    it('should prevent negative stock', async () => {})
    it('should handle concurrent updates', async () => {})
    it('should trigger low stock alerts', async () => {})
  })
})
```

#### 4. Load Optimization Tests
```typescript
describe('LoadOptimizationService', () => {
  describe('optimizeLoad', () => {
    it('should pack items efficiently', async () => {})
    it('should respect weight limits', async () => {})
    it('should respect volume limits', async () => {})
    it('should handle fragile items', async () => {})
    it('should segregate refrigerated items', async () => {})
    it('should optimize for delivery sequence', async () => {})
  })

  describe('calculateLoadSequence', () => {
    it('should prioritize heavy items at bottom', async () => {})
    it('should place fragile items on top', async () => {})
    it('should consider delivery order', async () => {})
  })
})
```

#### 5. Route Optimization Tests
```typescript
describe('RouteOptimizationService', () => {
  describe('optimizeRoute', () => {
    it('should minimize total distance', async () => {})
    it('should respect time windows', async () => {})
    it('should handle multiple stops', async () => {})
    it('should consider traffic patterns', async () => {})
    it('should include driver breaks', async () => {})
  })

  describe('calculateDeliverySequence', () => {
    it('should cluster nearby orders', async () => {})
    it('should solve TSP efficiently', async () => {})
    it('should handle priority orders', async () => {})
  })
})
```

### Integration Tests

```typescript
describe('Order Booking Flow', () => {
  it('should complete full booking flow', async () => {
    // 1. Check inventory availability
    // 2. Reserve slot
    // 3. Create order
    // 4. Reserve inventory
    // 5. Confirm reservation
    // 6. Verify all state changes
  })

  it('should handle booking failure scenarios', async () => {
    // Test rollback on failures
  })
})

describe('Load Planning Flow', () => {
  it('should plan and optimize load', async () => {
    // 1. Get orders for slot
    // 2. Select truck
    // 3. Optimize load
    // 4. Assign driver
    // 5. Generate route
    // 6. Verify load plan
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/specs/booking-flow.spec.ts
test.describe('Customer Booking Journey', () => {
  test('should book a delivery slot', async ({ page }) => {
    await page.goto('/booking')
    
    // Enter address
    await page.fill('[data-testid="address-input"]', '123 Main St, City')
    await page.click('[data-testid="find-slots"]')
    
    // Wait for slots to load
    await page.waitForSelector('[data-testid="slot-card"]')
    
    // Select first available slot
    await page.click('[data-testid="slot-card"]:first-child')
    
    // Add items to order
    await page.click('[data-testid="add-item"]')
    await page.selectOption('[data-testid="item-select"]', 'SKU-001')
    await page.fill('[data-testid="quantity"]', '2')
    
    // Confirm booking
    await page.click('[data-testid="confirm-booking"]')
    
    // Verify confirmation
    await expect(page).toHaveURL(/\/confirmation/)
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })

  test('should handle reservation timeout', async ({ page }) => {
    // Test 15-minute timeout scenario
  })
})

// tests/e2e/specs/fleet-management.spec.ts
test.describe('Fleet Management', () => {
  test('should create and assign load', async ({ page }) => {
    await page.goto('/admin/fleet')
    
    // Create new load
    await page.click('[data-testid="create-load"]')
    await page.selectOption('[data-testid="truck-select"]', 'TRUCK-001')
    await page.selectOption('[data-testid="driver-select"]', 'DRV-001')
    
    // Add orders to load
    await page.click('[data-testid="add-orders"]')
    await page.check('[data-testid="order-checkbox"]:first-child')
    
    // Optimize load
    await page.click('[data-testid="optimize-load"]')
    await page.waitForSelector('[data-testid="load-plan"]')
    
    // Verify optimization results
    await expect(page.locator('[data-testid="utilization"]')).toContainText('%')
  })
})

// tests/e2e/specs/inventory-management.spec.ts
test.describe('Inventory Management', () => {
  test('should adjust stock levels', async ({ page }) => {
    await page.goto('/admin/inventory')
    
    // Search for item
    await page.fill('[data-testid="search"]', 'SKU-001')
    await page.click('[data-testid="item-row"]:first-child')
    
    // Adjust stock
    await page.click('[data-testid="adjust-stock"]')
    await page.selectOption('[data-testid="transaction-type"]', 'in')
    await page.fill('[data-testid="quantity"]', '100')
    await page.fill('[data-testid="notes"]', 'Restock from supplier')
    await page.click('[data-testid="submit"]')
    
    // Verify update
    await expect(page.locator('[data-testid="stock-level"]')).toContainText('100')
  })
})
```

## Demo Data Seed

### Seed Script Overview
```typescript
// prisma/seed.ts
async function main() {
  // 1. Create delivery zones (5 zones)
  // 2. Create warehouses (2 warehouses)
  // 3. Create inventory items (50 items)
  // 4. Create trucks (10 trucks)
  // 5. Create drivers (15 drivers)
  // 6. Create customers (20 customers)
  // 7. Generate time slots (next 14 days)
  // 8. Create sample orders (30 orders)
  // 9. Create sample loads (5 loads)
  // 10. Create inventory transactions
}
```

### Sample Data
- **5 Delivery Zones**: North, South, East, West, Central
- **2 Warehouses**: Main Warehouse, Secondary Warehouse
- **50 Inventory Items**: Various products with different sizes/weights
- **10 Trucks**: Mix of vans, trucks, refrigerated trucks
- **15 Drivers**: With valid licenses and shift schedules
- **20 Customers**: With addresses in different zones
- **Time Slots**: 4 slots per day (9-11, 11-13, 13-15, 15-17) for 14 days
- **30 Sample Orders**: In various states (pending, confirmed, delivered)
- **5 Sample Loads**: With optimized routes

## Setup Instructions

### Prerequisites
- Docker Desktop installed
- Node.js 20+ (for local development)
- Git

### Quick Start (Docker)
```bash
# 1. Clone repository
git clone <repo-url>
cd last-mile-delivery

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Wait for services to be healthy (30-60 seconds)
docker-compose ps

# 5. Run database migrations
docker-compose exec backend npm run prisma:migrate

# 6. Seed demo data
docker-compose exec backend npm run prisma:seed

# 7. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# RabbitMQ Management: http://localhost:15672 (admin/admin123)
```

### Local Development Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Run tests
npm test
npm run test:e2e
```

## Demo Scenarios

### Scenario 1: Customer Books Delivery
1. Navigate to http://localhost:5173
2. Enter delivery address
3. View available slots
4. Select items from inventory
5. Reserve slot
6. Complete booking
7. View confirmation

### Scenario 2: Admin Plans Load
1. Login to admin panel
2. View pending orders
3. Select orders for a slot
4. Choose truck and driver
5. Run load optimization
6. Review load plan
7. Approve and start load

### Scenario 3: Inventory Management
1. View inventory dashboard
2. Check low stock items
3. Adjust stock levels
4. Transfer between warehouses
5. View transaction history

### Scenario 4: Route Optimization
1. View active loads
2. Select a load
3. View optimized route on map
4. See delivery sequence
5. Track progress

## Performance Targets

- ✅ API Response Time: < 200ms (p95)
- ✅ Slot Availability Query: < 50ms
- ✅ Load Optimization: < 3 seconds for 50 orders
- ✅ Route Optimization: < 5 seconds for 20 stops
- ✅ Concurrent Users: Support 100+ simultaneous bookings
- ✅ Database Queries: < 100ms (p95)
- ✅ Frontend Load Time: < 2 seconds

## Monitoring & Observability

### Metrics to Track
1. **Business Metrics**
   - Slot utilization rate
   - Truck capacity utilization
   - Inventory turnover
   - On-time delivery rate
   - Order cancellation rate

2. **Technical Metrics**
   - API response times
   - Database query performance
   - Cache hit rate
   - Error rates
   - System resource usage

### Logging
- Structured JSON logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Request/Response logging
- Error stack traces
- Performance metrics

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (Customer, Driver, Admin)
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: Parameterized queries via Prisma
5. **XSS Protection**: Content Security Policy headers
6. **Rate Limiting**: 100 requests per minute per IP
7. **CORS**: Configured for frontend domain only
8. **Secrets Management**: Environment variables, never in code

## Future Enhancements

1. **Real-time Tracking**: GPS integration for live tracking
2. **Mobile Apps**: Native iOS/Android driver apps
3. **AI/ML**: Demand forecasting, dynamic pricing
4. **IoT Integration**: Temperature sensors for refrigerated trucks
5. **Customer Notifications**: SMS/Email/Push notifications
6. **Advanced Analytics**: Predictive analytics dashboard
7. **Multi-tenant**: Support multiple logistics companies
8. **Blockchain**: Proof of delivery on blockchain

## Success Criteria

✅ **Functional Requirements**
- All CRUD operations working
- Slot booking with reservation
- Load optimization functional
- Route optimization functional
- Inventory tracking accurate

✅ **Technical Requirements**
- Docker deployment working
- All tests passing (Unit + E2E)
- 80%+ code coverage
- API documentation complete
- Demo data seeded

✅ **Performance Requirements**
- API response < 200ms
- Optimization < 5 seconds
- Support 100+ concurrent users
- Zero data loss

✅ **Documentation**
- Setup guide complete
- API documentation
- Architecture diagrams
- Demo scenarios documented

## Timeline

### Week 1: Foundation
- Day 1-2: Project setup, Docker configuration
- Day 3-4: Database schema and migrations
- Day 5-7: Core models and repositories

### Week 2: Backend Services
- Day 1-2: Slot management service
- Day 3-4: Fleet and inventory services
- Day 5-7: Optimization engines

### Week 3: API & Frontend
- Day 1-3: REST API endpoints
- Day 4-7: Frontend components

### Week 4: Testing & Polish
- Day 1-3: Unit and integration tests
- Day 4-5: E2E tests
- Day 6-7: Demo data, documentation, final polish

## Deliverables

1. ✅ Complete source code
2. ✅ Docker configuration
3. ✅ Database migrations and seed data
4. ✅ Comprehensive test suite
5. ✅ API documentation
6. ✅ Setup and deployment guide
7. ✅ Demo scenarios
8. ✅ Architecture documentation

---

**Ready to start implementation!** 🚀