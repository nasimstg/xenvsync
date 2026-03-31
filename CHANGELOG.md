# Changelog

All notable changes to this project will be documented in this file.

## [v1.10.0] - 2026-04-01

### Added
- Homebrew tap: `brew install nasimstg/tap/xenvsync` (auto-published by GoReleaser) (#17)
- Scoop bucket: `scoop install xenvsync` for Windows (auto-published by GoReleaser)
- Nix flake: `nix run github:nasimstg/xenvsync`
- AUR PKGBUILD for Arch Linux

## [v1.9.0] - 2026-04-01

### Added
- `xenvsync doctor` command — audit local setup for security issues (permissions, gitignore, key strength, vault integrity, identity) (#14)
- Passphrase protection for key files with `init --passphrase` and `XENVSYNC_PASSPHRASE` env var (scrypt + AES-256-GCM key-encryption-key)
- Memory zeroing for key material after use (`crypto.ZeroBytes`)

## [v1.8.0] - 2026-04-01

### Added
- `xenvsync verify` command — validate vault integrity with structural checks, GCM authentication, duplicate key detection, and stale vault warnings (#13)
- Pre-commit hook script (`examples/hooks/pre-commit`) that blocks commits when vault is stale or `.env` is staged
- `--env` flag support on verify for named environments
- Duplicate key detection warns about repeated keys in `.env` files

## [v1.7.0] - 2026-04-01

### Added
- `xenvsync log` command — display vault change history from Git commits with key-level diffs (#12)
- `--show-values` flag on `diff` and `log` for explicit opt-in to display secret values
- `-n/--limit` flag on `log` to control how many commits are shown (default 10)
- Shared diff engine (`diffutil.go`) with `computeKeyChanges` and `formatKeyChanges`
- `decryptVaultBytes` helper for decrypting vault data from non-file sources

### Changed
- `diff` now hides values by default — only key names and change types are shown
- `diff` output includes a summary line with counts of added/modified/removed keys

## [v1.6.0] - 2026-03-30

### Added
- `xenvsync rotate` command — rotate encryption key and re-encrypt the vault in one atomic step (#11)
- V1 mode: generates new symmetric key and re-encrypts with it
- V2 mode: re-encrypts for all current roster members with fresh ephemeral keys
- `--revoke <name>` flag to remove a team member and rotate in one step
- `--env` flag support for rotating named environment vaults

## [v1.5.0] - 2026-03-30

### Added
- Docker integration: Alpine Dockerfile, multi-stage app example, docker-compose, and entrypoint script (#8)
- CI provider templates: GitHub Actions, GitLab CI, CircleCI, and Bitbucket Pipelines (#10)
- All examples in `examples/docker/` and `examples/ci/`

## [v1.4.0] - 2026-03-30

### Added
- `xenvsync team add/remove/list` commands — manage team members' X25519 public keys (#5)
- Team roster stored in `.xenvsync-team.json` (project-local, committed to repo)
- V2 vault format with per-member key slots using X25519 ECDH (#6)
- Each team member can decrypt vaults using their own private key
- Automatic V2 encryption when a team roster exists
- V1 vault backward compatibility — existing vaults remain readable
- Shared `decryptVault()` helper auto-detects V1/V2 format across all commands

## [v1.3.0] - 2026-03-30

### Added
- `xenvsync keygen` command — generate an X25519 keypair and store identity at `~/.xenvsync/identity` (#4)
- `xenvsync whoami` command — display your public key and identity path
- `--force` flag on keygen to overwrite existing identity
- `internal/crypto` package with X25519 key generation, encoding, and decoding
- Cross-platform identity support (Linux, macOS, Windows)

## [v1.2.0] - 2026-03-30

### Added
- Multi-environment support with `--env` flag on push, pull, run, diff, status, and export commands (#1)
- `xenvsync envs` command — discover and list all environments with sync status (#3)
- `XENVSYNC_ENV` environment variable as fallback for `--env` flag
- Named environment file convention: `.env.<name>` / `.env.<name>.vault`
- Environment fallback merging: `.env.shared` < `.env.<name>` < `.env.local` (#2)
- `--no-fallback` flag on push to disable merging for strict isolation
- npm README for package page on npmjs.com

## [v1.1.1] - 2026-03-30

### Fixed
- npm postinstall failing with ENOENT — tar extraction used `--strip-components=1` but GoReleaser archives have no wrapper directory

## [v1.1.0] - 2026-03-29

### Added
- `xenvsync export` command — decrypt vault and output as JSON, YAML, shell, tfvars, or dotenv to stdout (#9)
- `xenvsync completion` command — generate shell completions for bash, zsh, fish, and powershell (#15)

## [v1.0.0] - 2026-03-21

### Added
- AES-256-GCM encryption/decryption of `.env` files
- `xenvsync init` — generate encryption key with 0600 permissions
- `xenvsync push` — encrypt `.env` → `.env.vault`
- `xenvsync pull` — decrypt `.env.vault` → `.env`
- `xenvsync run` — inject secrets into child process (in-memory only)
- `xenvsync diff` — preview changes between `.env` and vault
- `xenvsync status` — show sync state of xenvsync files
- Cross-platform builds via GoReleaser (Linux, macOS, Windows)
- npm package wrapper for `npm install -g @nasimstg/xenvsync`
- CI pipeline with test matrix, linting, and automated releases

[v1.10.0]: https://github.com/nasimstg/xenvsync/compare/v1.9.0...v1.10.0
[v1.9.0]: https://github.com/nasimstg/xenvsync/compare/v1.8.0...v1.9.0
[v1.8.0]: https://github.com/nasimstg/xenvsync/compare/v1.7.0...v1.8.0
[v1.7.0]: https://github.com/nasimstg/xenvsync/compare/v1.6.0...v1.7.0
[v1.6.0]: https://github.com/nasimstg/xenvsync/compare/v1.5.0...v1.6.0
[v1.5.0]: https://github.com/nasimstg/xenvsync/compare/v1.4.0...v1.5.0
[v1.4.0]: https://github.com/nasimstg/xenvsync/compare/v1.3.0...v1.4.0
[v1.3.0]: https://github.com/nasimstg/xenvsync/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/nasimstg/xenvsync/compare/v1.1.1...v1.2.0
[v1.1.1]: https://github.com/nasimstg/xenvsync/compare/v1.1.0...v1.1.1
[v1.1.0]: https://github.com/nasimstg/xenvsync/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/nasimstg/xenvsync/releases/tag/v1.0.0
