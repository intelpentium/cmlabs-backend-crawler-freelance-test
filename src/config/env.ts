import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().min(1).default("info"),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL must be a PostgreSQL connection string"
    ),
  FILE_STORAGE_DIR: z.string().min(1).default("files"),
  CRAWL_TIMEOUT_MS: z.coerce.number().int().positive().default(45_000),
  CRAWL_NETWORK_IDLE_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(10_000),
  CRAWL_SETTLE_MS: z.coerce.number().int().nonnegative().default(1_500),
  PLAYWRIGHT_HEADLESS: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  ALLOW_PRIVATE_URLS: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = {
  ...parsedEnv.data,
  FILE_STORAGE_DIR: path.resolve(process.cwd(), parsedEnv.data.FILE_STORAGE_DIR)
};
