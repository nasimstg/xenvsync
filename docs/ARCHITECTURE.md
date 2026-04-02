# xenvsync Architecture

## Design Goals

xenvsync is built around a local-first security model:

1. Keep secrets out of Git history by encrypting environment files.
2. Keep decryption material local by default.
3. Make common workflows simple (init, push, pull, run).
4. Preserve cross-platform behavior (Linux, macOS, Windows).
5. Keep implementation understandable and testable.

## Core Stack

- Language: Go
- CLI framework: Cobra
- Symmetric crypto: AES-256-GCM
- Team sharing crypto: X25519 + per-recipient key slots (V2 vault)

## Repository Layout

```
xenvsync/
├── main.go                  # CLI bootstrap and process exit behavior
├── cmd/                     # User-facing commands and orchestration
│   ├── root.go              # Root command registration
│   ├── init.go              # Key generation and .gitignore updates
│   ├── push.go              # Encrypt .env -> .env.vault
│   ├── pull.go              # Decrypt .env.vault -> .env
│   ├── run.go               # In-memory injection into child process
│   ├── diff.go              # Key-level drift comparison
│   ├── status.go            # Local file state and sync hints
│   ├── verify.go            # Structural + decrypt integrity checks
│   ├── doctor.go            # Security posture checks
│   ├── rotate.go            # Key rotation and re-encryption
│   ├── team.go              # Team roster management
│   ├── keygen.go            # User identity generation (X25519)
│   ├── vaultutil.go         # Shared vault decrypt/encrypt helpers
│   └── *_test.go            # Command integration-style tests
├── internal/
│   ├── crypto/              # AES, X25519, multi-key, passphrase helpers
│   ├── env/                 # .env parser and serializer
│   ├── team/                # Team roster model and persistence
│   └── vault/               # V1/V2 vault encoding and parsing
├── scripts/                 # Local CI parity and utility scripts
├── examples/ci/             # CI provider usage examples
└── docs/                    # User and contributor documentation
```

## Trust Boundaries and Sensitive Assets

### Plaintext secrets

- Source: `.env`, `.env.<name>`, `.env.shared`, `.env.local`
- Risk: accidental commit, local file disclosure, process memory residency

### Encrypted vaults

- Files: `.env.vault`, `.env.<name>.vault`
- Intended to be safe for VCS storage
- Still sensitive for metadata (variable names and change frequency)

### Local decryption material

- V1 key file: `.xenvsync.key`
- V2 identity file: `~/.xenvsync/identity`
- Must remain local and permission-restricted

### Team metadata

- Roster file: `.xenvsync-team.json`
- Non-secret, but integrity-sensitive (controls decryption access)

## Command Execution Model

1. `main.go` wires build metadata and calls `cmd.Execute()`.
2. `cmd/root.go` runs Cobra and returns typed errors.
3. Commands use shared helpers in `cmd/vaultutil.go`, `cmd/keyutil.go`, `cmd/envname.go`.
4. For child-process execution (`run`), command-specific exit codes are propagated via `ExitCodeCarrier`.

## Primary Workflow Flows

### 1) Initialization

`xenvsync init`

1. Generate 256-bit random key.
2. Optionally passphrase-wrap key material.
3. Write key file with restricted mode.
4. Ensure `.xenvsync.key` and `.env` are in `.gitignore`.

### 2) Encrypt (push)

`xenvsync push [--env <name>]`

1. Resolve target files from env flags/defaults.
2. Load `.env` layers (`.env.shared`, primary, `.env.local`) unless `--no-fallback`.
3. Marshal to canonical env payload.
4. Encrypt:
  - V1: AES-GCM with local symmetric key.
  - V2: random symmetric key sealed per recipient key slot.
5. Write vault output.

### 3) Decrypt (pull)

`xenvsync pull [--env <name>]`

1. Resolve vault input and env output paths.
2. Decrypt V1 or V2 vault content.
3. Parse to validate payload correctness.
4. Write plaintext file (owner-only mode).

### 4) In-memory run

`xenvsync run -- <cmd> [args...]`

1. Decrypt vault in memory.
2. Parse env key/value pairs.
3. Merge vars into child environment.
4. Start child process and forward SIGINT/SIGTERM.
5. Preserve child exit code for parent process.

### 5) Rotation

`xenvsync rotate [--revoke <member>]`

1. Decrypt current vault.
2. Re-encrypt with fresh material:
  - V1: new symmetric key.
  - V2: new per-recipient key slots.
3. On V1 key-write failures, restore previous vault/key state.

## Vault Format Overview

### V1 format (`internal/vault/vault.go`)

- Header/footer wrapped base64 payload
- Payload is AES-GCM output with nonce prefix

### V2 format (`internal/vault/v2.go`)

- Header marks V2 vault
- JSON key slot list
- Data separator
- Base64 ciphertext block

Each key slot stores:

- recipient name
- ephemeral public key (base64)
- encrypted symmetric key (base64)

## Security Boundaries in Code

### Key handling

- Key loading is centralized in `cmd/keyutil.go`.
- Permission checks warn on unsafe modes.
- Sensitive key bytes are zeroed after use.

### Plaintext handling

- Decrypted payloads are kept in-memory where possible.
- Commands defer byte-slice zeroization for decrypted payloads and transient key material.
- `run` injects vars into child process without writing plaintext env files.

### Parse and integrity checks

- `verify` validates vault structure and can authenticate full decrypt path.
- `doctor` audits setup risk signals (permissions, gitignore, staleness).

## Error Handling and Exit Behavior

- Commands return contextual errors using wrapping.
- `run` maps child non-zero exits to typed exit-code errors.
- Root command suppresses noisy output for intentionally quiet exit-code propagation errors.

## Testing Strategy and Conventions

### Unit tests

- Located with implementation in `internal/*/*_test.go`.
- Focus on deterministic crypto/env/vault behavior and malformed input handling.

### Command tests

- Located in `cmd/*_test.go`.
- Use temporary directories and realistic command invocation via Cobra root command.
- Validate end-to-end behavior for init/push/pull/run/status/envs/diff/verify/doctor/log/team flows.

### CI expectations

- Tests run with race detection.
- Coverage threshold is enforced.
- Lint and vulnerability checks run in CI.

## Extension Guidance

When adding a command:

1. Keep orchestration in `cmd/<command>.go`.
2. Put reusable logic in shared helpers or `internal/*` packages.
3. Return wrapped, actionable errors.
4. Add command-level tests for success and failure paths.
5. Update docs and examples if behavior is user-visible.

When changing crypto or vault formats:

1. Preserve backward compatibility where possible.
2. Add migration and round-trip tests.
3. Document trust/compatibility implications in release notes.