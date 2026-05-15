# 🔧 Fix Deployment Error - Backend Build Failed

## The Problem
The backend container failed to build with error: "npm install did not complete successfully"

## Solution Applied
Updated the backend Dockerfile to be more robust with:
- Added build tools for native modules
- Increased npm timeout settings
- Added retry logic for npm install

---

## What to Do Now

### Step 1: Clean Up Failed Containers

**In Ubuntu terminal, run:**

```bash
# Stop and remove all containers
docker compose down

# Remove all images to force rebuild
docker compose down --rmi all

# Clean up Docker system
docker system prune -f
```

### Step 2: Rebuild and Start

```bash
# Make sure you're in the project directory
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Build and start with verbose output
docker compose up -d --build

# Watch the build process
docker compose logs -f
```

### Step 3: Check Container Status

```bash
# Wait 2-3 minutes for build to complete
sleep 120

# Check if all containers are running
docker ps
```

**You should see 5 containers:**
- vytastest1-backend-1
- vytastest1-frontend-1
- vytastest1-postgres-1
- vytastest1-redis-1
- vytastest1-rabbitmq-1

---

## If Build Still Fails

### Alternative 1: Use Node 18 Instead

If Node 20 has issues, we can try Node 18:

**Edit backend/Dockerfile first line to:**
```dockerfile
FROM node:18-alpine
```

Then rebuild:
```bash
docker compose down
docker compose up -d --build
```

### Alternative 2: Use Full Node Image (Not Alpine)

Alpine sometimes has issues with native modules. Use full Node:

**Edit backend/Dockerfile first line to:**
```dockerfile
FROM node:20
```

Then rebuild:
```bash
docker compose down
docker compose up -d --build
```

### Alternative 3: Check Network Connection

```bash
# Test if you can reach npm registry
curl -I https://registry.npmjs.org

# If this fails, you might have network issues
# Try restarting WSL:
# In PowerShell: wsl --shutdown
# Then open Ubuntu again
```

---

## Complete Fix Script

**Run this in Ubuntu:**

```bash
#!/bin/bash

echo "🔧 Fixing deployment..."

# Navigate to project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Clean up
echo "🧹 Cleaning up old containers..."
docker compose down --rmi all
docker system prune -f

# Rebuild
echo "🔨 Rebuilding containers..."
docker compose build --no-cache

# Start
echo "🚀 Starting services..."
docker compose up -d

# Wait
echo "⏳ Waiting for containers to start..."
sleep 60

# Check status
echo "📊 Container status:"
docker ps

echo ""
echo "✅ Check if all 5 containers are running above"
echo "If backend is missing, check logs: docker compose logs backend"
```

---

## Check Build Logs

If the build fails again:

```bash
# View backend build logs
docker compose logs backend

# View all logs
docker compose logs

# Build with verbose output
docker compose build --no-cache --progress=plain backend
```

---

## After Successful Build

Once all containers are running:

```bash
# Initialize database
docker exec -it vytastest1-backend-1 npx prisma migrate deploy
docker exec -it vytastest1-backend-1 npx prisma db seed

# Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## Quick Troubleshooting

### Check if backend container exists
```bash
docker ps -a | grep backend
```

### View backend logs
```bash
docker compose logs backend
```

### Rebuild only backend
```bash
docker compose build --no-cache backend
docker compose up -d backend
```

### Test npm install locally in WSL
```bash
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1/backend
npm install
```

---

## Summary

1. ✅ Updated Dockerfile with better npm install configuration
2. ✅ Clean up old containers: `docker compose down --rmi all`
3. ✅ Rebuild: `docker compose up -d --build`
4. ✅ Wait 2-3 minutes for build
5. ✅ Check: `docker ps` (should see 5 containers)
6. ✅ Initialize database
7. ✅ Access application

**The Dockerfile has been fixed. Now run the cleanup and rebuild commands above!**