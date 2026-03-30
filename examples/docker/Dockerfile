# Minimal Alpine image with xenvsync pre-installed.
# Build: docker build -t xenvsync .
# Usage: docker run --rm xenvsync version
FROM alpine:3.20 AS downloader

ARG XENVSYNC_VERSION=latest
ARG TARGETARCH

RUN apk add --no-cache curl jq && \
    if [ "$XENVSYNC_VERSION" = "latest" ]; then \
      XENVSYNC_VERSION=$(curl -s https://api.github.com/repos/nasimstg/xenvsync/releases/latest | jq -r .tag_name); \
    fi && \
    VERSION=${XENVSYNC_VERSION#v} && \
    curl -fsSL "https://github.com/nasimstg/xenvsync/releases/download/${XENVSYNC_VERSION}/xenvsync_${VERSION}_linux_${TARGETARCH}.tar.gz" \
      | tar xz -C /usr/local/bin xenvsync && \
    chmod +x /usr/local/bin/xenvsync

FROM alpine:3.20

RUN apk add --no-cache ca-certificates

COPY --from=downloader /usr/local/bin/xenvsync /usr/local/bin/xenvsync

ENTRYPOINT ["xenvsync"]
