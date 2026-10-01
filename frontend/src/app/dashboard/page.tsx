/**
 * dashboard/page.tsx — Email campaigns dashboard.
 *
 * Integrates:
 *   - Tabs for switching between "Scheduled Emails" and "Sent Emails".
 *   - "Compose New Email" amber action button opening ComposeModal.
 *   - ScheduledEmailsTable and SentEmailsTable with live data hooks.
 *   - Automatic refresh of scheduled emails upon new campaign creation.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ComposeModal } from "@/features/compose/ComposeModal";
import { ScheduledEmailsTable } from "@/features/emails/ScheduledEmailsTable";
import { SentEmailsTable } from "@/features/emails/SentEmailsTable";
import { useScheduledEmails } from "@/features/emails/useScheduledEmails";
import { useSentEmails } from "@/features/emails/useSentEmails";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("scheduled");
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const {
    data: scheduledEmails,
    isLoading: isScheduledLoading,
    error: scheduledError,
    refetch: refetchScheduled,
  } = useScheduledEmails();

  const {
    data: sentEmails,
    isLoading: isSentLoading,
    error: sentError,
    refetch: refetchSent,
  } = useSentEmails();

  const tabs = [
    {
      id: "scheduled",
      label: "Scheduled Emails",
      count: scheduledEmails.length,
    },
    {
      id: "sent",
      label: "Sent Emails",
      count: sentEmails.length,
    },
  ];

  function handleComposeSuccess() {
    setActiveTab("scheduled");
    refetchScheduled();
    refetchSent();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Content header: Tabs on left, Compose button on right */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="flex-1"
        />

        <div className="shrink-0 pb-1">
          <Button
            variant="primary"
            onClick={() => setIsComposeOpen(true)}
            leftIcon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Compose New Email
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {activeTab === "scheduled" ? (
          <ScheduledEmailsTable
            emails={scheduledEmails}
            isLoading={isScheduledLoading}
            error={scheduledError}
            onComposeClick={() => setIsComposeOpen(true)}
          />
        ) : (
          <SentEmailsTable
            emails={sentEmails}
            isLoading={isSentLoading}
            error={sentError}
          />
        )}
      </div>

      {/* Compose Campaign Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={handleComposeSuccess}
      />
    </div>
  );
}
