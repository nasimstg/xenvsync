#!/usr/bin/env bash
# ci-check.sh — Run the same checks as GitHub Actions CI locally.
# Usage: ./scripts/ci-check.sh
set -euo pipefail

echo "=== CI Check: go.mod/go.sum tidy drift ==="
go mod tidy
git diff --exit-code go.mod go.sum

echo "=== CI Check: Vet ==="
go vet ./...

echo ""
echo "=== CI Check: Test (race detector + coverage) ==="
go test -v -race -coverprofile coverage.out ./...

echo ""
echo "=== CI Check: Coverage threshold (80%) ==="
COVERAGE=$(go tool cover -func=coverage.out | awk '/^total:/ {gsub("%", "", $3); print $3}')
echo "Total coverage: ${COVERAGE}%"
awk -v cov="$COVERAGE" 'BEGIN { if (cov < 80) exit 1 }'

echo ""
echo "=== CI Check: Lint (golangci-lint) ==="
golangci-lint run

echo ""
echo "=== CI Check: Vulnerability scan (govulncheck) ==="
if command -v govulncheck >/dev/null 2>&1; then
	govulncheck ./...
else
	echo "govulncheck not installed, skipping"
fi

echo ""
echo "=== All CI checks passed ==="
