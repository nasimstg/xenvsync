import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-[var(--color-accent)] mb-4">404</h1>
      <p className="text-lg text-[var(--color-text-muted)] mb-6">
        This page doesn&apos;t exist.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-medium text-sm hover:brightness-110 transition"
        >
          Home
        </Link>
        <Link
          href="/docs/getting-started"
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-sm hover:bg-[var(--color-bg-elevated)] transition"
        >
          Docs
        </Link>
      </div>
    </div>
  );
}
