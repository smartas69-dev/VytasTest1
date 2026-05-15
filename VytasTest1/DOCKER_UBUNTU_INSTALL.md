# 🐳 How to Install Docker in Ubuntu WSL2 - Step by Step

## Simple Installation Guide

Follow these steps **exactly** to install Docker in your Ubuntu WSL2.

---

## Step 1: Open Ubuntu Terminal

**Option A:** From Windows Start Menu
- Click **Start Menu**
- Type **"Ubuntu"**
- Click on **Ubuntu** app

**Option B:** From PowerShell
- Open PowerShell
- Type: `wsl`
- Press Enter

You should see a terminal that looks like:
```
username@computername:~$
```

---

## Step 2: Copy and Paste These Commands

**IMPORTANT:** Copy each command block and paste it into Ubuntu terminal, then press Enter.

### Command Block 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```
- This updates your Ubuntu system
- Type your password if asked
- Wait for it to complete (1-2 minutes)

### Command Block 2: Install Prerequisites
```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
```
- This installs required tools
- Wait for it to complete (30 seconds)

### Command Block 3: Add Docker Repository
```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
- This adds Docker's official repository
- Wait for it to complete (10 seconds)

### Command Block 4: Install Docker
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
- This installs Docker and Docker Compose
- Wait for it to complete (2-3 minutes)

### Command Block 5: Configure Docker
```bash
sudo usermod -aG docker $USER
sudo service docker start
```
- This allows you to run Docker without sudo
- Starts the Docker service

---

## Step 3: Verify Installation

Run this command:
```bash
docker --version
```

**Expected Output:**
```
Docker version 24.0.7, build afdd53b
```

Run this command:
```bash
docker compose version
```

**Expected Output:**
```
Docker Compose version v2.23.0
```

---

## Step 4: Test Docker

Run this command:
```bash
docker run hello-world
```

**Expected Output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

If you see this message, **Docker is installed successfully!** ✅

---

## Step 5: Make Docker Start Automatically

Run this command:
```bash
echo 'if service docker status 2>&1 | grep -q "is not running"; then sudo service docker start; fi' >> ~/.bashrc
source ~/.bashrc
```

This ensures Docker starts automatically when you open Ubuntu.

---

## Complete Installation Script (All-in-One)

If you want to run everything at once, copy and paste this entire script:

```bash
#!/bin/bash

echo "🚀 Installing Docker in Ubuntu WSL2..."
echo ""

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install prerequisites
echo "📦 Installing prerequisites..."
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker repository
echo "📦 Adding Docker repository..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
echo "📦 Installing Docker..."
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Configure Docker
echo "⚙️  Configuring Docker..."
sudo usermod -aG docker $USER
sudo service docker start

# Auto-start Docker
echo "⚙️  Setting up auto-start..."
echo 'if service docker status 2>&1 | grep -q "is not running"; then sudo service docker start; fi' >> ~/.bashrc

echo ""
echo "✅ Docker installation complete!"
echo ""
echo "📝 Please run these commands to verify:"
echo "   docker --version"
echo "   docker compose version"
echo "   docker run hello-world"
echo ""
echo "⚠️  If you get permission errors, log out and back in, or run:"
echo "   newgrp docker"
```

---

## Troubleshooting

### Problem: "Permission denied" when running docker

**Solution:**
```bash
# Add yourself to docker group
sudo usermod -aG docker $USER

# Apply the change
newgrp docker

# Test again
docker ps
```

### Problem: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Start Docker service
sudo service docker start

# Check if it's running
sudo service docker status
```

### Problem: Docker service won't start

**Solution:**
```bash
# Restart WSL from PowerShell
wsl --shutdown
wsl

# Then start Docker
sudo service docker start
```

---

## After Installation - Deploy Your Application

Once Docker is installed and working:

### 1. Navigate to Your Project
```bash
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1
```

### 2. Start the Application
```bash
docker compose up -d
```

### 3. Check Containers
```bash
docker ps
```

### 4. Initialize Database
```bash
# Wait 30 seconds for containers to start
sleep 30

# Run migrations
docker exec -it vytastest1-backend-1 npx prisma migrate deploy

# Seed database
docker exec -it vytastest1-backend-1 npx prisma db seed
```

### 5. Access Application
Open your browser (on Windows):
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

---

## Quick Reference

### Check Docker Status
```bash
docker --version
docker compose version
sudo service docker status
```

### Start Docker
```bash
sudo service docker start
```

### Stop Docker
```bash
sudo service docker stop
```

### View Running Containers
```bash
docker ps
```

### View All Containers
```bash
docker ps -a
```

### View Logs
```bash
docker compose logs -f
```

---

## Summary

1. ✅ Open Ubuntu terminal
2. ✅ Copy and paste the installation commands
3. ✅ Wait for installation to complete
4. ✅ Verify with `docker --version`
5. ✅ Test with `docker run hello-world`
6. ✅ Navigate to project directory
7. ✅ Run `docker compose up -d`
8. ✅ Access application at http://localhost:5173

---

**That's it!** Docker will be installed and ready to use in your Ubuntu WSL2 environment.