#!/usr/bin/env bash
# install-latest-xenvsync.sh
# Installs the latest xenvsync release binary for Linux amd64 by default.
# Override with:
#   XENVSYNC_REPO=owner/repo
#   XENVSYNC_OS=linux
#   XENVSYNC_ARCH=amd64
#   XENVSYNC_INSTALL_DIR=/usr/local/bin
set -euo pipefail

REPO="${XENVSYNC_REPO:-nasimstg/xenvsync}"
OS="${XENVSYNC_OS:-linux}"
ARCH="${XENVSYNC_ARCH:-amd64}"
INSTALL_DIR="${XENVSYNC_INSTALL_DIR:-/usr/local/bin}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to install xenvsync" >&2
  exit 1
fi

if ! command -v tar >/dev/null 2>&1; then
  echo "tar is required to install xenvsync" >&2
  exit 1
fi

latest_url="$(curl -fsSL -o /dev/null -w '%{url_effective}' "https://github.com/${REPO}/releases/latest")"
tag="${latest_url##*/}"

if [ -z "${tag}" ] || [ "${tag}" = "latest" ]; then
  tag="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | sed -n 's/.*"tag_name":[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"
fi

if [ -z "${tag}" ]; then
  echo "failed to resolve latest release tag for ${REPO}" >&2
  exit 1
fi

version="${tag#v}"
archive="xenvsync_${version}_${OS}_${ARCH}.tar.gz"
url="https://github.com/${REPO}/releases/download/${tag}/${archive}"

mkdir -p "${INSTALL_DIR}"
curl -fsSL "${url}" | tar xz -C "${INSTALL_DIR}"
chmod +x "${INSTALL_DIR}/xenvsync" 2>/dev/null || true

echo "Installed xenvsync ${tag} to ${INSTALL_DIR}/xenvsync"
