"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ConsentChoice = "essential" | "all";

const CONSENT_STORAGE_KEY = "xenvsync-consent-v1";

function saveConsent(choice: ConsentChoice) {
  const payload = { choice, updatedAt: new Date().toISOString() };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (existing) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[120]">
      <div className="max-w-4xl mx-auto rounded-xl border border-[var(--color-border-bright)] bg-[color:rgba(10,10,18,0.96)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
            We use minimal local storage to remember consent preferences and improve core site usability.
            See our <Link href="/consent" className="text-[var(--color-accent)] hover:underline"> consent page</Link> for details.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                saveConsent("essential");
                setVisible(false);
              }}
              className="px-3 py-2 rounded-md text-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              Essential only
            </button>
            <button
              onClick={() => {
                saveConsent("all");
                setVisible(false);
              }}
              className="px-3 py-2 rounded-md text-sm bg-[var(--color-accent)] text-[var(--color-bg)] font-medium"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
