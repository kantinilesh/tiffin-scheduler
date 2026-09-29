/**
 * constants.ts — App-wide constants that don't come from env vars.
 * Things like route prefixes, queue names, and index names live here
 * so they stay consistent across files.
 */

export const API_PREFIX = "/api/v1";

/** BullMQ queue names */
export const QUEUE_NAMES = {
  EMAIL: "email-queue",
  SLACK: "slack-queue",
  SEARCH_INDEX: "search-index-queue",
} as const;

/** Elasticsearch index names */
export const ES_INDICES = {
  SCHEDULES: "tiffin-schedules",
} as const;

/** Cookie name for the JWT auth token */
export const AUTH_COOKIE_NAME = "tiffin_token";
