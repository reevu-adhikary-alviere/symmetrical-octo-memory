---
title: "Payment Acceptance"
description: "Accept payments online — cards and ACH on a single API"
---

# Payment Acceptance

Accept payments from your customers on two rails — cards and bank accounts — through one Alviere integration. Charge once, route funds to the right account, and let the fee-rules engine handle splits between you, your sellers, and your payers.

| Rail | Guide | API |
|---|---|---|
| **Cards** | [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction) | `/v3/cards/*` |
| **Bank (ACH)** | [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) | `/v3/ach/debit` |

## Pick a rail

- **Online card payments** for ecommerce, marketplaces, subscriptions, donations → [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction)
- **ACH debit** for utility, telecom, insurance, or recurring bill pay → [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction)

Many partners use more than one. A marketplace can run card acceptance for buyers and ACH for high-ticket B2B sellers on the same setup.

## What Alviere handles, what you own

Alviere handles the **payment side**: authorizing cards, capturing funds, applying fee splits, settling to the right account, and surfacing disputes. Everything around payments stays in your stack and calls Alviere when it's time to charge.

| Alviere handles | You own |
|---|---|
| Card processing — authorize, capture, void, refund, 3DS, saved cards | Storefront, cart, and checkout UX |
| Settlement to the account you designate | Product catalog, SKUs, pricing |
| Fee splits — `SERVICE_FEE` (platform commission) and `CONVENIENCE_FEE` (payer upcharge) | Order management, fulfillment, returns |
| Compliance — onboarding, KYB/KYC, dossiers, sanctions screening | Sales tax calculation and filing |
| Disputes and chargeback handling at the program level | Subscription lifecycle (renewal, dunning) |
| Auditable transaction reporting with parent/child fee entries | Risk/fraud checks before you call the API |

An order is a commercial record in your system. A payment is what you ask Alviere to do. The API is centered on payments — you keep order state.

## Before you build

A few things are common to every rail:

- **[Payment Methods](/guides/resources/payment-methods)** — save cards and bank accounts so you can charge them later
- **[Accounts](/guides/resources/accounts)** — set up the businesses that get paid (KYB, dossiers)
- **[Webhooks](/guides/more/webhooks)** — get notified when a payment settles, fails, or gets disputed

Payouts (money going **out** to a card or bank — push-to-card, ACH credit, withdrawals) live under a different section in the API reference. Payment Acceptance is acceptance only.

## Things to know

| Constraint | What it means |
|---|---|
| **US-only** | No multi-currency acquiring, no EU local schemes, no DCC, no PSD2/SCA |
| **Not a payment facilitator** | Card statements show one program-level descriptor; chargebacks happen at the program level — not per sub-merchant. No per-sub-merchant MCC or statement descriptors |
| **Settlement to a designated account** | Each charge sets `destination.wallet_uuid` for where funds land |
| **Fee rules are configured for you** | Talk to your program manager to set up `SERVICE_FEE` and `CONVENIENCE_FEE` rules |
| **V3 endpoints** for new acceptance work | Existing V2 integrations keep running |

## Where to start

1. Skim [Which API version?](/guides/getting-started/api-versions) — Payment Acceptance is V3.
2. Open the guide for the rail that matches your use case.
3. For cards, [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction) covers the single charge endpoint and links out to each business model — direct merchant, marketplace, and bill pay.

## API reference

Browse endpoints by rail in the [V3 API Reference](/api-v3) under **Payment Acceptance**.
