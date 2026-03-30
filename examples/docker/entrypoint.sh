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

# Decrypt and export all variables from the vault.
if [ -f ".env.vault" ] && command -v xenvsync >/dev/null 2>&1; then
  echo "xenvsync: decrypting vault..."
  eval "$(xenvsync export --format=shell)"
fi

# Execute the main command.
exec "$@"
