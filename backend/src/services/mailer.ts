/**
 * mailer.ts — Sends emails via Nodemailer using per-sender Ethereal credentials.
 *
 * Each Sender row in the database has its own Ethereal SMTP account.
 * We create a Nodemailer transporter on-the-fly for each sender (these
 * are lightweight — just config objects, no persistent connections).
 *
 * After sending, we log the Ethereal preview URL so you can view the
 * email in a browser without a real mailbox.
 */

import nodemailer from "nodemailer";
import type { Sender } from "@prisma/client";

/**
 * Sends a single email through the given sender's Ethereal SMTP account.
 * Returns the Ethereal preview URL for debugging.
 */
export async function sendMail(
  sender: Sender,
  to: string,
  subject: string,
  body: string
): Promise<string | false> {
  const transporter = nodemailer.createTransport({
    host: sender.smtpHost,
    port: sender.smtpPort,
    secure: false, // Ethereal uses STARTTLS on port 587
    auth: {
      user: sender.etherealUser,
      pass: sender.etherealPass,
    },
  });

  const info = await transporter.sendMail({
    from: sender.etherealUser,
    to,
    subject,
    text: body,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[mailer] Preview: ${previewUrl}`);
  }

  return previewUrl;
}
