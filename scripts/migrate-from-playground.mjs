#!/usr/bin/env node
/**
 * Migrates guide MDX from the Fumadocs playground into Scalar markdown.
 */
import fs from 'node:fs';
import path from 'node:path';

const PLAYGROUND = '/Users/reevu.adhikary/Documents/fumanew23dec2025';
const DOCS_DIR = path.join(PLAYGROUND, 'content/docs');
const OUT_DIR = path.join(process.cwd(), 'docs/guides');

const SKIP = new Set(['index.mdx']);

const pageTitles = {
  index: 'Welcome',
  'platform-overview': 'Platform Overview',
  quickstart: 'Quickstart',
  authentication: 'Authentication',
  environments: 'Environments',
  'error-codes': 'Error Codes',
  idempotency: 'Idempotency',
  metadata: 'Metadata',
  'api-versions': 'API Versions',
  'payment-acceptance': 'Payment Acceptance',
  'card-payments': 'Card Payments',
  'card-payments-partner-context': 'Partner Context',
  'card-payment-configurations': 'Configurations',
  'card-config-direct-merchant': 'Direct Merchant Ecommerce',
  'card-config-marketplace': 'Marketplace',
  'card-config-bill-pay': 'Bill Pay / Utility',
  'pay-by-bank': 'Pay by Bank',
  'stored-value-payments': 'Stored Value Payments',
  accounts: 'Accounts',
  wallets: 'Wallets',
  treasury: 'Treasury Vaults',
  'payment-methods': 'Payment Methods',
  beneficiaries: 'Beneficiaries & Payouts',
  identity: 'Identity (Dossier)',
  activity: 'Activity',
  'transactions-overview': 'Transactions Overview',
  'internal-transfers': 'Internal Transfers',
  'global-money-transfers': 'Global Money Transfers',
  'card-pull': 'Card Pull',
  wire: 'Wire',
  ach: 'ACH',
  'cash-loading': 'Cash Loading',
  checks: 'Checks',
  'early-release': 'Early Release of Funds',
  cards: 'Issued Cards',
  incentives: 'Incentives',
  'mock-services': 'Sandbox Testing',
  'test-kyc': 'KYC Scenarios',
  'test-cards': 'Card Issuance Testing',
  'test-payments': 'Payment Method Testing',
  'test-transfers': 'International Transfer Testing',
  'test-cash-loading': 'Cash Loading Testing',
  'test-fraud-sanctions': 'Fraud & Sanctions Testing',
  webhooks: 'Webhooks',
  plaid: 'Plaid Integration',
  changelog: 'Changelog',
};

function slugToRoute(slug) {
  return slug === 'index' ? '/guides/welcome' : `/guides/${slug}`;
}

function rewriteLinks(text) {
  return text
    .replace(/\]\(\/docs\/([^)]+)\)/g, '](/guides/$1)')
    .replace(/\]\(\/docs\)/g, '](/guides/welcome)')
    .replace(/href="\/docs\/([^"]+)"/g, 'href="/guides/$1"')
    .replace(/href="\/docs"/g, 'href="/guides/welcome"')
    .replace(/\]\(\/api-reference-v3([^)]*)\)/g, '](/api-v3$1)')
    .replace(/\]\(\/api-reference([^)]*)\)/g, '](/api-v2$1)')
    .replace(/href="\/api-reference-v3([^"]*)"/g, 'href="/api-v3$1"')
    .replace(/href="\/api-reference([^"]*)"/g, 'href="/api-v2$1"');
}

function convertCallouts(text) {
  const typeMap = { info: 'info', warn: 'warning', warning: 'warning', error: 'danger' };

  return text.replace(
    /<Callout\s+type="(\w+)">\s*([\s\S]*?)\s*<\/Callout>/g,
    (_, type, body) => {
      const scalarType = typeMap[type] ?? 'info';
      return `:::scalar-callout{type="${scalarType}"}\n${body.trim()}\n:::`;
    },
  );
}

function convertCards(text) {
  return text.replace(/<Cards>\s*([\s\S]*?)\s*<\/Cards>/g, (_, inner) => {
    const cards = [...inner.matchAll(/<Card\s+title="([^"]+)"\s+href="([^"]+)"(?:\s+description="([^"]*)")?\s*\/>/g)];
    if (cards.length === 0) return '';

    return cards
      .map(([, title, href, description]) => {
        const link = rewriteLinks(`[${title}](${href})`);
        return description ? `- ${link} — ${description}` : `- ${link}`;
      })
      .join('\n');
  });
}

function stripJsx(text) {
  let out = text;

  out = out.replace(/^import\s+.+$/gm, '');
  out = out.replace(/<CodeTabs\s*\/>/g, '');
  out = out.replace(/<DynamicCodeBlock[\s\S]*?\/>/g, '');
  out = out.replace(/<Tabs[\s\S]*?<\/Tabs>/g, '');
  out = out.replace(/<Tab[\s\S]*?<\/Tab>/g, '');

  // Drop remaining JSX/HTML blocks that can't be rendered in Scalar markdown.
  out = out.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, '');
  out = out.replace(/<[A-Za-z][^>]*\/>/g, '');
  out = out.replace(/<div[\s\S]*?<\/div>/g, '');
  out = out.replace(/<section[\s\S]*?<\/section>/g, '');
  out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  return out;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }

  return { frontmatter: match[1], body: match[2], parsed: frontmatter };
}

function convertFile(filename) {
  if (SKIP.has(filename)) return null;

  const slug = filename.replace(/\.mdx$/, '');
  const outName = slug === 'index' ? 'welcome.md' : `${slug}.md`;
  const raw = fs.readFileSync(path.join(DOCS_DIR, filename), 'utf8');
  const { frontmatter, body, parsed } = parseFrontmatter(raw);

  let content = body;
  content = convertCallouts(content);
  content = convertCards(content);
  content = stripJsx(content);
  content = rewriteLinks(content);
  content = content.replace(/\n{3,}/g, '\n\n').trim();

  const title = parsed?.title ?? pageTitles[slug] ?? slug;
  const description = parsed?.description ?? '';

  const headerLines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    '---',
    '',
    `# ${title}`,
    '',
  ].filter((line) => line !== null);

  fs.writeFileSync(
    path.join(OUT_DIR, outName),
    `${headerLines.join('\n')}${content}\n`,
  );
  return outName;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.mdx'));
const migrated = [];

for (const file of files) {
  const result = convertFile(file);
  if (result) migrated.push(result);
}

console.log(`Migrated ${migrated.length} guides to ${OUT_DIR}`);
console.log(migrated.sort().join('\n'));
