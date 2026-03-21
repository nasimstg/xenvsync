# Development Roadmap

## V1 — Single-User Secure Sync (Complete)

- [x] **Phase 1: Scaffolding & CLI Structure**
  - [x] Initialize Go module with `spf13/cobra`.
  - [x] Set up command routing (`init`, `push`/`encrypt`, `pull`/`decrypt`, `run`).
  - [x] Implement root command with help text and subcommand registration.
  - [x] Implement structured error handling (all commands return errors via `RunE`).
- [x] **Phase 2: Cryptography Engine**
  - [x] Implement secure 32-byte key generation via `crypto/rand`, hex-encoded.
  - [x] Implement AES-256-GCM encryption with per-call random nonce (12 bytes).
  - [x] Implement AES-256-GCM decryption with nonce extraction and authentication.
  - [x] Enforce key file permissions (`0600`) on generation.
- [x] **Phase 3: File I/O & Parsing**
  - [x] Parse `.env` files (blank lines, comments, quotes, `export` prefix).
  - [x] Serialize key-value pairs back to `.env` format with quoting.
  - [x] Define vault file format (header/base64/footer) with 76-char line wrapping.
  - [x] Write `.gitignore` manipulation (ensure `.xenvsync.key` and `.env` are ignored).
- [x] **Phase 4: Process Execution (`run` command)**
  - [x] Implement in-memory decryption (plaintext never written to disk).
  - [x] Merge decrypted vars into child process environment.
  - [x] Implement cross-platform child process spawning via `os/exec`.
  - [x] Forward signals (`SIGINT`/`SIGTERM`) and propagate child exit codes.
- [x] **Phase 5: Testing**
  - [x] Unit tests for `internal/crypto` (encrypt/decrypt round-trip, bad key, tampered ciphertext).
  - [x] Unit tests for `internal/env` (edge cases: quotes, empty values, comments, `export`, multiline).
  - [x] Unit tests for `internal/vault` (encode/decode round-trip, malformed input, CRLF).
  - [x] Integration tests for CLI commands (`init`, `init --force`, `push`, `pull` end-to-end).
- [x] **Phase 6: Hardening & UX**
  - [x] Add multiline variable support in `.env` parser.
  - [x] Add `--force` flag to `init` for key regeneration.
  - [x] Add `diff` command to preview changes before push/pull.
  - [x] Add `status` command to show sync state between `.env` and `.env.vault`.
  - [x] Validate key file permissions on load and warn if too open (`loadKey()` in `cmd/keyutil.go`).
- [x] **Phase 7: Packaging & Distribution**
  - [x] Set up `goreleaser` for cross-platform builds (Windows, macOS, Linux) via `.goreleaser.yml`.
  - [x] Add CI pipeline (GitHub Actions) for automated testing, linting, and releases.
  - [x] Write installation instructions and user-facing documentation (`docs/INSTALL.md`).

---

## V2 — Collaboration & Scale Release

While V1 perfected secure, single-user environment synchronization, V2 aims to make `xenvsync` the ultimate zero-trust secrets manager for growing development teams and automated pipelines.

### Phase 8: Multi-Environment Mastery

Managing a modern tech stack means juggling development, staging, and production environments. V2 introduces seamless environment switching.

- [ ] **Targeted Pushes & Pulls**
  - [ ] Add `--env` flag to `push`: `xenvsync push --env=staging` encrypts `.env.staging` → `.env.staging.vault`.
  - [ ] Add `--env` flag to `pull`: `xenvsync pull --env=staging` decrypts `.env.staging.vault` → `.env.staging`.
  - [ ] Auto-detect environment from file naming convention (`.env.<name>` ↔ `.env.<name>.vault`).
- [ ] **Environment Fallbacks**
  - [ ] Support a `.env.shared` base file with common variables across environments.
  - [ ] Implement merge precedence: `.env.shared` < `.env.<name>` < `.env.local` (local always wins).
  - [ ] Add `--no-fallback` flag to disable merge behavior for strict isolation.
- [ ] **Smart Run Injection**
  - [ ] `xenvsync run --env=production -- npm start` loads the correct vault.
  - [ ] When `--env` is omitted, auto-detect from `XENVSYNC_ENV` environment variable.
  - [ ] Support `--env=production,shared` to explicitly compose multiple environments.
- [ ] **Environment Management UX**
  - [ ] `xenvsync envs` command to list all detected environments (`.env.*` / `.env.*.vault` pairs).
  - [ ] `xenvsync diff --env=staging` to compare a specific environment against its vault.
  - [ ] `xenvsync status` extended to show per-environment sync state.

### Phase 9: Asymmetric Cryptography (Zero-Trust Team Sharing)

Currently, team members must securely share the symmetric `.xenvsync.key` out-of-band. V2 eliminates this friction using public-key cryptography.

- [ ] **Keypair Generation**
  - [ ] `xenvsync keygen` to generate an X25519 keypair (public + private).
  - [ ] Private key stored in `~/.xenvsync/identity` with `0600` permissions (user-global, not per-project).
  - [ ] Public key is safe to share and commit.
