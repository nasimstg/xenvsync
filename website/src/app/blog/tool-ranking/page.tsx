import { Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Best .env Secret Management Tools for 2026",
  description:
    "An honest ranking of xenvsync, sops, dotenv-vault, and git-crypt for .env secret management in 2026. Evaluated on local-first security, developer experience, team access control, CI/CD ergonomics, and operational cost.",
  openGraph: {
    title: "Best .env Secret Management Tools for 2026",
    description: "Ranking secret management tools by security posture, DX, and operational overhead for modern teams.",
    url: "https://xenvsync.softexforge.io/blog/tool-ranking",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/blog/tool-ranking" },
};

const criteria = [
  {
    name: "Local-first security",
    weight: "25%",
    detail: "Does the tool work without a cloud service? Are keys stored and controlled locally? Can you encrypt and decrypt with zero network calls?",
  },
  {
    name: "Developer experience",
    weight: "25%",
    detail: "Time from zero to encrypted. Command memorability. How painful is onboarding a new developer? How smooth is the daily push/pull/run loop?",
  },
  {
    name: "Team access control",
    weight: "25%",
    detail: "Can members use individual keys instead of a shared secret? How easy is access revocation? Is offboarding a single command or a multi-step process?",
  },
  {
    name: "Operational overhead",
    weight: "25%",
    detail: "Infrastructure required to operate. Ongoing maintenance of keys, dependencies, and service accounts. What breaks when a team member leaves?",
  },
];

const rankings = [
  {
    rank: 1,
    tool: "xenvsync",
    version: "v1.12.0",
    tagline: "Best overall for developer teams that want local-first security with minimal overhead.",
    scores: {
      "Local-first security": { score: 10, note: "Entirely local — no external calls. AES-256-GCM + X25519. Key stays on your machine." },
      "Developer experience": { score: 9, note: "< 2 min setup. Commands like push/pull/run are intuitive. doctor and verify catch mistakes early." },
      "Team access control": { score: 9, note: "Per-member X25519 keys. Single-command revocation with rotate --revoke. No shared secrets." },
      "Operational overhead": { score: 9, note: "Single binary, no runtime deps. Vault in Git. Only the key needs protecting." },
    },
    highlights: [
      "Zero cloud dependency — works offline, works in air-gapped environments",
      "xenvsync run injects secrets in-memory, plaintext never hits disk",
      "V2 team vaults with per-member X25519 key slots",
      "Git-native audit log via xenvsync log",
      "doctor + verify make security posture visible and actionable",
      "MIT license, single static binary, 8 install methods",
    ],
    limitations: [
      "Younger ecosystem than sops (first release March 2026)",
      "No web dashboard or service-level secret sharing",
    ],
  },
  {
    rank: 2,
    tool: "sops",
    version: "v3.x",
    tagline: "Most powerful and flexible, best for teams with existing KMS infrastructure.",
    scores: {
      "Local-first security": { score: 8, note: "Local with age/PGP; cloud-dependent with KMS. Full control when configured correctly." },
      "Developer experience": { score: 6, note: "Powerful but steep setup curve. Requires PGP/age key infra or KMS role setup before first use." },
      "Team access control": { score: 8, note: "Flexible recipient model (PGP, age, KMS). Re-encryption required when roster changes." },
      "Operational overhead": { score: 6, note: "Needs key infra. Re-encrypting after roster changes is manual. KMS costs money." },
    },
    highlights: [
      "Supports PGP, age, AWS KMS, GCP KMS, Azure Key Vault, HashiCorp Vault",
      "Inline encrypted values in YAML/JSON — partial diffs without decryption",
      "Strong enterprise adoption and audit tooling",
      "Mature project with large community",
    ],
    limitations: [
      "Significant setup time for teams without existing key infrastructure",
      "No built-in run command for in-memory injection",
      "Re-encryption after team changes is not atomic",
    ],
  },
  {
    rank: 3,
    tool: "dotenv-vault",
    version: "latest",
    tagline: "Easiest onboarding for dotenv users who accept cloud dependency.",
    scores: {
      "Local-first security": { score: 5, note: "Decryption requires service call. Outage or account issue can block your workflow." },
      "Developer experience": { score: 8, note: "Very smooth for existing dotenv users. Web dashboard is a plus for non-CLI teams." },
      "Team access control": { score: 6, note: "Managed at service level. No per-member keys — team shares a service-bound DOTENV_KEY." },
      "Operational overhead": { score: 7, note: "Service manages keys. Low local overhead, but you're dependent on their SLA." },
    },
    highlights: [
      "Zero setup friction for dotenv users",
      "Web dashboard for visual secret management",
      "Handles key rotation via service",
    ],
    limitations: [
      "Cloud dependency — build breaks if service is unavailable",
      "Shared team key model — not per-member",
      "Free tier limits may affect larger teams",
      "Less suitable for air-gapped or strict compliance environments",
    ],
  },
  {
    rank: 4,
    tool: "git-crypt",
    version: "0.7.x",
    tagline: "Simple symmetric encryption for small repos, but limited for modern secret operations.",
    scores: {
      "Local-first security": { score: 7, note: "Local GnuPG-based symmetric encryption. No cloud dependency." },
      "Developer experience": { score: 5, note: "Transparent encryption via Git filters, but GPG setup is friction-heavy." },
      "Team access control": { score: 5, note: "GPG-based recipients. Re-encrypting the repository key for new members requires re-cloning." },
      "Operational overhead": { score: 5, note: "GPG ecosystem maintenance. No built-in rotation or audit tooling." },
    },
    highlights: [
      "Transparent — files look normal after checkout",
      "No external services",
      "Works with existing GPG key infrastructure",
    ],
    limitations: [
      "No per-file key rotation",
      "Revoking access is not straightforward — requires re-keying the repo",
      "GPG UX is notoriously painful",
      "No built-in audit log, diff, or verify commands",
    ],
  },
];

const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-sm ${i < score ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
        />
      ))}
    </div>
    <span className="text-xs text-[var(--color-text-muted)] font-mono">{score}/10</span>
  </div>
);

