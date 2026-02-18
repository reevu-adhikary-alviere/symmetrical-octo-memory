# Sidebar Version Switcher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Inject a dropdown `<select>` at the top of Scalar's sidebar that lets users switch between API v1 and API v2, visible only on API pages.

**Architecture:** A vanilla JS IIFE in `docs/scripts/version-switcher.js`, referenced via `siteConfig.head.scripts` in `scalar.config.json`. The script uses a `MutationObserver` to wait for Scalar's sidebar to appear in the DOM (SPA), then prepends a styled dropdown. Navigation happens via `window.location.href`. `popstate`/`hashchange` listeners keep the dropdown in sync during client-side navigation.

**Tech Stack:** Vanilla JS, Scalar CSS variables, `scalar.config.json` `siteConfig.head.scripts`

---

### Task 1: Create the version switcher script

**Files:**
- Create: `docs/scripts/version-switcher.js`

**Step 1: Create the directory**

```bash
mkdir -p docs/scripts
```

**Step 2: Write the script**

Create `docs/scripts/version-switcher.js` with this exact content:

```javascript
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
```

**Step 3: Commit**

```bash
git add docs/scripts/version-switcher.js
git commit -m "feat: add sidebar version switcher script"
```

---

### Task 2: Wire the script into scalar.config.json

**Files:**
- Modify: `scalar.config.json`

**Step 1: Add `scripts` to `siteConfig.head`**

In `scalar.config.json`, update the `siteConfig.head` object from:

```json
"head": {
  "links": [],
  "meta": [],
  "styles": []
}
```

To:

```json
"head": {
  "links": [],
  "meta": [],
  "styles": [],
  "scripts": [
    {
      "path": "docs/scripts/version-switcher.js"
    }
  ]
}
```

**Step 2: Validate the JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('scalar.config.json','utf8')); console.log('valid')"
```

Expected output: `valid`

**Step 3: Commit**

```bash
git add scalar.config.json
git commit -m "feat: wire version switcher script into scalar.config.json"
```

---

### Task 3: Verify

**Step 1: Push and check the deployed site**

After deploy, visit `/api-v1`. The top of the sidebar should show a `<select>` with "API v1" selected. Changing to "API v2" should navigate to `/api-v2`.

**Step 2: If the dropdown doesn't appear**

Open DevTools console. If you see errors, the sidebar selector likely doesn't match. Inspect the sidebar element and update the selectors in `findSidebar()`:

```javascript
// Replace with the actual class/element you find in DevTools
function findSidebar() {
  return document.querySelector('.YOUR_ACTUAL_SELECTOR');
}
```

Then commit the fix:

```bash
git add docs/scripts/version-switcher.js
git commit -m "fix: update sidebar selector for version switcher"
```

**Step 3: Verify hidden on non-API pages**

Visit `/getting-started`. The dropdown should not be visible.
