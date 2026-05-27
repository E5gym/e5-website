'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, '_site');
const PARTIALS = path.join(ROOT, 'Partials');

const navContent = fs.readFileSync(path.join(PARTIALS, 'nav.html'), 'utf8');
const footerContent = fs.readFileSync(path.join(PARTIALS, 'footer.html'), 'utf8');

const NAV_FETCH = /<div id=['"]site-nav['"]><\/div>[\s\S]*?<script>[\s\S]*?fetch\(['"][^'"]*nav\.html['"]\)[\s\S]*?<\/script>/;
const FOOTER_FETCH = /<div id=['"]site-footer['"][^>]*><\/div>[\s\S]*?<script>[\s\S]*?fetch\(['"][^'"]*footer\.html['"]\)[\s\S]*?<\/script>/;

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const entries = fs.readdirSync(ROOT, { withFileTypes: true });

// Publish shared partials so absolute fetch paths resolve in _site if needed.
const outPartials = path.join(OUT, 'Partials');
fs.mkdirSync(outPartials, { recursive: true });
for (const partial of ['nav.html', 'footer.html']) {
  fs.copyFileSync(path.join(PARTIALS, partial), path.join(outPartials, partial));
  console.log(`copied  Partials/${partial}`);
}

// Publish hidden/internal static experiences that live outside the root page list.
copyDir(path.join(ROOT, 'kiosk'), path.join(OUT, 'kiosk'));
console.log('copied  kiosk/');
copyDir(path.join(ROOT, 'coach-home'), path.join(OUT, 'coach-home'));
console.log('copied  coach-home/');

for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (entry.name.startsWith('.')) continue;
  if (['_site', 'Partials', 'build.js', 'netlify.toml', 'package.json'].includes(entry.name)) continue;
  if (entry.name.endsWith('.html')) continue;

  fs.copyFileSync(path.join(ROOT, entry.name), path.join(OUT, entry.name));
  console.log(`copied  ${entry.name}`);
}

let navInjected = 0;
let footerInjected = 0;
let unchanged = 0;
let htmlTotal = 0;

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

  htmlTotal++;
  let src = fs.readFileSync(path.join(ROOT, entry.name), 'utf8');
  const hadNavFetch = NAV_FETCH.test(src);
  const hadFooterFetch = FOOTER_FETCH.test(src);

  if (hadNavFetch) {
    src = src.replace(NAV_FETCH, navContent);
    navInjected++;
    console.log(`nav     ${entry.name}`);
  }

  if (hadFooterFetch) {
    src = src.replace(FOOTER_FETCH, footerContent);
    footerInjected++;
    console.log(`footer  ${entry.name}`);
  }

  if (!hadNavFetch && !hadFooterFetch) {
    unchanged++;
    console.log(`skipped ${entry.name}  (no fetch pattern found)`);
  }

  fs.writeFileSync(path.join(OUT, entry.name), src, 'utf8');
}

console.log(`\nDone - ${navInjected} files had nav inlined, ${footerInjected} files had footer inlined, ${unchanged} had no fetch pattern.`);
console.log(`Output: _site/  (${htmlTotal} HTML files total)`);
