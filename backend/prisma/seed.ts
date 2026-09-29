/**
 * seed.ts — Seeds the database with one fake User and two Senders.
 *
 * Each Sender gets real Ethereal test credentials generated via
 * nodemailer.createTestAccount(). The credentials are printed to
 * the console so you can copy them into .env or use them to log
 * into https://ethereal.email to view sent mail.
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Generate two Ethereal test accounts ────────────────
  const [accountA, accountB] = await Promise.all([
    nodemailer.createTestAccount(),
    nodemailer.createTestAccount(),
  ]);

  console.log("═══════════════════════════════════════════════");
  console.log("  Ethereal credentials (copy these!)");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Sender A:`);
  console.log(`    SMTP Host : ${accountA.smtp.host}`);
  console.log(`    SMTP Port : ${accountA.smtp.port}`);
  console.log(`    User      : ${accountA.user}`);
  console.log(`    Pass      : ${accountA.pass}`);
  console.log(`    Web URL   : https://ethereal.email/login`);
  console.log("───────────────────────────────────────────────");
  console.log(`  Sender B:`);
  console.log(`    SMTP Host : ${accountB.smtp.host}`);
  console.log(`    SMTP Port : ${accountB.smtp.port}`);
  console.log(`    User      : ${accountB.user}`);
  console.log(`    Pass      : ${accountB.pass}`);
  console.log(`    Web URL   : https://ethereal.email/login`);
  console.log("═══════════════════════════════════════════════\n");

  // ── Create the fake user ───────────────────────────────
  const user = await prisma.user.upsert({
    where: { googleId: "google-fake-id-001" },
    update: {},
    create: {
      googleId: "google-fake-id-001",
      name: "Tiffin Dev",
      email: "dev@tiffin.test",
      avatarUrl: null,
    },
  });

  console.log(`✅ User created: ${user.name} (${user.id})`);

  // ── Create two Senders with real Ethereal credentials ──
  const senderA = await prisma.sender.upsert({
    where: { id: "seed-sender-a" },
    update: {
      etherealUser: accountA.user,
      etherealPass: accountA.pass,
      smtpHost: accountA.smtp.host,
      smtpPort: accountA.smtp.port,
    },
    create: {
      id: "seed-sender-a",
      userId: user.id,
      label: "Sender A",
      etherealUser: accountA.user,
      etherealPass: accountA.pass,
      smtpHost: accountA.smtp.host,
      smtpPort: accountA.smtp.port,
    },
  });

  const senderB = await prisma.sender.upsert({
    where: { id: "seed-sender-b" },
    update: {
      etherealUser: accountB.user,
      etherealPass: accountB.pass,
      smtpHost: accountB.smtp.host,
      smtpPort: accountB.smtp.port,
    },
    create: {
      id: "seed-sender-b",
      userId: user.id,
      label: "Sender B",
      etherealUser: accountB.user,
      etherealPass: accountB.pass,
      smtpHost: accountB.smtp.host,
      smtpPort: accountB.smtp.port,
    },
  });

  console.log(`✅ Sender created: ${senderA.label} (${senderA.id})`);
  console.log(`✅ Sender created: ${senderB.label} (${senderB.id})`);
  console.log("\n🎉 Seed complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
