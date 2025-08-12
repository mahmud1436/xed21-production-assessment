import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());

// Health check - the most important endpoint
app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).json({ message: 'XED21 API is running!', port: PORT });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  console.log('API test hit');
  res.status(200).json({ 
    message: 'API working',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Start server with detailed logging
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started successfully`);
  console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
  console.log(`📍 Node.js version: ${process.version}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Handle startup errors
server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('🚀 Starting server...');
