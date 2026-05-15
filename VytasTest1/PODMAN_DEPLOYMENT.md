# 🐳 Podman Deployment Guide - Last Mile Delivery System

## Using Podman Desktop Instead of Docker

Podman is a Docker-compatible container engine. This guide will help you deploy using Podman.

---

## Step 1: Start Podman Desktop

1. **Open Podman Desktop application**
   - Find it in your Start Menu
   - Wait for it to fully start
   - You should see the Podman Desktop interface

2. **Verify Podman Machine is Running**
   - In Podman Desktop, check if the machine is started
   - If not, click "Start" on the Podman machine

---

## Step 2: Configure Podman for Docker Compatibility

Podman can emulate Docker commands. Open a **NEW PowerShell terminal** and run:

```powershell
# Check if podman is available
podman --version

# If podman command works, create Docker alias
Set-Alias -Name docker -Value podman
Set-Alias -Name docker-compose -Value podman-compose
```

---

## Step 3: Install podman-compose (if needed)

```powershell
# Install podman-compose using pip
pip install podman-compose

# Verify installation
podman-compose --version
```

If pip is not installed:
```powershell
# Install Python first from https://www.python.org/downloads/
# Then install podman-compose
python -m pip install podman-compose
```

---

## Step 4: Deploy with Podman

### Option A: Using podman-compose (Recommended)

```powershell
# Navigate to project directory
cd c:/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Start all services
podman-compose up -d

# Check if containers are running
podman ps

# Initialize database
podman exec -it vytastest1-backend-1 npx prisma migrate deploy
podman exec -it vytastest1-backend-1 npx prisma db seed
```

### Option B: Using Podman with Docker Compose

If you have docker-compose installed separately:

```powershell
# Set environment variable to use Podman
$env:DOCKER_HOST = "unix:///run/user/1000/podman/podman.sock"

# Or on Windows with Podman Desktop
$env:DOCKER_HOST = "npipe:////./pipe/podman-machine-default"

# Run docker-compose (it will use Podman)
docker-compose up -d
```

### Option C: Manual Podman Commands

If compose doesn't work, use individual Podman commands:

```powershell
# Create a pod (similar to docker-compose network)
podman pod create --name delivery-system -p 5173:5173 -p 3000:3000 -p 5432:5432 -p 6379:6379 -p 5672:5672 -p 15672:15672

# Start PostgreSQL
podman run -d --pod delivery-system `
  --name postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=delivery_system `
  postgres:15-alpine

# Start Redis
podman run -d --pod delivery-system `
  --name redis `
  redis:7-alpine

# Start RabbitMQ
podman run -d --pod delivery-system `
  --name rabbitmq `
  -e RABBITMQ_DEFAULT_USER=guest `
  -e RABBITMQ_DEFAULT_PASS=guest `
  rabbitmq:3.12-management-alpine

# Build and start Backend
podman build -t delivery-backend ./backend
podman run -d --pod delivery-system `
  --name backend `
  -e DATABASE_URL="postgresql://postgres:postgres@localhost:5432/delivery_system" `
  -e REDIS_HOST=localhost `
  -e REDIS_PORT=6379 `
  -e RABBITMQ_URL=amqp://localhost:5672 `
  delivery-backend

# Build and start Frontend
podman build -t delivery-frontend ./frontend
podman run -d --pod delivery-system `
  --name frontend `
  delivery-frontend
```

---

## Step 5: Verify Deployment

```powershell
# Check all containers are running
podman ps

# Check logs
podman logs backend
podman logs frontend

# Test backend health
curl http://localhost:3000/health

# Or in PowerShell
Invoke-WebRequest -Uri http://localhost:3000/health
```

---

## Step 6: Initialize Database

```powershell
# Find the backend container name
podman ps

# Run migrations (replace container name if different)
podman exec -it vytastest1-backend-1 npx prisma migrate deploy

# Seed database
podman exec -it vytastest1-backend-1 npx prisma db seed
```

---

## Step 7: Access the Application

Open your browser:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

---

## 🔧 Troubleshooting Podman

### Issue: "podman: command not found"

**Solution 1**: Restart PowerShell after starting Podman Desktop
```powershell
# Close and reopen PowerShell
# Or refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

**Solution 2**: Use full path to podman
```powershell
# Find Podman installation
Get-Command podman -ErrorAction SilentlyContinue

# Common locations:
# C:\Program Files\RedHat\Podman\podman.exe
# C:\Program Files (x86)\RedHat\Podman\podman.exe

# Use full path
& "C:\Program Files\RedHat\Podman\podman.exe" --version
```

