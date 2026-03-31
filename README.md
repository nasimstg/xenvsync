<p align="center">
  <h1 align="center">xenvsync</h1>
  <p align="center">
    Encrypt, commit, and inject <code>.env</code> secrets — no cloud required.
  </p>
  <p align="center">
    <a href="https://github.com/nasimstg/xenvsync/actions/workflows/ci.yml"><img src="https://github.com/nasimstg/xenvsync/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://goreportcard.com/report/github.com/nasimstg/xenvsync"><img src="https://goreportcard.com/badge/github.com/nasimstg/xenvsync" alt="Go Report Card"></a>
    <a href="https://pkg.go.dev/github.com/nasimstg/xenvsync"><img src="https://pkg.go.dev/badge/github.com/nasimstg/xenvsync.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/nasimstg/xenvsync" alt="License"></a>
    <a href="https://github.com/nasimstg/xenvsync/releases"><img src="https://img.shields.io/github/v/release/nasimstg/xenvsync?include_prereleases" alt="Release"></a>
  </p>
</p>

---

**xenvsync** encrypts your `.env` files into a `.env.vault` using **AES-256-GCM** so you can safely commit secrets to Git — while the decryption key never leaves your machine.

```
  .env (plaintext)                    .env.vault (encrypted)
  ┌──────────────────┐    push ──►   ┌──────────────────────┐
  │ DB_HOST=localhost │               │ #/---xenvsync vault--│
  │ API_KEY=sk-secret │   ◄── pull   │ aGVsbG8gd29ybGQ...   │
  └──────────────────┘               │ #/---end xenvsync----│
         │                            └──────────────────────┘
         │ run                                  │
         ▼                                      │
  ┌──────────────────┐               safe to commit to git
  │ child process    │
  │ (secrets in RAM) │
  └──────────────────┘
```

## Install

```bash
# npm
npm install -g @nasimstg/xenvsync

# or run without installing
npx @nasimstg/xenvsync

# Go 1.22+
go install github.com/nasimstg/xenvsync@latest
```

