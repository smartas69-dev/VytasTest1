# 🚀 Deployment Guide - Last Mile Delivery System

## ⚠️ Docker Not Installed

Docker is not currently installed on your system. You have two options:

---

## Option A: Install Docker Desktop (Recommended)

### Step 1: Download Docker Desktop
1. Visit: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Run the installer
4. Restart your computer if prompted

### Step 2: Verify Installation
```powershell
docker --version
docker compose version
```

### Step 3: Deploy the Application
```powershell
# Start all services
docker compose up -d

# Initialize database
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```

---

## Option B: Manual Installation (Without Docker)

If you prefer not to use Docker, you can run the services manually.

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 15+ (https://www.postgresql.org/download/)
- Redis 7+ (https://redis.io/download/)
- RabbitMQ 3.12+ (https://www.rabbitmq.com/download.html)

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your postgres password
4. Create database:
```sql
CREATE DATABASE delivery_system;
```

### Step 2: Install Redis
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Or use WSL: `wsl --install` then `sudo apt install redis-server`
3. Start Redis: `redis-server`

### Step 3: Install RabbitMQ
1. Download from: https://www.rabbitmq.com/install-windows.html
2. Install Erlang first (required dependency)
3. Install RabbitMQ
4. Enable management plugin:
```powershell
rabbitmq-plugins enable rabbitmq_management
```

### Step 4: Configure Environment Variables

Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/delivery_system"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Server
PORT=3000
NODE_ENV=development

# JWT (for future auth)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Step 5: Install Backend Dependencies
```powershell
cd backend
npm install
```

### Step 6: Initialize Database
```powershell
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Step 7: Start Backend Server
```powershell
npm run dev
```

Backend will be available at: http://localhost:3000

### Step 8: Install Frontend Dependencies
Open a new terminal:
```powershell
cd frontend
npm install
```

### Step 9: Start Frontend Development Server
```powershell
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## 🎯 Verification Steps

### 1. Check Backend Health
```powershell
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-14T23:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "rabbitmq": "connected"
  }
}
```

### 2. Check API Documentation
Open browser: http://localhost:3000/api-docs

### 3. Check Frontend
Open browser: http://localhost:5173

You should see the Last Mile Delivery System homepage.

---

## 📊 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React application |
| **Backend API** | http://localhost:3000 | Express.js API |
| **API Docs** | http://localhost:3000/api-docs | Swagger documentation |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache |
| **RabbitMQ** | localhost:5672 | Message queue |
| **RabbitMQ Admin** | http://localhost:15672 | Management UI (guest/guest) |

---

## 🧪 Test the Application

### 1. Customer Portal
1. Go to http://localhost:5173
2. Click "Book Delivery"
3. Select delivery zone and time slot
4. Add items to order
5. Complete booking

### 2. Admin Dashboard
1. Go to http://localhost:5173/admin
2. View orders
3. Manage fleet
4. Plan loads
5. View analytics

### 3. Driver App
1. Go to http://localhost:5173/driver
2. View assigned routes
3. See delivery list
4. Update delivery status

---

## 🔧 Troubleshooting

### Backend won't start
**Error**: "Cannot connect to database"
**Solution**: 
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Test connection: `psql -U postgres -d delivery_system`

**Error**: "Cannot connect to Redis"
**Solution**:
- Check Redis is running: `redis-cli ping` (should return "PONG")
- Verify REDIS_HOST and REDIS_PORT in .env

**Error**: "Cannot connect to RabbitMQ"
**Solution**:
- Check RabbitMQ is running
- Verify RABBITMQ_URL in .env
- Check management UI: http://localhost:15672

### Frontend won't start
**Error**: "Port 5173 already in use"
**Solution**:
```powershell
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Database migration fails
**Solution**:
```powershell
# Reset database
npx prisma migrate reset

# Run migrations again
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

---

## 📝 Default Test Data

After seeding, you'll have:

### Delivery Zones
- Downtown (5km radius)
- Suburbs (10km radius)
- Industrial (15km radius)

### Time Slots
- Morning: 8:00-12:00
- Afternoon: 12:00-17:00
- Evening: 17:00-21:00

### Warehouses
- Main Warehouse (Downtown)
- North Warehouse (Suburbs)

### Inventory Items
- Electronics (laptops, phones, tablets)
- Furniture (chairs, desks, sofas)
- Appliances (fridges, washers, microwaves)

### Fleet
- 5 trucks (various capacities)
- 5 drivers

---

## 🎊 Success!

If all services are running, you now have:
- ✅ Backend API running on port 3000
- ✅ Frontend app running on port 5173
- ✅ Database with test data
- ✅ All services connected
- ✅ Ready to use!

---

## 📚 Next Steps

1. **Explore the application**
   - Try booking a delivery
   - View the admin dashboard
   - Check the driver app

2. **Review the documentation**
   - Read FINAL_PROJECT_SUMMARY.md
   - Check API documentation
   - Review code structure

3. **Customize for your needs**
   - Update delivery zones
   - Add your inventory
   - Configure your fleet

4. **Add enhancements**
   - Authentication system
   - Payment integration
   - Real-time tracking

---

## 🆘 Need Help?

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml or .env
2. **Permission errors**: Run terminal as Administrator
3. **Memory issues**: Increase Docker memory limit
4. **Network issues**: Check firewall settings

### Resources
- Project documentation: FINAL_PROJECT_SUMMARY.md
- API documentation: http://localhost:3000/api-docs
- Testing guide: TESTING_COMPLETE.md
- Quick start: QUICK_START.md

---

## 🎯 Current Status

**Docker Status**: ❌ Not Installed
**Recommended Action**: Install Docker Desktop (Option A)
**Alternative**: Manual installation (Option B)

**Once Docker is installed, deployment takes just 5 minutes!**

---

*Last updated: 2026-05-14*
*Project: Last Mile Delivery System*
*Status: Production Ready*