### Issue: "Cannot connect to Podman"

**Solution**: Ensure Podman machine is running
```powershell
# In Podman Desktop, start the machine
# Or via CLI:
podman machine start

# Check status
podman machine list
```

### Issue: "podman-compose not found"

**Solution**: Install it
```powershell
# Install Python if needed
# Download from: https://www.python.org/downloads/

# Install podman-compose
pip install podman-compose

# Or use Python module directly
python -m pip install podman-compose
```

### Issue: Port conflicts

**Solution**: Stop conflicting services
```powershell
# Check what's using the port
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Issue: Containers won't start

**Solution**: Check logs and restart
```powershell
# View logs
podman logs backend
podman logs postgres

# Restart containers
podman restart backend
podman restart postgres

# Or restart entire pod
podman pod restart delivery-system
```

---

## 🎯 Quick Commands Reference

### Start Services
```powershell
podman-compose up -d
```

### Stop Services
```powershell
podman-compose down
```

### View Logs
```powershell
podman-compose logs -f
podman logs -f backend
```

### Restart Services
```powershell
podman-compose restart
```

### Check Status
```powershell
podman ps
podman pod ps
```

### Execute Commands in Container
```powershell
podman exec -it backend sh
podman exec backend npx prisma migrate deploy
```

### Clean Up
```powershell
# Stop and remove all containers
podman-compose down -v

# Remove all pods
podman pod rm -f delivery-system

# Remove all images
podman rmi delivery-backend delivery-frontend
```

---

## 🔄 Podman vs Docker Differences

| Feature | Docker | Podman |
|---------|--------|--------|
| **Command** | `docker` | `podman` |
| **Compose** | `docker-compose` | `podman-compose` |
| **Daemon** | Requires daemon | Daemonless |
| **Root** | Runs as root | Rootless by default |
| **Compatibility** | N/A | Docker-compatible |

**Good News**: Most Docker commands work with Podman by just replacing `docker` with `podman`!

---

## 📋 Complete Deployment Checklist

- [ ] Podman Desktop is installed and running
- [ ] Podman machine is started
- [ ] `podman --version` works in terminal
- [ ] `podman-compose` is installed
- [ ] Project directory is correct
- [ ] Run `podman-compose up -d`
- [ ] All containers are running (`podman ps`)
- [ ] Database is initialized
- [ ] Database is seeded
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend accessible at http://localhost:3000
- [ ] API docs accessible at http://localhost:3000/api-docs

---

## 🎊 Success Indicators

When everything is working, you should see:

```powershell
PS> podman ps
CONTAINER ID  IMAGE                              COMMAND     STATUS      PORTS
abc123def456  localhost/delivery-backend:latest  npm start   Up 2 mins   0.0.0.0:3000->3000/tcp
def456ghi789  localhost/delivery-frontend:latest npm start   Up 2 mins   0.0.0.0:5173->5173/tcp
ghi789jkl012  postgres:15-alpine                 postgres    Up 2 mins   0.0.0.0:5432->5432/tcp
jkl012mno345  redis:7-alpine                     redis       Up 2 mins   0.0.0.0:6379->6379/tcp
mno345pqr678  rabbitmq:3.12-management-alpine    rabbitmq    Up 2 mins   0.0.0.0:5672->5672/tcp
```

---

## 🆘 Still Having Issues?

### Option 1: Use Podman Desktop UI
1. Open Podman Desktop
2. Go to "Containers" tab
3. Click "Create Container"
4. Use the UI to manage containers

### Option 2: Switch to Docker
If Podman continues to have issues:
```powershell
# Uninstall Podman Desktop
# Install Docker Desktop from:
# https://www.docker.com/products/docker-desktop/

# Then use docker-compose commands instead
```

### Option 3: Manual Installation
Follow the manual installation guide in DEPLOYMENT_GUIDE.md (Option B)

---

## 📞 Need Help?

1. Check Podman Desktop logs
2. Check container logs: `podman logs <container-name>`
3. Verify Podman machine: `podman machine list`
4. Restart Podman Desktop
5. Restart Podman machine: `podman machine restart`

---

## 🎯 Next Steps After Deployment

Once deployed successfully:
1. ✅ Test customer booking flow
2. ✅ Explore admin dashboard
3. ✅ Check driver app
4. ✅ Review API documentation
5. ✅ Run tests: `cd backend && npm test`

---

*Last updated: 2026-05-14*
*Project: Last Mile Delivery System*
*Container Engine: Podman*
*Status: Ready for Deployment*