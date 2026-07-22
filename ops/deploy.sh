#!/usr/bin/env bash
set -euo pipefail
ARCHIVE="${1:?Usage: deploy.sh /path/to/release.tgz}"
STAGING="$(mktemp -d /opt/tastebite/release.XXXXXX)"
trap 'rm -rf "$STAGING"' EXIT
tar -xzf "$ARCHIVE" -C "$STAGING"
find "$STAGING" -type d -name node_modules -prune -exec rm -rf {} +
chown -R www-data:www-data "$STAGING"
rm -rf /opt/tastebite/app
mv "$STAGING" /opt/tastebite/app
systemctl restart tastebite
systemctl is-active --quiet tastebite
curl --fail --retry 10 --retry-connrefused http://127.0.0.1:8000/health