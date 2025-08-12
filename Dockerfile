FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy only necessary files first
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ ./server/

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# No health check needed - Cloud Run handles this

# Start the server
CMD ["node", "server/index.js"]
