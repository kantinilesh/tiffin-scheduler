/**
 * ComposeModal.tsx — Modal dialog for scheduling an email campaign.
 *
 * Provides inputs for:
 *   - Subject (text input)
 *   - Body (textarea)
 *   - CSV/Text file upload with client-side parsing + manual paste fallback
 *   - Start time (datetime-local)
 *   - Delay between sends (seconds)
 *   - Hourly limit (emails/hour)
 *
 * Submits to POST /emails/schedule, handles loading state, toasts, and tab refresh.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import type { ScheduleCampaignResponse } from "@/types/email";

export interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function getDefaultStartTime(): string {
  const d = new Date(Date.now() + 60 * 1000); // 1 minute from now
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function ComposeModal({ isOpen, onClose, onSuccess }: ComposeModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [rawPastedRecipients, setRawPastedRecipients] = useState("");
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [delaySeconds, setDelaySeconds] = useState<number>(2);
  const [hourlyLimit, setHourlyLimit] = useState<number>(200);

  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset defaults when opening modal
  useEffect(() => {
    if (isOpen) {
      setStartTime(getDefaultStartTime());
    }
  }, [isOpen]);

  function resetForm() {
    setSubject("");
    setBody("");
    setRecipients([]);
    setRawPastedRecipients("");
    setStartTime(getDefaultStartTime());
    setDelaySeconds(2);
    setHourlyLimit(200);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function parseEmailsFromString(text: string): string[] {
    const rawItems = text.split(/[\r\n,;]+/);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const detected: string[] = [];

    for (const item of rawItems) {
      const clean = item.replace(/["']/g, "").trim();
      if (clean && emailRegex.test(clean)) {
        if (!detected.includes(clean)) {
          detected.push(clean);
        }
      }
    }
    return detected;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const detected = parseEmailsFromString(text);
      if (detected.length === 0) {
        showToast({
          type: "error",
          title: "No Emails Found",
          message: "Could not find any valid email addresses in the uploaded file.",
        });
      } else {
        setRecipients(detected);
        showToast({
          type: "info",
          message: `Parsed ${detected.length} email(s) from ${file.name}`,
        });
      }
    };

    reader.onerror = () => {
      showToast({
        type: "error",
        title: "File Read Error",
        message: "Failed to read the selected file.",
      });
    };

    reader.readAsText(file);
  }

  function handleManualRecipientsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setRawPastedRecipients(val);
    const detected = parseEmailsFromString(val);
    setRecipients(detected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject.trim()) {
      showToast({ type: "error", message: "Please provide a subject." });
      return;
    }

    if (!body.trim()) {
      showToast({ type: "error", message: "Please enter the email body." });
      return;
    }

    if (recipients.length === 0) {
      showToast({
        type: "error",
        message: "Please upload a CSV or paste at least one valid recipient.",
      });
      return;
    }

    if (!startTime) {
      showToast({ type: "error", message: "Please set a start time." });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        subject: subject.trim(),
        body: body.trim(),
        recipients,
        startTime: new Date(startTime).toISOString(),
        delaySeconds: Number(delaySeconds) || 0,
        hourlyLimit: Number(hourlyLimit) || 1,
      };

      const result = await apiFetch<ScheduleCampaignResponse>(
        "/emails/schedule",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      showToast({
        type: "success",
        title: "Campaign Scheduled",
        message: `Successfully scheduled ${result.emailCount} email(s).`,
      });

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to schedule emails";
      showToast({
        type: "error",
        title: "Scheduling Failed",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose New Campaign"
      description="Configure and schedule batch emails across your active senders."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-medium text-[#1a1a1a]">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Weekly Product Update"
            className="mt-1 block w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#1a1a1a] shadow-xs placeholder:text-gray-400 focus:border-[#d97706] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
          />
        </div>

        {/* Recipients (CSV Upload + paste) */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-[#1a1a1a]">
              Recipients <span className="text-red-500">*</span>
            </label>
            {recipients.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-[#d97706]">
                {recipients.length} email{recipients.length === 1 ? "" : "s"} detected
              </span>
            )}
          </div>

          <div className="mt-1 space-y-2">
            {/* File Upload Box */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-upload"
              />
              <label
                htmlFor="csv-file-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#e5e7eb] bg-gray-50 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="h-4 w-4 text-[#6b7280]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload CSV / Text File
              </label>
              {fileName && (
                <span className="text-xs text-[#6b7280] truncate max-w-xs">
                  {fileName}
                </span>
              )}
            </div>

            {/* Manual paste / fallback */}
            <textarea
              rows={2}
              value={rawPastedRecipients}
              onChange={handleManualRecipientsChange}
              placeholder="Or paste comma/newline-separated emails here..."
              className="block w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-xs text-[#1a1a1a] shadow-xs placeholder:text-gray-400 focus:border-[#d97706] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
            />
          </div>
        </div>

        {/* Email Body */}
        <div>
          <label className="block text-xs font-medium text-[#1a1a1a]">
            Email Body <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your email content here..."
            className="mt-1 block w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#1a1a1a] shadow-xs placeholder:text-gray-400 focus:border-[#d97706] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
          />
        </div>

        {/* Scheduling Options (Grid) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-1">
          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-[#1a1a1a]">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs text-[#1a1a1a] shadow-xs focus:border-[#d97706] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
            />
          </div>

          {/* Delay Between Sends */}
          <div>
            <label className="block text-xs font-medium text-[#1a1a1a]">
              Delay (seconds)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value, 10) || 0)}
              className="mt-1 block w-full rounded-md border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs text-[#1a1a1a] shadow-xs focus:border-[#d97706] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
            />
          </div>

          {/* Hourly Limit */}
          <div>
            <label className="block text-xs font-medium text-[#1a1a1a]">
              Hourly Limit
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(parseInt(e.target.value, 10) || 1)}
              className="mt-1 block w-full rounded-md border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs text-[#1a1a1a] shadow-xs focus:border-[#d97706] focus:outline-none focus:ring-1 focus:ring-[#d97706]"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Schedule Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ComposeModal;
