# API Version Dropdown Setup

This guide explains how to add a custom dropdown button in the API reference sidebar to switch between API versions.

## Files Created

1. `docs/custom-dropdown.css` - Styles for the dropdown
2. `docs/custom-dropdown.js` - JavaScript functionality for the dropdown

## Setup Instructions

### Option 1: Using Scalar Dashboard (Recommended)

1. Go to your Scalar Dashboard
2. Navigate to your project settings
3. Find the "Custom CSS" or "Styling" section
4. Paste the contents of `docs/custom-dropdown.css` into the Custom CSS field
5. Find the "Custom JavaScript" or "Scripts" section
6. Paste the contents of `docs/custom-dropdown.js` into the Custom JavaScript field
7. Save and publish

### Option 2: Using scalar.config.json

If Scalar Docs supports `customCss` in `siteConfig`, you can add it directly to your `scalar.config.json`:

```json
{
  "siteConfig": {
    "theme": "purple",
    "logo": {
      "darkMode": "https://alviere.com/imgs/alviere-signet.svg",
      "lightMode": "https://alviere.com/imgs/alviere-signet.svg"
    },
    "customCss": "/* Paste CSS from custom-dropdown.css here */"
  }
}
```

For JavaScript, you may need to use a plugin system or add it through the dashboard.

### Option 3: Using Plugins

If Scalar Docs supports plugins, create a plugin file that references these files.

## How It Works

The dropdown will:
- Appear in the sidebar under the search bar
- Default to "API Reference v2"
- Allow switching to "API Reference v1" (or v3 if you add it)
- Update automatically when navigating between versions
- Support dark mode

## Customization

To add more versions or change the default:

1. Edit `docs/custom-dropdown.js`
2. Update the `versions` array:
   ```javascript
   const versions = [
     { name: 'API Reference v2', slug: 'api-reference-v2', default: true },
     { name: 'API Reference v1', slug: 'api-reference-v1', default: false },
     { name: 'API Reference v3', slug: 'api-reference-v3', default: false } // Add v3
   ];
   ```
3. Make sure the slug matches your reference names in `scalar.config.json`

## Notes

- The dropdown automatically detects the current URL and updates accordingly
- It works with Scalar's SPA (Single Page Application) navigation
- The styling matches your purple theme

