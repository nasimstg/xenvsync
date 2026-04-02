import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section, StaggerItem, StaggerList } from "@/components/DocsComponents";

export const metadata = {
  title: "Troubleshooting - xenvsync",
  description:
    "Comprehensive xenvsync troubleshooting guide covering decrypt failures, key permission errors, passphrase issues, stale vaults, team access problems, CI injection failures, export errors, and doctor/verify diagnostics.",
  openGraph: {
    title: "Troubleshooting - xenvsync",
    description: "Fix common xenvsync setup, decrypt, team, and CI issues quickly.",
    url: "https://xenvsync.softexforge.io/docs/troubleshooting",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/troubleshooting" },
};

const issues = [
  {
    category: "Decryption Failures",
    items: [
      {
        title: "authentication failed — vault decryption error",
        cause: "The key used to decrypt does not match the key that encrypted the vault. This happens when the wrong .xenvsync.key is present, the vault came from a different project, or the vault was tampered with.",
        fix: `# Run the full diagnostic
$ xenvsync doctor
$ xenvsync verify

# Check which key file is present
$ ls -la .xenvsync.key

# Compare key fingerprint against team roster if using V2
$ xenvsync whoami

# If key is wrong, obtain the correct key from the vault owner
# then re-run:
$ xenvsync pull`,
      },
      {
        title: "vault file not found / no such file .env.vault",
        cause: "The vault has not been created yet, or you are running xenvsync from the wrong directory.",
        fix: `# Verify you are in the repo root
$ ls .env.vault

# If missing, create the vault by encrypting your .env
$ xenvsync push

# For named environments, specify --env
$ xenvsync push --env staging`,
      },
      {
        title: "no key file found — .xenvsync.key missing",
        cause: "The symmetric key file is absent. It was never initialized, was gitignored and not restored, or was deleted.",
        fix: `# Initialize a new key (only if starting fresh — this invalidates the old vault)
$ xenvsync init

# If vault already exists, obtain the key from the person who created it
# Place it at:
$ ls .xenvsync.key
# Set correct permissions
$ chmod 600 .xenvsync.key`,
      },
      {
        title: "passphrase required — enc: prefix detected",
        cause: "The key file was created with --passphrase and requires XENVSYNC_PASSPHRASE to be set before xenvsync can use it.",
        fix: `# Export the passphrase before running any xenvsync command
$ export XENVSYNC_PASSPHRASE="your-passphrase"
$ xenvsync pull

# In CI, inject via secrets manager:
# GitHub Actions example
# env:
#   XENVSYNC_PASSPHRASE: \${{ secrets.XENVSYNC_PASSPHRASE }}`,
      },
    ],
  },
  {
    category: "Key & Permission Errors",
    items: [
      {
        title: "key file readable by others — permission warning",
        cause: "xenvsync expects .xenvsync.key and ~/.xenvsync/identity to be owner-only (mode 0600). Broader permissions are a security risk.",
        fix: `# Fix key file permissions (Linux / macOS)
$ chmod 600 .xenvsync.key

# Fix identity file permissions
$ chmod 600 ~/.xenvsync/identity

# Confirm with doctor
$ xenvsync doctor`,
      },
      {
        title: "key not in .gitignore — doctor warning",
        cause: "The .xenvsync.key file is not listed in .gitignore. Committing it would expose the decryption key.",
        fix: `# Add to .gitignore manually
$ echo ".xenvsync.key" >> .gitignore
$ echo ".env" >> .gitignore
$ git add .gitignore

# Or re-run init which auto-updates .gitignore
$ xenvsync init --force`,
      },
      {
        title: "key strength warning — all-zeros or weak key",
        cause: "doctor detected a key that is all zeros or appears too weak to provide security.",
        fix: `# Generate a fresh strong key
$ xenvsync init --force

# Then re-encrypt the vault with the new key
$ xenvsync push`,
      },
    ],
  },
  {
    category: "Stale Vault & Sync Issues",
    items: [
      {
        title: ".env is newer than .env.vault — stale vault warning",
        cause: "The plaintext .env was edited after the last push. The vault does not reflect current secrets.",
        fix: `# Preview what changed
$ xenvsync diff

# Re-encrypt with current .env contents
$ xenvsync push

# Verify the updated vault
$ xenvsync verify`,
      },
      {
        title: "diff shows unexpected changes",
        cause: "A diff that shows changes you did not make may indicate that another team member pushed changes, or that the vault was rotated.",
        fix: `# Show full diff (key names only by default — no values)
$ xenvsync diff

# To see values explicitly (use with care)
$ xenvsync diff --show-values

# Check vault Git history for recent changes
$ xenvsync log`,
      },
    ],
  },
  {
    category: "Team & V2 Vault Access",
    items: [
      {
        title: "no identity file found — team member cannot decrypt",
        cause: "The member has not generated their X25519 identity, or the identity file was deleted.",
        fix: `# Generate identity (run on the member's machine)
$ xenvsync keygen

# Print public key to share with vault maintainer
$ xenvsync whoami`,
      },
      {
        title: "recipient not in roster — V2 decryption failed",
        cause: "The member's public key was not included in the roster when the vault was last encrypted. Either they were never added, or rotation was performed without them.",
        fix: `# Maintainer: add the member and rotate
$ xenvsync team add alice <alice-public-key>
$ xenvsync rotate
$ xenvsync push

# Member: pull after maintainer rotates
$ xenvsync pull`,
      },
      {
        title: "member removed but can still decrypt old vault",
        cause: "Removing from roster does not retroactively re-encrypt. Rotation is required to exclude the revoked identity.",
        fix: `# Revoke access and rotate in one step
$ xenvsync rotate --revoke former-member

# Confirm roster
$ xenvsync team list`,
      },
      {
        title: ".xenvsync-team.json not committed",
        cause: "The team roster file is needed by all members. It must be committed to the repository.",
        fix: `$ git add .xenvsync-team.json
$ git commit -m "Add team roster"`,
      },
    ],
  },
  {
    category: "CI/CD Injection Failures",
    items: [
      {
        title: "xenvsync pull fails in CI — key not available",
        cause: "The key was not injected into the CI environment. CI jobs do not have the .xenvsync.key file by default.",
        fix: `# Inject key from CI secret into file
# GitHub Actions example:
# - run: echo "\${{ secrets.XENVSYNC_KEY }}" > .xenvsync.key && chmod 600 .xenvsync.key

# For passphrase-protected keys, also set:
# env:
#   XENVSYNC_PASSPHRASE: \${{ secrets.XENVSYNC_PASSPHRASE }}

# Then pull or run as normal
$ xenvsync pull
$ xenvsync run -- npm run build`,
      },
      {
        title: "run command exits with unexpected code",
        cause: "xenvsync run preserves child exit codes. A non-zero exit comes from the child process, not xenvsync itself.",
        fix: `# Debug by running the child process directly after pulling
$ xenvsync pull
$ npm run build  # run child independently to see its error

# Alternatively, inspect the child environment
$ xenvsync run -- env | grep YOUR_VAR`,
      },
    ],
  },
  {
    category: "Export Errors",
    items: [
      {
        title: "export --format=shell produces invalid output",
        cause: "Values are single-quote escaped to prevent shell expansion. If a value itself contains a single quote, the escaping handles it. This is the secure behavior.",
        fix: `# Verify export output looks correct
$ xenvsync export --format=shell

# Supported formats: dotenv, json, yaml, shell, tfvars
$ xenvsync export --format=json
$ xenvsync export --format=yaml`,
      },
      {
        title: "YAML export has unquoted boolean-like values",
        cause: "YAML 1.1 treats yes/no/on/off as booleans. xenvsync v1.12.0+ quotes these automatically.",
        fix: `# Upgrade to v1.12.0 or later
$ xenvsync version

# Re-export after upgrading
$ xenvsync export --format=yaml`,
      },
    ],
  },
  {
    category: "Multi-Environment Issues",
    items: [
      {
        title: "wrong environment loaded — unexpected variables",
        cause: "Fallback merging layers .env.shared → .env.<name> → .env.local. A variable from .env.shared may be overriding your expectation.",
        fix: `# Disable fallback to use only the named env file
$ xenvsync push --no-fallback --env production
$ xenvsync pull --no-fallback --env production

# Discover all environments in the project
$ xenvsync envs

# Check status of a specific env
$ xenvsync status --env staging`,
      },
      {
        title: "invalid environment name — path traversal error",
        cause: "Environment names must not contain slashes or .. characters. This is a security check.",
        fix: `# Valid environment names
$ xenvsync push --env staging
$ xenvsync push --env prod
$ xenvsync push --env feature-auth

# Invalid (will error)
# xenvsync push --env ../etc
# xenvsync push --env prod/v2`,
      },
    ],
  },
];

export default function TroubleshootingPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Troubleshooting"
        description="Diagnostics and fixes for every major class of xenvsync error — from decrypt failures and key permissions to team access, CI injection, and export issues."
      />

      <Section title="First-Response Diagnostics">
        <CodeBlock title="Run these commands first" language="bash">
{`# Check version and environment
$ xenvsync version

# Show sync state of all xenvsync files
$ xenvsync status

# Full security audit (permissions, gitignore, key strength, vault integrity)
$ xenvsync doctor

# Structural + cryptographic vault validation
$ xenvsync verify`}
        </CodeBlock>
        <Callout type="important">
          Always run diagnostics from the repository root that contains your target vault and key files. Running from a subdirectory is a common source of &quot;file not found&quot; errors.
        </Callout>
      </Section>

      {issues.map((group) => (
        <Section key={group.category} title={group.category}>
          <StaggerList>
            <div className="space-y-4">
              {group.items.map((issue) => (
                <StaggerItem key={issue.title}>
                  <Card className="space-y-3">
                    <h3 className="text-sm font-semibold font-mono text-[var(--color-accent)]">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      <strong className="text-[var(--color-text)]">Cause: </strong>{issue.cause}
                    </p>
                    <CodeBlock title="Fix" language="bash">
                      {issue.fix}
                    </CodeBlock>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>
        </Section>
      ))}

      <Section title="Still Stuck?">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>If none of the above resolves your issue, collect diagnostic output and open a GitHub issue:</p>
          <CodeBlock title="Collect diagnostics" language="bash">
{`$ xenvsync version
$ xenvsync doctor
$ xenvsync verify
$ xenvsync status`}
          </CodeBlock>
          <p className="mt-2">
            File a bug at{" "}
            <a href="https://github.com/nasimstg/xenvsync/issues" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
              github.com/nasimstg/xenvsync/issues
            </a>
            {" "}with the output from the commands above and your OS / Go version.
          </p>
        </Card>
      </Section>
    </div>
  );
}
