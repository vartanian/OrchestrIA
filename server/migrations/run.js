import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...\n');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schemaSql);
    
    console.log('✅ Database schema created successfully');
    console.log('✅ Tables created: tasks, events, projects');
    console.log('✅ Indexes created for optimized queries');
    console.log('✅ Triggers created for auto-updating timestamps');
    console.log('✅ Sample data inserted (if tables were empty)\n');
    
    // Verify tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(tablesQuery);
    console.log('📊 Available tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Count records in each table
    const counts = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM tasks'),
      pool.query('SELECT COUNT(*) as count FROM events'),
      pool.query('SELECT COUNT(*) as count FROM projects')
    ]);
    
    console.log('\n📈 Record counts:');
    console.log(`   - Tasks: ${counts[0].rows[0].count}`);
    console.log(`   - Events: ${counts[1].rows[0].count}`);
    console.log(`   - Projects: ${counts[2].rows[0].count}`);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. DATABASE_URL is correctly set in .env');
    console.error('3. Database exists (or you have permission to create tables)');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
