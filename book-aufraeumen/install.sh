#!/usr/bin/env bash
set -euo pipefail

package_dir="$(cd "$(dirname "$0")" && pwd)"
patch_file="$package_dir/book-aufraeumen.patch"
project_dir="$(git -C "${1:-.}" rev-parse --show-toplevel)"
cd "$project_dir"

if git apply --reverse --check "$patch_file" >/dev/null 2>&1; then
  echo 'Dieser Patch ist bereits installiert.'
  exit 0
fi

# Ohne --reject: Bei Konflikten wird keine Datei teilweise gepatcht.
git apply --check "$patch_file"
if ! command -v hugo >/dev/null 2>&1; then
  echo 'Hugo wurde nicht gefunden. Bitte dieses Skript im Terminal mit deiner Hugo-Installation starten.' >&2
  exit 1
fi

build_dir="$(mktemp -d "${TMPDIR:-/tmp}/book-aufraeumen.XXXXXX")"
trap 'rm -rf "$build_dir"' EXIT

git apply "$patch_file"
echo 'Patch angewendet. Prüfe den Hugo-Build in einem temporären Ordner.'
if hugo --destination "$build_dir/public" --cacheDir "$build_dir/cache" --noBuildLock; then
  echo 'Build erfolgreich. Die Änderungen liegen uncommitted in deinem Arbeitsverzeichnis.'
  echo 'Zum Prüfen: git diff --stat und hugo server -D'
  echo 'Neue Dateien sind noch untracked. Beim späteren Commit ebenfalls aufnehmen.'
else
  echo 'Der Hugo-Build ist fehlgeschlagen. Nehme den Patch wieder zurück.' >&2
  if git apply --reverse --check "$patch_file"; then
    git apply --reverse "$patch_file"
    echo 'Patch zurückgenommen. Die Fehlermeldung des Builds steht oben.' >&2
  else
    echo 'Automatische Rücknahme nicht möglich. Bitte git diff prüfen.' >&2
  fi
  exit 1
fi
