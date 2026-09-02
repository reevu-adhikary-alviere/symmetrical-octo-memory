---
title: "Card Pull"
description: "Fund a wallet by pulling money from a saved card payment method"
---

# Card Pull

Pull funds from a saved card into a wallet. The customer tops up their balance from a debit or credit card on file, the charge runs against the card, and a `LOAD_FUNDS` transaction credits the wallet.

| Operation | Endpoint |
|---|---|
| Load funds | `POST /wallets/{wallet_uuid}/load` |

## Save the card first

The card has to exist as a [payment method](/guides/resources/payment-methods) before you can pull from it. The load request references `payment_method_uuid` and carries no card details.

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
| `amount` | In cents, as every V2 endpoint takes it. `5000` is $50.00. Required |
| `external_id` | Your [idempotency key](/guides/getting-started/idempotency), 8 to 64 characters. Required |
| `description` | Optional, up to 255 characters |
| `metadata` | Optional custom key-value pairs |
| `transaction_options.payment_options.prefund` | Set `true` to prefund this transaction |

The same endpoint loads from bank payment methods too. The `ACH_type` and `ach_reference` options under `transaction_options.payment_options` apply only to bank funding and do nothing on a card pull.

## Settlement timing

The `201` means Alviere accepted the load. The amount lands in the wallet's `transit` bucket, or in `pending` if the program is not prefunded, and moves into available balance on the card's settlement schedule. Show the customer the wallet's available balance, not the load response.

## What the transaction looks like

The load posts as `LOAD_FUNDS` with a positive amount. Status runs `CREATED`, then `PROCESSING_PAYMENT`, then `COMPLETED`, or `FAILED` if the issuer declines. A decline arrives as a status change on the transaction, so watch the transaction, not the `201`.

Two records can arrive after the fact.

- **`LOAD_PULLBACK`**. A completed load being pulled back, carrying `parent_transaction_uuid` pointing at the original load. See [Transactions Overview](/guides/transactions/transactions-overview#reversals-and-money-coming-back).
- **`REVERSAL`**. `POST /transactions/{transaction_uuid}/reverse` against a completed card load sends the money back to the card and posts a `REVERSAL` with a negative amount.

## Related

- [Payment Methods](/guides/resources/payment-methods). Save cards before pulling from them.
- [Wallets](/guides/resources/wallets). Where pulled funds land.
- [Transactions Overview](/guides/transactions/transactions-overview). `LOAD_FUNDS`, `LOAD_PULLBACK`, and `REVERSAL`.
