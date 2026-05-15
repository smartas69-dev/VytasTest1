#!/bin/sh

# Seed wrapper script to ensure DATABASE_URL is set
export DATABASE_URL="postgresql://admin:admin123@postgres:5432/lastmile_db"

echo "🌱 Starting database seeding with DATABASE_URL: $DATABASE_URL"

npx tsx prisma/seed.ts

# Made with Bob
