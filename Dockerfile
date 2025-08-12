FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server/ ./server/
COPY shared/ ./shared/

# Expose port
EXPOSE 8080

# Run the JavaScript server directly
CMD ["node", "server/index.js"]
