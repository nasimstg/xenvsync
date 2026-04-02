import Link from "next/link";
import { Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "Blog - xenvsync",
  description:
    "The xenvsync blog — deep dives into .env secret management, AES-256-GCM cryptography, team key sharing, CI/CD injection patterns, tool comparisons, and migration guides for developers.",
  openGraph: {
    title: "xenvsync Blog",
    description: "Engineering content on secure .env workflows, cryptography, team secrets, and developer tooling.",
    url: "https://xenvsync.softexforge.io/blog",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/blog" },
};

const posts = [
  {
    href: "/blog/tool-comparison",
    title: "xenvsync vs dotenv-vault vs sops — A Practical Comparison",
    category: "Tool Comparison",
    date: "2026-04-01",
    readTime: "8 min read",
    excerpt: "A detailed comparison across security model, team key sharing, CI ergonomics, and operational overhead. When each tool wins and when it doesn't.",
    tags: ["security", "dotenv-vault", "sops", "comparison"],
  },
  {
    href: "/blog/tool-ranking",
    title: "Best .env Secret Management Tools for 2026",
    category: "Tool Ranking",
    date: "2026-04-01",
    readTime: "6 min read",
    excerpt: "Ranking xenvsync, sops, dotenv-vault, and git-crypt across local-first security, developer experience, team access control, and 12-month operational cost.",
    tags: ["ranking", "security", "developer experience"],
  },
  {
    href: "/blog/use-case-story",
    title: "How a 7-Person Startup Encrypted Their Secrets in One Sprint",
    category: "Case Study",
    date: "2026-03-30",
    readTime: "7 min read",
    excerpt: "From scattered Slack-shared .env files to encrypted vaults with per-member keys in a single week. A real migration story with the commands that made it happen.",
    tags: ["startup", "team", "migration", "case study"],
  },
  {
    href: "/blog/developer-workflow",
    title: "The Secret-Safe Developer Workflow: Local to CI Without Leaks",
    category: "Developer Workflow",
    date: "2026-03-29",
    readTime: "9 min read",
    excerpt: "A repeatable four-step pattern for keeping plaintext secrets out of repos, build logs, and container images — from laptop setup through production deployment.",
    tags: ["workflow", "CI/CD", "docker", "best practices"],
  },
  {
    href: "/blog/technical-deep-dive",
    title: "Inside xenvsync: AES-256-GCM Encryption and X25519 Team Sharing",
    category: "Technical Deep Dive",
    date: "2026-03-28",
    readTime: "12 min read",
    excerpt: "A detailed look at the vault format, nonce generation, GCM authentication, and the X25519 ECDH key exchange that enables per-member team vaults with no shared secrets.",
    tags: ["cryptography", "AES-256-GCM", "X25519", "security"],
  },
  {
    href: "/blog/migration-playbook",
    title: "Migration Playbook: From dotenv / git-crypt to xenvsync",
    category: "Migration Guide",
    date: "2026-03-27",
    readTime: "10 min read",
    excerpt: "A phased, low-risk migration plan for teams moving off plaintext .env files, dotenv-vault, sops, or git-crypt. Includes rollback strategy and CI transition steps.",
    tags: ["migration", "dotenv-vault", "git-crypt", "sops"],
  },
];

const categoryColors: Record<string, string> = {
  "Tool Comparison": "text-blue-400 border-blue-400/30 bg-blue-400/5",
  "Tool Ranking": "text-purple-400 border-purple-400/30 bg-purple-400/5",
  "Case Study": "text-amber-400 border-amber-400/30 bg-amber-400/5",
  "Developer Workflow": "text-green-400 border-green-400/30 bg-green-400/5",
  "Technical Deep Dive": "text-rose-400 border-rose-400/30 bg-rose-400/5",
  "Migration Guide": "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
};

export default function BlogIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <PageHeader
        title="xenvsync Blog"
        description="Engineering writing on secure .env workflows, cryptography decisions, team secret management, CI/CD patterns, and migration strategies for developers who care about security without complexity."
      />

      <Section title="Articles">
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.href} className="group space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[post.category] ?? "text-[var(--color-text-muted)]"}`}>
                  {post.category}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.date}</span>
                <span className="text-xs text-[var(--color-text-muted)]">·</span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                <Link href={post.href}>{post.title}</Link>
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{post.excerpt}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link href={post.href} className="text-sm text-[var(--color-accent)] hover:underline shrink-0">
                  Read article →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Topics Covered">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Cryptography", detail: "AES-256-GCM, X25519, nonce safety" },
            { label: "Team Secrets", detail: "Per-member keys, rotation, revocation" },
            { label: "CI/CD", detail: "GitHub Actions, GitLab, Docker, runtime injection" },
            { label: "Tool Comparisons", detail: "xenvsync vs dotenv-vault vs sops vs git-crypt" },
            { label: "Migration Guides", detail: "Step-by-step transitions with rollback plans" },
            { label: "Developer Workflow", detail: "Local dev to production, secret-safe patterns" },
          ].map((topic) => (
            <Card key={topic.label} className="space-y-1">
              <p className="text-sm font-semibold">{topic.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{topic.detail}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
