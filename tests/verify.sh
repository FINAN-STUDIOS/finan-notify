#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

required_files='fxmanifest.lua config.lua client/client.lua server/server.lua html/index.html html/style.css html/app.js locales/de.lua locales/en.lua locales/fr.lua locales/es.lua README.md CHANGELOG.md LICENSE .gitignore'
for file in $required_files; do
    test -s "$file" || { echo "Missing or empty: $file" >&2; exit 1; }
done

grep -q "version '1.0.2'" fxmanifest.lua
grep -q "ui_page 'html/index.html'" fxmanifest.lua
grep -q "exports('Notify'" client/client.lua
grep -q "finan_notify:notify" client/client.lua
grep -q "RegisterNUICallback('ready'" client/client.lua
grep -q "NotifyPlayer" server/server.lua
grep -q "maxQueued" config.lua
grep -q "normalizeNotification" html/app.js

if grep -q "finan_notify:server:notify" server/server.lua README.md; then
    echo 'Public server notification event must not be present.' >&2
    exit 1
fi

if command -v luac >/dev/null 2>&1; then
    luac -p fxmanifest.lua config.lua locales/*.lua client/client.lua server/server.lua
else
    echo 'SKIP: Lua syntax check (luac unavailable).'
fi

if command -v node >/dev/null 2>&1; then
    node --check html/app.js
    node tests/nui.test.js
    node tests/regression.test.js
else
    echo 'SKIP: JavaScript checks (node unavailable).'
fi

echo 'Available FINAN Notify checks passed; review any SKIP messages above.'
