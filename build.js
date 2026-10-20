'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, '_site');
const PARTIALS = path.join(ROOT, 'Partials');
const CONFIG_PATH = path.join(ROOT, 'launch.config.js');

const launchConfig = require(CONFIG_PATH);
const allowedLaunchPhases = new Set(['current', 'enrolling']);

function failBuild(message) {
  throw new Error(`Launch config error: ${message}`);
}

function readLaunchConfig(config) {
  if (!config || typeof config !== 'object') {
    failBuild('launch.config.js must export an object.');
  }

  const phase = config.launchPhase;
  if (!allowedLaunchPhases.has(phase)) {
    failBuild(`launchPhase must be one of: ${Array.from(allowedLaunchPhases).join(', ')}.`);
  }

  if (!config.phases || typeof config.phases !== 'object') {
    failBuild('phases must be defined.');
  }

  const values = config.phases[phase];
  if (!values || typeof values !== 'object') {
    failBuild(`phases.${phase} must be defined.`);
  }

  const launch = {
    launchPhase: phase,
    openingDateDisplay: values.openingDateDisplay || '',
    enrollmentLaunchDateDisplay: values.enrollmentLaunchDateDisplay || '',
    enrollmentCtaLabel: values.enrollmentCtaLabel || '',
    enrollmentCtaUrl: values.enrollmentCtaUrl || '',
    showJanuaryEnrollmentSections: Boolean(values.showJanuaryEnrollmentSections)
  };

  if (phase === 'enrolling') {
    for (const key of [
      'openingDateDisplay',
      'enrollmentLaunchDateDisplay',
      'enrollmentCtaLabel',
      'enrollmentCtaUrl'
    ]) {
      if (!String(launch[key]).trim()) {
        failBuild(`launchPhase "enrolling" requires ${key}.`);
      }
    }
  }

  return launch;
}

const launch = readLaunchConfig(launchConfig);
const launchKeys = new Set(Object.keys(launch));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLaunchTemplate(src, sourceName) {
  let rendered = src.replace(
    /<!--\s*launch-if\s+([a-zA-Z0-9_]+)\s*-->([\s\S]*?)<!--\s*\/launch-if\s*-->/g,
    function (_match, key, body) {
      if (!launchKeys.has(key)) {
        failBuild(`${sourceName} references unknown launch flag "${key}".`);
      }
      return launch[key] ? body : '';
    }
  );

  rendered = rendered.replace(/\{\{\s*launch\.([a-zA-Z0-9_]+)\s*\}\}/g, function (_match, key) {
    if (!launchKeys.has(key)) {
      failBuild(`${sourceName} references unknown launch value "${key}".`);
    }
    return escapeHtml(launch[key]);
  });

  const unreplacedToken = rendered.match(/\{\{\s*launch\.[^}]+\}\}/);
  if (unreplacedToken) {
    failBuild(`${sourceName} contains an unresolved launch token: ${unreplacedToken[0]}`);
  }

  return rendered;
}

const navContent = renderLaunchTemplate(
  fs.readFileSync(path.join(PARTIALS, 'nav.html'), 'utf8'),
  'Partials/nav.html'
);
const footerContent = renderLaunchTemplate(
  fs.readFileSync(path.join(PARTIALS, 'footer.html'), 'utf8'),
  'Partials/footer.html'
);

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
  const content = partial === 'nav.html' ? navContent : footerContent;
  fs.writeFileSync(path.join(outPartials, partial), content, 'utf8');
  console.log(`copied  Partials/${partial}`);
}

// Publish image assets referenced by the site pages.
copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
console.log('copied  assets/');

// Publish hidden/internal static experiences that live outside the root page list.
copyDir(path.join(ROOT, 'kiosk'), path.join(OUT, 'kiosk'));
console.log('copied  kiosk/');
copyDir(path.join(ROOT, 'coach-home'), path.join(OUT, 'coach-home'));
console.log('copied  coach-home/');

for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (entry.name.startsWith('.')) continue;
  if (['_site', 'Partials', 'build.js', 'launch.config.js', 'netlify.toml', 'package.json'].includes(entry.name)) continue;
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
  if (entry.name === 'store.html') continue;

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

  src = renderLaunchTemplate(src, entry.name);

  if (!hadNavFetch && !hadFooterFetch) {
    unchanged++;
    console.log(`skipped ${entry.name}  (no fetch pattern found)`);
  }

  fs.writeFileSync(path.join(OUT, entry.name), src, 'utf8');
}

console.log(`\nDone - ${navInjected} files had nav inlined, ${footerInjected} files had footer inlined, ${unchanged} had no fetch pattern.`);
console.log(`Output: _site/  (${htmlTotal} HTML files total)`);
