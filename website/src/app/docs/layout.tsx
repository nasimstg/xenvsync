import { Sidebar } from "@/components/Sidebar";
import { DocsNavigation } from "@/components/DocsNavigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Subtle accent glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex gap-10 relative">
        <Sidebar />
        <article className="flex-1 min-w-0 max-w-3xl">
          <Breadcrumbs />
          {children}
          <DocsNavigation />
        </article>
      </div>
    </div>
  );
}
