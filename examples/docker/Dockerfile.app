# Example: Multi-stage build that uses xenvsync to inject secrets at runtime.
#
# Build:   docker build -f Dockerfile.app -t myapp .
# Run:     docker run -v /path/to/.xenvsync.key:/app/.xenvsync.key:ro myapp
#
# The .env.vault is baked into the image (safe — it's encrypted).
# The key file is mounted at runtime via a volume (never baked into the image).

FROM alpine:3.20 AS xenvsync

ARG XENVSYNC_VERSION=latest
ARG TARGETARCH

RUN apk add --no-cache curl jq && \
    if [ "$XENVSYNC_VERSION" = "latest" ]; then \
      XENVSYNC_VERSION=$(curl -s https://api.github.com/repos/nasimstg/xenvsync/releases/latest | jq -r .tag_name); \
    fi && \
    VERSION=${XENVSYNC_VERSION#v} && \
    curl -fsSL "https://github.com/nasimstg/xenvsync/releases/download/${XENVSYNC_VERSION}/xenvsync_${VERSION}_linux_${TARGETARCH}.tar.gz" \
      | tar xz -C /usr/local/bin xenvsync

# --- Your application stage ---
FROM node:20-alpine

WORKDIR /app

# Install xenvsync
COPY --from=xenvsync /usr/local/bin/xenvsync /usr/local/bin/xenvsync

# Copy your app and encrypted vault
COPY package*.json ./
RUN npm ci --production
COPY . .

# The entrypoint uses xenvsync to decrypt and inject secrets at runtime.
# Mount the key file at runtime: -v .xenvsync.key:/app/.xenvsync.key:ro
ENTRYPOINT ["xenvsync", "run", "--"]
CMD ["node", "server.js"]
