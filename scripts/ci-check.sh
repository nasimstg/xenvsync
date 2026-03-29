#!/usr/bin/env bash
# ci-check.sh — Run the same checks as GitHub Actions CI locally.
# Usage: ./scripts/ci-check.sh
set -euo pipefail

echo "=== CI Check: Vet ==="
go vet ./...

echo ""
echo "=== CI Check: Test (race detector + coverage) ==="
go test -v -race -coverprofile coverage.out ./...

echo ""
echo "=== CI Check: Lint (golangci-lint) ==="
golangci-lint run

echo ""
echo "=== All CI checks passed ==="
