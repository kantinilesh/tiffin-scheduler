/**
 * SentEmailsTable.tsx — Displays delivered and failed emails.
 *
 * Columns: Email, Subject, Sent time, Status.
 * Status badge: green for 'sent', red for 'failed'.
 * Shows Spinner during loading, EmptyState when empty, and error feedback.
 */

"use client";

import React, { useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { EmailItem } from "@/types/email";

export interface SentEmailsTableProps {
  emails: EmailItem[];
  isLoading: boolean;
  error: string | null;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
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

export function SentEmailsTable({
  emails,
  isLoading,
  error,
}: SentEmailsTableProps) {
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
        message="No sent emails yet"
        description="Emails processed and delivered by workers will appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Sent Time</TableHead>
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
              <div>
                <span>{email.subject}</span>
                {email.failReason && (
                  <span className="block text-xs text-red-600 truncate max-w-sm">
                    {email.failReason}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Sent Time */}
            <TableCell className="text-xs text-[#6b7280]">
              {formatDate(email.sentAt)}
            </TableCell>

            {/* Status Badge */}
            <TableCell>
              {email.status === "sent" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  sent
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  failed
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default SentEmailsTable;
