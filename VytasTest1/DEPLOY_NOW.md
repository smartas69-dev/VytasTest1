# 🚀 Deploy Your Application NOW!

## Docker is Working! Let's Deploy! 🎉

Now that Docker is installed and working, let's deploy your Last Mile Delivery System.

---

## Step 1: Navigate to Your Project

**In Ubuntu terminal, copy and paste this:**

```bash
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1
```

**Verify you're in the right place:**
```bash
ls -la
```

**You should see:**
- `docker-compose.yml`
- `backend/` directory
- `frontend/` directory
- `README.md`
- etc.

---

## Step 2: Start All Services

**Copy and paste this:**

```bash
docker compose up -d
```

**What this does:**
- Starts PostgreSQL database
- Starts Redis cache
- Starts RabbitMQ message queue
- Builds and starts Backend API
- Builds and starts Frontend application

**This will take 2-3 minutes** (first time only, as it builds the images)

---

## Step 3: Check if Containers are Running

**After 2-3 minutes, run:**

```bash
docker ps
```

**You should see 5 containers running:**
1. `vytastest1-backend-1` (Backend API)
2. `vytastest1-frontend-1` (Frontend)
3. `vytastest1-postgres-1` (Database)
4. `vytastest1-redis-1` (Cache)
5. `vytastest1-rabbitmq-1` (Message Queue)

---

## Step 4: Initialize the Database

**Wait 30 seconds for containers to be fully ready, then run:**

```bash
# Wait for containers to be ready
sleep 30

# Run database migrations
docker exec -it vytastest1-backend-1 npx prisma migrate deploy

# Seed the database with sample data
docker exec -it vytastest1-backend-1 npx prisma db seed
```

**What this does:**
- Creates all database tables
- Adds sample data (vehicles, routes, orders, etc.)

---

## Step 5: Access Your Application

**Open your web browser (on Windows) and go to:**

### Frontend (Customer/Admin/Driver Interface)
```
http://localhost:5173
```

### Backend API
```
http://localhost:3000
```

### API Documentation (Swagger)
```
http://localhost:3000/api-docs
```

### RabbitMQ Management Console
```
http://localhost:15672
Username: guest
Password: guest
```

---

## Complete Deployment Script (All-in-One)

**Copy and paste this entire script in Ubuntu:**

```bash
#!/bin/bash

echo "🚀 Deploying Last Mile Delivery System..."
echo ""

# Navigate to project
echo "📁 Navigating to project directory..."
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Verify location
echo "📍 Current directory:"
pwd
echo ""

# Start services
echo "🐳 Starting Docker containers..."
docker compose up -d

echo ""
echo "⏳ Waiting for containers to be ready (30 seconds)..."
sleep 30

# Check containers
echo ""
echo "📊 Container status:"
docker ps

# Initialize database
echo ""
echo "🗄️  Initializing database..."
docker exec -it vytastest1-backend-1 npx prisma migrate deploy

echo ""
echo "🌱 Seeding database with sample data..."
docker exec -it vytastest1-backend-1 npx prisma db seed

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   API Docs:  http://localhost:3000/api-docs"
echo "   RabbitMQ:  http://localhost:15672 (guest/guest)"
echo ""
echo "📝 To view logs: docker compose logs -f"
echo "📝 To stop: docker compose down"
```

---

## Useful Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Restart Services
```bash
docker compose restart
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Everything (including data)
```bash
docker compose down -v
```

### Check Container Status
```bash
docker ps
```

### Execute Commands in Container
```bash
# Open shell in backend container
docker exec -it vytastest1-backend-1 sh

# Run specific command
docker exec -it vytastest1-backend-1 npm run test
```

---

## Troubleshooting

### Problem: "Cannot start service"

**Solution:**
```bash
# Check what's using the ports
sudo lsof -i :5173
sudo lsof -i :3000

# Stop conflicting services
docker compose down

# Try again
docker compose up -d
```

### Problem: "Port already in use"

**Solution:**
```bash
# Stop all containers
docker compose down

# Check if any containers are still running
docker ps -a

# Remove all stopped containers
docker container prune -f

# Try again
docker compose up -d
```

### Problem: Database connection errors

**Solution:**
```bash
# Restart database container
docker compose restart postgres

# Wait 10 seconds
sleep 10

# Run migrations again
docker exec -it vytastest1-backend-1 npx prisma migrate deploy
```

### Problem: Frontend not loading

**Solution:**
```bash
# Check frontend logs
docker compose logs frontend

# Restart frontend
docker compose restart frontend

# Wait 10 seconds and try accessing http://localhost:5173
```

---

## What to Do After Deployment

1. ✅ Open http://localhost:5173 in your browser
2. ✅ Explore the customer booking interface
3. ✅ Check the admin dashboard
4. ✅ View the driver app
5. ✅ Test the API at http://localhost:3000/api-docs
6. ✅ Check RabbitMQ at http://localhost:15672

---

## Sample Data Included

After seeding, you'll have:
- **Vehicles**: 5 delivery vehicles with different capacities
- **Routes**: Pre-defined delivery routes
- **Orders**: Sample customer orders
- **Inventory**: Various items for delivery
- **Time Slots**: Available delivery time slots

---

## Next Steps

Once deployed:
1. Test customer order flow
2. Explore admin features
3. Check driver interface
4. Review API documentation
5. Run tests: `docker exec -it vytastest1-backend-1 npm test`

---

**Ready to deploy? Copy the deployment script above and paste it in your Ubuntu terminal!** 🚀