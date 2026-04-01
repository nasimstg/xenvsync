import { Github, Terminal } from "lucide-react";
import Link from "next/link";

const footerSections = [
  {
    title: "Documentation",
    links: [
      { href: "/docs/getting-started", label: "Getting Started" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/commands", label: "Commands" },
      { href: "/docs/security", label: "Security Model" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/roadmap", label: "Roadmap" },
      { href: "https://github.com/nasimstg/xenvsync/blob/main/CONTRIBUTING.md", label: "Contributing", external: true },
      { href: "https://github.com/nasimstg/xenvsync/blob/main/LICENSE", label: "License (MIT)", external: true },
      { href: "https://github.com/nasimstg/xenvsync/releases", label: "Changelog", external: true },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "https://github.com/nasimstg/xenvsync", label: "GitHub", external: true, icon: true },
      { href: "https://github.com/nasimstg/xenvsync/issues", label: "Issues", external: true },
      { href: "https://github.com/nasimstg/xenvsync/discussions", label: "Discussions", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24 bg-[var(--color-bg-card)]/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-purple)] flex items-center justify-center">
                <Terminal className="w-3 h-3 text-white" />
              </div>
              xenvsync
            </Link>
            <p className="mt-3 text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[200px]">
              Encrypt, commit, and inject .env secrets. No cloud required.
            </p>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => {
                  const cls = "text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors inline-flex items-center gap-1.5";
                  const content = (
                    <>
                      {"icon" in link && link.icon && <Github className="w-3.5 h-3.5" />}
                      {link.label}
                    </>
                  );
                  return (
                    <li key={link.href}>
                      {"external" in link ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
                          {content}
                        </a>
                      ) : (
                        <Link href={link.href} className={cls}>
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span>
            Built by{" "}
            <a href="https://www.nasimstg.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
              Md Nasim Sheikh
            </a>
            {" "}&middot;{" "}
            <a href="https://softexforge.io" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              SoftexForge
            </a>
          </span>
          <span>Open source under MIT License</span>
        </div>
      </div>
    </footer>
  );
}
