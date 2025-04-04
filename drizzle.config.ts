import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import process from "node:process";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
