import { defineConfig } from "drizzle-kit";
import { ensureDatabaseEnvLoaded } from "./src/load-env";

ensureDatabaseEnvLoaded();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
