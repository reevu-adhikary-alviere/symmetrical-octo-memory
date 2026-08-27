---
title: "Card Payments Integration"
description: "Charge a card with POST /v3/cards/debit, route funds with destination.wallet_uuid, and apply fee splits"
---

# Integration

Charge a card and route the funds to the right account. This is the hands-on companion to the [Card Payments overview](/guides/payment-acceptance/online-payments/card-payments/introduction).

## Charge a card

Every card charge goes through a single endpoint:

```bash
POST /v3/cards/debit
```

A charge sets the amount, an `external_id` you control, the card to charge (`source`), and the account that gets paid (`destination.wallet_uuid`):

```bash
curl -X POST https://api.snd.alviere.com/v3/cards/debit \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "108.00",
    "currency": "USD",
    "auth_type": "AUTHCAP",
    "external_id": "order_1000456",
    "source": { "payment_method_uuid": "550e8400-e29b-41d4-a716-446655440000" },
    "destination": { "wallet_uuid": "223e4567-e89b-12d3-a456-426614174000" }
  }'
```

| Field | What it does |
|---|---|
| `amount` | Decimal string, e.g. `"108.00"` |
| `auth_type` | `AUTHCAP` authorizes and captures in one step |
| `external_id` | Your unique reference. Guards against [duplicate charges](/guides/getting-started/idempotency) on retry |
| `source` | The card to charge: a saved `payment_method_uuid` or an inline `card` |
| `destination.wallet_uuid` | The account that gets paid. This is what selects the business model |

Setting `destination.wallet_uuid` is what turns the same primitive into "direct merchant," "marketplace," or "bill pay."

## How fees work

The same charge can carry two kinds of fee. Both are set up as rules by your program manager. You don't configure them in code today.

| Who charges who | Fee type | Where the money lands |
|---|---|---|
| **Platform** charges **seller** (commission) | `SERVICE_FEE` (DEDUCT) | Your platform |
| **Seller** charges **buyer** (payer upcharge) | `CONVENIENCE_FEE` (UPCHARGE) | Seller's account |

The account you set as `destination.wallet_uuid` is always the one that gets paid. Fees are computed and routed automatically. See each business model for a worked example: [direct merchant](/guides/payment-acceptance/use-cases/card-config-direct-merchant), [marketplace](/guides/payment-acceptance/use-cases/card-config-marketplace), [bill pay](/guides/payment-acceptance/use-cases/card-config-bill-pay).

## API reference

Card Payments endpoints live under `/v3/cards/*` in the [V3 API Reference](/api-v3). Looking for push-to-card payouts? Those are disbursements (`POST /v3/cards/push`), not acceptance. Find them under **Payouts**.

## Next steps

1. Pick the [configuration](/guides/payment-acceptance/online-payments/card-payments/introduction) that matches your business model.
2. Set up [Payment Methods](/guides/resources/payment-methods) to save cards before charging them.
