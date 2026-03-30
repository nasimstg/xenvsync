# xenvsync

Encrypt, commit, and inject `.env` secrets — no cloud required.

[![CI](https://github.com/nasimstg/xenvsync/actions/workflows/ci.yml/badge.svg)](https://github.com/nasimstg/xenvsync/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/nasimstg/xenvsync)](https://github.com/nasimstg/xenvsync/blob/main/LICENSE)

**xenvsync** encrypts your `.env` files into a `.env.vault` using **AES-256-GCM** so you can safely commit secrets to Git — while the decryption key never leaves your machine.

## Install

```bash
npm install -g @nasimstg/xenvsync
```

Or run without installing:

```bash
npx @nasimstg/xenvsync
```

The npm package automatically downloads the correct prebuilt binary for your platform (Linux, macOS, Windows — x64 and arm64).

## Quick Start

```bash
xenvsync init                    # generate key + update .gitignore
xenvsync push                    # encrypt .env → .env.vault
git add .env.vault && git commit # safe to commit

xenvsync pull                    # decrypt .env.vault → .env
xenvsync run -- npm start        # inject secrets into process (in-memory)
```

## Commands

| Command | Description |
|---------|-------------|
| `xenvsync init [--force]` | Generate a 256-bit key, add it to `.gitignore` |
| `xenvsync push` | Encrypt `.env` → `.env.vault` |
| `xenvsync pull` | Decrypt `.env.vault` → `.env` |
| `xenvsync run -- <cmd>` | Decrypt in-memory and inject into a child process |
| `xenvsync diff` | Preview changes between `.env` and the vault |
| `xenvsync status` | Show file presence, timestamps, and sync direction |
| `xenvsync export` | Decrypt vault and output as JSON, YAML, shell, tfvars, or dotenv |
| `xenvsync completion` | Generate shell completions (bash/zsh/fish/powershell) |

## Why xenvsync?

- **No cloud required** — works 100% offline, key stays on your machine
- **Single binary** — zero runtime dependencies
- **In-memory injection** — `xenvsync run` never writes plaintext to disk
- **Standard crypto** — AES-256-GCM with fresh nonce per encryption
- **Git-friendly** — commit `.env.vault`, share the key out-of-band

## Alternative Install Methods

```bash
# Go
go install github.com/nasimstg/xenvsync@latest

# Prebuilt binary
# https://github.com/nasimstg/xenvsync/releases
```

## Documentation

Full documentation: [xenvsync.softexforge.io](https://xenvsync.softexforge.io)

## License

[MIT](https://github.com/nasimstg/xenvsync/blob/main/LICENSE)
