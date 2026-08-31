---
title: "Payment Acceptance"
description: "Accept payments online: cards and ACH on a single API"
---

# Payment Acceptance

Accept payments from your customers on two rails, cards and bank accounts, through one Alviere integration. Charge once, route funds to the right account, and let the fee-rules engine handle splits between you, your sellers, and your payers.

| Rail | Guide | API |
|---|---|---|
| **Cards** | [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction) | `/v3/cards/*` |
| **Bank (ACH)** | [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) | `/v3/ach/debit` |

## Pick a rail

- **Online card payments** for ecommerce, marketplaces, subscriptions, donations → [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction)
- **ACH debit** for recurring billing and any charge where card interchange costs too much → [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction)

Many partners use more than one. A marketplace can run card acceptance for buyers and ACH for high-ticket B2B sellers on the same setup.

## Before you build

A few things are common to every rail:

- **[Payment Methods](/guides/resources/payment-methods)**. Save cards and bank accounts so you can charge them later.
- **[Accounts](/guides/resources/accounts)**. Set up the businesses that get paid (KYB, dossiers).
- **[Webhooks](/guides/more/webhooks)**. Get notified when a payment settles, fails, or gets disputed.

Payouts (money going **out** to a card or bank: push-to-card, ACH credit, withdrawals) live under a different section in the API reference. Payment Acceptance is acceptance only.

## Things to know

| Constraint | What it means |
|---|---|
| **US-only** | No multi-currency acquiring, no EU local schemes, no DCC, no PSD2/SCA |
| **Not a payment facilitator** | Card statements show one program-level descriptor; chargebacks happen at the program level, not per sub-merchant. No per-sub-merchant MCC or statement descriptors |
| **Settlement to a designated account** | Each charge sets `destination.wallet_uuid` for where funds land |
| **Fee rules are an API** | Create `SERVICE_FEE` and `CONVENIENCE_FEE` rules with `POST /v3/fee-rules`, or have your program manager set them up |
| **V3 endpoints** for new acceptance work | Existing V2 integrations keep running |

## Where to start

1. Skim [Which API version?](/guides/getting-started/api-versions). Payment Acceptance is V3.
2. Open the guide for the rail that matches your use case.
3. For cards, [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction) covers the single charge endpoint and links out to each business model: direct merchant, marketplace, and bill pay.

## API reference

Browse endpoints by rail in the [V3 API Reference](/api-v3) under **Payment Acceptance**.
