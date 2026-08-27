#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const { redirects } = JSON.parse(
  fs.readFileSync('/tmp/scalar-guide-routes.json', 'utf8'),
);

const files = [
  ...fs.globSync('docs/guides/*.md', { cwd: ROOT }),
  'docs/scripts/guides-mega-menu.js',
  'docs/guides/welcome.md',
];

function rewrite(content) {
  let next = content;
  const sorted = [...redirects].sort((a, b) => b.from.length - a.from.length);

  for (const { from, to } of sorted) {
    const pattern = new RegExp(`${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[)"'\\s#?]|$)`, 'g');
    next = next.replace(pattern, to);
  }

  next = next.replace(/\/guides\/payment-acceptance\/payment-acceptance\//g, '/guides/payment-acceptance/');
  next = next.replace(/\/guides\/cards\/cards\//g, '/guides/cards/');

  return next;
}

let updated = 0;

for (const rel of files) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;

  const before = fs.readFileSync(file, 'utf8');
  const after = rewrite(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    updated += 1;
  }
}

console.log(`Updated links in ${updated} files`);
