---
title: "SDKs"
description: "Three ways to put Alviere in front of a customer: call the API, drop in our components, or start from a working app"
---

# SDKs

You can build most Alviere flows by calling the [HIVE API](/guides/getting-started/quickstart) directly. Displaying a card number and setting a PIN are the exceptions. Both are restricted to the SDK, for a reason worth understanding before you plan a mobile build.

Past that it is a question of how much of the interface you want to hand over. Pick per screen, and expect to use more than one.

| What you are building | Reach for |
|---|---|
| A payment box on an existing checkout page | [Alviere Checkout](/guides/payment-acceptance/online-payments/alviere-checkout/introduction) |
| Onboarding, KYC, or payment forms in your web app | The UI SDK |
| Alviere logic behind your own design system | The Core SDK |
| Card display, PIN entry, or check deposit in a native app | The iOS or Android SDK |
| A whole mobile banking app | [Bootstrap App](/guides/sdks/bootstrap-app/introduction) |

## Web

**UI SDK, `@alviere/ui`.** A component library for onboarding and payment flows: forms, multi-step flows, and validated inputs. It ships framework-independent Web Components alongside typed Svelte components. Both formats expose the same properties and events, so the choice is only about your framework. Components call the Core SDK underneath for authentication, validation, encryption, and talking to Alviere.

**Core SDK, `@alviere/core`.** The headless layer the UI SDK runs on, with typed services for accounts, payments, wallets, authentication, request encryption, validation, logging, and errors. It has no interface components. Use it when you already have a design system and intend to keep it.

**Alviere Checkout.** A prebuilt, themeable checkout you drop in as a single tag. Bank payments by default, cards optional. It runs account entry, the mandate, and the debit as one flow, then hands you an event when the money moves. See [Alviere Checkout](/guides/payment-acceptance/online-payments/alviere-checkout/introduction) and the [web integration guide](/guides/payment-acceptance/online-payments/alviere-checkout/web).

**JavaScript SDK.** The older browser SDK, kept for existing integrations. Your backend creates a web session, your page loads the SDK with that session identifier, and a global factory hands you a service. It covers payment method collection, fraud device data, and card operations including PIN management. New web work should start with the UI and Core SDKs instead.

## Mobile

Four packages per platform, matched one to one.

| Package | iOS | Android |
|---|---|---|
| Accounts | `alviere-accounts-ios` | `com.alviere.android:accounts` |
| Payments | `alviere-payments-ios` | `com.alviere.android:payments` |
| Cards | `alviere-cards-ios` | `com.alviere.android:cards` |
| Remittances | `alviere-remittances-ios` | `com.alviere.android:remit` |

iOS resolves through Swift Package Manager, Android through Gradle.

### Some flows require the SDK

The two endpoints that move raw card material, the one returning a full PAN and CVV and the one that sets a PIN, are restricted to the Alviere SDK or a preauthorized client. The intent is that your app asks the SDK to display the card and the SDK fetches and renders it on the device. A PAN that reaches your servers pulls them into PCI DSS scope, and it does so retroactively for anything that logged, cached, or proxied the response. [Card Data and PCI](/guides/cards/card-security) spells out where the line falls.

Remote check deposit also runs through the mobile SDKs, since the customer photographs the check on the device.

## Bootstrap App

A complete native banking app for both platforms, built on the four packages above. It covers onboarding, funding, card issuance, money movement, and history. Fork it, restyle it, point it at your program. See [Bootstrap App](/guides/sdks/bootstrap-app/introduction).

## Sessions, not secrets

Every client-side SDK follows the same rule. Your backend creates a short-lived session with Alviere, the client consumes that session, and your API credentials never leave your server. Client identifiers and secrets in browser or app code are for local development and nothing else. [Authentication](/guides/getting-started/authentication) covers credential handling.

## Next steps

- [Quickstart](/guides/getting-started/quickstart). Credentials and your first API call.
- [Bootstrap App](/guides/sdks/bootstrap-app/introduction). The reference app for iOS and Android.
- [Alviere Checkout](/guides/payment-acceptance/online-payments/alviere-checkout/introduction). The prebuilt payment box.
- [Card Data and PCI](/guides/cards/card-security). Why card display belongs in the SDK.
- [Environments](/guides/getting-started/environments). Sandbox and production.
