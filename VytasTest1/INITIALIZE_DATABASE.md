# 🗄️ Initialize Database - Create Migrations

## Current Status
✅ All 5 containers are running  
✅ Prisma schema is loaded  
❌ No migrations exist yet (need to create them)

---

## Solution: Create Initial Migration

Since there are no migration files, we need to create the initial migration from the Prisma schema.

---

## Step 1: Create Initial Migration

**In Ubuntu terminal, run:**

```bash
# Create the initial migration
docker exec -it vytastest1-backend-1 npx prisma migrate dev --name init
```

**What this does:**
- Reads your Prisma schema
- Creates migration SQL files
- Applies the migration to the database
- Creates all tables, indexes, and relationships

---

## Step 2: Verify Database Tables

```bash
# Check if tables were created
docker exec -it vytastest1-backend-1 npx prisma studio
```

Or check directly in PostgreSQL:

```bash
docker exec -it vytastest1-postgres-1 psql -U postgres -d delivery_system -c "\dt"
```

---

## Step 3: Seed the Database

```bash
# Add sample data
docker exec -it vytastest1-backend-1 npm run prisma:seed
```

**This will add:**
- Sample vehicles
- Delivery routes
- Customer orders
- Inventory items
- Time slots

---

## Complete Initialization Script

**Copy and paste this in Ubuntu:**

```bash
#!/bin/bash

echo "🗄️  Initializing database..."

# Create initial migration
echo "📝 Creating initial migration..."
docker exec -it vytastest1-backend-1 npx prisma migrate dev --name init

# Verify migration
echo "✅ Checking migration status..."
docker exec -it vytastest1-backend-1 npx prisma migrate status

# Seed database
echo "🌱 Seeding database with sample data..."
docker exec -it vytastest1-backend-1 npm run prisma:seed

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000"
echo "   API Docs:  http://localhost:3000/api-docs"
```

---

## Alternative: Use Prisma Push (Faster for Development)

If `migrate dev` has issues, use `prisma db push`:

```bash
# Push schema directly to database (no migration files)
docker exec -it vytastest1-backend-1 npx prisma db push

# Seed database
docker exec -it vytastest1-backend-1 npm run prisma:seed
```

**Difference:**
- `migrate dev`: Creates migration files (better for production)
- `db push`: Directly syncs schema (faster for development)

---

## Troubleshooting

### Issue: "Migration failed"

**Solution 1: Reset database and try again**
```bash
# Reset database
docker exec -it vytastest1-backend-1 npx prisma migrate reset --force

# Create migration
docker exec -it vytastest1-backend-1 npx prisma migrate dev --name init
```

**Solution 2: Use db push instead**
```bash
docker exec -it vytastest1-backend-1 npx prisma db push
```

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if postgres is running
docker ps | grep postgres

# Restart postgres
docker compose restart postgres

# Wait 10 seconds
sleep 10

# Try again
docker exec -it vytastest1-backend-1 npx prisma migrate dev --name init
```

### Issue: "Seed script fails"

**Solution:**
```bash
# Check seed script logs
docker exec -it vytastest1-backend-1 npm run prisma:seed

# If it fails, check the error and we can fix the seed script
docker compose logs backend
```

---

## Verify Everything Works

### Check Database Tables
```bash
docker exec -it vytastest1-postgres-1 psql -U postgres -d delivery_system -c "\dt"
```

**You should see tables like:**
- Vehicle
- Route
- Order
- Inventory
- TimeSlot
- etc.

### Check Backend API
```bash
# Test health endpoint
curl http://localhost:3000/health

# Or in browser: http://localhost:3000/health
```

### Check Frontend
Open browser: http://localhost:5173

---

## After Database is Initialized

### Test the Application

1. **Customer Flow:**
   - Go to http://localhost:5173
   - Create a new order
   - Select items
   - Choose delivery slot
   - Confirm booking

2. **Admin Dashboard:**
   - View all orders
   - Manage fleet
   - Optimize routes
   - View analytics

3. **Driver App:**
   - View assigned deliveries
   - Update delivery status
   - View route map

4. **API Documentation:**
   - Go to http://localhost:3000/api-docs
   - Explore all endpoints
   - Test API calls

---

## Quick Commands Reference

### Database Management
```bash
# Create migration
docker exec -it vytastest1-backend-1 npx prisma migrate dev --name <name>

# Apply migrations
docker exec -it vytastest1-backend-1 npx prisma migrate deploy

# Reset database
docker exec -it vytastest1-backend-1 npx prisma migrate reset

# Push schema (no migrations)
docker exec -it vytastest1-backend-1 npx prisma db push

# Open Prisma Studio
docker exec -it vytastest1-backend-1 npx prisma studio

# Seed database
docker exec -it vytastest1-backend-1 npm run prisma:seed
```

### Check Database
```bash
# List tables
docker exec -it vytastest1-postgres-1 psql -U postgres -d delivery_system -c "\dt"

# Count records
docker exec -it vytastest1-postgres-1 psql -U postgres -d delivery_system -c "SELECT COUNT(*) FROM \"Order\";"

# View data
docker exec -it vytastest1-postgres-1 psql -U postgres -d delivery_system -c "SELECT * FROM \"Vehicle\" LIMIT 5;"
```

---

## Summary

**Current Status:** All containers running, schema loaded, no migrations

**What to Do:**
1. ✅ Run: `docker exec -it vytastest1-backend-1 npx prisma migrate dev --name init`
2. ✅ Run: `docker exec -it vytastest1-backend-1 npm run prisma:seed`
3. ✅ Access: http://localhost:5173

**Alternative (Faster):**
1. ✅ Run: `docker exec -it vytastest1-backend-1 npx prisma db push`
2. ✅ Run: `docker exec -it vytastest1-backend-1 npm run prisma:seed`
3. ✅ Access: http://localhost:5173

---

**Ready to initialize! Run the commands above to create the database tables and add sample data.** 🚀