- [ ] **Team Roster**
  - [ ] `xenvsync team add <name> <public-key>` to register a team member's public key.
  - [ ] `xenvsync team remove <name>` to revoke a member's access.
  - [ ] `xenvsync team list` to display the current roster.
  - [ ] Store roster in `.xenvsync-team.json` (committed to repo).
- [ ] **Multi-Key Vault Encryption**
  - [ ] On `push`, generate a random ephemeral symmetric key per encryption.
  - [ ] Encrypt the ephemeral key once per team member using their public key.
  - [ ] Vault format V2: embedded key slots + ciphertext (each member decrypts with their own private key).
  - [ ] Backward compatibility: detect vault format version and handle V1 vaults transparently.
- [ ] **Key Exchange UX**
  - [ ] `xenvsync whoami` to display the current user's public key and identity.
  - [ ] `xenvsync team sync` to re-encrypt the vault for the current roster after membership changes.
  - [ ] Warn if a `push` is made without re-encrypting for newly added team members.

### Phase 10: CI/CD & DevOps Integrations

To fully replace cloud secret managers, `xenvsync` needs to integrate natively into automated deployment pipelines.

- [ ] **GitHub Action**
  - [ ] Official `nasimstg/xenvsync-action@v1` for GitHub Actions workflows.
  - [ ] Decrypt vault using a single repository secret (`XENVSYNC_KEY`).
  - [ ] Support multi-environment: `with: { env: "production" }`.
  - [ ] Outputs decrypted vars as masked GitHub Actions outputs.
- [ ] **Docker Integration**
  - [ ] Document best practices for `xenvsync run` in Docker entrypoints.
  - [ ] Provide a minimal Alpine-based Docker image with `xenvsync` pre-installed.
  - [ ] Example `Dockerfile` and `docker-compose.yml` in `examples/docker/`.
- [ ] **Format Exporting**
  - [ ] `xenvsync export --format=json` to output decrypted vars as JSON.
  - [ ] `xenvsync export --format=yaml` for Kubernetes ConfigMap / Helm values.
  - [ ] `xenvsync export --format=shell` for `eval $(xenvsync export --format=shell)` usage.
  - [ ] `xenvsync export --format=tfvars` for Terraform variable files.
  - [ ] All export formats write to stdout only (never disk) to preserve security model.
- [ ] **CI Provider Templates**
  - [ ] Example configs for GitLab CI, CircleCI, and Bitbucket Pipelines.
  - [ ] Documentation for using `xenvsync` with cloud build systems (AWS CodeBuild, GCP Cloud Build).

### Phase 11: Hardening & Auditing

As teams scale, tracking who changed what and rotating credentials becomes critical.

- [ ] **Secret Rotation**
  - [ ] `xenvsync rotate` to generate a new master key and re-encrypt the vault atomically.
  - [ ] In team mode (Phase 9), `rotate` re-encrypts for all current roster members.
  - [ ] `--revoke <name>` flag to rotate and exclude a specific team member in one step.
  - [ ] Warn if the previous key file is not securely deleted after rotation.
- [ ] **Audit Logging**
  - [ ] Enhanced `xenvsync diff` to show key-level changes (added, modified, removed) without exposing values.
  - [ ] `xenvsync log` to display vault change history from Git commits (parses `git log` for `.env.vault` changes).
  - [ ] Optional `--show-values` flag for `diff` and `log` (requires explicit opt-in).
- [ ] **Integrity Verification**
  - [ ] `xenvsync verify` to validate vault integrity without decrypting (GCM tag check).
  - [ ] Pre-commit hook integration: block commits if vault is stale relative to `.env`.
  - [ ] Detect and warn about duplicate keys in `.env` files.
- [ ] **Security Hardening**
  - [ ] Memory zeroing: overwrite key material in memory after use (`memguard` or manual zeroing).
  - [ ] Optional passphrase protection for the key file (key-encryption-key pattern).
  - [ ] `xenvsync doctor` command to audit the local setup (permissions, gitignore, key strength).

### Phase 12: Ecosystem & Community

- [ ] **Plugin System**
  - [ ] Define a plugin interface for custom vault backends (S3, GCS, etc.).
  - [ ] Allow community-contributed import/export format plugins.
- [ ] **Shell Completions**
  - [ ] `xenvsync completion bash/zsh/fish/powershell` for tab completion.
- [ ] **Documentation Site**
  - [ ] Static docs site (GitHub Pages or similar) with guides, API reference, and tutorials.
  - [ ] Migration guides from dotenv-vault, sops, and git-crypt.
- [ ] **Homebrew & Package Managers**
  - [ ] Homebrew tap: `brew install nasimstg/tap/xenvsync`.
  - [ ] Scoop bucket for Windows.
  - [ ] AUR package for Arch Linux.
  - [ ] Nix flake.
