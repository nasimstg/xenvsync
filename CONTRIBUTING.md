# Contributing to xenvsync

Thank you for considering contributing to xenvsync! Here's how to get started.

## Development Setup

1. **Fork and clone** the repository.
2. Ensure you have **Go 1.22+** installed.
3. Install dependencies:
   ```bash
   go mod download
   ```
4. Run the tests:
   ```bash
   go test -race ./...
   ```

## Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/my-change
   ```
2. Make your changes — keep commits focused and atomic.
3. Add or update tests for any new or changed behavior.
4. Ensure all tests pass:
   ```bash
   go test -race ./...
   go vet ./...
   ```
5. Open a pull request against `main`.

## Code Style

- Follow standard Go conventions (`gofmt`, `go vet`).
- Keep functions small and well-named.
- Add comments only where the logic isn't self-evident.

## Commit Messages

- Use the imperative mood: "Add feature" not "Added feature".
- Keep the first line under 72 characters.
- Reference issues when applicable: `Fix #42`.

## Reporting Issues

- Use [GitHub Issues](../../issues) to report bugs or request features.
- Include steps to reproduce, expected vs. actual behavior, and your OS/Go version.

## Security

If you discover a security vulnerability, please report it privately via [GitHub Security Advisories](../../security/advisories/new) rather than opening a public issue.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
