# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY resources/package*.json ./resources/

# Install all dependencies (including dev dependencies for build)
RUN npm install
RUN cd resources && npm install

# Copy source code
COPY . .

# Copy config folder (including google-vision.json)
COPY .config ./.config

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and resources from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/resources ./resources
COPY --from=builder /app/.config ./.config

# Copy environment file if it exists
COPY .env.production.local* ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]