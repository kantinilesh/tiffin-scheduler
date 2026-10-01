/**
 * search.ts — Elasticsearch service for indexing and searching emails.
 *
 * Connects to Elasticsearch using ELASTICSEARCH_URL from env.
 * Indexes email documents with: recipient, subject, status, scheduledAt, sentAt.
 * Exposes multi-match search over recipient and subject fields.
 * Includes ensureSearchIndex() to verify or create the index on boot.
 */

import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
});

export const INDEX = "emails";

export interface IndexableEmail {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  scheduledAt: Date | string;
  sentAt?: Date | string | null;
}

/**
 * Indexes or updates an email document in Elasticsearch.
 */
export async function indexEmail(email: IndexableEmail): Promise<void> {
  await esClient.index({
    index: INDEX,
    id: email.id,
    document: {
      recipient: email.recipient,
      subject: email.subject,
      status: email.status,
      scheduledAt: email.scheduledAt,
      sentAt: email.sentAt ?? null,
    },
  });
}

/**
 * Ensures the Elasticsearch index exists on boot.
 * Creates it if HEAD request returns 404 / false.
 */
export async function ensureSearchIndex(): Promise<void> {
  try {
    const exists = await esClient.indices.exists({ index: INDEX });
    if (!exists) {
      await esClient.indices.create({
        index: INDEX,
        mappings: {
          properties: {
            recipient: { type: "text" },
            subject: { type: "text" },
            status: { type: "keyword" },
            scheduledAt: { type: "date" },
            sentAt: { type: "date" },
          },
        },
      });
      console.log(`[search] Created Elasticsearch index '${INDEX}'`);
    } else {
      console.log(`[search] Elasticsearch index '${INDEX}' already exists`);
    }
  } catch (err: any) {
    if (err?.meta?.statusCode === 404 || err?.statusCode === 404) {
      await esClient.indices.create({ index: INDEX });
      console.log(`[search] Created Elasticsearch index '${INDEX}' after 404`);
    } else {
      console.error(
        `[search] Failed to ensure Elasticsearch index '${INDEX}':`,
        err.message || err
      );
    }
  }
}
