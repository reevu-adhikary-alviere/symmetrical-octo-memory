---
title: "Card Payments"
description: "Accept online card payments — direct merchant, marketplace, bill pay, subscriptions, and donations on a single API"
---

# Card Payments

Charge your customers' cards online and get paid. One endpoint powers direct ecommerce, marketplace platforms, bill pay, subscriptions, and donations — fee splits between you, your sellers, and your payers are handled by the fee-rules engine.

Ready to make your first charge? Go straight to [Integration](/guides/payment-acceptance/online-payments/card-payments/integration).

## One endpoint, many business models

You decide where the funds land by setting `destination.wallet_uuid` — the account that gets paid. That single choice is what turns the same primitive into "direct merchant," "marketplace," or "bill pay."

| Configuration | Funds go to | Example |
|---|---|---|
| [Direct merchant ecommerce](/guides/payment-acceptance/use-cases/card-config-direct-merchant) | Your merchant account | Shopify-style store |
| [Marketplace](/guides/payment-acceptance/use-cases/card-config-marketplace) | Seller's account | Etsy, Substack |
| [Bill pay / utility](/guides/payment-acceptance/use-cases/card-config-bill-pay) | Biller's account | Utility, government |
| Subscription / recurring | Merchant account | Membership, SaaS rebill |
| Donations | Nonprofit account | GiveLively, ActBlue |

## Where this fits

Card Payments is one of two acceptance rails:

- **[Bank Payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction)** — accept ACH debits

To save a card on file before charging it, start with [Payment Methods](/guides/resources/payment-methods).

## Accounts involved

A card charge touches a few entity types. You'll see them in webhooks and reports:

| Entity | Role |
|---|---|
| `BUSINESS` | The merchant, seller, biller, or platform client receiving funds |
| `STAKEHOLDER` | Officers of a `BUSINESS`, used for KYB |
| `CONSUMER` | The end customer being charged |

## What's supported

- **US transactions only.** No DCC, no PSD2/SCA, no local schemes.
- **V3 endpoints** for all Card Payments work.
- **Settlement to your designated account.** Funds land in the `destination.wallet_uuid` you set on the charge.

:::scalar-callout{type="info"}
Alviere is not a payment facilitator, so scheme-level features like per-sub-merchant statement descriptors, per-sub-merchant MCC, and scheme-level chargeback isolation aren't available.
:::

## Next steps

1. Read the [Payment Acceptance overview](/guides/payment-acceptance/payment-acceptance) for what you keep vs. what Alviere handles.
2. Follow [Integration](/guides/payment-acceptance/online-payments/card-payments/integration) to make your first charge.
3. Pick the configuration that matches your business model.
