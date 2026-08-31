---
title: "Bootstrap App"
description: "A complete consumer banking app for iOS and Android, built on the Alviere mobile SDKs. Fork it, rebrand it, point it at your program"
---

# Bootstrap App

Ship a mobile banking product without building one from scratch. Bootstrap is a full native app for iOS and Android, written on top of the Alviere mobile SDKs. It onboards a customer through KYC, opens a wallet, funds it, issues a card, moves money, and shows the history. You fork it, restyle it, point it at your program, and submit to the stores.

This is the mobile counterpart to [Alviere Checkout](/guides/payment-acceptance/online-payments/alviere-checkout/introduction). Checkout gives you a payment box in a few lines of HTML. Bootstrap gives you the whole app.

## Two apps, one product

Both apps implement the same flows with the same screens in the same order. Each one is written the way its platform expects, so neither reads like a port.

| | iOS | Android |
|---|---|---|
| Language | Swift 6, strict concurrency | Kotlin |
| UI | SwiftUI | Jetpack Compose, Material 3 |
| Minimum OS | iOS 17.5 | API 24 |
| Dependencies | Swift Package Manager | Gradle version catalog |
| Dependency injection | A container registered at startup | Hilt |
| Navigation | An injected router | Navigation 3 |
| Default environment | Sandbox | Sandbox |

Both ship with in-repo developer documentation, a linter config, a test suite, and a CI pipeline that runs static analysis, tests, and a build.

## What you are starting from

Bootstrap is not a demo with three screens and a mock backend. It calls the real platform, handles the states a real customer produces, and includes the screens teams tend to discover late: onboarding recovery for someone who abandons halfway, a maintenance mode, a forced-update screen, and a rejection path with an appeal.

The four Alviere packages sit behind a single wrapper in the app, so the SDK calls are already grouped by what they do rather than scattered through views.

| Package | What it covers in the app |
|---|---|
| Accounts | Authentication, KYC and the identity dossier, document and selfie capture, legal documents, address and occupation |
| Payments | Wallets, bank and card payment methods, loading, withdrawing, transactions |
| Cards | Card issuance, status, PIN, card data display, wallet provisioning |
| Remittances | Recipients and sending money |

## Where to go next

- [What's included](/guides/sdks/bootstrap-app/features). Every flow in the app, screen by screen, and the guide behind each one.
- [Configure and brand](/guides/sdks/bootstrap-app/configure). Make it look like your product rather than ours.
- [Build and run](/guides/sdks/bootstrap-app/build). Toolchain, dependencies, tests, and CI.

## Getting access

The Bootstrap repositories are not public. Ask your program manager for access to the iOS and Android repositories along with sandbox credentials and a card product configured for your program.

## Related

- [SDKs](/guides/sdks/overview). The web and mobile packages Bootstrap is built on.
- [Quickstart](/guides/getting-started/quickstart). Credentials and your first API call.
- [Card Data and PCI](/guides/cards/card-security). Why card display belongs in the SDK.
