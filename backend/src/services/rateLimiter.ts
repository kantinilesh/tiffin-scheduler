/**
 * rateLimiter.ts — Atomic Redis-backed hourly rate limiting per sender.
 *
 * GET + INCR + EXPIRE run as one atomic unit inside Redis via this Lua script,
 * so two workers checking the same sender's counter at the same millisecond
 * can never both slip through — this is what makes the limit safe across
 * multiple worker processes, not just multiple threads in one process.
 */

import { connection } from "../config/redis";

const checkAndIncrementScript = `
-- KEYS[1] = rate:{senderId}:{hourWindow}
-- ARGV[1] = max allowed this hour
-- ARGV[2] = TTL seconds for the key (7200 = 2 hours, safe buffer)
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local max = tonumber(ARGV[1])
if current >= max then
  return 0                -- rejected: over the cap
end
redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], ARGV[2])
return 1                  -- accepted
`;

export async function tryConsumeHourlySlot(
  senderId: string,
  maxPerHour: number
): Promise<boolean> {
  const hourWindow = new Date().toISOString().slice(0, 13); // e.g. "2026-09-29T14"
  const key = `rate:${senderId}:${hourWindow}`;
  const result = await connection.eval(
    checkAndIncrementScript,
    1,
    key,
    maxPerHour,
    7200
  );
  return result === 1; // true = allowed, false = limit hit
}

export function nextHourBoundary(): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  return next;
}
