/**
 * useScheduledEmails.ts — Hook to fetch pending/processing emails.
 *
 * Calls GET /emails/scheduled and provides data, isLoading, error, and refetch.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { EmailItem } from "@/types/email";

export function useScheduledEmails() {
  const [data, setData] = useState<EmailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduled = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch<EmailItem[]>("/emails/scheduled");
      setData(result);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load scheduled emails";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchScheduled,
  };
}

export default useScheduledEmails;
