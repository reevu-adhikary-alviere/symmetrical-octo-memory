(function () {
  var VERSIONS = [
    { label: 'API v1', path: '/api-v1' },
    { label: 'API v2', path: '/api-v2' },
  ];

  function isApiPage() {
    return VERSIONS.some(function (v) {
      return window.location.pathname.startsWith(v.path);
    });
  }

  function currentPath() {
    for (var i = 0; i < VERSIONS.length; i++) {
      if (window.location.pathname.startsWith(VERSIONS[i].path)) {
        return VERSIONS[i].path;
      }
    }
    return null;
  }

  function injectDropdown(sidebar) {
    if (sidebar.querySelector('#scalar-version-switcher')) return;

    var wrapper = document.createElement('div');
    wrapper.id = 'scalar-version-switcher';
    wrapper.style.cssText =
      'padding:12px 16px;border-bottom:1px solid var(--scalar-border-color,#333);';

    var select = document.createElement('select');
    select.style.cssText = [
      'width:100%',
      'padding:8px 12px',
      'background:var(--scalar-sidebar-background-1,#1a1a2e)',
      'color:var(--scalar-sidebar-color-1,#fff)',
      'border:1px solid var(--scalar-border-color,#444)',
      'border-radius:6px',
      'font-size:13px',
      'cursor:pointer',
    ].join(';');

    VERSIONS.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v.path;
      opt.textContent = v.label;
      if (window.location.pathname.startsWith(v.path)) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', function () {
      window.location.href = this.value;
    });

    wrapper.appendChild(select);
    wrapper.style.display = isApiPage() ? 'block' : 'none';
    sidebar.insertBefore(wrapper, sidebar.firstChild);
  }

  function updateDropdown() {
    var wrapper = document.getElementById('scalar-version-switcher');
    if (!wrapper) return;
    wrapper.style.display = isApiPage() ? 'block' : 'none';
    var select = wrapper.querySelector('select');
    if (select) {
      var cur = currentPath();
      if (cur) select.value = cur;
    }
  }

  function findSidebar() {
    return (
      document.querySelector('.sidebar') ||
      document.querySelector('aside') ||
      document.querySelector('[class*="sidebar"]')
    );
  }

  function tryInject() {
    var sidebar = findSidebar();
    if (sidebar) {
      injectDropdown(sidebar);
      return true;
    }
    return false;
  }

  if (!tryInject()) {
    var observer = new MutationObserver(function (mutations, obs) {
      if (tryInject()) obs.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener('popstate', updateDropdown);
  window.addEventListener('hashchange', updateDropdown);
})();
