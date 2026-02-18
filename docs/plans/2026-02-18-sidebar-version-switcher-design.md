# Sidebar Version Switcher — Design

**Date:** 2026-02-18
**Status:** Approved

## Problem

Scalar's native navigation options (tabs, grouped routes) for switching between API v1 and v2 were visually unsatisfactory. A custom JS solution is needed.

## Goal

Inject a dropdown `<select>` at the top of Scalar's sidebar that lets users switch between API v1 (`/api-v1`) and API v2 (`/api-v2`). Only visible on API pages.

## Approach

Inline IIFE embedded in `siteConfig.head.scripts` in `scalar.config.json`. No external files or CDN dependencies.

## Implementation Details

### Injection

- Added to `siteConfig.head.scripts` as an inline script (no `src`)
- Runs on page load before Scalar's React app finishes rendering

### Waiting for the Sidebar

Scalar is a SPA — the sidebar is not in the DOM at script execution time.

- `MutationObserver` watches `document.body` for DOM changes
- On each mutation, attempts to find the sidebar via `.sidebar` or `aside` selectors
- Once found: injects the dropdown, disconnects the observer
- `popstate` / `hashchange` listeners keep the selected option in sync on SPA navigation

### The Dropdown

- `<select>` with two `<option>` tags: `API v1 → /api-v1`, `API v2 → /api-v2`
- Active option set from `window.location.pathname`
- `onchange` navigates via `window.location.href`
- Styled with Scalar CSS variables: `--scalar-sidebar-background-1`, `--scalar-sidebar-color-1`, `--scalar-border-color`
- Hidden (`display: none`) when not on an `/api-v1` or `/api-v2` path

## Non-Goals

- No support for more than 2 versions (YAGNI)
- No animation or custom dropdown UI — native `<select>` is sufficient
