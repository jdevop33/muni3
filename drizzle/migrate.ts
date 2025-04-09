import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Run the migration
async function main() {
  try {
    console.log("Migration started...");
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

main();