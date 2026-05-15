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

# Copy package files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies with increased timeout and retry
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --legacy-peer-deps || npm install --legacy-peer-deps

# Generate Prisma client with correct binary targets
RUN npx prisma generate

# Copy only source code (not node_modules)
COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Made with Bob
