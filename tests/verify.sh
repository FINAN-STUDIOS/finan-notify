#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

required_files='fxmanifest.lua config.lua client/client.lua server/server.lua html/index.html html/style.css html/app.js locales/de.lua locales/en.lua README.md CHANGELOG.md LICENSE .gitignore'
for file in $required_files; do
    test -s "$file" || { echo "Missing or empty: $file" >&2; exit 1; }
done

grep -q "version '1.0.0'" fxmanifest.lua
grep -q "ui_page 'html/index.html'" fxmanifest.lua
grep -q "exports('Notify'" client/client.lua
grep -q "finan_notify:notify" client/client.lua
grep -q "RegisterNUICallback('ready'" client/client.lua
grep -q "NotifyPlayer" server/server.lua

if command -v luac >/dev/null 2>&1; then
    luac -p fxmanifest.lua config.lua locales/de.lua locales/en.lua client/client.lua server/server.lua
fi

if command -v node >/dev/null 2>&1; then
    node --check html/app.js
fi

echo 'FINAN Notify verification passed.'
