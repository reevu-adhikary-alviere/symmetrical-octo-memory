---
title: "Card Pull"
description: "Fund a wallet by pulling money from a saved card payment method"
---

# Card Pull

Pull funds from a saved card payment method into a wallet. The consumer tops up their balance from a debit or credit card on file, the charge runs against the card, and a `LOAD_FUNDS` transaction credits the wallet.

One endpoint covers it:

| Operation | Endpoint |
|---|---|
| Load funds | `POST /wallets/{wallet_uuid}/load` |

## Prerequisite: a saved card

The card has to be tokenized as a [payment method](/guides/resources/payment-methods) first. The load request only ever references `payment_method_uuid` — card details never appear in it.

## Loading

```
POST /wallets/{wallet_uuid}/load
```

```json
{
  "payment_method_uuid": "64010643-bd14-43f4-ab08-2886690ce12a",
  "amount": 5000,
  "external_id": "load-2026-000512"
}
```

| Field | Notes |
|---|---|
| `payment_method_uuid` | The saved card to charge. Required |
| `amount` | In cents. `5000`, not `"50.00"`. Required |
| `external_id` | Your idempotency key, 8 to 64 characters. Required. Retrying with the same value returns `409` with the original transaction instead of charging the card twice |
| `description` | Optional, up to 255 characters |
| `metadata` | Optional custom key-value pairs |
| `transaction_options.payment_options.prefund` | Set `true` to prefund this transaction |

The same endpoint loads from bank payment methods too. The `ACH_type` and `ach_reference` options under `transaction_options.payment_options` apply only to bank funding and do nothing on a card pull.

## Settlement timing

A successful `201` is an accepted load, not settled money. The amount lands in the wallet's `transit` bucket — or `pending`, depending on the program's prefunding setting — and moves into available balance according to the payment method's settlement times. Build your UI around the wallet's available balance rather than around the load call returning.

## What the transaction looks like

The load posts as `LOAD_FUNDS` with a negative-amount counterpart nowhere — this is money in, so the wallet record is positive. Statuses run `CREATED` → `PROCESSING_PAYMENT` → `COMPLETED`, with `FAILED` if the issuer declines the charge. Card declines surface through the transaction, so monitor the transaction status rather than treating the `201` as the money being there.

Two late-arrival cases to build for:

- **`LOAD_PULLBACK`** — a completed load being pulled back, carrying `parent_transaction_uuid` pointing at the original load. See [Transactions Overview](/guides/transactions/transactions-overview#reversals-and-money-coming-back).
- **`REFUND`** — loads can be refunded through `POST /transactions/{transaction_uuid}/refund`.

## Related

- [Payment Methods](/guides/resources/payment-methods). Save cards before pulling from them.
- [Wallets](/guides/resources/wallets). Where pulled funds land.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses and lifecycle.
