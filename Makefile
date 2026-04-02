BINARY   := xenvsync
MODULE   := github.com/nasimstg/xenvsync
VERSION  ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
COMMIT   := $(shell git rev-parse --short HEAD 2>/dev/null || echo none)
DATE     := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
LDFLAGS  := -s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.date=$(DATE)

.PHONY: help build test test-coverage vet lint clean install tidy ci-check

help:
	@echo "xenvsync Makefile targets:"
	@echo "  build          Build $(BINARY)"
	@echo "  install        Install xenvsync to GOPATH/bin"
	@echo "  test           Run tests with race detector"
	@echo "  test-coverage  Run tests with race detector + coverage output"
	@echo "  vet            Run go vet"
	@echo "  lint           Run golangci-lint (if installed)"
	@echo "  tidy           Run go mod tidy"
	@echo "  ci-check       Run local CI-equivalent checks"
	@echo "  clean          Remove local build artifacts"

build:
	go build -ldflags "$(LDFLAGS)" -o $(BINARY) .

install:
	go install -ldflags "$(LDFLAGS)" .

test:
	go test -race ./...

test-coverage:
	go test -v -race -coverprofile coverage.out ./...

vet:
	go vet ./...

lint: vet
	@command -v golangci-lint >/dev/null 2>&1 && golangci-lint run ./... || echo "golangci-lint not installed, skipping"

tidy:
	go mod tidy

ci-check:
	./scripts/ci-check.sh

clean:
	rm -f $(BINARY)
	rm -rf dist/
