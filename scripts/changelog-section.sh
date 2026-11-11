#!/usr/bin/env bash
# Prints the CHANGELOG.md entry of one version (without its heading), e.g. for
# release notes: ./scripts/changelog-section.sh 7.0.2
# nx writes "## X.Y.Z (date)" for minor/patch and "# X.0.0 (date)" for major releases.
set -euo pipefail

VERSION="${1:?Usage: $0 <version> [changelog file]}"
FILE="${2:-CHANGELOG.md}"

awk -v version="$VERSION" '
  /^#{1,2} [0-9]+\.[0-9]+\.[0-9]+/ {
    if (found) exit
    if ($2 == version) { found = 1; next }
  }
  found { print }
  END { if (!found) exit 1 }
' "$FILE" | sed -e '/./,$!d' | sed -e ':a' -e '/^\n*$/{$d;N;ba' -e '}'
