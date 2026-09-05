'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html = read('html/index.html');
const css = read('html/style.css');

assert.doesNotMatch(html, /<meta\b[^>]*name\s*=\s*["']color-scheme["']/i);
assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /\bcolor-scheme\s*:/i);
assert.match(css, /html,\s*body\s*\{[^}]*background:\s*transparent\s*;/);
assert.match(read('fxmanifest.lua'), /version '1\.0\.2'/);

for (const locale of ['en', 'de', 'fr', 'es']) {
    const source = read(`locales/${locale}.lua`);
    assert.ok(source.includes(`Locales.${locale} = {`));
    for (const type of ['success', 'error', 'info', 'warning']) {
        assert.match(source, new RegExp(`${type} = '[^']+'`));
    }
}

console.log('Transparency, locale completeness and version regressions passed.');
