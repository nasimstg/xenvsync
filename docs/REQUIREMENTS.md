# Product Requirements Document: XEnvSync LI

## Vision
A fast, cross-platform CLI tool to securely encrypt, sync, and inject environment variables for local development without relying on centralized cloud secret managers. It utilizes Git as the storage mechanism by encrypting `.env` files into `.env.vault` files.

## Core Commands
1. `init`: Scaffolds the project. Generates a strong symmetric key (AES-256-GCM) saved to `.envsync.key` and adds it to `.gitignore`.
2. `push` (or `encrypt`): Reads the local `.env` file, encrypts its contents using the local key, and outputs `.env.vault`.
3. `pull` (or `decrypt`): Reads `.env.vault`, decrypts it using `.envsync.key`, and writes a local `.env` file.
4. `run`: Reads the vault, decrypts variables in-memory, and spawns a child process with those variables injected into the environment.

## Security Constraints
- Keys must NEVER be committed to version control.
- Use standard, proven cryptographic libraries (AES-256-GCM).
- Vault files must be deterministic (or handle diffs gracefully) to avoid massive Git conflicts on every encryption.