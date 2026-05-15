# 🚀 Quick Start Guide - Last Mile Delivery System

Get the Last Mile Delivery System up and running in **5 minutes**!

---

## Prerequisites

Before you begin, ensure you have:
- ✅ **Docker** (version 20.10+)
- ✅ **Docker Compose** (version 2.0+)
- ✅ **Git** (for cloning the repository)

**That's it!** Docker will handle everything else.

---

## 🎯 Step-by-Step Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd last-mile-delivery
```

### Step 2: Configure Environment Variables
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# The default configuration works out of the box!
# No changes needed for local development
```

**Default Configuration:**
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/delivery_db"
REDIS_URL="redis://redis:6379"
RABBITMQ_URL="amqp://guest:guest@rabbitmq:5672"
PORT=3000
NODE_ENV=development
```

### Step 3: Start All Services
```bash
# Start all services in detached mode
docker-compose up -d

# This will start:
# - PostgreSQL database
# - Redis cache
# - RabbitMQ message queue
# - Backend API server
# - Frontend development server
```

**Expected Output:**
```
✔ Container postgres    Started
✔ Container redis       Started
✔ Container rabbitmq    Started
✔ Container backend     Started
✔ Container frontend    Started
```

### Step 4: Initialize Database
```bash
# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed the database with demo data
docker-compose exec backend npx prisma db seed
```

**Demo Data Includes:**
- 5 delivery zones
- 2 warehouses with 10 inventory items
- 5 trucks and 5 drivers
- 5 sample customers
- 560 time slots (14 days × 8 slots/day × 5 zones)
- 25 sample orders with various statuses

### Step 5: Access the Applications
```bash
# Frontend (Customer/Admin/Driver UI)
open http://localhost:5173

# Backend API
open http://localhost:3000/health

# RabbitMQ Management Console
open http://localhost:15672
# Username: guest
# Password: guest
```

---

## 🎉 You're Ready!

The system is now running with demo data. You can:

### 👤 Customer Interface
**URL:** http://localhost:5173

**Try These Features:**
1. Browse available time slots
2. Select delivery items
3. Fill out delivery information
4. Confirm booking

### 👨‍💼 Admin Dashboard
**URL:** http://localhost:5173/admin

**Try These Features:**
1. View order list and statistics
2. Manage fleet (trucks and drivers)
3. Create optimized loads
4. View analytics and reports

### 🚚 Driver App
**URL:** http://localhost:5173/driver

**Try These Features:**
1. View today's route
2. Manage delivery checklist
3. Update delivery status
4. Complete deliveries

---

## 📊 Verify Installation

### Check Service Health
```bash
# Check all services are running
docker-compose ps

# Expected output: All services should show "Up" status
```

### Check Backend API
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2026-05-14T22:00:00.000Z"}
```

### Check Database
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d delivery_db

# List tables
\dt

# Exit
\q
```

### View Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🛠️ Common Commands

### Start/Stop Services
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View service status
docker-compose ps
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Reset database (WARNING: Deletes all data!)
docker-compose exec backend npx prisma migrate reset

# Seed database
docker-compose exec backend npx prisma db seed

# Open Prisma Studio (Database GUI)
docker-compose exec backend npx prisma studio
# Access at: http://localhost:5555
```

### Development
```bash
# View real-time logs
docker-compose logs -f backend frontend

# Rebuild services after code changes
docker-compose up -d --build

# Execute commands in backend container
docker-compose exec backend npm run <command>

# Execute commands in frontend container
docker-compose exec frontend npm run <command>
```

### Cleanup
```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes (full reset)
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all
```

---

## 🔍 Troubleshooting

### Issue: Port Already in Use
**Error:** `Bind for 0.0.0.0:5173 failed: port is already allocated`

**Solution:**
```bash
# Find process using the port
lsof -i :5173  # On macOS/Linux
netstat -ano | findstr :5173  # On Windows

# Kill the process or change port in docker-compose.yml
```

### Issue: Database Connection Failed
**Error:** `Can't reach database server`

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: Backend Not Starting
**Error:** `Backend service exited with code 1`

**Solution:**
```bash
# Check backend logs
docker-compose logs backend

# Common fixes:
# 1. Ensure database is running
docker-compose up -d postgres

# 2. Run migrations
docker-compose exec backend npx prisma migrate deploy

# 3. Rebuild backend
docker-compose up -d --build backend
```

