import { CodeBlock } from "@/components/CodeBlock";
import { Section, PageHeader, StaggerList, StaggerItem } from "@/components/DocsComponents";

export const metadata = {
  title: "Command Reference - xenvsync",
  description: "Complete reference for all xenvsync commands: init, push, pull, run, diff, status, envs, export, completion, and version with flags, aliases, and examples.",
  openGraph: {
    title: "Command Reference - xenvsync",
    description: "All xenvsync commands, flags, aliases, and usage examples.",
    url: "https://xenvsync.softexforge.io/docs/commands",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/commands" },
};

interface CommandDef {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  flags?: { flag: string; description: string }[];
  example: string;
}

const commands: CommandDef[] = [
  {
    name: "init",
    description:
      "Generates a cryptographically secure 256-bit AES key, saves it to .xenvsync.key with owner-only permissions (0600), and ensures the key file and .env are in .gitignore.",
    usage: "xenvsync init [flags]",
    flags: [
      { flag: "--force, -f", description: "Overwrite existing key file (regenerate key)" },
    ],
    example: `$ xenvsync init
Generated encryption key → .xenvsync.key (mode 0600)
Updated .gitignore (added .xenvsync.key, .env)

# Regenerate key
$ xenvsync init --force`,
  },
  {
    name: "push",
    aliases: ["encrypt"],
    description:
      "Reads the plaintext .env file, encrypts it using AES-256-GCM, and writes the ciphertext to .env.vault. The vault file is safe to commit to version control.",
    usage: "xenvsync push [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--file, -e", description: "Path to the .env file (default: .env)" },
      { flag: "--out, -o", description: "Path to the output vault file (default: .env.vault)" },
      { flag: "--no-fallback", description: "Disable .env.shared and .env.local merging" },
    ],
    example: `$ xenvsync push
Encrypted 5 variable(s) → .env.vault

# Named environment (merges .env.shared < .env.staging < .env.local)
$ xenvsync push --env staging
Encrypted 7 variable(s) → .env.staging.vault

# Disable fallback merging
$ xenvsync push --env staging --no-fallback
Encrypted 3 variable(s) → .env.staging.vault`,
  },
  {
    name: "pull",
    aliases: ["decrypt"],
    description:
      "Reads the encrypted .env.vault, decrypts it using the local .xenvsync.key, and writes the plaintext variables to .env.",
    usage: "xenvsync pull [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--vault, -v", description: "Path to the vault file (default: .env.vault)" },
      { flag: "--out, -o", description: "Path to the output .env file (default: .env)" },
    ],
    example: `$ xenvsync pull
Decrypted 5 variable(s) → .env

# Named environment
$ xenvsync pull --env staging
Decrypted 3 variable(s) → .env.staging

# Custom paths
$ xenvsync pull -v .env.staging.vault -o .env.staging`,
  },
  {
    name: "run",
    description:
      "Decrypts the vault in-memory and spawns a child process with the decrypted variables merged into the environment. Plaintext secrets never touch disk — they exist only in the child process's memory.",
    usage: "xenvsync run [flags] -- <command> [args...]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--vault, -v", description: "Path to the vault file (default: .env.vault)" },
    ],
    example: `$ xenvsync run -- npm start
$ xenvsync run --env staging -- npm start
$ xenvsync run -- python manage.py runserver
$ xenvsync run -- docker compose up`,
  },
  {
    name: "diff",
    description:
      "Decrypts the vault and compares its contents to the current .env file. Shows added, removed, and changed variables.",
    usage: "xenvsync diff [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--file, -e", description: "Path to the .env file (default: .env)" },
      { flag: "--vault, -v", description: "Path to the vault file (default: .env.vault)" },
    ],
    example: `$ xenvsync diff
+ NEW_KEY=value     (in .env only, not yet pushed)
- OLD_KEY=removed   (in vault only, not yet pulled)
~ API_KEY  (changed)
    .env:   sk-new-key
    vault:  sk-old-key`,
  },
  {
    name: "status",
    description:
      "Reports the presence and last-modified time of .xenvsync.key, .env, and .env.vault. Warns about insecure key file permissions and suggests whether to push or pull.",
    usage: "xenvsync status [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
    ],
    example: `$ xenvsync status
xenvsync status
───────────────────────────────────────
  Key file  .xenvsync.key     2026-03-21 10:00:00  (0600)
  Env file  .env              2026-03-21 10:05:00  (0644)
  Vault     .env.vault        2026-03-21 09:30:00  (0644)
───────────────────────────────────────
  .env is newer than vault → consider running: xenvsync push

# Named environment
$ xenvsync status --env staging`,
  },
  {
    name: "envs",
    description:
      "Scans the current directory for .env.* and .env.*.vault files and displays all discovered environments with their sync status.",
    usage: "xenvsync envs",
    example: `$ xenvsync envs
Discovered environments:
───────────────────────────────────────
  (default)      .env + .env.vault                    synced
  staging        .env.staging + .env.staging.vault     synced
  production     .env.production.vault                 not pulled`,
  },
  {
    name: "export",
    description:
      "Decrypts the vault and writes variables to stdout in the specified format. Output is always written to stdout (never to disk) to preserve the security model.",
    usage: "xenvsync export [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--format, -f", description: "Output format: dotenv, json, yaml, shell, tfvars (default: dotenv)" },
      { flag: "--vault, -v", description: "Path to the vault file (default: .env.vault)" },
    ],
    example: `# Export as JSON
$ xenvsync export --format=json
{
  "DB_HOST": "localhost",
  "API_KEY": "sk-secret"
}

# Inject into current shell
$ eval $(xenvsync export --format=shell)

# Pipe to other tools
$ xenvsync export -f yaml | kubectl create configmap`,
  },
  {
    name: "completion",
    description:
      "Generates shell completion scripts for bash, zsh, fish, or powershell. Source the output in your shell profile for tab completion of commands and flags.",
    usage: "xenvsync completion [bash|zsh|fish|powershell]",
    example: `# Bash (add to ~/.bashrc)
$ source <(xenvsync completion bash)

# Zsh (add to ~/.zshrc)
$ source <(xenvsync completion zsh)

# Fish
$ xenvsync completion fish > ~/.config/fish/completions/xenvsync.fish

# PowerShell
$ xenvsync completion powershell | Out-String | Invoke-Expression`,
  },
  {
    name: "version",
    description:
      "Prints the version, commit hash, and build date. Build info is injected at compile time via ldflags.",
    usage: "xenvsync version",
    example: `$ xenvsync version
xenvsync v1.1.0
  commit: abc1234
  built:  2026-03-29T00:00:00Z`,
  },
];

