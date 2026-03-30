import { Shield, Key, Lock, Eye, AlertTriangle, FileWarning } from "lucide-react";
import { Section, PageHeader, Card, Callout, GlassCard } from "@/components/DocsComponents";

export const metadata = {
  title: "Security Model - xenvsync",
  description: "How xenvsync protects secrets with AES-256-GCM encryption, key management, nonce handling, tamper detection, and in-memory injection.",
  openGraph: {
    title: "Security Model - xenvsync",
    description: "AES-256-GCM encryption, key management, tamper detection, and threat model.",
    url: "https://xenvsync.softexforge.io/docs/security",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/security" },
};

export default function Security() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Security Model"
        description="How xenvsync protects your secrets at rest and in transit."
      />

      <Section title="Overview">
        <GlassCard>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            xenvsync uses <strong className="text-[var(--color-text)]">AES-256-GCM</strong> (Galois/Counter Mode),
            an authenticated encryption algorithm from Go&apos;s standard{" "}
            <code>crypto/aes</code> and <code>crypto/cipher</code> packages. No
            third-party cryptography libraries are used.
          </p>
        </GlassCard>
      </Section>

      <Section title="Encryption Properties">
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] glow-sm">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-border)]">
              <PropertyRow property="Algorithm" value="AES-256-GCM (authenticated encryption with associated data)" />
              <PropertyRow property="Key size" value="256 bits (32 bytes), generated via crypto/rand" />
              <PropertyRow property="Key encoding" value="Hex-encoded for safe storage in .xenvsync.key" />
              <PropertyRow property="Nonce size" value="96 bits (12 bytes), fresh random nonce per encryption" />
              <PropertyRow property="Auth tag" value="128 bits (16 bytes), appended by GCM — detects any tampering" />
              <PropertyRow property="Ciphertext layout" value="[nonce (12 B) ‖ ciphertext ‖ GCM tag (16 B)]" />
              <PropertyRow property="Vault format" value="Base64 with header/footer markers, 76-char line wrapping" />
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Key Management">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card glow>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="font-medium">Generation</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Keys are generated using Go&apos;s <code>crypto/rand.Reader</code>,
              which sources entropy from the OS CSPRNG
              (<code>/dev/urandom</code> on Linux, <code>CryptGenRandom</code> on
              Windows).
            </p>
          </Card>
          <Card glow>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="font-medium">Storage</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              The key is written to <code>.xenvsync.key</code> with file
              permissions <code>0600</code> (owner read/write only). Permissions
              are validated on every operation.
            </p>
          </Card>
          <Card glow>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="font-medium">Isolation</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              The key is <strong>never</strong> embedded in the vault output,
              logged, or printed to stdout. It is automatically added to{" "}
              <code>.gitignore</code> during <code>init</code>.
            </p>
          </Card>
          <Card glow>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="font-medium">Sharing</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              In V1, the symmetric key must be shared out-of-band (secure
              messaging, password manager, etc.). V2 introduces X25519 asymmetric
              keypairs (<code>keygen</code> / <code>whoami</code>) as the
              foundation for zero-trust team sharing.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Nonce Handling">
        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
          A fresh 12-byte random nonce is generated for every call to{" "}
          <code>xenvsync push</code>. This means encrypting the same{" "}
          <code>.env</code> file twice produces completely different ciphertext,
          which is important for:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            <span>
              <strong className="text-[var(--color-text)]">Security</strong> —
              prevents ciphertext analysis across multiple versions
            </span>
          </li>
          <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            <span>
              <strong className="text-[var(--color-text)]">Git diffs</strong> —
              the entire vault changes on each push, so it&apos;s clear when secrets
              were updated
            </span>
          </li>
        </ul>
        <Callout>
          The nonce is prepended to the ciphertext — you don&apos;t need to manage
          it separately. xenvsync handles this automatically.
        </Callout>
      </Section>

      <Section title="Tamper Detection">
        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
          GCM provides built-in authentication. If any byte of the vault file is
          modified (accidentally or maliciously), decryption fails with an
          authentication error. This protects against:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GlassCard className="flex items-center gap-3">
            <FileWarning className="w-4 h-4 text-[var(--color-yellow)] shrink-0" />
            <span className="text-sm text-[var(--color-text-secondary)]">Corrupted vault files</span>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-[var(--color-yellow)] shrink-0" />
            <span className="text-sm text-[var(--color-text-secondary)]">Bit-flipping attacks</span>
          </GlassCard>
          <GlassCard className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[var(--color-yellow)] shrink-0" />
            <span className="text-sm text-[var(--color-text-secondary)]">Truncated payloads</span>
          </GlassCard>
        </div>
      </Section>

      <Section title="In-Memory Injection">
        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
          The <code>xenvsync run</code> command decrypts the vault entirely in
          memory and passes secrets to the child process via its environment
          block. The plaintext is never written to a file. This reduces the
          attack surface compared to writing a <code>.env</code> file, which
          could be:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            Read by other processes on the same machine
          </li>
          <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            Persisted in filesystem snapshots or backups
          </li>
          <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
            Accidentally committed to Git
          </li>
        </ul>
      </Section>

      <Section title="Threat Model">
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] glow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-elevated)] text-left">
                <th className="px-4 py-3 font-medium">Threat</th>
                <th className="px-4 py-3 font-medium">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              <ThreatRow threat="Secrets committed to Git" mitigation=".env added to .gitignore on init; vault is encrypted" />
              <ThreatRow threat="Key file leaked" mitigation="0600 permissions; auto-gitignored; permission warnings on load" />
              <ThreatRow threat="Vault file tampered" mitigation="GCM authentication tag rejects modified ciphertext" />
              <ThreatRow threat="Plaintext .env on disk" mitigation="Use `run` command for in-memory injection instead" />
              <ThreatRow threat="Weak encryption key" mitigation="256-bit key from OS CSPRNG; validated on decode" />
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Reporting Vulnerabilities">
        <Card glow>
          <p className="text-[var(--color-text-secondary)]">
            If you discover a security vulnerability, please report it privately
            via{" "}
            <a
              href="https://github.com/nasimstg/xenvsync/security/advisories/new"
              className="text-[var(--color-accent)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Security Advisories
            </a>{" "}
            rather than opening a public issue. We take all reports seriously and
            will respond promptly.
          </p>
        </Card>
      </Section>
    </div>
  );
}

function PropertyRow({ property, value }: { property: string; value: string }) {
  return (
    <tr className="hover:bg-[var(--color-bg-card)] transition-colors">
      <td className="px-4 py-2.5 font-medium whitespace-nowrap w-40">{property}</td>
      <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{value}</td>
    </tr>
  );
}

function ThreatRow({ threat, mitigation }: { threat: string; mitigation: string }) {
  return (
    <tr className="hover:bg-[var(--color-bg-card)] transition-colors">
      <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{threat}</td>
      <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{mitigation}</td>
    </tr>
  );
}
