/**
 * ScheduledEmailsTable.tsx — Displays pending/processing emails.
 *
 * Columns: Email, Subject, Scheduled time, Status.
 * Status badge: gray for 'scheduled', blue for 'processing'.
 * Shows Spinner during loading, EmptyState when empty, and error feedback.
 */

"use client";

import React, { useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { EmailItem } from "@/types/email";

export interface ScheduledEmailsTableProps {
  emails: EmailItem[];
  isLoading: boolean;
  error: string | null;
  onComposeClick?: () => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ScheduledEmailsTable({
  emails,
  isLoading,
  error,
  onComposeClick,
}: ScheduledEmailsTableProps) {
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Load Error",
        message: error,
      });
    }
  }, [error, showToast]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        message="No scheduled emails yet"
        description="Campaign emails queued for future delivery will appear here."
        action={
          onComposeClick ? (
            <button
              onClick={onComposeClick}
              className="text-xs font-medium text-[#d97706] hover:underline"
            >
              Compose and schedule a campaign
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Scheduled Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id}>
            {/* Email / Recipient */}
            <TableCell className="font-medium text-[#1a1a1a]">
              <div>
                <span>{email.recipient}</span>
                {email.sender && (
                  <span className="block text-xs text-[#6b7280]">
                    via {email.sender.label}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Subject */}
            <TableCell className="max-w-xs truncate text-[#1a1a1a]">
              {email.subject}
            </TableCell>

            {/* Scheduled Time */}
            <TableCell className="text-xs text-[#6b7280]">
              {formatDate(email.scheduledAt)}
            </TableCell>

            {/* Status Badge */}
            <TableCell>
              {email.status === "processing" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                  processing
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 border border-gray-200">
                  scheduled
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ScheduledEmailsTable;
