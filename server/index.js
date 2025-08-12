const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// Safe database connection - only initialize if needed
let pool = null;

// Function to get database connection safely
const getDbPool = () => {
  if (!pool) {
    try {
      const { Pool } = require('pg');
      pool = new Pool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
        ssl: false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      console.log('✅ Database pool created');
    } catch (error) {
      console.error('❌ Database pool creation failed:', error.message);
      return null;
    }
  }
  return pool;
};

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

// Database configuration test
app.get('/api/db-test', async (req, res) => {
  console.log('Database test endpoint hit');
  try {
    res.status(200).json({ 
      message: 'Database configuration loaded',
      config: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        port: process.env.DATABASE_PORT,
        password_set: !!process.env.DATABASE_PASSWORD,
        database_url_set: !!process.env.DATABASE_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database test failed',
      details: error.message 
    });
  }
});

// Safe database connection test
app.get('/api/db-connect', async (req, res) => {
  console.log('Database connection test hit');
  try {
    const dbPool = getDbPool();
    if (!dbPool) {
      return res.status(500).json({
        error: 'Database pool not available',
        message: 'PostgreSQL module failed to initialize'
      });
    }

    const client = await dbPool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    client.release();
    
    res.status(200).json({ 
      message: 'Database connection successful!',
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

// Safe users table test
app.get('/api/users', async (req, res) => {
  console.log('Users endpoint hit');
  try {
    const dbPool = getDbPool();
    if (!dbPool) {
      return res.status(500).json({
        error: 'Database pool not available',
        message: 'PostgreSQL module failed to initialize'
      });
    }

    const client = await dbPool.connect();
    try {
      const result = await client.query('SELECT * FROM users LIMIT 10');
      res.status(200).json({ 
        message: 'Users retrieved successfully',
        users: result.rows,
        count: result.rowCount
      });
    } catch (tableError) {
      res.status(200).json({ 
        message: 'Users table not found - database is ready for setup',
        suggestion: 'Run database migrations to create tables',
        error: tableError.message
      });
    }
    client.release();
  } catch (error) {
    console.error('Users endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to query users',
      details: error.message 
    });
  }
});

// Start server with detailed logging
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started successfully`);
  console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
  console.log(`📍 Node.js version: ${process.version}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🗄️ Database host: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
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
    if (pool) {
      pool.end(() => {
        console.log('✅ Database pool closed');
        console.log('✅ Server closed');
        process.exit(0);
      });
    } else {
      console.log('✅ Server closed');
      process.exit(0);
    }
  });
});

console.log('🚀 Starting server...');
