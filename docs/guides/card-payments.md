---
title: "Card Payments"
description: "Accept online card payments through one endpoint and route the funds to whichever account gets paid"
---

# Card Payments

Charge a customer's card online and route the funds to the account that gets paid. One endpoint covers every business model. The fee-rules engine handles any split between you, your sellers, and your payers.

If you already know the model you need, go to [Integration](/guides/payment-acceptance/online-payments/card-payments/integration) and make the first charge.

## One endpoint, many business models

You decide where the funds land by setting `destination.wallet_uuid` on the charge. That one field is the difference between the configurations below.

| Configuration | Funds go to |
|---|---|
| [Direct merchant](/guides/payment-acceptance/use-cases/card-config-direct-merchant) | Your own account. You sell, you get paid |
| [Marketplace](/guides/payment-acceptance/use-cases/card-config-marketplace) | The seller's account, with your platform fee split off by a fee rule |
| [Bill pay](/guides/payment-acceptance/use-cases/card-config-bill-pay) | The biller's account, with an optional convenience fee to the payer |

Recurring charges and donations are the direct merchant configuration with a saved card. Nothing about the charge itself changes.

## Where this fits

Card Payments is one of two acceptance rails. The other is [Bank Payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction), which accepts ACH debits.

To charge a card more than once, save it first through [Payment Methods](/guides/resources/payment-methods).

## Accounts involved

A card charge involves three entity types. They show up in webhooks and reports:

| Entity | Role |
|---|---|
| `BUSINESS` | The merchant, seller, biller, or platform client receiving funds |
| `STAKEHOLDER` | Officers of a `BUSINESS`, used for KYB |
| `CONSUMER` | The end customer being charged |

## What's supported

- US transactions only. There is no dynamic currency conversion, no PSD2 or SCA, and no local schemes.
- All Card Payments work uses the V3 endpoints.
- Funds settle to the `destination.wallet_uuid` you set on the charge.

:::scalar-callout{type="info"}
Alviere is not a payment facilitator. Per-sub-merchant statement descriptors, per-sub-merchant MCC, and per-sub-merchant chargeback isolation are not available.
:::

## Next steps

1. Read the [Payment Acceptance overview](/guides/payment-acceptance/payment-acceptance).
2. Follow [Integration](/guides/payment-acceptance/online-payments/card-payments/integration) to make your first charge.
3. Pick the configuration that matches your business model.