export default function Commands() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Command Reference"
        description="Complete reference for all xenvsync commands, flags, and usage examples."
      />

      {/* Quick reference table */}
      <Section title="Quick Reference">
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] glow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-elevated)] text-left">
                <th className="px-4 py-3 font-medium">Command</th>
                <th className="px-4 py-3 font-medium">Alias</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {commands.map((cmd) => (
                <tr key={cmd.name} className="hover:bg-[var(--color-bg-card)] transition-colors">
                  <td className="px-4 py-2.5">
                    <a href={`#${cmd.name}`} className="text-[var(--color-accent)] hover:underline font-mono text-xs">
                      {cmd.name}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--color-text-muted)] font-mono text-xs">
                    {cmd.aliases?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">
                    {cmd.description.split(".")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Detailed command sections */}
      <StaggerList>
        {commands.map((cmd, i) => (
          <StaggerItem key={cmd.name}>
            <section id={cmd.name} className="space-y-4 scroll-mt-20 pt-6">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold font-mono">{cmd.name}</h2>
                {cmd.aliases?.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                  >
                    alias: {a}
                  </span>
                ))}
              </div>

              <p className="text-[var(--color-text-secondary)]">{cmd.description}</p>

              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Usage</h3>
                <div className="inline-block px-4 py-2 rounded-lg glass-bright">
                  <code className="text-sm text-[var(--color-accent)]">{cmd.usage}</code>
                </div>
              </div>

              {cmd.flags && cmd.flags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Flags</h3>
                  <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {cmd.flags.map((f) => (
                          <tr key={f.flag} className="hover:bg-[var(--color-bg-card)] transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-accent)] whitespace-nowrap">
                              {f.flag}
                            </td>
                            <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">
                              {f.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Example</h3>
                <CodeBlock language="bash">{cmd.example}</CodeBlock>
              </div>

              {i < commands.length - 1 && (
                <div className="border-b border-[var(--color-border)] pt-2" />
              )}
            </section>
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Global help */}
      <Section title="Global Help">
        <p className="text-[var(--color-text-secondary)] mb-3">
          Every command supports <code>--help</code> for inline documentation.
        </p>
        <CodeBlock language="bash">
{`$ xenvsync --help
$ xenvsync push --help`}
        </CodeBlock>
      </Section>
    </div>
  );
}
