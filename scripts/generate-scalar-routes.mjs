#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const meta = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'docs/guides-meta.json'), 'utf8'),
);

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

const icons = {
  index: 'phosphor/regular/book-open',
  quickstart: 'phosphor/regular/rocket-launch',
  authentication: 'phosphor/regular/lock-key',
  environments: 'phosphor/regular/flask',
  webhooks: 'phosphor/regular/bell',
  changelog: 'phosphor/regular/list-bullets',
};

function sectionKey(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pageSlug(entry) {
  return entry === 'index' ? 'welcome' : entry;
}

function guidePath(section, entry) {
  return `/guides/${section}/${pageSlug(entry)}`;
}

function pageRoute(entry) {
  const slug = pageSlug(entry);
  return {
    type: 'page',
    filepath: `docs/guides/${slug}.md`,
    title: pageTitles[entry] ?? entry,
    ...(icons[entry] ? { icon: icons[entry] } : {}),
  };
}

const sections = [];
let current = { title: 'Overview', entries: [] };

for (const entry of meta.pages) {
  if (typeof entry !== 'string') continue;

  const sectionMatch = entry.match(/^---(.+)---$/);
  if (sectionMatch) {
    if (current.entries.length > 0) sections.push(current);
    current = { title: sectionMatch[1], entries: [] };
    continue;
  }

  current.entries.push(entry);
}

if (current.entries.length > 0) sections.push(current);

const children = {};
const redirects = [];
const paths = {};

for (const section of sections) {
  const key = sectionKey(section.title);
  const sectionChildren = {};

  for (const entry of section.entries) {
    const slug = pageSlug(entry);
    sectionChildren[`/${slug}`] = pageRoute(entry);

    const oldPath = `/guides/${slug}`;
    const newPath = guidePath(key, entry);
    paths[entry] = newPath;
    if (oldPath !== newPath) {
      redirects.push({ from: oldPath, to: newPath });
    }
  }

  children[`/${key}`] = {
    type: 'group',
    title: section.title,
    mode: 'flat',
    children: sectionChildren,
  };
}

const output = { children, redirects, paths };
fs.writeFileSync('/tmp/scalar-guide-routes.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${sections.length} sidebar sections, ${redirects.length} redirects`);
