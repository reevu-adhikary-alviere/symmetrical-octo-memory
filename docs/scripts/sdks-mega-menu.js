(function () {
  // A platform-first SDK menu, mirroring the Guides mega menu. Each column is a
  // titled section of links. Links whose href starts with http open off-site
  // (the mobile SDK reference lives on developer.alviere.com); the rest are
  // in-repo guide routes. Keep every href pointed at a page that exists.
  var MENU = [
    {
      sections: [
        {
          title: 'Web SDK',
          links: [
            { label: 'Overview', href: 'https://websdk.alviere.com/quick-start/overview' },
            { label: 'Onboarding', href: 'https://websdk.alviere.com/quick-start/components/forms' },
            { label: 'Account creation', href: 'https://websdk.alviere.com/quick-start/components/forms' },
            { label: 'Bank account linking', href: 'https://websdk.alviere.com/quick-start/components/forms' },
            { label: 'Checkout', href: 'https://websdk.alviere.com/quick-start/components/forms' },
            { label: 'Core SDK', href: 'https://websdk.alviere.com/core/overview' },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'iOS SDK',
          links: [
            { label: 'Accounts', href: 'https://developer.alviere.com/sdk/ios/accounts/' },
            { label: 'Payments', href: 'https://developer.alviere.com/sdk/ios/payments/' },
            { label: 'Cards', href: 'https://developer.alviere.com/sdk/ios/cards/' },
            { label: 'Remittances', href: 'https://developer.alviere.com/sdk/ios/remittances' },
          ],
        },
      ],
    },
    {
      sections: [
        {
          title: 'Android SDK',
          links: [
            { label: 'Accounts', href: 'https://developer.alviere.com/sdk/android/accounts/' },
            { label: 'Payments', href: 'https://developer.alviere.com/sdk/android/payments/' },
            { label: 'Cards', href: 'https://developer.alviere.com/sdk/android/cards/' },
            { label: 'Remittances', href: 'https://developer.alviere.com/sdk/android/remit/' },
          ],
        },
        {
          title: 'Legacy',
          links: [
            { label: 'JavaScript SDK', href: 'https://apidocs.alviere.com/javascript-sdk/overview' },
          ],
        },
      ],
    },
  ];

  var WRAPPER_ID = 'hive-sdks-mega';
  var closeTimer = null;

  var NAV_SELECTOR = 'nav.t-header__nav, nav.navigation';

  function isExternal(href) {
    return href.indexOf('http://') === 0 || href.indexOf('https://') === 0;
  }

  function isLinkActive(href) {
    if (isExternal(href)) return false;
    var path = window.location.pathname;
    return path === href || path.startsWith(href + '/');
  }

  // Scalar renders each header label twice (an invisible copy plus the active
  // copy), so textContent comes back doubled, e.g. "SDKsSDKs".
  function headerLabel(link) {
    var text = link.textContent.replace(/\s+/g, ' ').trim();
    var half = text.length / 2;
    if (text.length && text.length % 2 === 0 && text.slice(0, half) === text.slice(half)) {
      return text.slice(0, half);
    }
    return text;
  }

  function findSdksLink() {
    var nav = document.querySelector(NAV_SELECTOR);
    if (!nav) return null;

    var links = nav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      if (headerLabel(links[i]) === 'SDKs') return links[i];
    }
    return null;
  }

  function renderSection(section) {
    var block = document.createElement('div');
    block.className = 'hive-sdks-mega__section';

    var heading = document.createElement('p');
    heading.className = 'hive-sdks-mega__heading';
    heading.textContent = section.title;
    block.appendChild(heading);

    var list = document.createElement('ul');
    list.className = 'hive-sdks-mega__list';

    section.links.forEach(function (link) {
      var item = document.createElement('li');
      var anchor = document.createElement('a');
      anchor.className = 'hive-sdks-mega__link';
      if (isLinkActive(link.href)) anchor.classList.add('is-active');
      anchor.href = link.href;
      anchor.textContent = link.label;

      if (isExternal(link.href)) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.classList.add('hive-sdks-mega__link--external');
        var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrow.setAttribute('class', 'hive-sdks-mega__external-icon');
        arrow.setAttribute('viewBox', '0 0 24 24');
        arrow.setAttribute('fill', 'none');
        arrow.setAttribute('stroke', 'currentColor');
        arrow.setAttribute('stroke-width', '2');
        arrow.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />';
        anchor.appendChild(arrow);
      }

      item.appendChild(anchor);
      list.appendChild(item);
    });

    block.appendChild(list);
    return block;
  }

  function renderColumn(column) {
    var col = document.createElement('div');
    col.className = 'hive-sdks-mega__column';

    column.sections.forEach(function (section) {
      col.appendChild(renderSection(section));
    });

    return col;
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'hive-sdks-mega__panel';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-label', 'SDKs');

    var grid = document.createElement('div');
    grid.className = 'hive-sdks-mega__grid';

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
    var width = Math.min(760, window.innerWidth - 32);

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
    wrapper.className = 'hive-sdks-mega';

    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    link.classList.add('hive-sdks-mega__trigger');
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');

    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'hive-sdks-mega__chevron');
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
    var link = findSdksLink();
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
