---
title: "Configure and brand"
description: "Colors, typography, spacing, assets, copy, and the switches that change behaviour, without touching a view"
---

# Configure and brand

Rebranding Bootstrap is deliberately the shallowest change you can make. Neither app hardcodes a color in a view. Both resolve everything through a theme, so restyling is an exercise in editing values rather than hunting through screens.

Work through it in this order.

## 1. Colors

Both apps use semantic color roles, not a palette of raw hex. You are changing what "primary button background" means, not finding every button.

**iOS** keeps colors in the asset catalog under `Content/Assets.xcassets/Colors`, as roughly sixty color sets named for their role: `color.button.background.primary`, `color.foreground.secondary`, `color.background.bottomsheet`, `color.danger`, and so on. Each color set carries its own light and dark values, so dark mode follows automatically.

**Android** defines the same idea in Kotlin. `ui/theme/scheme/` holds one immutable data class per role group, with a light and a dark instance of each:

| Scheme | Covers |
|---|---|
| `MainScheme` | Primary, secondary, inverse primary |
| `BackgroundScheme` | Screen and sheet backgrounds |
| `ForegroundScheme` | Content on those backgrounds |
| `ButtonScheme` | Button fills, labels, pressed states |
| `IconScheme` | Icon tints |
| `TextScheme` | Text colors |
| `SystemScheme`, `OthersScheme` | Status colors and the remainder |

`ui/theme/tokens/` holds the raw values those schemes draw on: neutrals, avatar colors, and sizes. `res/values/colors.xml` and `res/values-night/colors.xml` cover the parts Android resolves outside Compose.

Start with `MainScheme` on Android and `color.main.primary` on iOS. Between them they move most of what a customer sees.

## 2. Typography and spacing

**iOS** declares a font scale in `Theme+Font.swift`, from a 48pt extra-large header down to an 11pt caption, and every size runs through `UIFontMetrics` so Dynamic Type keeps working. Spacing is a fixed set of steps in `Theme.Spacer`. The app uses the system font, so switching to a brand typeface means changing the font construction in one file.

**Android** provides `BootstrapTypography()` and `BootstrapDimens()` through composition, with font files in `res/font`. Replace the files, point the typography at them, done.

## 3. Per-component styling

iOS goes a step further than a color table. `UI/Theme/` carries a theme extension for each control, more than twenty of them: buttons, text fields, switches, pickers, chips, list rows, search fields, the one-time-code field, the password strength meter, shadows, and the activity indicator. If you need a different button shape rather than a different button color, `Theme+Button.swift` is the whole change.

On Android the equivalent lives in the reusable composables under `ui/screens/components`.

## 4. SDK screens

The Accounts SDK renders document capture itself, so it needs telling about your palette too. On Android the app passes its own colors into the SDK's capture tokens when it builds the theme, which is why the capture screen matches the app. Do the same for any SDK colors you override, in the same place, so there is one source of truth.

## 5. Assets and copy

Swap the app icon, splash, and imagery in the asset catalog on iOS or the `res/mipmap` and `res/drawable` directories on Android.

Copy lives in a string catalog on iOS and in `res/values/strings.xml` on Android, which runs to about a thousand lines. Nothing is inlined in a view, so translation is a normal localization job and rewording is a normal edit.

## 6. Behaviour

A small flags file on iOS and a constants file on Android hold the switches worth knowing about.

| Setting | Effect |
|---|---|
| Card type | Physical, digital, or digital-first. Determines whether shipping and tracking screens appear |
| Card orientation | Horizontal or vertical card artwork |
| Debit program | Whether debit-program features are on |
| Alviere environment | Sandbox or production |
| Card product identifier | The product new cards are issued against |
| Deep-link scheme | The app's URL scheme. On Android the manifest needs the matching change by hand |
| Page sizes | How many transactions, recipients, and card transactions load per page |
| PIN length | Digits in a card PIN |
| Polling delays | How often the app re-checks card state, KYC review, and maintenance |

The send-money minimum and maximum in there are sample-app guardrails, not platform limits. Your real limits come from your program configuration, which your program manager sets and the API does not change. See [Environments](/guides/getting-started/environments).

## What not to change first

Resist starting in the views. Both apps route styling through the theme precisely so that a rebrand does not touch screen code, and a rebrand that edits screens directly is one you have to redo on every upgrade.

## Related

- [Build and run](/guides/sdks/bootstrap-app/build). Compile and see the result.
- [What's included](/guides/sdks/bootstrap-app/features). The flows you are restyling.
