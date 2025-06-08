import { defineConfig } from "drizzle-kit";
import { env } from "./env";
export default defineConfig({
    dialect: "postgresql",
    schema: "./src/lib/db/schema.ts",
    out: "./src/lib/db/migrations",
    dbCredentials: {
        url: env.AUTH_DRIZZLE_URL,
    }
});