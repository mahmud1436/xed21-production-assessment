import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

// Cloud SQL connection configuration
const getCloudSQLConnection = () => {
  const host = '34.131.103.137';
  const port = 5432;
  const database = 'postgres';
  const user = 'postgres';
  
  // In production, this should come from environment variables or secret manager
  const password = process.env.DATABASE_PASSWORD || 'your_password_here';
  
  const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
  
  return connectionString;
};

let db: ReturnType<typeof drizzle>;

export const initializeDatabase = () => {
  if (!db) {
    const connectionString = getCloudSQLConnection();
    const pool = new Pool({ connectionString });
    db = drizzle({ client: pool, schema });
    console.log('✅ Cloud SQL database connection initialized');
  }
  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};