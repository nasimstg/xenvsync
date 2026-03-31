import { CodeBlock } from "@/components/CodeBlock";
import { Section, PageHeader, StaggerList, StaggerItem } from "@/components/DocsComponents";

export const metadata = {
  title: "Command Reference - xenvsync",
  description: "Complete reference for all xenvsync commands: init, push, pull, run, diff, status, envs, export, rotate, completion, and version with flags, aliases, and examples.",
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
      "Decrypts the vault and compares its contents to the current .env file. Shows added, removed, and changed variables. Values are hidden by default for security — use --show-values to reveal them.",
    usage: "xenvsync diff [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--file, -e", description: "Path to the .env file (default: .env)" },
      { flag: "--vault, -v", description: "Path to the vault file (default: .env.vault)" },
      { flag: "--show-values", description: "Display actual values in output (sensitive)" },
    ],
    example: `$ xenvsync diff
+ NEW_KEY  (in .env only, not yet pushed)
- OLD_KEY  (in vault only, not yet pulled)
~ API_KEY  (changed)
3 change(s): 1 added, 1 modified, 1 removed.

# Show actual values
$ xenvsync diff --show-values
+ NEW_KEY=value     (in .env only, not yet pushed)
- OLD_KEY=removed   (in vault only, not yet pulled)
~ API_KEY  (changed)
    .env:   sk-new-key
    vault:  sk-old-key
3 change(s): 1 added, 1 modified, 1 removed.`,
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
    name: "team add",
    description:
      "Registers a team member by name and their X25519 public key (base64-encoded, as shown by 'xenvsync whoami'). The roster is stored in .xenvsync-team.json and should be committed to version control.",
    usage: "xenvsync team add <name> <public-key>",
    example: `$ xenvsync team add alice dGhpcyBpcyBhIGJhc2U2NCBwdWJsaWMga2V5...
Added alice to team roster (.xenvsync-team.json)
  Public key: dGhpcyBpcyBhIGJhc2U2NCBwdWJsaWMga2V5...

Roster now has 2 member(s).`,
  },
  {
    name: "team remove",
    description:
      "Removes a team member from the project roster by name, revoking their ability to decrypt future vaults.",
    usage: "xenvsync team remove <name>",
    example: `$ xenvsync team remove alice
Removed alice from team roster
Roster now has 1 member(s).`,
  },
  {
    name: "team list",
    description:
      "Displays all team members in the project roster with their public keys and the date they were added.",
    usage: "xenvsync team list",
    example: `$ xenvsync team list
Team roster (2 member(s)):
  NAME     PUBLIC KEY                                    ADDED
  alice    dGhpcyBpcyBhIGJhc2U2NCBwdWJsaWMga2V5...      2026-03-30
  bob      Ym9iJ3MgcHVibGljIGtleQ==...                   2026-03-30`,
  },
  {
    name: "verify",
    description:
      "Validates vault file structural integrity, performs GCM authentication to detect tampering, checks for duplicate keys in .env files, and warns about stale vaults. Without a key, only structural checks run; with a key, full decrypt and authenticate is performed.",
    usage: "xenvsync verify [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
    ],
    example: `$ xenvsync verify
PASS  vault structure — valid V1 vault
PASS  vault decrypt — GCM authenticated, 5 variable(s)
PASS  duplicate keys — no duplicates in .env
PASS  vault freshness — .env.vault is up to date

Verification complete: 4 passed

# With warnings
$ xenvsync verify
PASS  vault structure — valid V1 vault
PASS  vault decrypt — GCM authenticated, 5 variable(s)
WARN  duplicate key "API_KEY" appears 2 times in .env
WARN  stale vault — .env is newer than .env.vault (consider running: xenvsync push)

Verification complete: 2 passed, 2 warning(s)

# Named environment
$ xenvsync verify --env staging`,
  },
  {
    name: "log",
    description:
      "Parses Git history for commits that modified the vault file and displays a timeline of changes. For each commit, shows which keys were added, modified, or removed. Values are hidden by default.",
    usage: "xenvsync log [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--show-values", description: "Display actual decrypted values (sensitive)" },
      { flag: "-n, --limit", description: "Maximum number of commits to show (default: 10)" },
    ],
    example: `$ xenvsync log
Vault history for .env.vault (3 commit(s)):

commit a1b2c3d (2026-04-01, alice)
  Update API keys for v2
  ~ API_KEY  (changed)
  + NEW_SERVICE_URL  (in new only, not yet pushed)
  2 change(s): 1 added, 1 modified.

commit d4e5f6a (2026-03-30, bob)
  Initial secrets
  + DB_HOST  (in new only, not yet pushed)
  + API_KEY  (in new only, not yet pushed)
  2 change(s): 2 added.

# Show values (sensitive)
$ xenvsync log --show-values

# Limit to last 5 commits
$ xenvsync log -n 5

# Named environment
$ xenvsync log --env staging`,
  },
  {
    name: "rotate",
    description:
      "Rotates the encryption key and re-encrypts the vault in one atomic step. In V1 mode, generates a new symmetric key. In V2 (team) mode, re-encrypts for all current roster members with fresh ephemeral keys. Use --revoke to remove a member and rotate simultaneously.",
    usage: "xenvsync rotate [flags]",
    flags: [
      { flag: "--env", description: "Environment name (e.g., staging, production)" },
      { flag: "--revoke", description: "Remove a team member and rotate in one step" },
    ],
    example: `# V1: rotate symmetric key
$ xenvsync rotate
Rotated key → .xenvsync.key (mode 0600)
Rotated vault → .env.vault
Rotation complete. 5 variable(s) re-encrypted.

# V2: re-encrypt for all team members
$ xenvsync rotate
Rotated vault → .env.vault (V2, 3 recipient(s))
Rotation complete. 5 variable(s) re-encrypted.

# Revoke a member and rotate
$ xenvsync rotate --revoke exmember
Revoked exmember from team roster
Rotated vault → .env.vault (V2, 2 recipient(s))

# Rotate a named environment
$ xenvsync rotate --env staging`,
  },
  {
    name: "keygen",
    description:
      "Generates an X25519 keypair and stores the private key in ~/.xenvsync/identity with restricted permissions (0600). The public key is printed to stdout for sharing with teammates. This identity is user-global (not per-project).",
    usage: "xenvsync keygen [flags]",
    flags: [
      { flag: "--force, -f", description: "Overwrite existing identity (regenerate keypair)" },
    ],
    example: `$ xenvsync keygen
Generated X25519 identity → /home/you/.xenvsync/identity (mode 0600)

Your public key:
  dGhpcyBpcyBhIGJhc2U2NCBwdWJsaWMga2V5...

Share this public key with your team to be added to project vaults.

# Regenerate identity
$ xenvsync keygen --force`,
  },
  {
    name: "whoami",
    description:
      "Reads your X25519 private key from ~/.xenvsync/identity, derives the public key, and prints it in a copy-paste-friendly format.",
    usage: "xenvsync whoami",
    example: `$ xenvsync whoami
Identity:   /home/you/.xenvsync/identity
Public key: dGhpcyBpcyBhIGJhc2U2NCBwdWJsaWMga2V5...`,
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
