---
title: "Internal Transfers"
description: "Move funds between wallets on the same Alviere program, instantly"
---

# Internal Transfers

Move funds between two wallets on the same Alviere program. The money never leaves the Alviere ledger, so there is no bank leg to wait on. The sender's wallet is debited and the recipient's wallet is credited in one ledger operation, and both sides post as a `WALLET_TRANSFER`.

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
| `external_id` | Your [idempotency key](/guides/getting-started/idempotency), 8 to 64 characters. Required |
| `amount` | In cents, as every V2 endpoint takes it. `2500` is $25.00 |
| `service_fees` | Optional array of service fees to apply to the send |
| `description` | Optional free text identifying the transaction |
| `metadata` | Optional custom key-value pairs, stored with the transaction |

`amount` is debited from the wallet in the path and credited to the destination wallet. Reconcile the two sides by the shared `external_id`, and remember the sign convention from the [Transactions Overview](/guides/transactions/transactions-overview): the sender's record posts negative, the recipient's positive.

## The P2P module

The send endpoint needs the P2P module on your program. Without it the call returns `403` whatever wallets you name, so confirm the module with your program manager before you build on it.

For a recipient outside the program, use [Global Money Transfers](/guides/transactions/global-money-transfers) for an international beneficiary, `POST /wallets/{wallet_uuid}/transfer` for a domestic [beneficiary](/guides/resources/beneficiaries), or a withdrawal to the customer's own bank account.

## Related

- [Wallets](/guides/resources/wallets). Fund buckets and how balances work.
- [Transactions Overview](/guides/transactions/transactions-overview). `WALLET_TRANSFER` and the sign convention.
- [Global Money Transfers](/guides/transactions/global-money-transfers). Cross-border transfers.
