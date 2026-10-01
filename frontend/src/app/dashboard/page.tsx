/**
 * dashboard/page.tsx — Email campaigns dashboard shell.
 *
 * Features:
 *   - Tab switcher: "Scheduled Emails" | "Sent Emails" with amber active underline.
 *   - "Compose New Email" amber primary action button in the top right.
 *   - Render <EmptyState message="No scheduled emails yet" /> (or "No sent emails yet").
 *   - Includes demo modal for "Compose New Email" to test the UI Modal component.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("scheduled");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { showToast } = useToast();

  const tabs = [
    { id: "scheduled", label: "Scheduled Emails", count: 0 },
    { id: "sent", label: "Sent Emails", count: 0 },
  ];

  function handleComposeClick() {
    setIsComposeOpen(true);
  }

  function handleCloseCompose() {
    setIsComposeOpen(false);
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
            onClick={handleComposeClick}
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
          <EmptyState
            message="No scheduled emails yet"
            description="Campaign emails scheduled for future delivery will appear here."
            action={
              <Button variant="secondary" size="sm" onClick={handleComposeClick}>
                Schedule your first email
              </Button>
            }
          />
        ) : (
          <EmptyState
            message="No sent emails yet"
            description="Emails that have been successfully delivered by workers will be logged here."
          />
        )}
      </div>

      {/* Compose Email Modal Shell */}
      <Modal
        isOpen={isComposeOpen}
        onClose={handleCloseCompose}
        title="Compose New Email"
        description="Schedule a new email campaign across your configured senders."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={handleCloseCompose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                showToast({
                  type: "info",
                  message: "Campaign creation form will be wired in the next phase.",
                });
                handleCloseCompose();
              }}
            >
              Continue
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6b7280]">
            The full campaign compose form (subject, body, CSV recipient upload,
            start time, and delay interval) will be integrated in the next step.
          </p>
        </div>
      </Modal>
    </div>
  );
}