Or download a prebuilt binary from [Releases](https://github.com/nasimstg/xenvsync/releases).

<details>
<summary>Build from source</summary>

```bash
git clone https://github.com/nasimstg/xenvsync.git
cd xenvsync
make build
```
</details>

## Quick Start

```bash
xenvsync init                    # generate key + update .gitignore
xenvsync push                    # encrypt .env → .env.vault
git add .env.vault && git commit # safe to commit

xenvsync pull                    # decrypt .env.vault → .env
xenvsync run -- npm start        # inject secrets into process (in-memory, no .env written)
```

## Why xenvsync?

| Problem | xenvsync |
|---------|----------|
| Cloud secret managers are overkill for local dev | Works 100% offline. Key stays on your machine. |
| `.env` files leak into Git history | Encrypt first, commit the vault. |
| Secrets written to disk in CI/scripts | `xenvsync run` injects in-memory. Plaintext never touches disk. |
| Sharing secrets = Slack DMs and sticky notes | Commit `.env.vault`, share the key out-of-band. |

## How It Compares

| Feature | xenvsync | dotenv-vault | git-crypt | sops |
|---------|:--------:|:------------:|:---------:|:----:|
| No cloud account required | Yes | No | Yes | Yes |
| Encrypts only `.env` (not all files) | Yes | Yes | No | Yes |
| In-memory secret injection (`run`) | Yes | No | No | No |
| Single binary, zero dependencies | Yes | No | No | No |
| Diff / status preview | Yes | No | No | Yes |
| Standard crypto (AES-256-GCM) | Yes | Yes | AES-256 | Various |

## Commands

| Command | Description |
|---------|-------------|
| `xenvsync init [--force]` | Generate a 256-bit key, add it to `.gitignore` |
| `xenvsync push [--env NAME]` | Encrypt `.env` → `.env.vault` |
| `xenvsync pull [--env NAME]` | Decrypt `.env.vault` → `.env` |
| `xenvsync run [--env NAME] -- <cmd>` | Decrypt in-memory and inject into a child process |
| `xenvsync diff [--env NAME] [--show-values]` | Preview changes between `.env` and the vault |
| `xenvsync status [--env NAME]` | Show file presence, timestamps, and sync direction |
| `xenvsync keygen [--force]` | Generate an X25519 keypair for team vault encryption |
| `xenvsync whoami` | Display your public key and identity path |
| `xenvsync team add <name> <key>` | Register a team member's public key |
| `xenvsync team remove <name>` | Remove a team member from the roster |
| `xenvsync team list` | List all team members and their public keys |
| `xenvsync rotate [--env NAME] [--revoke NAME]` | Rotate encryption key and re-encrypt the vault |
| `xenvsync verify [--env NAME]` | Verify vault integrity, detect duplicate keys |
| `xenvsync log [--env NAME] [-n N]` | Show vault change history from Git commits |
| `xenvsync envs` | List all discovered environments and their sync status |
| `xenvsync export [--format FMT]` | Decrypt vault and output as JSON, YAML, shell, tfvars, or dotenv |
| `xenvsync completion [SHELL]` | Generate shell completions (bash/zsh/fish/powershell) |
| `xenvsync version` | Print version, commit, and build date |

> **Aliases**: `push` = `encrypt`, `pull` = `decrypt`

## Multi-Environment Support

Use `--env` to work with named environments. File paths follow the convention `.env.<name>` / `.env.<name>.vault`:

```bash
xenvsync push --env staging     # .env.staging → .env.staging.vault
xenvsync pull --env production  # .env.production.vault → .env.production
xenvsync run --env staging -- npm start
xenvsync diff --env staging
xenvsync envs                   # list all discovered environments
```

You can also set `XENVSYNC_ENV` to avoid passing `--env` every time.

### Fallback Merging

When pushing, xenvsync automatically merges variables from fallback files if they exist:

```
.env.shared  →  base variables (lowest priority)
.env.staging →  environment-specific overrides
.env.local   →  developer-local overrides (highest priority)
```

Use `--no-fallback` to disable merging and encrypt only the primary file.

## Team Sharing (V2 Vault)

With V2, each team member has their own X25519 keypair. Vaults are encrypted per-member — no shared symmetric key needed.

```bash
# Each member generates their identity (once)
xenvsync keygen

# Share your public key with the team
xenvsync whoami

# Add team members to the project roster
xenvsync team add alice <alice-public-key>
xenvsync team add bob <bob-public-key>
xenvsync team list

# Push now auto-encrypts for all team members (V2 format)
xenvsync push    # creates V2 vault with per-member key slots

# Each member decrypts with their own private key
xenvsync pull    # uses ~/.xenvsync/identity automatically
```

V1 vaults (created without a team roster) are still fully readable.

## Key Rotation

Rotate encryption keys and re-encrypt the vault in one atomic step:

```bash
# V1 (symmetric key): generates new .xenvsync.key and re-encrypts
xenvsync rotate

# V2 (team mode): re-encrypts with fresh ephemeral keys for all members
xenvsync rotate

# Revoke a team member and rotate in one step
xenvsync rotate --revoke exmember

# Rotate a specific environment
xenvsync rotate --env staging
```

When revoking a member, the member is removed from the roster and the vault is re-encrypted so they can no longer decrypt it — even if they have a copy of the old vault file.

## Security Model

| Property | Detail |
|----------|--------|
| Algorithm | AES-256-GCM (authenticated encryption) |
| Key | 32 random bytes via `crypto/rand`, hex-encoded, file mode `0600` |
| Nonce | Fresh 12-byte random nonce per encryption — same plaintext always produces different ciphertext |
| Vault layout | `[nonce ‖ ciphertext ‖ GCM tag]`, base64-wrapped with header/footer |
| Key isolation | Never embedded in vault output. Auto-added to `.gitignore` on `init` |
| Identity | X25519 keypair at `~/.xenvsync/identity` (mode 0600) for asymmetric team sharing |
| Permission check | Warns at runtime if key file is readable by group/others |

## Project Structure

```
xenvsync/
├── main.go                        # Entry point + version wiring
├── cmd/                           # CLI commands (Cobra)
│   ├── root.go                    # Root command
│   ├── init.go                    # init (--force)
│   ├── push.go / pull.go          # encrypt / decrypt
│   ├── run.go                     # in-memory injection
│   ├── diff.go / status.go        # preview & sync state
│   ├── keygen.go / whoami.go       # X25519 identity management
│   ├── version.go                 # version info
│   └── keyutil.go                 # shared key loading + permission check
├── internal/
│   ├── crypto/                    # AES-256-GCM + X25519 key exchange
│   ├── env/                       # .env parser (multiline, quotes, export)
│   └── vault/                     # vault file format
├── examples/
│   ├── docker/                    # Dockerfile, compose, entrypoint
│   ├── ci/                        # GitHub Actions, GitLab, CircleCI, Bitbucket
│   └── hooks/                     # Git pre-commit hook
├── Makefile                       # build, test, lint, install
├── .goreleaser.yml                # cross-platform release builds
└── .github/workflows/ci.yml       # CI: test matrix, lint, release
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

If you find xenvsync useful, consider giving it a star — it helps others discover the project.

## License

[MIT](LICENSE)
