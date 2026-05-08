'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT  = path.join(ROOT, '_site');

// Nav content from source partial
const navContent = fs.readFileSync(path.join(ROOT, 'Partials', 'nav.html'), 'utf8');

// Matches all four known variants of the nav div + fetch script:
//   - single or double quotes on id="site-nav"
//   - lowercase or uppercase P in /partials/nav.html
//   - multi-line arrow callback, compact arrow callback, function() style, minified
const NAV_FETCH = /<div id=['"]site-nav['"]><\/div>[\s\S]*?<script>[\s\S]*?fetch\(['"][^'"]*nav\.html['"]\)[\s\S]*?<\/script>/;

// Reset output directory
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const entries = fs.readdirSync(ROOT, { withFileTypes: true });

// Copy non-HTML assets (images, etc.) straight to _site
for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (entry.name.startsWith('.')) continue;
  if (['_site', 'Partials', 'build.js', 'netlify.toml', 'package.json'].includes(entry.name)) continue;
  if (entry.name.endsWith('.html')) continue;

  fs.copyFileSync(path.join(ROOT, entry.name), path.join(OUT, entry.name));
  console.log(`copied  ${entry.name}`);
}

// Process every HTML file — inject nav inline, remove fetch block
let injected = 0;
let unchanged = 0;

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

  let src = fs.readFileSync(path.join(ROOT, entry.name), 'utf8');

  if (NAV_FETCH.test(src)) {
    src = src.replace(NAV_FETCH, navContent);
    injected++;
    console.log(`inlined ${entry.name}`);
  } else {
    unchanged++;
    console.log(`skipped ${entry.name}  (no fetch pattern found)`);
  }

  fs.writeFileSync(path.join(OUT, entry.name), src, 'utf8');
}

console.log(`\nDone — ${injected} files had nav inlined, ${unchanged} had no fetch pattern.`);
console.log(`Output: _site/  (${injected + unchanged} HTML files total)`);
