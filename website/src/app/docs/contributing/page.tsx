import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section, StaggerItem, StaggerList } from "@/components/DocsComponents";

export const metadata = {
  title: "Contributing - xenvsync",
  description:
    "How to contribute to xenvsync: development setup with Go 1.25+, branch workflow, quality checks, commit conventions, issue reporting, and security disclosure guidelines.",
  openGraph: {
    title: "Contributing - xenvsync",
    description: "Contribute code, docs, and feedback to xenvsync.",
    url: "https://xenvsync.softexforge.io/docs/contributing",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/contributing" },
};

const prChecklist = [
  "Add or update tests for any new or changed behavior.",
  "Ensure all tests pass with race detection enabled.",
  "Run the local CI-equivalent checks script before pushing.",
  "Keep docs aligned with user-visible changes (README, INSTALL, ARCHITECTURE).",
  "Include migration notes for breaking changes.",
  "Use focused, atomic commits with imperative mood messages.",
  "Reference the relevant issue in your PR description.",
];

const codeStyleRules = [
  { rule: "gofmt", detail: "All code must be formatted with gofmt. CI enforces this." },
  { rule: "go vet", detail: "No vet warnings allowed. Run go vet ./... before pushing." },
  { rule: "golangci-lint", detail: "Optionally install golangci-lint for broader static analysis." },
  { rule: "govulncheck", detail: "Scan for known vulnerabilities with govulncheck ./..." },
  { rule: "Small functions", detail: "Keep functions focused and well-named. Avoid long multi-purpose functions." },
  { rule: "Comments", detail: "Only add comments where the logic is not self-evident. Avoid redundant comments." },
];

const highRiskAreas = [
  { area: "run command", note: "Child process exit code propagation and signal forwarding (SIGINT/SIGTERM) must work correctly on Linux, macOS, and Windows." },
  { area: "rotate command", note: "Vault is written before key to ensure rollback safety. Do not change this ordering." },
  { area: "Fallback merge precedence", note: ".env.shared < .env.<name> < .env.local. Ensure layer order is preserved." },
  { area: "V1/V2 vault detection", note: "decryptVault() auto-detects format. Changes must not break backward compatibility with V1 vaults." },
  { area: "Key permissions", note: "Key files must be written with mode 0600. Identity files must also be 0600." },
  { area: "Memory zeroing", note: "Key material must be zeroed after use via crypto.ZeroBytes." },
];

export default function ContributingPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Contributing to xenvsync"
        description="Thank you for considering a contribution. This guide covers everything from local setup to PR expectations, code style, commit conventions, and security disclosure."
      />

      <Callout type="info">
        Before writing code, review the{" "}
        <a href="https://github.com/nasimstg/xenvsync/blob/main/docs/DEVELOPMENT.md" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Development Guide</a>
        {" "}and{" "}
        <a href="https://github.com/nasimstg/xenvsync/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Architecture docs</a>
        {" "}to understand the codebase structure and design decisions.
      </Callout>

      <Section title="Development Setup">
        <Card className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            <strong>Prerequisites:</strong> Go 1.25+, Git. Optionally install golangci-lint and govulncheck for richer local checks.
          </p>
        </Card>
        <CodeBlock language="bash" title="Initial setup">
{`# 1. Fork and clone
$ git clone https://github.com/nasimstg/xenvsync.git
$ cd xenvsync

# 2. Download dependencies
$ go mod download

# 3. Run tests with race detection
$ go test -race ./...

# 4. (Recommended) Install quality tools
$ go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
$ go install golang.org/x/vuln/cmd/govulncheck@latest`}
        </CodeBlock>
      </Section>

      <Section title="Making Changes">
        <CodeBlock language="bash" title="Feature branch workflow">
{`# Create a feature branch from main
$ git checkout -b feature/my-change

# Make changes, then run checks
$ go test -race ./...
$ go vet ./...

# Run local CI-equivalent before pushing
$ ./scripts/ci-check.sh

# Open a pull request against main`}
        </CodeBlock>
        <Callout type="important">
          All changes must be against the <code>main</code> branch. Keep commits focused and atomic — one logical change per commit.
        </Callout>
      </Section>

      <Section title="Pull Request Checklist">
        <Card className="space-y-2">
          {prChecklist.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <span className="text-[var(--color-accent)] shrink-0 font-bold">{i + 1}.</span>
              <span>{item}</span>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Code Style">
        <StaggerList>
          <div className="space-y-2">
            {codeStyleRules.map((r) => (
              <StaggerItem key={r.rule}>
                <Card className="flex gap-3 items-start">
                  <code className="text-xs font-mono text-[var(--color-accent)] shrink-0 mt-0.5 bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded">
                    {r.rule}
                  </code>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{r.detail}</p>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
      </Section>

      <Section title="Commit Message Conventions">
        <Card className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Use the <strong>imperative mood</strong> in the first line. Keep it under 72 characters. Reference issues when applicable.
          </p>
        </Card>
        <CodeBlock language="bash" title="Examples">
{`# Good — imperative mood, concise, references issue
Add --revoke flag to rotate command (#11)
Fix path traversal via --env flag
Update YAML export to quote YAML 1.1 booleans

# Bad — past tense or vague
Added rotation support
Fixed stuff
Update`}
        </CodeBlock>
      </Section>

      <Section title="Testing Requirements">
        <Card className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            xenvsync uses table-driven tests. New functionality must include tests covering normal paths, malformed input, and negative/error paths.
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Command tests in <code>cmd/*_test.go</code> use temporary directories and invoke Cobra directly. Do not depend on global state.
          </p>
        </Card>
        <CodeBlock language="bash" title="Running the test suite">
{`# Full suite with race detection (required before PR)
$ go test -race ./...

# With coverage report
$ go test -race -coverprofile=coverage.out ./...
$ go tool cover -html=coverage.out

# Run a specific package
$ go test -race ./internal/crypto/...
$ go test -race ./cmd/...`}
        </CodeBlock>
      </Section>

      <Section title="High-Risk Areas">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
          These areas require extra care and thorough testing before any changes:
        </p>
        <StaggerList>
          <div className="space-y-2">
            {highRiskAreas.map((h) => (
              <StaggerItem key={h.area}>
                <Card className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{h.area}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{h.note}</p>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
      </Section>

      <Section title="Documentation Updates">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>When making user-visible behavior changes, update the following files alongside code:</p>
          <ul className="space-y-1 mt-2 ml-3">
            {["README.md — feature overview and command reference", "CONTRIBUTING.md — if contributing workflow changes", "docs/INSTALL.md — if installation steps change", "docs/ARCHITECTURE.md — if design boundaries shift", "CHANGELOG.md — add entry under the next version"].map((doc, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Reporting Issues">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>Use <a href="https://github.com/nasimstg/xenvsync/issues" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">GitHub Issues</a> to report bugs or request features.</p>
          <p>Include:</p>
          <ul className="ml-3 space-y-1 mt-1">
            {["Steps to reproduce the issue", "Expected vs. actual behavior", "Your OS and Go version (xenvsync version output)", "Relevant error output"].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Security Vulnerabilities">
        <Callout type="warning">
          Do <strong>not</strong> open a public issue for security vulnerabilities. Report them privately via{" "}
          <a
            href="https://github.com/nasimstg/xenvsync/security/advisories/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            GitHub Security Advisories
          </a>
          . This ensures responsible disclosure before a fix is released.
        </Callout>
      </Section>

      <Section title="License">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          By contributing, you agree that your contributions will be licensed under the{" "}
          <a href="/license" className="text-[var(--color-accent)] hover:underline">MIT License</a>.
        </Card>
      </Section>
    </div>
  );
}
