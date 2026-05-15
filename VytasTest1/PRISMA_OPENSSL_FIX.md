# Prisma OpenSSL Compatibility Fix

## Problem

When deploying the backend with Prisma ORM in Docker, we encountered persistent OpenSSL compatibility issues:

```
PrismaClientInitializationError: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`).
Error loading shared library libssl.so.1.1: No such file or directory
```

## Root Cause

1. **Alpine Linux** (node:20-alpine) uses musl libc instead of glibc
2. **Prisma engines** require OpenSSL 1.1, but Alpine Linux 3.x ships with OpenSSL 3.x
3. **Cached Prisma client** was generated for Alpine (musl) but persisted when switching base images

## Solutions Attempted

### ❌ Attempt 1: Add openssl1.1-compat to Alpine
```dockerfile
RUN apk add --no-cache openssl1.1-compat
```
**Result**: Package doesn't exist in Alpine repositories

### ❌ Attempt 2: Add openssl-dev to Alpine  
```dockerfile
RUN apk add --no-cache openssl-dev
```
**Result**: Provides development headers but not runtime library libssl.so.1.1

### ❌ Attempt 3: Switch to Debian-slim without cache cleanup
```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y openssl
```
**Result**: Still loaded cached musl version of Prisma engine

### ✅ Solution: Debian-slim + Binary Targets + Force Prisma Regeneration

**Step 1: Update Prisma Schema**
```prisma
// backend/prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

**Step 2: Update Dockerfile**
```dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies for native modules and OpenSSL
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --legacy-peer-deps || npm install --legacy-peer-deps

# Copy application code
COPY . .

# Generate Prisma client for Debian (not Alpine)
# Remove any cached Prisma engines
RUN rm -rf node_modules/.prisma node_modules/@prisma/client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

## Key Changes

1. **Base Image**: `node:20-alpine` → `node:20-slim` (Debian-based)
2. **Package Manager**: `apk` → `apt-get`
3. **OpenSSL**: Debian includes proper OpenSSL 3.x with compatibility
4. **Prisma Cache**: Force regeneration by removing cached engines
5. **Build**: Use `--no-cache` flag to ensure clean build

## Build Commands

```bash
# Clean build without cache
docker compose build --no-cache backend

# Recreate and start container
docker compose up -d --force-recreate backend

# Verify it's working
docker logs vytastest1-backend-1
```

## Verification

Check logs for successful startup:
```bash
docker logs vytastest1-backend-1 --tail 50
```

Should see:
```
✅ Database connected successfully
✅ Redis connected successfully
✅ RabbitMQ connected successfully
🚀 Server running on port 3000
```

Should NOT see:
```
❌ Unhandled rejection: PrismaClientInitializationError
Error loading shared library libssl.so.1.1
```

## Why Debian-slim?

| Feature | Alpine | Debian-slim |
|---------|--------|-------------|
| Size | ~40MB | ~80MB |
| libc | musl | glibc |
| OpenSSL | 3.x only | 3.x with compat |
| Prisma Support | ⚠️ Limited | ✅ Full |
| Build Tools | Minimal | Complete |
| Compatibility | Lower | Higher |

**Recommendation**: Use Debian-slim for Node.js applications with native dependencies like Prisma.

## Alternative Solutions

### Option 1: Use Prisma Data Proxy
- Offload database connection to Prisma Cloud
- No local engine needed
- Requires subscription

### Option 2: Use Different ORM
- TypeORM, Sequelize, or Knex
- More Alpine-compatible
- Less type-safe than Prisma

### Option 3: Use Full Debian Image
- `node:20` instead of `node:20-slim`
- Larger image size (~300MB)
- All dependencies included

## Lessons Learned

1. **Always match Prisma engine to runtime environment**
2. **Clear caches when switching base images**
3. **Debian-slim is better for complex dependencies**
4. **Alpine is great for simple Node.js apps without native deps**
5. **Test in production-like environment early**

## References

- [Prisma System Requirements](https://www.prisma.io/docs/reference/system-requirements)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Alpine vs Debian for Node.js](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## Made with Bob