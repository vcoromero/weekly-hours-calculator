import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("7d"),
  MASTER_EMAIL: z.string().email(),
  MASTER_PASSWORD_HASH: z.string().min(1),
  FRONTEND_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
