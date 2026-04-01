"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { docPages } from "./Sidebar";

export function DocsNavigation() {
  const pathname = usePathname();
  const currentIdx = docPages.findIndex((p) => p.href === pathname);
  const prev = currentIdx > 0 ? docPages[currentIdx - 1] : null;
  const next = currentIdx < docPages.length - 1 ? docPages[currentIdx + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-16 pt-8 border-t border-[var(--color-border)]">
      {prev ? (
        <Link
          href={prev.href}
          className="flex-1 group p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent-dim)] transition-colors"
        >
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-1">
            <ChevronLeft className="w-3 h-3" /> Previous
          </span>
          <span className="text-sm font-medium group-hover:text-[var(--color-accent-bright)] transition-colors">
            {prev.label}
          </span>
        </Link>
      ) : <div className="flex-1" />}

      {next ? (
        <Link
          href={next.href}
          className="flex-1 group p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent-dim)] transition-colors text-right"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-[var(--color-text-muted)] mb-1">
            Next <ChevronRight className="w-3 h-3" />
          </span>
          <span className="text-sm font-medium group-hover:text-[var(--color-accent-bright)] transition-colors">
            {next.label}
          </span>
        </Link>
      ) : <div className="flex-1" />}
    </div>
  );
}
