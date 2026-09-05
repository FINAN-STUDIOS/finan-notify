#!/usr/bin/env sh
set -eu

archive=${1:?Usage: sh tests/package.test.sh <archive.zip>}
unzip -t "$archive" >/dev/null

listing=$(unzip -Z1 "$archive")
for required in \
    finan_notify/fxmanifest.lua \
    finan_notify/config.lua \
    finan_notify/client/client.lua \
    finan_notify/server/server.lua \
    finan_notify/html/index.html \
    finan_notify/html/style.css \
    finan_notify/html/app.js \
    finan_notify/locales/en.lua \
    finan_notify/locales/de.lua \
    finan_notify/locales/fr.lua \
    finan_notify/locales/es.lua \
    finan_notify/README.md \
    finan_notify/CHANGELOG.md \
    finan_notify/LICENSE; do
    printf '%s\n' "$listing" | grep -qx "$required" || { echo "Missing: $required" >&2; exit 1; }
done

if printf '%s\n' "$listing" | grep -Eq '(^|/)(tests|release|scripts|\.git)(/|$)|\.sha256$|\.zip$'; then
    echo 'Development or nested release files found in customer archive.' >&2
    exit 1
fi

echo 'Minimal Cfx archive content verified.'
