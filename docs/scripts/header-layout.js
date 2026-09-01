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
    'sdks': 'SDKs',
    'sandbox-testing': 'Sandbox Testing',
    'reporting': 'Data Reporting',
    'more': 'More',
  };

  function normalizeBackText(t) {
    return (t || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isBackLabel(txt) {
    var n = normalizeBackText(txt);
    if (n === 'back') return true;
    if (n.length <= 10 && n.endsWith('back')) {
      var prefix = n.slice(0, -4).trim();
      if (prefix === '' || prefix === '←' || prefix === '‹' || prefix === '<' || prefix === '→' || prefix === '›' || prefix === '‹—' || prefix === '←—') return true;
    }
    return false;
  }

  function relabelOneAside(aside, label) {
    var el = aside.querySelector('.hive-section-header');
    if (el) {
      if (el.textContent.trim() !== label) el.textContent = label;
      el.classList.add('hive-section-header');
      el.style.pointerEvents = 'none';
      el.style.cursor = 'default';
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('tabindex', '-1');
      if (el.tagName === 'A') el.removeAttribute('href');
      var svg = el.querySelector('svg');
      if (svg) svg.style.display = 'none';
      return true;
    }

    var candidates = aside.querySelectorAll('a, button, [role="button"]');
    var found = null;
    for (var i = 0; i < candidates.length; i++) {
      var node = candidates[i];
      if (isBackLabel(node.textContent)) {
        found = node;
        break;
      }
      var aria = node.getAttribute('aria-label');
      if (aria && isBackLabel(aria)) {
        found = node;
        break;
      }
    }

    if (!found) {
      var all = aside.querySelectorAll('*');
      for (var j = 0; j < all.length; j++) {
        var t = normalizeBackText(all[j].textContent);
        if (t !== 'back') continue;
        var tag = all[j].tagName;
        if (tag === 'A' || tag === 'BUTTON' || all[j].getAttribute('role') === 'button') {
          // Avoid matching the whole aside which aggregates many texts
          // Only accept if the element's own trimmed text is exactly Back (no surrounding guide titles)
          // Check that element does not contain a large list of links
          if (all[j].querySelectorAll('a').length <= 1) {
            found = all[j];
            break;
          }
        }
        var p = all[j].parentElement;
        if (p && (p.tagName === 'A' || p.tagName === 'BUTTON' || p.getAttribute('role') === 'button')) {
          if (isBackLabel(p.textContent)) {
            found = p;
            break;
          }
        }
      }
    }

    if (!found) return false;

    el = found;
    el.classList.add('hive-section-header');
    el.textContent = label;
    el.style.pointerEvents = 'none';
    el.style.cursor = 'default';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('tabindex', '-1');
    if (el.tagName === 'A') el.removeAttribute('href');
    var s = el.querySelector('svg');
    if (s) s.style.display = 'none';
    return true;
  }

  function relabelSectionHeader() {
    var seg = window.location.pathname.split('/')[2] || '';
    var title = SECTION_TITLES[seg];
    if (!title) return;
    var label = 'Guides • ' + title;

    var asides = document.querySelectorAll("aside[class*='sidebar'], aside");
    if (!asides.length) return;
    for (var k = 0; k < asides.length; k++) {
      relabelOneAside(asides[k], label);
    }
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

  // SPA route changes via history API don't always trigger a body mutation
  // that the observer catches in time, so also wrap push/replace and listen
  // to popstate/hashchange.
  (function wrapHistory() {
    try {
      var _push = history.pushState;
      var _replace = history.replaceState;
      function onRoute() {
        setTimeout(applyLayout, 0);
        setTimeout(applyLayout, 50);
        setTimeout(applyLayout, 250);
      }
      history.pushState = function () {
        var r = _push.apply(this, arguments);
        onRoute();
        return r;
      };
      history.replaceState = function () {
        var r = _replace.apply(this, arguments);
        onRoute();
        return r;
      };
      window.addEventListener('popstate', onRoute);
      window.addEventListener('hashchange', onRoute);
    } catch (e) {}
  })();

  // Scalar injects this in <head>; document.body may not exist yet.
  function boot() {
    applyLayout();
    // Poll briefly after boot to catch late-mounted sidebar (Scalar renders async)
    var tries = 0;
    var poll = setInterval(function () {
      applyLayout();
      tries++;
      if (tries > 20) clearInterval(poll);
    }, 100);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
