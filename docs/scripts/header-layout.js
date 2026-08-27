(function () {
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

  function moveNavToLeft() {
    var header = document.querySelector('header.header');
    if (!header) return false;

    var headerLeft = header.querySelector('.t-header__start, .header-left');
    var nav = header.querySelector(NAV_SELECTOR);
    if (!headerLeft || !nav) return false;
    if (nav.dataset.hiveNavLeft === 'true') return true;

    var brand = headerLeft.querySelector('a[href="/"]');
    if (brand) {
      brand.insertAdjacentElement('afterend', nav);
    } else {
      headerLeft.appendChild(nav);
    }

    nav.dataset.hiveNavLeft = 'true';
    header.classList.add('hive-header-nav-left');
    return true;
  }

  function moveChangelogToRight() {
    var header = document.querySelector('header.header');
    if (!header) return false;

    var headerRight = header.querySelector('.t-header__end, .header-right');
    var nav = header.querySelector(NAV_SELECTOR);
    if (!headerRight || !nav) return false;

    var changelog = null;
    var links = nav.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      if (headerLabel(links[i]) === 'Changelog') {
        changelog = links[i];
        break;
      }
    }
    if (!changelog) return false;

    // Drop a stale copy first so SPA re-renders don't leave two Changelog links.
    var existing = headerRight.querySelector('[data-hive-changelog-right="true"]');
    if (existing && existing !== changelog) existing.remove();

    changelog.dataset.hiveChangelogRight = 'true';
    changelog.classList.add('hive-header-changelog');
    headerRight.appendChild(changelog);
    return true;
  }

  var SECTION_TITLES = {
    'overview': 'Overview',
    'getting-started': 'Getting Started',
    'payment-acceptance': 'Payment Acceptance',
    'resources': 'Resources',
    'transactions': 'Transactions',
    'cards': 'Card Issuing',
    'sandbox-testing': 'Sandbox Testing',
    'more': 'More',
  };

  function relabelSectionHeader() {
    var aside = document.querySelector("aside[class*='sidebar']");
    if (!aside) return;

    var seg = window.location.pathname.split('/')[2] || '';
    var title = SECTION_TITLES[seg];
    if (!title) return;
    var label = 'Guides • ' + title;

    var el = aside.querySelector('.hive-section-header');
    if (!el) {
      var nodes = aside.querySelectorAll('a, button, [role="button"]');
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].textContent.trim().toLowerCase() === 'back') {
          el = nodes[i];
          break;
        }
      }
    }
    if (!el) return;

    el.classList.add('hive-section-header');
    if (el.textContent.trim() !== label) el.textContent = label;
  }

  function markLandingRoute() {
    if (!document.body) return;
    var p = window.location.pathname.replace(/\/+$/, '');
    var isLanding = p === '' || p === '/guides' || p === '/guides/overview/welcome';
    document.body.classList.toggle('hive-landing', isLanding);
  }

  function applyLayout() {
    moveNavToLeft();
    moveChangelogToRight();
    markLandingRoute();
    relabelSectionHeader();
  }

  var observer = new MutationObserver(function () {
    applyLayout();
  });

  // Scalar injects this in <head>; document.body may not exist yet.
  function boot() {
    applyLayout();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
