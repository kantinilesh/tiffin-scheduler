/**
 * useSentEmails.ts — Hook to fetch delivered/terminal emails.
 *
 * Calls GET /emails/sent and provides data, isLoading, error, and refetch.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { EmailItem } from "@/types/email";

export function useSentEmails() {
  const [data, setData] = useState<EmailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch<EmailItem[]>("/emails/sent");
      setData(result);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load sent emails";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSent();
  }, [fetchSent]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSent,
  };
}

export default useSentEmails;
