# Development Guide

This guide focuses on day-to-day contributor workflows for xenvsync.

## Prerequisites

- Go 1.25+
- Git
- (Recommended) golangci-lint
- (Recommended) govulncheck

Install optional tools:

```bash
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install golang.org/x/vuln/cmd/govulncheck@latest
```

## First-Time Setup

```bash
git clone https://github.com/nasimstg/xenvsync.git
cd xenvsync
go mod download
```

## Common Commands

Use the Makefile for discoverable tasks:

```bash
make help
make build
make test
make test-coverage
make vet
make lint
make ci-check
```

Equivalent direct commands:

```bash
go test -race ./...
go test -v -race -coverprofile coverage.out ./...
go vet ./...
golangci-lint run ./...
govulncheck ./...
```

## Local CI Parity

Run the same baseline checks used in CI:

```bash
./scripts/ci-check.sh
```

Current checks include:

- module tidy drift check
- vet
- race + coverage tests
- coverage threshold check
- lint
- vulnerability scan (if installed locally)

## Testing Conventions

### Unit tests

- Keep tests next to implementation files.
- Prefer table-driven tests for parser/crypto helpers.
- Cover malformed input and negative paths, not only round-trips.

### Command tests

- Add command tests in `cmd/*_test.go`.
- Use temporary directories and run commands via the Cobra root command.
- Verify stdout/stderr and filesystem side effects.

### High-risk behavior expectations

Always test these when touching related code:

- child exit code propagation in `run`
- signal forwarding lifecycle in `run`
- fallback merge precedence and error behavior in env loading
- rotation rollback behavior when writes fail
- decryption parse/integrity failures

## Documentation Update Rules

Update docs whenever user-visible behavior changes:

- command flags or defaults
- security-sensitive file mode behavior
- CI expectations for contributors
- vault format behavior or compatibility notes

Primary docs to keep aligned:

- `README.md`
- `CONTRIBUTING.md`
- `docs/INSTALL.md`
- `docs/ARCHITECTURE.md`

## Adding a New Command

1. Add command file in `cmd/` and register in `init()`.
2. Keep IO/crypto primitives in reusable helpers.
3. Return wrapped errors with clear context.
4. Add tests in `cmd/*_test.go` for success and failure paths.
5. Document usage in README command table if user-facing.

## Release and Packaging Notes

- CI handles test/lint/vuln gates before release.
- Keep packaging templates and install examples DRY by reusing shared scripts where possible.
- If packaging metadata changes, verify that downstream files remain consistent.