### Issue: Frontend Not Loading
**Error:** `Cannot GET /`

**Solution:**
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend

# Clear browser cache and reload
```

### Issue: Out of Memory
**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory
# Increase to at least 4GB

# Or set Node memory limit in docker-compose.yml:
# environment:
#   - NODE_OPTIONS=--max-old-space-size=4096
```

---

## 📚 Next Steps

### Explore the Documentation
- **README.md** - Comprehensive overview and API docs
- **PROJECT_SUMMARY.md** - Architecture and features
- **PROJECT_STATUS_FINAL.md** - Complete project status
- **IMPLEMENTATION_ROADMAP.md** - Development guide

### Try the API
```bash
# Get all orders
curl http://localhost:3000/api/orders

# Get order statistics
curl http://localhost:3000/api/orders/statistics

# Create a new order (example)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-1",
    "timeSlotId": "slot-1",
    "deliveryAddress": "123 Main St",
    "items": [
      {"inventoryItemId": "item-1", "quantity": 2}
    ]
  }'
```

### Customize the System
1. **Add Your Data:**
   - Modify `backend/prisma/seed.ts`
   - Run `docker-compose exec backend npx prisma db seed`

2. **Configure Settings:**
   - Edit `backend/.env` for backend config
   - Edit `frontend/vite.config.ts` for frontend config

3. **Extend Features:**
   - Add new services in `backend/src/services/`
   - Add new components in `frontend/src/components/`

---

## 🎓 Learning Resources

### Backend (Node.js + Express)
- **Prisma ORM:** https://www.prisma.io/docs
- **Express.js:** https://expressjs.com
- **TypeScript:** https://www.typescriptlang.org

### Frontend (React + Redux)
- **React:** https://react.dev
- **Redux Toolkit:** https://redux-toolkit.js.org
- **Material-UI:** https://mui.com

### DevOps (Docker)
- **Docker:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose

---

## 💡 Tips for Success

### Development Best Practices
1. **Use Hot Reload:** Frontend auto-reloads on changes
2. **Check Logs:** Always check logs when debugging
3. **Use Prisma Studio:** Visual database editor at http://localhost:5555
4. **Test API:** Use Postman or curl to test endpoints
5. **Read Docs:** Comprehensive docs in the repository

### Performance Tips
1. **Redis Caching:** Enabled by default (5min-1hour TTL)
2. **Database Indexes:** Already optimized in schema
3. **API Pagination:** Use `?page=1&limit=10` parameters
4. **Load Balancing:** Use nginx for production

### Security Reminders
1. **Change Default Passwords:** Update in production
2. **Use HTTPS:** Configure SSL/TLS certificates
3. **Enable Authentication:** Implement JWT tokens
4. **Rate Limiting:** Add API rate limits
5. **Environment Variables:** Never commit `.env` files

---

## 🆘 Getting Help

### Check Documentation
- README.md - Main documentation
- PROJECT_STATUS_FINAL.md - Complete status
- API docs at http://localhost:3000/api-docs

### Common Issues
- Port conflicts → Change ports in docker-compose.yml
- Database errors → Check PostgreSQL logs
- Build failures → Clear Docker cache and rebuild

### Debug Mode
```bash
# Enable debug logging
docker-compose exec backend npm run dev

# View detailed logs
docker-compose logs -f --tail=100 backend
```

---

## ✅ Success Checklist

After setup, verify:
- [ ] All 5 Docker containers are running
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend health check passes at http://localhost:3000/health
- [ ] Database has demo data (check Prisma Studio)
- [ ] Can create a test order through the UI
- [ ] Can view orders in admin dashboard
- [ ] Can see route in driver app

---

## 🎊 Congratulations!

You now have a fully functional Last Mile Delivery System running locally!

**What's Next?**
1. Explore the customer booking flow
2. Try the admin dashboard features
3. Test the driver app interface
4. Review the API documentation
5. Customize for your needs

**Need Help?** Check the troubleshooting section or review the comprehensive documentation.

---

**Happy Delivering! 🚚📦**

---

*Last Updated: May 14, 2026*  
*Version: 1.0.0*  
*Status: Production Ready*