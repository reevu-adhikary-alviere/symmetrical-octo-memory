#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const { children, redirects } = JSON.parse(
  fs.readFileSync('/tmp/scalar-guide-routes.json', 'utf8'),
);

const config = {
  scalar: '2.0.0',
  $schema: 'https://cdn.scalar.com/schema/scalar-config-next.json',
  publishOnMerge: true,
  insertPageTitles: false,
  assetsDir: 'docs/assets',
  siteConfig: {
    subdomain: 'my-awesome-documentation-reevu',
    routing: {
      redirects,
    },
    head: {
      links: [],
      meta: [],
      styles: [
        { path: 'docs/assets/header-layout.css' },
        { path: 'docs/assets/guides-mega-menu.css' },
        { path: 'docs/assets/guides-sidebar.css' },
        { path: 'docs/assets/apis-mega-menu.css' },
        { path: 'docs/assets/sdks-mega-menu.css' },
      ],
      scripts: [
        { path: 'docs/scripts/header-layout.js' },
        { path: 'docs/scripts/guides-mega-menu.js' },
        { path: 'docs/scripts/apis-mega-menu.js' },
        { path: 'docs/scripts/sdks-mega-menu.js' },
      ],
    },
    theme: 'purple',
    logo: {
      darkMode: 'docs/assets/logo-dark.png',
      lightMode: 'docs/assets/logo.png',
    },
  },
  versions: {
    default: {
      header: [
        { type: 'link', title: 'Guides', to: '/guides/overview/welcome' },
        { type: 'link', title: 'API Reference', to: '/api-v3' },
        { type: 'link', title: 'SDKs', to: '/guides/payment-acceptance/online-payments/alviere-checkout/introduction' },
        { type: 'link', title: 'Changelog', to: '/guides/more/changelog' },
      ],
      routes: {
        '/guides': {
          title: 'Guides',
          type: 'group',
          children,
        },
        '/api-v2': {
          title: 'API v2',
          type: 'openapi',
          filepath: 'docs/swagger_1.yaml',
          config: {},
        },
        '/api-v3': {
          title: 'API v3',
          type: 'openapi',
          filepath: 'docs/swagger_3.yaml',
          config: {},
        },
      },
    },
  },
};

fs.writeFileSync(
  path.join(ROOT, 'scalar.config.json'),
  `${JSON.stringify(config, null, 2)}\n`,
);

console.log('Updated scalar.config.json');
