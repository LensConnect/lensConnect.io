import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  // Use your live server connection string
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log('Running migrations programmatically...');
  
  try {
    // Point this to your generated migration folder (usually "./drizzle")
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed! Here is the hidden error:');
    console.error(error); // This will print the actual error text!
  } finally {
    await connection.end();
  }
}

runMigration();




