#!/bin/bash

echo "📤 Pushing Last Mile Delivery System to GitHub..."
echo "Repository: https://github.com/smartas69-dev/VytasTest1"
echo ""

# Fix Git ownership
echo "🔧 Fixing Git ownership..."
git config --global --add safe.directory /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code

# Navigate to project
cd /mnt/c/Users/SauliusMartusevicius/IBM/AI_Bob_Code/VytasTest1

# Check current status
echo ""
echo "📊 Current Git status:"
git status

# Check if remote exists
echo ""
echo "🔍 Checking remote repository..."
REMOTE_EXISTS=$(git remote -v | grep origin || echo "")

if [ -z "$REMOTE_EXISTS" ]; then
    echo "➕ Adding remote repository..."
    git remote add origin https://github.com/smartas69-dev/VytasTest1.git
else
    echo "✅ Remote already exists"
    echo "🔄 Updating remote URL..."
    git remote set-url origin https://github.com/smartas69-dev/VytasTest1.git
fi

# Show remote
echo ""
echo "📍 Remote repository:"
git remote -v

# Add all changes
echo ""
echo "➕ Adding all changes..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "ℹ️  No changes to commit"
else
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
- Configured for Docker in Ubuntu WSL2
- Fixed Podman configuration issues"
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo ""
echo "🌿 Current branch: $BRANCH"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin $BRANCH

echo ""
echo "✅ Push complete!"
echo ""
echo "🌐 View your repository at:"
echo "   https://github.com/smartas69-dev/VytasTest1"

# Made with Bob
