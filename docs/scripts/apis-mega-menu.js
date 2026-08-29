(function () {
  var VERSIONS = {
    v3: { label: 'V3', base: '/api-v3' },
    v2: { label: 'V2', base: '/api-v2' },
  };

  // Every `tag` below must match a non-internal tag declared in the spec that
  // version renders: docs/swagger_3.yaml for V3, docs/swagger_1.yaml for V2.
  // A tag that does not exist there renders a 404, so entries with no matching
  // tag are linked to their guide with `href` instead. In V3 that is
  // Beneficiaries and Webhooks, both x-internal: true. In V2 it is Activities
  // and Cash Loading, which have guides but no tag of their own.
  var MENU_V3 = [
    {
      title: 'Payment Acceptance',
      links: [
        { label: 'Overview', href: '/api-v3' },
        { label: 'Card Payments', tag: 'card-payments' },
        { label: 'Bank Payments', tag: 'bank-payments' },
        { label: 'Legal Texts', tag: 'legal-texts' },
      ],
    },
    {
      title: 'Fees & Scheduling',
      links: [
        { label: 'Fee Rules', tag: 'fee-rules' },
        { label: 'Scheduled Payments', tag: 'scheduled-payments' },
        { label: 'Batches', tag: 'batches' },
      ],
    },
    {
      title: 'Platform & Operations',
      links: [
        { label: 'Authentication', tag: 'authentication' },
        { label: 'Transactions', tag: 'transactions' },
        { label: 'Webhooks', href: '/guides/more/webhooks' },
      ],
    },
  ];

  var MENU_V2 = [
    {
      title: 'Core Platform',
      links: [
        { label: 'Overview', href: '/api-v2' },
        { label: 'Authentication', tag: 'authentication' },
        { label: 'Accounts', tag: 'accounts' },
        { label: 'Wallets', tag: 'wallets' },
        { label: 'Dossiers', tag: 'dossiers' },
        { label: 'Activities', href: '/guides/resources/activity' },
      ],
    },
    {
      title: 'Money Movement',
      links: [
        { label: 'Transactions', tag: 'transactions' },
        { label: 'Payment Methods', tag: 'payment-methods' },
        { label: 'Beneficiaries', tag: 'beneficiaries' },
        { label: 'Global Payments', tag: 'global-payments' },
        { label: 'Treasury Management', tag: 'treasury-management' },
      ],
    },
    {
      title: 'Cards & Deposits',
      links: [
        { label: 'Card Issuance', tag: 'card-issuance' },
        { label: 'Check Deposits', tag: 'check-deposits' },
        { label: 'Cash Loading', href: '/guides/transactions/cash-loading' },
        { label: 'Service Fees', tag: 'service-fees' },
        { label: 'Rewards & Incentives', tag: 'rewards-and-incentives' },
      ],
    },
  ];

  var MENUS = {
    v3: MENU_V3,
    v2: MENU_V2,
  };

  var WRAPPER_ID = 'hive-api-mega';
  var closeTimer = null;

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

  function findApiLink() {
    var nav = document.querySelector(NAV_SELECTOR);
    if (!nav) return null;

    var links = nav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      if (headerLabel(links[i]).indexOf('API Reference') === 0) return links[i];
    }
    return null;
  }

  function detectVersion() {
    var path = window.location.pathname;
    if (path.indexOf('/api-v2') === 0) return 'v2';
    return 'v3';
  }

  function hrefFor(version, link) {
    if (link.disabled) return null;
    if (link.href) return link.href;
    var base = VERSIONS[version].base;
    if (!link.tag) return base;
    return base + '/tag/' + link.tag;
  }

  function renderLinkItem(link, version) {
    var item = document.createElement('li');
    var href = hrefFor(version, link);

    if (href) {
      var anchor = document.createElement('a');
      anchor.className = 'hive-api-mega__link';
      anchor.href = href;
      anchor.textContent = link.label;
      item.appendChild(anchor);
    } else {
      var label = document.createElement('span');
      label.className = 'hive-api-mega__link hive-api-mega__link--disabled';
      label.textContent = link.label;
      item.appendChild(label);
    }

    if (link.soon) {
      var badge = document.createElement('span');
      badge.className = 'hive-api-mega__badge';
      badge.textContent = 'SOON';
      item.classList.add('hive-api-mega__list-item--with-badge');
      item.appendChild(badge);
    }

    return item;
  }

  function renderGrid(grid, version) {
    grid.innerHTML = '';
    var menu = MENUS[version] || MENUS.v3;

    menu.forEach(function (column) {
      var col = document.createElement('div');
      col.className = 'hive-api-mega__column';

      var heading = document.createElement('h3');
      heading.className = 'hive-api-mega__heading';
      heading.textContent = column.title;
      col.appendChild(heading);

      var list = document.createElement('ul');
      list.className = 'hive-api-mega__list';

      column.links.forEach(function (link) {
        list.appendChild(renderLinkItem(link, version));
      });

      col.appendChild(list);
      grid.appendChild(col);
    });
  }

  function buildToolbar(wrapper) {
    var toolbar = document.createElement('div');
    toolbar.className = 'hive-api-mega__toolbar';

    var toggle = document.createElement('div');
    toggle.className = 'hive-api-mega__version-toggle';
    toggle.setAttribute('role', 'tablist');
    toggle.setAttribute('aria-label', 'API version');

    Object.keys(VERSIONS).forEach(function (key) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'hive-api-mega__version-btn';
      button.dataset.version = key;
      button.textContent = VERSIONS[key].label;
      button.setAttribute('role', 'tab');
      if (key === wrapper._version) {
        button.classList.add('is-active');
        button.setAttribute('aria-selected', 'true');
      } else {
        button.setAttribute('aria-selected', 'false');
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        wrapper._version = key;
        toggle.querySelectorAll('.hive-api-mega__version-btn').forEach(function (btn) {
          var active = btn.dataset.version === key;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        renderGrid(wrapper._grid, key);
      });

      toggle.appendChild(button);
    });

    var help = document.createElement('a');
    help.className = 'hive-api-mega__help';
    help.href = '/guides/getting-started/api-versions';
    help.textContent = 'Which version should I use?';

    toolbar.appendChild(toggle);
    toolbar.appendChild(help);
    return toolbar;
  }

  function buildPanel(wrapper) {
    var panel = document.createElement('div');
    panel.className = 'hive-api-mega__panel';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', 'API Reference');

    panel.appendChild(buildToolbar(wrapper));

    var grid = document.createElement('div');
    grid.className = 'hive-api-mega__grid';
    wrapper._grid = grid;
    renderGrid(grid, wrapper._version);

    panel.appendChild(grid);
    return panel;
  }

  function positionPanel(wrapper) {
    var panel = wrapper._panel;
    if (!panel) return;

    var rect = wrapper.getBoundingClientRect();
    var left = Math.max(16, rect.left);
    var width = Math.min(920, window.innerWidth - left - 16);

    panel.style.left = left + 'px';
    panel.style.top = rect.bottom + 4 + 'px';
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
    wrapper.className = 'hive-api-mega';
    wrapper._version = detectVersion();

    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    link.classList.add('hive-api-mega__trigger');
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');

    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'hive-api-mega__chevron');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2');
    chevron.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />';
    link.appendChild(chevron);

    var panel = buildPanel(wrapper);
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
      if (
        window.location.pathname.indexOf('/api-v2') === 0 ||
        window.location.pathname.indexOf('/api-v3') === 0
      ) {
        return;
      }
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
    var link = findApiLink();
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
