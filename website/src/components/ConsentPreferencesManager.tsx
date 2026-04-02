"use client";

import { useState } from "react";

type ConsentChoice = "essential" | "all";

type ConsentRecord = {
  choice: ConsentChoice;
  updatedAt: string;
};

const CONSENT_STORAGE_KEY = "xenvsync-consent-v1";

function parseConsent(raw: string | null): ConsentRecord | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (!parsed || (parsed.choice !== "essential" && parsed.choice !== "all") || typeof parsed.updatedAt !== "string") {
      return null;
    }
    return { choice: parsed.choice, updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
}

function persistConsent(choice: ConsentChoice) {
  const payload: ConsentRecord = { choice, updatedAt: new Date().toISOString() };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function ConsentPreferencesManager() {
  const [record, setRecord] = useState<ConsentRecord | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
  });
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Current Preference</h3>
        {record ? (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            You selected <strong className="text-[var(--color-text)]">{record.choice === "all" ? "Accept all" : "Essential only"}</strong> on {new Date(record.updatedAt).toLocaleString()}.
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            No saved preference found in this browser yet.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setRecord(persistConsent("essential"));
            setStatusMessage("Saved: essential-only preference.");
          }}
          className="px-3 py-2 rounded-md text-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          Set Essential only
        </button>
        <button
          onClick={() => {
            setRecord(persistConsent("all"));
            setStatusMessage("Saved: accept-all preference.");
          }}
          className="px-3 py-2 rounded-md text-sm bg-[var(--color-accent)] text-[var(--color-bg)] font-medium"
        >
          Set Accept all
        </button>
        <button
          onClick={() => {
            localStorage.removeItem(CONSENT_STORAGE_KEY);
            setRecord(null);
            setStatusMessage("Saved preference cleared.");
          }}
          className="px-3 py-2 rounded-md text-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          Clear preference
        </button>
      </div>

      {statusMessage && (
        <p className="text-xs text-[var(--color-text-muted)]">{statusMessage}</p>
      )}
    </div>
  );
}
