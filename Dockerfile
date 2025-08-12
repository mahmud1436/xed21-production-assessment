FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server/ ./server/
COPY shared/ ./shared/

# Install ts-node for running TypeScript directly
RUN npm install -g ts-node

# Expose port
EXPOSE 8080

# Run TypeScript directly
CMD ["npx", "ts-node", "server/index.ts"]
