FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm ci

# Install TypeScript globally for compilation
RUN npm install -g typescript

# Copy source code
COPY server/ ./server/

# Create tsconfig.json for compilation
RUN echo '{"compilerOptions":{"target":"es2020","module":"commonjs","esModuleInterop":true,"allowSyntheticDefaultImports":true,"strict":false,"skipLibCheck":true,"outDir":"./dist"},"include":["server/**/*"]}' > tsconfig.json

# Compile TypeScript to JavaScript
RUN tsc

# Expose port
EXPOSE 8080

# Run the compiled JavaScript
CMD ["node", "dist/server/index.js"]
