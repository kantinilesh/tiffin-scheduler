/**
 * types/email.ts — TypeScript types for email campaigns and items.
 * Matches the Prisma model and response shapes from the backend API.
 */

export type EmailStatus = "scheduled" | "processing" | "sent" | "failed";

export interface EmailItem {
  id: string;
  campaignId: string;
  senderId: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailStatus;
  attempts: number;
  failReason?: string | null;
  sender?: {
    label: string;
  };
  campaign?: {
    subject: string;
  };
}

export interface ScheduleCampaignInput {
  subject: string;
  body: string;
  recipients: string[];
  startTime: string;
  delaySeconds: number;
  hourlyLimit: number;
}

export interface ScheduleCampaignResponse {
  campaignId: string;
  emailCount: number;
}
