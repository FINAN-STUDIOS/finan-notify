#!/usr/bin/env sh
set -eu

root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
version=$(sed -n "s/^version '\([^']*\)'/\1/p" "$root/fxmanifest.lua")
test -n "$version"

output_dir="$root/dist"
archive="$output_dir/finan_notify-v$version.zip"
checksum="$output_dir/finan_notify-v$version.sha256"
staging=$(mktemp -d /tmp/finan-notify-release.XXXXXX)
trap 'case "$staging" in /tmp/finan-notify-release.*) rm -rf "$staging" ;; esac' EXIT HUP INT TERM

mkdir -p "$staging/finan_notify/client" "$staging/finan_notify/server" \
    "$staging/finan_notify/html" "$staging/finan_notify/locales" "$output_dir"

cp "$root/fxmanifest.lua" "$root/config.lua" "$root/README.md" \
    "$root/CHANGELOG.md" "$root/LICENSE" "$staging/finan_notify/"
cp "$root/client/client.lua" "$staging/finan_notify/client/"
cp "$root/server/server.lua" "$staging/finan_notify/server/"
cp "$root/html/index.html" "$root/html/style.css" "$root/html/app.js" "$staging/finan_notify/html/"
cp "$root"/locales/*.lua "$staging/finan_notify/locales/"

(cd "$staging" && zip -qr "$archive" finan_notify)
hash=$(shasum -a 256 "$archive" | awk '{print $1}')
printf '%s  %s\n' "$hash" "$(basename "$archive")" > "$checksum"
sh "$root/tests/package.test.sh" "$archive"
printf 'Created %s\nCreated %s\n' "$archive" "$checksum"
