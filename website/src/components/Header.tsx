"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Github, Terminal, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

const Search = dynamic(() => import("@/components/Search").then((m) => m.Search), {
  ssr: false,
  loading: () => (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)]/90 border border-[var(--color-border-bright)]">
      Search
    </button>
  ),
});

const navLinks = [
  { href: "/docs/getting-started", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/blog", label: "Blog" },
  { href: "/donate", label: "Donate" },
  { href: "/roadmap", label: "Roadmap" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-bright)] bg-[color:rgba(8,8,14,0.9)] backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.38)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-purple)] flex items-center justify-center group-hover:shadow-[0_0_12px_var(--color-accent-glow-strong)] transition-shadow">
            <Terminal className="w-3.5 h-3.5 text-white" />
          </div>
          <span>xenvsync</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          <Search />
          <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
          <a
            href="https://github.com/nasimstg/xenvsync"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] hover:text-[var(--color-accent-bright)] transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            Star on GitHub
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[var(--color-border)] bg-[color:rgba(8,8,14,0.96)] backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://github.com/nasimstg/xenvsync"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
