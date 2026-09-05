import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from './db/schema';
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Define it in .env.local");
}

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle({
  client: connection.pool,
  relations
});
