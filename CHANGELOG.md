# Changelog

All notable changes to this project will be documented in this file.

## [v1.2.0] - 2026-03-30

### Added
- Multi-environment support with `--env` flag on push, pull, run, diff, status, and export commands (#1)
- `xenvsync envs` command — discover and list all environments with sync status (#3)
- `XENVSYNC_ENV` environment variable as fallback for `--env` flag
- Named environment file convention: `.env.<name>` / `.env.<name>.vault`
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

[v1.2.0]: https://github.com/nasimstg/xenvsync/compare/v1.1.1...v1.2.0
[v1.1.1]: https://github.com/nasimstg/xenvsync/compare/v1.1.0...v1.1.1
[v1.1.0]: https://github.com/nasimstg/xenvsync/compare/v1.0.0...v1.1.0
[v1.0.0]: https://github.com/nasimstg/xenvsync/releases/tag/v1.0.0
