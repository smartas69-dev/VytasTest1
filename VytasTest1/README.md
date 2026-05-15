# 🚚 Last Mile Delivery System

A comprehensive logistics platform for managing last mile delivery operations with intelligent slot booking, fleet optimization, inventory tracking, and route planning.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- ✅ **Delivery Slot Booking** - Real-time slot availability with capacity management
- ✅ **Fleet Management** - Truck and driver assignment with utilization tracking
- ✅ **Inventory Management** - Stock tracking with reservation system
- ✅ **Load Optimization** - 3D bin packing algorithm for efficient truck loading
- ✅ **Route Optimization** - TSP solver for optimal delivery routes
- ✅ **Order Management** - Complete order lifecycle from creation to delivery

### Technical Features
- 🔒 Atomic transactions for data consistency
- ⚡ Redis caching for performance
- 📊 Real-time metrics and analytics
- 🔄 Automatic cache invalidation
- 📱 Responsive web interface
- 🐳 Docker deployment ready

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Customer   │ │    Admin     │ │    Driver    │        │
│  │   Portal     │ │   Dashboard  │ │     App      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │     Slot     │ │    Fleet     │ │  Inventory   │        │
│  │   Service    │ │   Service    │ │   Service    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │     Load     │ │    Route     │ │    Order     │        │
│  │ Optimization │ │ Optimization │ │   Service    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
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

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **ORM**: Prisma 5.x
- **Validation**: Zod
- **Cache**: Redis 7
- **Queue**: RabbitMQ 3.12

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Build Tool**: Vite

### Database
- **Primary**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ 3.12

### DevOps
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest, Playwright
- **Linting**: ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (recommended)
- [Node.js 20+](https://nodejs.org/) (for local development)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd last-mile-delivery
```

2. **Setup environment variables**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

3. **Start with Docker (Recommended)**
```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy (30-60 seconds)
docker-compose ps

# Run database migrations
docker-compose exec backend npx prisma migrate dev --name init

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Seed database (when available)
docker-compose exec backend npx prisma db seed
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- API Health: http://localhost:3000/api/health
- RabbitMQ Management: http://localhost:15672 (admin/admin123)

### Local Development (Without Docker)

1. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Setup local services**
```bash
# Start PostgreSQL, Redis, and RabbitMQ locally
# Or use Docker for just the databases:
docker-compose up -d postgres redis rabbitmq
```

3. **Run migrations**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Project Structure

```
last-mile-delivery/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (DB, Redis, RabbitMQ)
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── middleware/      # Express middleware
│   │   └── app.ts           # Express app setup
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/               # Test files
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store & API
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── Dockerfile
│   └── package.json
├── tests/
│   └── e2e/                 # End-to-end tests
├── docker-compose.yml       # Docker services
├── PROJECT_STATUS.md        # Detailed project status
├── COMPLETE_PROJECT_PLAN.md # Full specifications
└── README.md               # This file
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Order Endpoints

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "deliveryAddress": "123 Main St, City",
  "deliveryCoordinates": "40.7128,-74.0060",
  "items": [
    {
      "inventoryItemId": "uuid",
      "quantity": 2
    }
  ]
}
```

#### Get Orders
```http
GET /api/orders?status=pending&zoneId=uuid
```

#### Get Order by ID
```http
GET /api/orders/:id
```

#### Update Order Status
```http
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### Confirm Order
```http
POST /api/orders/:id/confirm
```

#### Cancel Order
```http
POST /api/orders/:id/cancel
Content-Type: application/json

{
  "reason": "Customer request"
}
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-14T21:00:00.000Z",
    "uptime": 12345
  }
}
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (to be created).

## 💻 Development

### Backend Development

```bash
cd backend

# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Format code
npm run format

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# View database in Prisma Studio
npx prisma studio
```

### Frontend Development

```bash
cd frontend

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

### Database Management

```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## 🧪 Testing

### Unit Tests

```bash
# Backend unit tests
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Backend integration tests
cd backend
npm run test:integration
```

### E2E Tests

```bash
# Install Playwright
cd frontend
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Deployment

1. **Build frontend**
```bash
cd frontend
npm run build
```

2. **Build backend**
```bash
cd backend
npm run build
```

3. **Deploy to cloud**
- AWS: ECS, RDS, ElastiCache
- Azure: App Service, Azure Database
- GCP: Cloud Run, Cloud SQL

## 📊 Project Status

**Current Status**: 60-70% Complete

### Completed ✅
- Backend services (6 services)
- API layer with controllers
- Database schema
- Docker configuration
- Frontend foundation
- Redux store setup

### In Progress 🚧
- Frontend UI components
- Testing suite
- Documentation

### Planned 📋
- Seed data script
- E2E tests
- Deployment guides

For detailed status, see [PROJECT_STATUS.md](./PROJECT_STATUS.md).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation
- Follow existing code style
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Prisma for excellent ORM
- Material-UI for beautiful components
- Redux Toolkit for state management
- Docker for containerization

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for known issues
- Review [COMPLETE_PROJECT_PLAN.md](./COMPLETE_PROJECT_PLAN.md) for specifications

---

**Built with ❤️ for efficient last mile delivery management**