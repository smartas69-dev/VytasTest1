# 🔧 Fix Docker Permission Denied Error

## The Problem
You're getting: "permission denied while trying to connect to the docker API"

This means Docker is installed but your user doesn't have permission to use it yet.

---

## Quick Fix - Run These Commands in Ubuntu

### Step 1: Apply the Docker Group Change
```bash
newgrp docker
```

This applies the docker group membership without logging out.

### Step 2: Test Docker Again
```bash
docker run hello-world
```

**If this works, you're done!** ✅

---

## If Step 1 Doesn't Work

### Alternative Fix 1: Log Out and Back In

**In Ubuntu terminal, run:**
```bash
exit
```

**Then open Ubuntu again** (from Start Menu or run `wsl`)

**Test Docker:**
```bash
docker run hello-world
```

---

## If Still Not Working

### Alternative Fix 2: Restart Docker Service

```bash
# Stop Docker
sudo service docker stop

# Start Docker
sudo service docker start

# Add yourself to docker group (again)
sudo usermod -aG docker $USER

# Apply the change
newgrp docker

# Test
docker run hello-world
```

---

## If Still Not Working

### Alternative Fix 3: Restart WSL

**In Windows PowerShell (not Ubuntu), run:**
```powershell
wsl --shutdown
```

**Wait 5 seconds, then open Ubuntu again**

**In Ubuntu, run:**
```bash
# Start Docker
sudo service docker start

# Test
docker run hello-world
```

---

## If Still Not Working

### Alternative Fix 4: Check Docker Service

```bash
# Check if Docker is running
sudo service docker status

# If not running, start it
sudo service docker start

# Check your groups
groups

# You should see "docker" in the list
# If not, add yourself again
sudo usermod -aG docker $USER

# Apply changes
newgrp docker

# Test
docker run hello-world
```

---

## If Still Not Working

### Alternative Fix 5: Use sudo (Temporary)

While we fix permissions, you can use sudo:

```bash
sudo docker run hello-world
```

**This should work!** But let's fix it properly:

```bash
# Fix permissions on docker socket
sudo chmod 666 /var/run/docker.sock

# Now try without sudo
docker run hello-world
```

---

## Complete Fix Script

Run this entire script in Ubuntu:

```bash
#!/bin/bash

echo "🔧 Fixing Docker permissions..."

# Ensure Docker service is running
sudo service docker start

# Add user to docker group
sudo usermod -aG docker $USER

# Fix socket permissions
sudo chmod 666 /var/run/docker.sock

# Apply group changes
newgrp docker << END
echo "✅ Testing Docker..."
docker run hello-world
END

echo ""
echo "If you see 'Hello from Docker!' above, it's working!"
echo "If not, please log out and back in, then try: docker run hello-world"
```

---

## Most Common Solution

**99% of the time, this works:**

```bash
# In Ubuntu terminal:
newgrp docker
docker run hello-world
```

**If that doesn't work:**

```bash
# In PowerShell:
wsl --shutdown

# Wait 5 seconds, then open Ubuntu again

# In Ubuntu:
sudo service docker start
docker run hello-world
```

---

## After Docker Works

Once `docker run hello-world` works, deploy your application:

```bash
# Navigate to project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Start services
docker compose up -d

# Check containers
docker ps

# Initialize database (wait 30 seconds first)
sleep 30
docker exec -it vytastest1-backend-1 npx prisma migrate deploy
docker exec -it vytastest1-backend-1 npx prisma db seed
```

---

## Summary

**Try these in order:**

1. ✅ `newgrp docker` → `docker run hello-world`
2. ✅ `exit` → Open Ubuntu again → `docker run hello-world`
3. ✅ `wsl --shutdown` (in PowerShell) → Open Ubuntu → `sudo service docker start` → `docker run hello-world`
4. ✅ `sudo chmod 666 /var/run/docker.sock` → `docker run hello-world`

One of these will definitely work! 🎯