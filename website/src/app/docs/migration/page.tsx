import { CodeBlock } from "@/components/CodeBlock";
import { Section, PageHeader } from "@/components/DocsComponents";

export const metadata = {
  title: "Migration Guides - xenvsync",
  description: "Step-by-step guides to migrate from dotenv-vault, sops, and git-crypt to xenvsync.",
  openGraph: {
    title: "Migration Guides - xenvsync",
    description: "Migrate from dotenv-vault, sops, or git-crypt to xenvsync with step-by-step instructions.",
    url: "https://xenvsync.softexforge.io/docs/migration",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/migration" },
};

export default function Migration() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Migration Guides"
        description="Step-by-step guides to switch from other secret management tools to xenvsync."
      />

      {/* dotenv-vault */}
      <Section title="From dotenv-vault">
        <p className="text-[var(--color-text-secondary)] mb-4">
          dotenv-vault uses a cloud service to manage encrypted vaults. xenvsync does everything locally with no cloud dependency.
        </p>

        <h3 className="text-base font-medium mb-2">1. Export your secrets</h3>
        <p className="text-[var(--color-text-secondary)] mb-2">
          If you have a <code>.env.vault</code> from dotenv-vault, you need to decrypt it first using your DOTENV_KEY:
        </p>
        <CodeBlock language="bash">
{`# Decrypt your dotenv-vault secrets to a plain .env file
# (use your dotenv-vault tooling or dashboard to export)
npx dotenv-vault@latest pull

# Verify your .env has all expected variables
cat .env`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">2. Set up xenvsync</h3>
        <CodeBlock language="bash">
{`# Initialize xenvsync (generates encryption key)
xenvsync init

# Encrypt your .env
xenvsync push

# Verify the vault
xenvsync verify`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">3. Clean up dotenv-vault</h3>
        <CodeBlock language="bash">
{`# Remove dotenv-vault artifacts
rm -f .env.vault  # (the old dotenv-vault format, now replaced by xenvsync's)
rm -f .env.keys

# Remove dotenv-vault from dependencies
npm uninstall dotenv-vault

# Commit the new vault
git add .env.vault .gitignore
git commit -m "Migrate from dotenv-vault to xenvsync"`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">4. Verify</h3>
        <CodeBlock language="bash">
{`# Delete .env and restore from vault
rm .env
xenvsync pull
cat .env  # should match your original secrets

# Test in-memory injection
xenvsync run -- env | grep YOUR_KEY`}
        </CodeBlock>

        <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
          <strong>Key differences:</strong> xenvsync vaults are not compatible with dotenv-vault vaults. The <code>.env.vault</code> file format is different.
          xenvsync uses AES-256-GCM with a local key, while dotenv-vault uses a cloud-managed key.
        </div>
      </Section>

      {/* sops */}
      <Section title="From sops">
        <p className="text-[var(--color-text-secondary)] mb-4">
          sops encrypts individual values within YAML/JSON/ENV files. xenvsync encrypts the entire <code>.env</code> file as a single unit.
        </p>

        <h3 className="text-base font-medium mb-2">1. Export your secrets</h3>
        <CodeBlock language="bash">
{`# Decrypt your sops-encrypted file to plain .env
sops -d secrets.enc.env > .env

# Or from YAML/JSON:
sops -d secrets.yaml | yq -r 'to_entries[] | "\\(.key)=\\(.value)"' > .env`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">2. Set up xenvsync</h3>
        <CodeBlock language="bash">
{`# Initialize xenvsync
xenvsync init

# Encrypt your .env
xenvsync push

# Verify
xenvsync diff  # should show no differences`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">3. Clean up sops</h3>
        <CodeBlock language="bash">
{`# Remove sops-encrypted files
rm -f secrets.enc.env secrets.yaml
rm -f .sops.yaml

# Update .gitignore if needed
# (xenvsync init already added .xenvsync.key and .env)

# Commit
git add .env.vault .gitignore
git rm secrets.enc.env .sops.yaml  # if tracked
git commit -m "Migrate from sops to xenvsync"`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">4. Verify</h3>
        <CodeBlock language="bash">
{`rm .env
xenvsync pull
xenvsync verify`}
        </CodeBlock>

        <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
          <strong>Key differences:</strong> sops supports KMS, PGP, and age keys with per-value encryption. xenvsync uses a single AES-256-GCM key (or X25519 team keys) and encrypts the entire file.
          If you need per-value encryption or cloud KMS integration, sops may be a better fit.
        </div>
      </Section>

      {/* git-crypt */}
      <Section title="From git-crypt">
        <p className="text-[var(--color-text-secondary)] mb-4">
          git-crypt transparently encrypts files in a Git repo. xenvsync uses explicit push/pull commands and encrypts only <code>.env</code> files.
        </p>

        <h3 className="text-base font-medium mb-2">1. Export your secrets</h3>
        <CodeBlock language="bash">
{`# Ensure your repo is unlocked (files are decrypted in working tree)
git-crypt unlock

# Copy your .env (it's already in plaintext when unlocked)
cp .env .env.backup

# Verify contents
cat .env`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">2. Remove git-crypt</h3>
        <CodeBlock language="bash">
{`# Lock first to see what was encrypted
git-crypt lock

# Remove git-crypt configuration
rm -rf .git-crypt/
rm -f .gitattributes  # or remove git-crypt filter lines

# Unlock to restore plaintext
git-crypt unlock`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">3. Set up xenvsync</h3>
        <CodeBlock language="bash">
{`# Initialize xenvsync
xenvsync init

# Restore .env if needed
cp .env.backup .env

# Encrypt
xenvsync push

# Verify
xenvsync verify`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">4. Commit the migration</h3>
        <CodeBlock language="bash">
{`git add .env.vault .gitignore
git commit -m "Migrate from git-crypt to xenvsync"

# Clean up backup
rm .env.backup`}
        </CodeBlock>

        <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
          <strong>Key differences:</strong> git-crypt encrypts transparently on git operations and works with any file type.
          xenvsync is focused specifically on <code>.env</code> files and adds features like in-memory injection (<code>run</code>), multi-environment support, and vault diff/status.
        </div>
      </Section>

      {/* Team migration */}
      <Section title="Team Migration">
        <p className="text-[var(--color-text-secondary)] mb-4">
          If your team uses xenvsync&apos;s V2 (team) mode, follow these additional steps after any migration:
        </p>
        <CodeBlock language="bash">
{`# Each team member generates their keypair (once)
xenvsync keygen

# Share public keys and add to roster
xenvsync team add alice <alice-public-key>
xenvsync team add bob <bob-public-key>

# Re-push to create V2 vault with per-member encryption
xenvsync push

# Commit the roster and vault
git add .xenvsync-team.json .env.vault
git commit -m "Enable V2 team vault"`}
        </CodeBlock>
      </Section>

      {/* Comparison */}
      <Section title="Feature Comparison">
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-elevated)] text-left">
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium">xenvsync</th>
                <th className="px-4 py-3 font-medium">dotenv-vault</th>
                <th className="px-4 py-3 font-medium">sops</th>
                <th className="px-4 py-3 font-medium">git-crypt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              <tr><td className="px-4 py-2.5">No cloud required</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">Yes</td></tr>
              <tr><td className="px-4 py-2.5">In-memory injection</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">No</td></tr>
              <tr><td className="px-4 py-2.5">Multi-environment</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">Manual</td><td className="px-4 py-2.5">No</td></tr>
              <tr><td className="px-4 py-2.5">Team sharing</td><td className="px-4 py-2.5">X25519</td><td className="px-4 py-2.5">Cloud</td><td className="px-4 py-2.5">KMS/PGP</td><td className="px-4 py-2.5">GPG</td></tr>
              <tr><td className="px-4 py-2.5">Key rotation</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">Cloud</td><td className="px-4 py-2.5">Manual</td><td className="px-4 py-2.5">No</td></tr>
              <tr><td className="px-4 py-2.5">Diff / audit log</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">Partial</td><td className="px-4 py-2.5">No</td></tr>
              <tr><td className="px-4 py-2.5">Single binary</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">No</td></tr>
              <tr><td className="px-4 py-2.5">Passphrase protection</td><td className="px-4 py-2.5">Yes</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">No</td><td className="px-4 py-2.5">No</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
