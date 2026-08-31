---
title: "What's included"
description: "Every flow the Bootstrap apps ship, screen by screen, and the platform guide behind each one"
---

# What's included

Both apps ship the same flows. This page is the inventory, with the guide that explains what each flow is doing underneath.

## Onboarding and identity

Email and phone entry, each verified with a one-time code. Then legal name and date of birth, address with autocomplete, SSN last four, full SSN where the program requires it, occupation, and terms acceptance. Document capture and a selfie close the flow.

Document capture comes from the Accounts SDK rather than the app. On iOS the SDK returns a SwiftUI camera view that the app wraps in a thin component; on Android the SDK's capture screen reads its colors from the app's palette, so it matches the rest of your product instead of looking borrowed.

The review screen polls for a decision, first after thirty seconds and then every ten. Approval, rejection, and the appeal path each have a screen. So do the recovery cases, where a customer abandons onboarding partway through and comes back to find themselves at the right step rather than the beginning.

See [Identity (Dossier)](/guides/resources/identity) for the underlying model and [KYC Scenarios](/guides/sandbox-testing/test-kyc) for test identities that produce each outcome.

## Sign-in and session

Password sign-in, password reset, and biometric unlock. The session locks itself after five minutes in the background.

## Wallet and funding

A home screen with the balance, recent transactions, and quick access to recipients. Customers link a bank account or add a card as a payment method, then load funds or withdraw them, each with confirmation, success, and error screens.

See [Wallets](/guides/resources/wallets), [Payment Methods](/guides/resources/payment-methods), and [Card Pull](/guides/transactions/card-pull) for the load path.

## Recipients and sending money

Create, edit, and browse recipients with paging, then send money with a confirmation step and a success screen. Bank details are validated on entry, including routing and account number lengths.

See [Beneficiaries and Payouts](/guides/resources/beneficiaries) and [Internal Transfers](/guides/transactions/internal-transfers).

## Cards

The fullest part of the app, because card flows have the most states.

| Flow | What the app does |
|---|---|
| Request | Issues a card against the configured card product |
| Activate | In-app activation, and a screen for cards activated by phone |
| Set PIN | Collects and sets a PIN through the SDK |
| View card data | Shows the number, expiry, and CVV rendered by the SDK on the device |
| Card settings | Freeze, unfreeze, and card-level controls |
| Card transactions | A card-scoped transaction list |
| Replace | Replacement with a reason and a description |
| Delete | Removal, tracked with card metadata |
| Shipping address | Update the address before dispatch |
| Tracking | Follow a physical card's progress |
| Add to wallet | Push provisioning, with a fallback screen for devices that cannot provision |

Card artwork orientation and card type are configuration rather than code, so a program issuing virtual-only cards does not carry physical shipping screens it will never show. See [Configure and brand](/guides/sdks/bootstrap-app/configure).

The card number and the PIN never pass through the app's own backend. Both flows call the SDK directly, which is a platform requirement and not a Bootstrap choice. [Card Data and PCI](/guides/cards/card-security) explains what that boundary buys you.

See also [Issued Cards](/guides/cards/cards), [Card Operations](/guides/cards/card-operations), [Physical Cards](/guides/cards/physical-cards), and [Digital Wallets](/guides/cards/digital-wallets).

## Transactions

A paged list, a detail screen, and a receipt the customer can share. See [Transactions Overview](/guides/transactions/transactions-overview).

## Account management

Personal information editing, security settings, periodic statements, legal documents, in-app support, and account closure. Direct-deposit switching is wired in behind the account section.

## Operational screens

The ones that matter in production and rarely appear in samples.

**Maintenance mode.** The app polls for platform availability and holds customers on a maintenance screen during a window, rather than failing requests one at a time.

**Forced update.** When an old build has to stop working, it stops working, on a screen that tells the customer what to do.

**Notifications, analytics, and monitoring.** Push notifications, analytics, and crash and performance reporting are already wired to swappable vendors.

## Testing the flows

Every flow above has a sandbox path. Start at [Sandbox Testing](/guides/sandbox-testing/mock-services), then the scenario page for the flow you are working on: [KYC](/guides/sandbox-testing/test-kyc), [card issuance](/guides/sandbox-testing/test-cards), [payment methods](/guides/sandbox-testing/test-payments), or [fraud and sanctions](/guides/sandbox-testing/test-fraud-sanctions).

## Related

- [Configure and brand](/guides/sdks/bootstrap-app/configure). Change how all of this looks.
- [Build and run](/guides/sdks/bootstrap-app/build). Get it onto a simulator or device.
