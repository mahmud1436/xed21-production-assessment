FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application files
COPY dist/ ./dist/
COPY server/ ./server/
COPY shared/ ./shared/

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]
