/**
 * env.ts — Loads environment variables from .env via dotenv and
 * exports them as a typed object. Every env var the app uses is
 * defined here so we have one place to check what's required.
 */

import dotenv from "dotenv";
dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,

  // Elasticsearch
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || "http://localhost:9200",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:4000/auth/google/callback",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Slack
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || "",
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || "",
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET || "",
  SLACK_REDIRECT_URI:
    process.env.SLACK_REDIRECT_URI ||
    "http://localhost:4000/slack/oauth/callback",

  // SMTP (Ethereal in dev)
  SMTP_HOST: process.env.SMTP_HOST || "smtp.ethereal.email",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // BullMQ limits & rate limiting — always from env, never hardcoded
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || "5", 10),
  MIN_DELAY_MS: parseInt(process.env.MIN_DELAY_MS || "2000", 10),
  MAX_EMAILS_PER_HOUR: parseInt(process.env.MAX_EMAILS_PER_HOUR || "200", 10),
  QUEUE_CONCURRENCY: parseInt(process.env.QUEUE_CONCURRENCY || "5", 10),
  QUEUE_RATE_LIMIT_MAX: parseInt(
    process.env.QUEUE_RATE_LIMIT_MAX || "100",
    10
  ),
  QUEUE_RATE_LIMIT_DURATION: parseInt(
    process.env.QUEUE_RATE_LIMIT_DURATION || "3600000",
    10
  ),
  QUEUE_RETRY_ATTEMPTS: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || "3", 10),
  QUEUE_RETRY_DELAY: parseInt(process.env.QUEUE_RETRY_DELAY || "5000", 10),

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
