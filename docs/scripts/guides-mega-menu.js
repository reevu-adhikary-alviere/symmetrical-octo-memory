(function () {
  // Mirrors fumanew23dec2025 getDocsNavColumns() — 4 columns, full guide tree.
  var MENU = [
    {
      sections: [
        {
          title: 'Overview',
          links: [
            { label: 'Welcome', href: '/guides/overview/welcome' },
            { label: 'Platform Overview', href: '/guides/overview/platform-overview' },
          ],
        },
        {
          title: 'Getting Started',
          links: [
            { label: 'Quickstart', href: '/guides/getting-started/quickstart' },
            { label: 'Authentication', href: '/guides/getting-started/authentication' },
            { label: 'Environments', href: '/guides/getting-started/environments' },
            { label: 'Error Codes', href: '/guides/getting-started/error-codes' },
            { label: 'Idempotency', href: '/guides/getting-started/idempotency' },
            { label: 'Metadata', href: '/guides/getting-started/metadata' },
            { label: 'API Versions', href: '/guides/getting-started/api-versions' },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'Resources',
          links: [
            { label: 'Accounts', href: '/guides/resources/accounts' },
            { label: 'Wallets', href: '/guides/resources/wallets' },
            { label: 'Treasury Vaults', href: '/guides/resources/treasury' },
            { label: 'Payment Methods', href: '/guides/resources/payment-methods' },
            { label: 'Beneficiaries & Payouts', href: '/guides/resources/beneficiaries' },
            { label: 'Identity (Dossier)', href: '/guides/resources/identity' },
            { label: 'Activity', href: '/guides/resources/activity' },
          ],
        },
        {
          title: 'Transactions',
          links: [
            { label: 'Overview', href: '/guides/transactions/transactions-overview' },
            { label: 'Internal Transfers', href: '/guides/transactions/internal-transfers' },
            { label: 'Global Money Transfers', href: '/guides/transactions/global-money-transfers' },
            { label: 'Card Pull', href: '/guides/transactions/card-pull' },
            { label: 'Wire', href: '/guides/transactions/wire' },
            { label: 'ACH', href: '/guides/transactions/ach' },
            { label: 'Cash Loading', href: '/guides/transactions/cash-loading' },
            { label: 'Checks', href: '/guides/transactions/checks' },
            { label: 'Early Release of Funds', href: '/guides/transactions/early-release' },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'Payment Acceptance',
          links: [
            { label: 'Overview', href: '/guides/payment-acceptance/payment-acceptance' },
            { label: 'Card payments', href: '/guides/payment-acceptance/online-payments/card-payments/introduction' },
            { label: 'Alviere Checkout', href: '/guides/payment-acceptance/online-payments/alviere-checkout/introduction' },
            { label: 'Pay by Bank', href: '/guides/payment-acceptance/online-payments/pay-by-bank/introduction' },
            { label: 'Direct merchant ecommerce', href: '/guides/payment-acceptance/use-cases/card-config-direct-merchant' },
            { label: 'Marketplace', href: '/guides/payment-acceptance/use-cases/card-config-marketplace' },
            { label: 'Bill pay & utility', href: '/guides/payment-acceptance/use-cases/card-config-bill-pay' },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'Card Issuing',
          links: [
            { label: 'Issued Cards', href: '/guides/cards/cards' },
            { label: 'Incentives', href: '/guides/cards/incentives' },
          ],
        },
        {
          title: 'Sandbox Testing',
          links: [
            { label: 'Overview', href: '/guides/sandbox-testing/mock-services' },
            { label: 'KYC Scenarios', href: '/guides/sandbox-testing/test-kyc' },
            { label: 'Card Issuance Testing', href: '/guides/sandbox-testing/test-cards' },
            { label: 'Payment Method Testing', href: '/guides/sandbox-testing/test-payments' },
            { label: 'International Transfer Testing', href: '/guides/sandbox-testing/test-transfers' },
            { label: 'Cash Loading Testing', href: '/guides/sandbox-testing/test-cash-loading' },
            { label: 'Fraud & Sanctions Testing', href: '/guides/sandbox-testing/test-fraud-sanctions' },
          ],
        },
        {
          title: 'More',
          links: [
            { label: 'Webhooks', href: '/guides/more/webhooks' },
            { label: 'Plaid Integration', href: '/guides/more/plaid' },
            { label: 'Changelog', href: '/guides/more/changelog' },
          ],
        },
      ],
    },
  ];

  var WRAPPER_ID = 'hive-guides-mega';
  var closeTimer = null;

  function isLinkActive(href) {
    var path = window.location.pathname;
    if (href === '/guides/overview/welcome') {
      return path === '/guides/overview/welcome' || path === '/guides';
    }
    return path === href || path.startsWith(href + '/');
  }

  var NAV_SELECTOR = 'nav.t-header__nav, nav.navigation';

  // Scalar renders each header label twice (an invisible copy plus the active
  // copy), so textContent comes back doubled, e.g. "GuidesGuides".
  function headerLabel(link) {
    var text = link.textContent.replace(/\s+/g, ' ').trim();
    var half = text.length / 2;
    if (text.length && text.length % 2 === 0 && text.slice(0, half) === text.slice(half)) {
      return text.slice(0, half);
    }
    return text;
  }

  function findGuidesLink() {
    var nav = document.querySelector(NAV_SELECTOR);
    if (!nav) return null;

    var links = nav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      if (headerLabel(links[i]) === 'Guides') return links[i];
    }
    return null;
  }

  function renderSection(section) {
    var block = document.createElement('div');
    block.className = 'hive-guides-mega__section';

    var heading = document.createElement('p');
    heading.className = 'hive-guides-mega__heading';
    heading.textContent = section.title;
    block.appendChild(heading);

    var list = document.createElement('ul');
    list.className = 'hive-guides-mega__list';

    section.links.forEach(function (link) {
      var item = document.createElement('li');
      var anchor = document.createElement('a');
      anchor.className = 'hive-guides-mega__link';
      if (isLinkActive(link.href)) anchor.classList.add('is-active');
      anchor.href = link.href;
      anchor.textContent = link.label;
      item.appendChild(anchor);
      list.appendChild(item);
    });

    block.appendChild(list);
    return block;
  }

  function renderColumn(column) {
    var col = document.createElement('div');
    col.className = 'hive-guides-mega__column';

    column.sections.forEach(function (section) {
      col.appendChild(renderSection(section));
    });

    return col;
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'hive-guides-mega__panel';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', 'Guides');

    var grid = document.createElement('div');
    grid.className = 'hive-guides-mega__grid';

    MENU.forEach(function (column) {
      grid.appendChild(renderColumn(column));
    });

    panel.appendChild(grid);
    return panel;
  }

  function positionPanel(wrapper) {
    var panel = wrapper._panel;
    if (!panel) return;

    var rect = wrapper.getBoundingClientRect();
    var left = Math.max(16, rect.left);
    var width = Math.min(920, window.innerWidth - 32);

    panel.style.left = left + 'px';
    panel.style.top = rect.bottom + 8 + 'px';
    panel.style.width = width + 'px';
  }

  function openMenu(wrapper) {
    clearTimeout(closeTimer);
    positionPanel(wrapper);
    wrapper.classList.add('is-open');
  }

  function closeMenu(wrapper) {
    closeTimer = setTimeout(function () {
      wrapper.classList.remove('is-open');
    }, 120);
  }

  function injectMegaMenu(link) {
    if (link.closest('#' + WRAPPER_ID)) return true;

    var wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.className = 'hive-guides-mega';

    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    link.classList.add('hive-guides-mega__trigger');
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');

    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'hive-guides-mega__chevron');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2');
    chevron.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />';
    link.appendChild(chevron);

    var panel = buildPanel();
    wrapper.appendChild(panel);
    wrapper._panel = panel;

    wrapper.addEventListener('mouseenter', function () {
      openMenu(wrapper);
      link.setAttribute('aria-expanded', 'true');
    });

    wrapper.addEventListener('mouseleave', function () {
      closeMenu(wrapper);
      link.setAttribute('aria-expanded', 'false');
    });

    panel.addEventListener('mouseenter', function () {
      openMenu(wrapper);
      link.setAttribute('aria-expanded', 'true');
    });

    panel.addEventListener('mouseleave', function () {
      closeMenu(wrapper);
      link.setAttribute('aria-expanded', 'false');
    });

    link.addEventListener('click', function (event) {
      if (window.location.pathname.startsWith('/guides/overview/welcome')) return;
      if (!wrapper.classList.contains('is-open')) {
        event.preventDefault();
        openMenu(wrapper);
        link.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        wrapper.classList.remove('is-open');
        link.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('resize', function () {
      positionPanel(wrapper);
    });

    return true;
  }

  function tryInject() {
    var link = findGuidesLink();
    if (link) return injectMegaMenu(link);
    return false;
  }

  var observer = new MutationObserver(function () {
    tryInject();
  });

  // Scalar injects this in <head>; document.body may not exist yet.
  function boot() {
    tryInject();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
