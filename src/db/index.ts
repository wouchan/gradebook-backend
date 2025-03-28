import { drizzle } from "drizzle-orm/node-postgres";
import process from "node:process";

export const db = drizzle(process.env.DATABASE_URL!);
