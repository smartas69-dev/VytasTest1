# 🐧 Ubuntu WSL2 Setup Guide - Docker Installation

## Current Status
✅ Ubuntu WSL2 is installed and running  
❌ Docker is not installed in Ubuntu  
❌ Podman is not installed in Ubuntu

---

## Recommended Solution: Install Docker in Ubuntu WSL2

This is the **easiest and most reliable** way to run containers on Windows!

---

## Step 1: Install Docker in Ubuntu WSL2

Open Ubuntu (from Start Menu or run `wsl` in PowerShell), then run these commands:

```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Start Docker service
sudo service docker start
```

---

## Step 2: Verify Docker Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Test Docker with hello-world
docker run hello-world
```

**Expected Output:**
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x
Hello from Docker!
```

---

## Step 3: Configure Docker to Start Automatically

Add this to your `~/.bashrc` file:

```bash
# Start Docker service automatically
if service docker status 2>&1 | grep -q "is not running"; then
    sudo service docker start
fi
```

Apply changes:
```bash
echo 'if service docker status 2>&1 | grep -q "is not running"; then sudo service docker start; fi' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 4: Access Your Project in WSL

Your Windows files are accessible in WSL at `/mnt/c/`:

```bash
# Navigate to your project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Verify you're in the right place
ls -la

# You should see: docker-compose.yml, backend/, frontend/, etc.
```

---

## Step 5: Deploy the Application

```bash
# Make sure you're in the project directory
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Start all services
docker compose up -d

# Check if containers are running
docker ps

# View logs
docker compose logs -f
```

---

## Step 6: Initialize Database

```bash
# Wait for containers to be healthy (about 30 seconds)
sleep 30

# Run database migrations
docker exec -it vytastest1-backend-1 npx prisma migrate deploy

# Seed the database
docker exec -it vytastest1-backend-1 npx prisma db seed
```

---

## Step 7: Access the Application

Open your browser (on Windows):
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

---

## Quick Commands Reference

### Docker Commands (run in Ubuntu WSL)

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check running containers
docker ps

# Restart services
docker compose restart

# Execute commands in container
docker exec -it backend sh

# Clean up everything
docker compose down -v
docker system prune -a
```

### WSL Commands (run in Windows PowerShell)

```bash
# Open Ubuntu
wsl

# Run command in Ubuntu
wsl docker ps

# Stop Ubuntu
wsl --shutdown

# Restart Ubuntu
wsl --shutdown
wsl

# Check WSL status
wsl --list --verbose
```

---

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Start Docker service
sudo service docker start

# Check status
sudo service docker status

# If still not working, restart WSL
# In PowerShell:
wsl --shutdown
wsl
```

### Issue: "Permission denied" when running docker

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker

# Test
docker ps
```

### Issue: Docker service won't start

**Solution:**
```bash
# Check what's wrong
sudo service docker status

# Try restarting
sudo service docker restart

# If still failing, reinstall
sudo apt remove docker-ce docker-ce-cli containerd.io
sudo apt install docker-ce docker-ce-cli containerd.io
```

### Issue: Containers can't access the internet

**Solution:**
```bash
# Restart Docker
sudo service docker restart

# Or restart WSL
# In PowerShell:
wsl --shutdown
wsl
```

### Issue: Port already in use

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :5173
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or stop all containers
docker compose down
```

---

## Alternative: Use Docker Desktop with WSL2 Backend

If you prefer a GUI:

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install with WSL2 backend enabled

2. **Enable WSL2 Integration**
   - Open Docker Desktop
   - Settings → Resources → WSL Integration
   - Enable integration with Ubuntu

3. **Use Docker from Ubuntu**
   ```bash
   # Docker will be available in WSL automatically
   docker --version
   docker compose up -d
   ```

---

## Complete Setup Script

Run this all at once in Ubuntu:

```bash
#!/bin/bash

echo "🚀 Installing Docker in Ubuntu WSL2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Configure user
sudo usermod -aG docker $USER

# Start Docker
sudo service docker start

# Auto-start Docker
echo 'if service docker status 2>&1 | grep -q "is not running"; then sudo service docker start; fi' >> ~/.bashrc

echo "✅ Docker installation complete!"
echo "⚠️  Please log out and log back in, or run: newgrp docker"
echo "📝 Then test with: docker run hello-world"
```

---

## Deployment Checklist

- [ ] Ubuntu WSL2 is installed and running
- [ ] Docker is installed in Ubuntu
- [ ] Docker service is running
- [ ] User is in docker group
- [ ] `docker --version` works
- [ ] `docker compose version` works
- [ ] Navigated to project directory in WSL
- [ ] Ran `docker compose up -d`
- [ ] All containers are running
- [ ] Database is initialized
- [ ] Application is accessible

---

## Why Ubuntu WSL2 + Docker is Better

✅ **Native Linux environment** - Docker runs natively  
✅ **Better performance** - No virtualization overhead  
✅ **Easier to use** - Standard Docker commands  
✅ **More reliable** - Fewer compatibility issues  
✅ **Better documented** - Standard Linux setup  
✅ **No Podman complexity** - Use standard Docker  

---

## Next Steps

1. ✅ Open Ubuntu terminal
2. ✅ Run the installation script above
3. ✅ Log out and back in (or run `newgrp docker`)
4. ✅ Navigate to project: `cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1`
5. ✅ Deploy: `docker compose up -d`
6. ✅ Initialize database
7. ✅ Access application at http://localhost:5173

---

*This is the recommended approach for running Docker on Windows!*