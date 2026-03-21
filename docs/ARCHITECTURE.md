# Architecture & Tech Stack

## Stack
- **Language**: Go
- **CLI Framework**: Cobra
- **Cryptography**: Standard AES-256-GCM for symmetric encryption.

## Data Flow
- **Encryption**: Plaintext `.env` -> Parse into Key/Value -> Encrypt with Key -> JSON/String output -> write to `.env.vault`.
- **In-Memory Injection**: `envsync run -- python app.py` 
  1. CLI intercepts command.
  2. Reads `.envsync.key` and `.env.vault`.
  3. Decrypts variables.
  4. Merges with `process.env` (or OS env).
  5. Executes `python app.py` as a child process with the modified environment.