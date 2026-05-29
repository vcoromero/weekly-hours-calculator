import { describe, it, expect } from "vitest";
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

describe("env schema", () => {
  const validEnv = {
    PORT: "3000",
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://localhost:5432/testdb",
    JWT_SECRET: "super-secret-key-12345",
    JWT_EXPIRES_IN: "7d",
    MASTER_EMAIL: "admin@example.com",
    MASTER_PASSWORD_HASH: "$2a$10$hash",
    FRONTEND_URL: "http://localhost:5173",
  };

  it("parses valid env correctly", () => {
    const result = envSchema.parse(validEnv);
    expect(result.PORT).toBe("3000");
    expect(result.NODE_ENV).toBe("development");
    expect(result.DATABASE_URL).toBe("postgresql://localhost:5432/testdb");
    expect(result.JWT_SECRET).toBe("super-secret-key-12345");
    expect(result.MASTER_EMAIL).toBe("admin@example.com");
    expect(result.FRONTEND_URL).toBe("http://localhost:5173");
  });

  it("throws on missing DATABASE_URL", () => {
    const env = { ...validEnv };
    delete env.DATABASE_URL;
    expect(() => envSchema.parse(env)).toThrow();
  });

  it("throws on invalid DATABASE_URL (not a URL)", () => {
    const env = { ...validEnv, DATABASE_URL: "not-a-url" };
    expect(() => envSchema.parse(env)).toThrow();
  });

  it("throws on short JWT_SECRET (< 10 chars)", () => {
    const env = { ...validEnv, JWT_SECRET: "short" };
    expect(() => envSchema.parse(env)).toThrow();
  });

  it("accepts JWT_SECRET at exactly 10 chars", () => {
    const env = { ...validEnv, JWT_SECRET: "1234567890" };
    const result = envSchema.parse(env);
    expect(result.JWT_SECRET).toBe("1234567890");
  });

  it("defaults PORT to 3000 when not provided", () => {
    const env = { ...validEnv };
    delete env.PORT;
    const result = envSchema.parse(env);
    expect(result.PORT).toBe("3000");
  });

  it("defaults NODE_ENV to development when not provided", () => {
    const env = { ...validEnv };
    delete env.NODE_ENV;
    const result = envSchema.parse(env);
    expect(result.NODE_ENV).toBe("development");
  });

  it("throws on invalid NODE_ENV", () => {
    const env = { ...validEnv, NODE_ENV: "invalid" };
    expect(() => envSchema.parse(env)).toThrow();
  });

  it("throws on invalid MASTER_EMAIL", () => {
    const env = { ...validEnv, MASTER_EMAIL: "not-an-email" };
    expect(() => envSchema.parse(env)).toThrow();
  });
});
