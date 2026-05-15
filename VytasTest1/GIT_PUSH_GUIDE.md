# 📤 Push Application to Git - Complete Guide

## Current Status
✅ Application is deployed and running  
✅ Git repository exists  
⚠️ Need to configure Git and push changes

---

## Step 1: Fix Git Ownership Issue (WSL)

**In Ubuntu terminal, run:**

```bash
# Add safe directory
git config --global --add safe.directory /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code

# Navigate to project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Check status
git status
```

---

## Step 2: Create/Update .gitignore

**Make sure these files are ignored:**

```bash
# Check if .gitignore exists
cat .gitignore

# If it doesn't exist or needs updating, create it
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local
backend/.env
frontend/.env

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker
*.log

# Prisma
backend/prisma/migrations/

# Test coverage
coverage/

# Temporary files
*.tmp
*.temp
EOF
```

---

## Step 3: Configure Git (If Not Already Done)

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

## Step 4: Stage and Commit Changes

```bash
# Navigate to project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Check what files will be committed
git status

# Add all files
git add .

# Create commit
git commit -m "feat: Complete Last Mile Delivery System with Docker deployment

- Implemented full-stack delivery management system
- Backend: Node.js/Express with Prisma ORM
- Frontend: React with Vite
- Database: PostgreSQL with complete schema
- Cache: Redis for performance
- Message Queue: RabbitMQ for async processing
- Containerized with Docker Compose
- Complete documentation and deployment guides
- Configured for Docker in Ubuntu WSL2"
```

---

## Step 5: Push to Remote Repository

### Option A: Push to Existing Remote

```bash
# Check if remote exists
git remote -v

# Push to main branch
git push origin main

# Or push to master branch
git push origin master
```

### Option B: Add New Remote (GitHub)

```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option C: Add New Remote (GitLab)

```bash
# Create repository on GitLab first, then:
git remote add origin https://gitlab.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitLab
git branch -M main
git push -u origin main
```

### Option D: Add New Remote (Azure DevOps)

```bash
# Create repository on Azure DevOps first, then:
git remote add origin https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/YOUR_REPO

# Push to Azure DevOps
git branch -M main
git push -u origin main
```

---

## Step 6: Verify Push

```bash
# Check remote status
git remote -v

# Check branch status
git branch -a

# View commit history
git log --oneline -5
```

---

## Complete Push Script

**Run this in Ubuntu terminal:**

```bash
#!/bin/bash

echo "📤 Pushing Last Mile Delivery System to Git..."

# Fix ownership
git config --global --add safe.directory /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code

# Navigate to project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Check status
echo "📊 Current Git status:"
git status

# Add all changes
echo "➕ Adding all changes..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "feat: Complete Last Mile Delivery System with Docker deployment

- Implemented full-stack delivery management system
- Backend: Node.js/Express with Prisma ORM
- Frontend: React with Vite
- Database: PostgreSQL with complete schema
- Cache: Redis for performance
- Message Queue: RabbitMQ for async processing
- Containerized with Docker Compose
- Complete documentation and deployment guides
- Configured for Docker in Ubuntu WSL2"

# Check remote
echo "🔍 Checking remote repository..."
git remote -v

# Push (uncomment the appropriate line)
# git push origin main
# git push origin master

echo "✅ Done! Check the output above for any errors."
```

---

## Important Files to Commit

✅ **Include:**
- Source code (backend/src/, frontend/src/)
- Configuration files (package.json, tsconfig.json, etc.)
- Docker files (Dockerfile, docker-compose.yml)
- Documentation (*.md files)
- Prisma schema (backend/prisma/schema.prisma)

❌ **Exclude (via .gitignore):**
- node_modules/
- .env files
- Build outputs (dist/, build/)
- Log files
- IDE settings (.vscode/)
- Database files
- Prisma migrations (optional)

---

## Troubleshooting

### Issue: "fatal: detected dubious ownership"

**Solution:**
```bash
git config --global --add safe.directory /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code
```

### Issue: "Permission denied (publickey)"

**Solution:** Set up SSH keys or use HTTPS with personal access token

**For HTTPS:**
```bash
# Use personal access token instead of password
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/REPO.git
```

**For SSH:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub/GitLab
cat ~/.ssh/id_ed25519.pub
# Copy and add to your Git provider's SSH keys
```

### Issue: "Updates were rejected"

**Solution:**
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: "No remote repository"

**Solution:**
```bash
# Add remote
git remote add origin YOUR_REPO_URL

# Push
git push -u origin main
```

---

## After Pushing

### Create README.md on GitHub/GitLab

Add this content to your repository's README:

```markdown
# 🚚 Last Mile Delivery System

A comprehensive delivery management system built with modern technologies.

## Features

- 📦 Order Management
- 🚛 Fleet Management
- 📍 Route Optimization
- 📊 Real-time Analytics
- 👥 Multi-role Support (Customer, Admin, Driver)

## Tech Stack

- **Backend**: Node.js, Express, Prisma ORM
- **Frontend**: React, Vite, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Containerization**: Docker, Docker Compose

## Quick Start

\`\`\`bash
# Clone repository
git clone YOUR_REPO_URL
cd VytasTest1

# Start with Docker Compose
docker compose up -d

# Initialize database
docker exec -it vytastest1-backend-1 npx prisma migrate deploy

# Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
\`\`\`

## Documentation

- [Deployment Guide](DEPLOY_NOW.md)
- [Docker Setup](DOCKER_UBUNTU_INSTALL.md)
- [Database Initialization](INITIALIZE_DATABASE.md)

## License

MIT
```

---

## Summary

**To push your application to Git:**

1. ✅ Fix Git ownership: `git config --global --add safe.directory /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code`
2. ✅ Navigate to project: `cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1`
3. ✅ Check .gitignore is correct
4. ✅ Stage changes: `git add .`
5. ✅ Commit: `git commit -m "feat: Complete Last Mile Delivery System"`
6. ✅ Push: `git push origin main` (or master)

---

**Run the commands above in Ubuntu terminal to push your application to Git!** 📤