/**
 * redis.ts — Shared ioredis connection for BullMQ.
 *
 * BullMQ requires `maxRetriesPerRequest: null` on the Redis connection
 * so it can use blocking commands (BRPOPLPUSH) without timing out.
 * This single connection is shared by all queues and workers.
 */

import IORedis from "ioredis";
import { env } from "./env";

export const connection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // required by BullMQ
});

connection.on("connect", () => {
  console.log("[tiffin-redis] Connected to Redis");
});

connection.on("error", (err) => {
  console.error("[tiffin-redis] Redis error:", err.message);
});
