import { CodeBlock } from "@/components/CodeBlock";
import { Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Workflow Examples - xenvsync",
  description:
    "Team-ready xenvsync workflow examples for local development, CI/CD, promotion, rotation, and incident response.",
  openGraph: {
    title: "Workflow Examples - xenvsync",
    description: "Detailed xenvsync workflows for solo, startup, and enterprise delivery flows.",
    url: "https://xenvsync.softexforge.io/examples/workflows",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/examples/workflows" },
};

const workflows = [
  {
    title: "Solo: Local Development Loop",
    team: "Solo",
    summary: "Initialize once, encrypt local env, and run app with in-memory secret injection.",
    script: `$ xenvsync init
$ xenvsync push
$ git add .env.vault && git commit -m "vault update"
$ xenvsync run -- npm run dev
$ xenvsync diff`,
  },
  {
    title: "Startup: Team Onboarding + Staging",
    team: "Startup",
    summary: "Add team members, publish staging vault, and align local and CI workflows.",
    script: `$ xenvsync keygen
$ xenvsync whoami
$ xenvsync team add alice <alice-pubkey>
$ xenvsync team add bob <bob-pubkey>
$ xenvsync push --env staging
$ xenvsync pull --env staging
$ xenvsync run --env staging -- npm test`,
  },
  {
    title: "Enterprise: CI Gate + Promotion",
    team: "Enterprise",
    summary: "Enforce doctor/verify in pipeline, then promote vetted config from staging to production.",
    script: `$ xenvsync doctor --env staging
$ xenvsync verify --env staging
$ xenvsync pull --env staging
$ xenvsync push --env production
$ xenvsync verify --env production`,
  },
  {
    title: "Enterprise: Offboarding + Rotation",
    team: "Enterprise",
    summary: "Revoke member access and rotate production/staging material with an audit-friendly command chain.",
    script: `$ xenvsync team remove contractor-1
$ xenvsync rotate --revoke contractor-1 --env staging
$ xenvsync rotate --revoke contractor-1 --env production
$ xenvsync push --env staging
$ xenvsync push --env production
$ xenvsync log --env production -n 20`,
  },
  {
    title: "Incident Response: Suspected Key Leak",
    team: "All",
    summary: "Contain, rotate, and re-issue working vaults with minimal downtime.",
    script: `$ xenvsync doctor
$ xenvsync verify --env production
$ xenvsync rotate --env production
$ xenvsync push --env production
$ xenvsync pull --env production
$ xenvsync run --env production -- npm run smoke`,
  },
];

export default function WorkflowsExamplesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Workflow Examples"
        description="Expanded team workflows for solo, startup, and enterprise environments, including CI gates and recovery paths."
      />

      <Section title="Team Workflow Playbooks">
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.title} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{workflow.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {workflow.team}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{workflow.summary}</p>
              <CodeBlock title="Command flow" language="bash">
                {workflow.script}
              </CodeBlock>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Related Guides">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Use-Cases Narrative</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Strategic context for solo, startup, and enterprise adoption paths.
            </p>
            <Link href="/use-cases" className="text-sm text-[var(--color-accent)] hover:underline">
              Open use-cases
            </Link>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Usage Cookbook</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Task-driven recipes for migration, auditing, export, and operations.
            </p>
            <Link href="/examples/usages" className="text-sm text-[var(--color-accent)] hover:underline">
              Open usages
            </Link>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Troubleshooting</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Error signatures, warning classes, and targeted remediation patterns.
            </p>
            <Link href="/docs/troubleshooting" className="text-sm text-[var(--color-accent)] hover:underline">
              Open troubleshooting
            </Link>
          </Card>
        </div>
      </Section>
    </div>
  );
}
