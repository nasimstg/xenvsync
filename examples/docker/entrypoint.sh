#!/bin/sh
# Example entrypoint script for existing applications.
# Decrypts secrets and exports them before running the main process.
#
# Usage in Dockerfile:
#   COPY entrypoint.sh /entrypoint.sh
#   RUN chmod +x /entrypoint.sh
#   ENTRYPOINT ["/entrypoint.sh"]
#   CMD ["your-app"]

set -e

# Decrypt and inject secrets via xenvsync run (safer than eval).
if [ -f ".env.vault" ] && command -v xenvsync >/dev/null 2>&1; then
  echo "xenvsync: decrypting vault..."
  exec xenvsync run -- "$@"
fi

# Execute the main command.
exec "$@"
