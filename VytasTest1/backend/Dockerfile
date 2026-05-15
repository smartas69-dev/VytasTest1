FROM node:20-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with increased timeout and retry
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --legacy-peer-deps || npm install --legacy-peer-deps

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate || true

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Made with Bob