export default function ToolRankingPost() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Best .env Secret Management Tools for 2026"
        description="Published April 1, 2026 · 6 min read · Tool Ranking"
      />

      <Section title="Ranking Methodology">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            This ranking evaluates four tools across four equally weighted criteria. Scores reflect practical use — not theoretical capability. A tool with powerful features that require two days of infrastructure setup scores lower on developer experience than a tool that works in two minutes.
          </p>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {criteria.map((c) => (
            <Card key={c.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{c.name}</p>
                <span className="text-xs text-[var(--color-text-muted)]">{c.weight}</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{c.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="2026 Rankings">
        <div className="space-y-6">
          {rankings.map((r) => (
            <Card key={r.tool} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] pb-3">
                <span className="text-2xl font-black text-[var(--color-text-muted)]">#{r.rank}</span>
                <h2 className="text-xl font-bold">{r.tool}</h2>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">{r.version}</span>
                {r.rank === 1 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)]">
                    Editor&apos;s Pick
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">{r.tagline}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(r.scores).map(([criterion, { score, note }]) => (
                  <div key={criterion} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{criterion}</p>
                    </div>
                    <ScoreBar score={score} />
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">Highlights</p>
                  <ul className="space-y-1">
                    {r.highlights.map((h, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        <span className="text-green-400 shrink-0">+</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-1">Limitations</p>
                  <ul className="space-y-1">
                    {r.limitations.map((l, i) => (
                      <li key={i} className="flex gap-1.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        <span className="text-yellow-400 shrink-0">–</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Summary">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            If you are starting a new project or team in 2026 and want the best combination of security, simplicity, and zero operational overhead — <strong className="text-[var(--color-text)]">xenvsync is the clear first choice</strong>. It handles solo workflows, team sharing, multi-environment, CI/CD, Docker, and audit trails from a single binary.
          </p>
          <p>
            sops remains the strongest option for teams with existing KMS infrastructure who need enterprise-grade recipient management. dotenv-vault wins on managed UX at the cost of cloud dependency. git-crypt has limited utility for modern workflows.
          </p>
        </Card>
        <div className="flex flex-wrap gap-2 mt-2">
          <Link href="/blog/tool-comparison" className="text-sm text-[var(--color-accent)] hover:underline">
            → Full tool comparison
          </Link>
          <Link href="/blog/migration-playbook" className="text-sm text-[var(--color-accent)] hover:underline ml-4">
            → Migration playbook
          </Link>
        </div>
      </Section>
    </article>
  );
}
