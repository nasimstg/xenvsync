"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Download,
  Terminal,
  Shield,
  Map,
  Menu,
  X,
  ChevronRight,
  ArrowRightLeft,
} from "lucide-react";

export const docPages = [
  { href: "/docs/getting-started", label: "Getting Started", icon: BookOpen, section: "Learn" },
  { href: "/docs/installation", label: "Installation", icon: Download, section: "Learn" },
  { href: "/docs/migration", label: "Migration Guides", icon: ArrowRightLeft, section: "Learn" },
  { href: "/docs/commands", label: "Commands", icon: Terminal, section: "Reference" },
  { href: "/docs/security", label: "Security Model", icon: Shield, section: "Reference" },
  { href: "/roadmap", label: "Roadmap", icon: Map, section: "Project" },
];

const sections = [...new Set(docPages.map((p) => p.section))];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav className="space-y-5">
      {sections.map((section) => (
        <div key={section}>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1.5 px-3">
            {section}
          </h4>
          <ul className="space-y-0.5">
            {docPages
              .filter((p) => p.section === section)
              .map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="relative">
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[var(--color-accent)]"
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      />
                    )}
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                        active
                          ? "bg-[var(--color-accent-glow-strong)] text-[var(--color-accent-bright)] font-medium"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]"
                      }`}
                    >
                      <item.icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[var(--color-accent)]" : ""}`} />
                      {item.label}
                      {active && <ChevronRight className="w-3 h-3 ml-auto text-[var(--color-accent)]" />}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-52 shrink-0 hidden lg:block">
        <div className="sticky top-20">{navContent}</div>
      </aside>

      {/* Mobile toggle — hidden when drawer is open */}
      {!mobileOpen && (
        <button
          className="lg:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20"
          onClick={() => setMobileOpen(true)}
          aria-label="Open docs menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-[var(--color-bg)] border-r border-[var(--color-border)] p-5 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold">Documentation</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-md hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {navContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
