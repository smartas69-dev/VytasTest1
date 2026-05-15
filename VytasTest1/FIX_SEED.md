# 🌱 Fix Seed Script Error

## The Problem
PrismaClient initialization error when running seed script.

## Quick Fix

The seed script should work inside the container because the DATABASE_URL is set in docker-compose.yml. Let's try a different approach.

---

## Solution 1: Run Seed with Explicit Environment Variable

**In Ubuntu terminal, run:**

```bash
docker exec -it vytastest1-backend-1 sh -c "DATABASE_URL='postgresql://admin:admin123@postgres:5432/lastmile_db' npx tsx prisma/seed.ts"
```

---

## Solution 2: Check if Environment Variables are Set

```bash
# Check environment variables in container
docker exec -it vytastest1-backend-1 env | grep DATABASE_URL

# If DATABASE_URL is shown, try seed again
docker exec -it vytastest1-backend-1 npm run prisma:seed
```

---

## Solution 3: Run Seed Directly with tsx

```bash
docker exec -it vytastest1-backend-1 npx tsx prisma/seed.ts
```

---

## Solution 4: Restart Backend Container

Sometimes environment variables aren't loaded properly:

```bash
# Restart backend
docker compose restart backend

# Wait 10 seconds
sleep 10

# Try seed again
docker exec -it vytastest1-backend-1 npm run prisma:seed
```

---

## Solution 5: Manual Seeding (If All Else Fails)

If the seed script continues to fail, we can seed manually:

```bash
# Enter the container
docker exec -it vytastest1-backend-1 sh

# Inside container, run:
export DATABASE_URL="postgresql://admin:admin123@postgres:5432/lastmile_db"
npx tsx prisma/seed.ts

# Exit container
exit
```

---

## Verify Database Has Data

After successful seeding:

```bash
# Check if data exists
docker exec -it vytastest1-postgres-1 psql -U admin -d lastmile_db -c "SELECT COUNT(*) FROM \"Order\";"

# Should show number of orders (25)
```

---

## Alternative: Skip Seeding for Now

The application will work without seed data, you just won't have sample data:

```bash
# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# You can create orders manually through the UI
```

---

## Complete Fix Script

```bash
#!/bin/bash

echo "🌱 Fixing seed script..."

# Method 1: Restart backend and try again
echo "🔄 Restarting backend container..."
docker compose restart backend
sleep 15

echo "🌱 Attempting to seed database..."
docker exec -it vytastest1-backend-1 npm run prisma:seed

# If that fails, try with explicit DATABASE_URL
if [ $? -ne 0 ]; then
    echo "⚠️  First attempt failed, trying with explicit DATABASE_URL..."
    docker exec -it vytastest1-backend-1 sh -c "DATABASE_URL='postgresql://admin:admin123@postgres:5432/lastmile_db' npx tsx prisma/seed.ts"
fi

# Check if data was created
echo ""
echo "📊 Checking database..."
docker exec -it vytastest1-postgres-1 psql -U admin -d lastmile_db -c "SELECT COUNT(*) FROM \"Order\";"

echo ""
echo "✅ If you see a number above, seeding was successful!"
echo "🌐 Access your application at: http://localhost:5173"
```

---

## What to Try (In Order)

1. ✅ **Restart backend**: `docker compose restart backend` then `docker exec -it vytastest1-backend-1 npm run prisma:seed`

2. ✅ **Use tsx directly**: `docker exec -it vytastest1-backend-1 npx tsx prisma/seed.ts`

3. ✅ **Explicit DATABASE_URL**: `docker exec -it vytastest1-backend-1 sh -c "DATABASE_URL='postgresql://admin:admin123@postgres:5432/lastmile_db' npx tsx prisma/seed.ts"`

4. ✅ **Manual inside container**: 
   ```bash
   docker exec -it vytastest1-backend-1 sh
   export DATABASE_URL="postgresql://admin:admin123@postgres:5432/lastmile_db"
   npx tsx prisma/seed.ts
   exit
   ```

---

## After Successful Seeding

You'll have:
- 5 Delivery Zones
- 2 Warehouses
- 10 Inventory Items
- 5 Trucks
- 5 Drivers
- 5 Customers
- 560 Time Slots (14 days × 8 slots × 5 zones)
- 25 Sample Orders

---

**Try Solution 1 first (restart backend and run seed). If that doesn't work, try the others in order!**