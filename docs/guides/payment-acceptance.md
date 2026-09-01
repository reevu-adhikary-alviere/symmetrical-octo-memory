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

Cards settle faster and the customer already knows the flow. ACH costs less per transaction and suits recurring or high-ticket charges where interchange would eat the margin. Most programs end up running both on the same setup, with the choice made per charge.

## Before you build

Every rail depends on the same three pieces.

- **[Payment Methods](/guides/resources/payment-methods)**. Save cards and bank accounts so you can charge them later.
- **[Accounts](/guides/resources/accounts)**. Set up the businesses that get paid, including KYB and dossiers.
- **[Webhooks](/guides/more/webhooks)**. Get notified when a payment settles, fails, or is disputed.

Payouts (money going **out** to a card or bank: push-to-card, ACH credit, withdrawals) live under a different section in the API reference. Payment Acceptance is acceptance only.

## Things to know

Acceptance covers US transactions in USD.

Card statements show your program's descriptor, and chargebacks are handled at the program level.

Each charge names its own destination. The `destination.wallet_uuid` on the request decides where the funds settle.

Fee rules are configured through the API. Create `SERVICE_FEE` and `CONVENIENCE_FEE` rules with `POST /v3/fee-rules`, or ask your program manager to set them up.

New acceptance work uses the V3 endpoints. Existing V2 integrations keep running.

## Where to start

1. Skim [Which API version?](/guides/getting-started/api-versions). Payment Acceptance is V3.
2. Open the guide for the rail that matches your use case.
3. For cards, [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction) covers the single charge endpoint and links out to each business model: direct merchant, marketplace, and bill pay.

## API reference

Browse endpoints by rail in the [V3 API Reference](/api-v3) under **Payment Acceptance**.
