---
title: "Internal Transfers"
description: "Move funds between wallets on the same Alviere program, instantly"
---

# Internal Transfers

Move funds between two wallets on the same Alviere program. The money never leaves the Alviere ledger, so there is no bank leg to wait on: the sender's wallet is debited and the recipient's wallet is credited in one ledger operation, posting as a `WALLET_TRANSFER` on both sides.

One endpoint covers it:

| Operation | Endpoint | Direction |
|---|---|---|
| Send to wallet | `POST /wallets/{wallet_uuid}/send` | Debit the sender, credit the recipient |

## Sending

```
POST /wallets/{wallet_uuid}/send
```

```json
{
  "destination_wallet_uuid": "3b0c5dd8-83fc-4d62-b54b-3780148e50c9",
  "external_id": "p2p-2026-000171",
  "amount": 2500,
  "description": "Rent split for March",
  "metadata": {
    "invoice_id": "2026-03-114"
  }
}
```

| Field | Notes |
|---|---|
| `destination_wallet_uuid` | The wallet receiving the funds |
| `external_id` | Your idempotency key, 8 to 64 characters. Required. Retrying with the same value returns `409` with the original transaction instead of creating a second one |
| `amount` | In cents. `2500`, not `"25.00"` |
| `service_fees` | Optional array of service fees to apply to the send |
| `description` | Optional free text identifying the transaction |
| `metadata` | Optional custom key-value pairs, stored with the transaction |

`amount` is debited from the wallet in the path and credited to the destination wallet. Reconcile the two sides by the shared `external_id`, and remember the sign convention from the [Transactions Overview](/guides/transactions/transactions-overview): the sender's record posts negative, the recipient's positive.

## Prerequisite: a P2P program

The send endpoint is only available to customers subscribed to a P2P program. If your program does not include P2P, the call fails with `403` regardless of the wallets involved. Confirm your program configuration before building a send flow on top of it.

## When to use what

Internal transfers move money between wallets you already hold on the program. If the recipient is outside the program, you need a different rail: [Global Money Transfers](/guides/transactions/global-money-transfers) for an international beneficiary, or a withdrawal to a bank account. Sending to a saved beneficiary's payout method is a transfer, not an internal transfer — see [Beneficiaries](/guides/resources/beneficiaries).

## Related

- [Wallets](/guides/resources/wallets). Fund buckets and how balances work.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses and lifecycle.
- [Global Money Transfers](/guides/transactions/global-money-transfers). Cross-border transfers.
