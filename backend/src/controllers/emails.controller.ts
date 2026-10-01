/**
 * emails.controller.ts — Handlers for email scheduling and listing.
 *
 * scheduleEmails — POST /emails/schedule: validates input, calls scheduler,
 *                  returns { campaignId, emailCount }.
 * getScheduled   — GET /emails/scheduled: lists emails with status 'scheduled'
 *                  for the current user's campaigns.
 * getSent        — GET /emails/sent: lists emails with status 'sent'
 *                  for the current user's campaigns.
 */

import { Request, Response } from "express";
import { scheduleCampaign } from "../services/scheduler";
import { prisma } from "../db/prisma";
import { esClient, INDEX } from "../services/search";

/**
 * POST /emails/schedule
 * Body: { subject, body, recipients[], startTime, delaySeconds, hourlyLimit }
 */
export async function scheduleEmails(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const { subject, body, recipients, startTime, delaySeconds, hourlyLimit } =
    req.body;

  // Basic validation
  if (
    !subject ||
    !body ||
    !Array.isArray(recipients) ||
    recipients.length === 0
  ) {
    res
      .status(400)
      .json({ error: "subject, body, and recipients[] are required" });
    return;
  }

  if (!startTime || delaySeconds === undefined || delaySeconds === null || !hourlyLimit) {
    res
      .status(400)
      .json({ error: "startTime, delaySeconds, and hourlyLimit are required" });
    return;
  }

  const result = await scheduleCampaign({
    userId,
    subject,
    body,
    recipients,
    startTime: new Date(startTime),
    delaySeconds: Number(delaySeconds),
    hourlyLimit: Number(hourlyLimit),
  });

  res.status(201).json(result);
}

/**
 * GET /emails/scheduled — emails with status 'scheduled', ordered by scheduledAt
 */
export async function getScheduled(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;

  const emails = await prisma.email.findMany({
    where: {
      status: "scheduled",
      campaign: { userId },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      sender: { select: { label: true } },
      campaign: { select: { subject: true } },
    },
  });

  res.json(emails);
}

/**
 * GET /emails/sent — emails with status 'sent', ordered by sentAt descending
 */
export async function getSent(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;

  const emails = await prisma.email.findMany({
    where: {
      status: "sent",
      campaign: { userId },
    },
    orderBy: { sentAt: "desc" },
    include: {
      sender: { select: { label: true } },
      campaign: { select: { subject: true } },
    },
  });

  res.json(emails);
}

/**
 * GET /emails/search?q=<text> — searches recipient and subject via Elasticsearch multi_match,
 * then returns fresh Prisma email rows matching the hits for the authenticated user.
 */
export async function searchEmails(
  req: Request,
  res: Response
): Promise<void> {
  const userId = (req as any).userId;
  const q = req.query.q;

  if (!q || typeof q !== "string" || q.trim() === "") {
    res.json([]);
    return;
  }

  try {
    const { hits } = await esClient.search({
      index: INDEX,
      query: {
        multi_match: {
          query: q.trim(),
          fields: ["recipient", "subject"],
        },
      },
    });

    const ids = hits.hits.map((hit) => hit._id as string);

    if (ids.length === 0) {
      res.json([]);
      return;
    }

    const emails = await prisma.email.findMany({
      where: {
        id: { in: ids },
        campaign: { userId },
      },
      include: {
        sender: { select: { label: true } },
        campaign: { select: { subject: true } },
      },
    });

    // Preserve Elasticsearch ranking order
    const emailMap = new Map(emails.map((email) => [email.id, email]));
    const ordered = ids
      .map((id) => emailMap.get(id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));

    res.json(ordered);
  } catch (err: any) {
    // If index doesn't exist yet, return empty list
    if (err?.meta?.statusCode === 404 || err?.statusCode === 404) {
      res.json([]);
      return;
    }
    console.error("[search] Search query error:", err);
    res.status(500).json({ error: "Failed to search emails" });
  }
}

