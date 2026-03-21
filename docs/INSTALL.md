# Installation

## npm (Quickest)

```bash
# Install globally
npm install -g xenvsync

# Or run without installing
npx xenvsync
```

## From Binary Releases (Recommended)

Download the latest release for your platform from the
[Releases](../../releases) page.

### Linux / macOS

```bash
# Download (replace VERSION and PLATFORM)
curl -LO https://github.com/nasimstg/xenvsync/releases/download/vVERSION/xenvsync_VERSION_PLATFORM.tar.gz

# Extract
tar xzf xenvsync_VERSION_PLATFORM.tar.gz

# Move to PATH
sudo mv xenvsync /usr/local/bin/
```

### Windows

Download the `.zip` from the releases page, extract it, and add the
directory to your `PATH`.

## From Source

Requires Go 1.22+.

```bash
go install github.com/nasimstg/xenvsync@latest
```

Or clone and build locally:

```bash
git clone https://github.com/nasimstg/xenvsync.git
cd xenvsync
go build -o xenvsync .
```

## Quick Start

```bash
# 1. Initialize — generates .xenvsync.key and updates .gitignore
xenvsync init

# 2. Create your .env file
echo "DB_HOST=localhost" >> .env
echo "SECRET=hunter2"    >> .env

# 3. Encrypt → safe to commit
xenvsync push

# 4. On another machine (after cloning + copying the key)
xenvsync pull

# 5. Run a process with injected secrets (never writes .env)
xenvsync run -- python app.py
```

## Verifying Installation

```bash
xenvsync --help
```

## Upgrading

Replace the binary with the newer version. Configuration files
(`.xenvsync.key`, `.env.vault`) are forward-compatible.
