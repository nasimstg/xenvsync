"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { docPages } from "./Sidebar";

export function Breadcrumbs() {
  const pathname = usePathname();
  const current = docPages.find((p) => p.href === pathname);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-6">
      <Link href="/" className="hover:text-[var(--color-text)] transition-colors">
        Home
      </Link>
      <ChevronRight className="w-3 h-3" />
      <Link href="/docs/getting-started" className="hover:text-[var(--color-text)] transition-colors">
        Docs
      </Link>
      {current && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text)]">{current.label}</span>
        </>
      )}
    </nav>
  );
}
