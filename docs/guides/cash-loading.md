---
title: "Cash Loading"
description: "Generate barcodes so customers can load cash into their wallet at retail locations"
---

# Cash Loading

Let customers turn cash into wallet balance at a retail register. You generate a one-time barcode, the customer shows it at a participating store, the cashier scans it and takes the cash, and a `CASH_LOADING` transaction credits the wallet.

| Operation | Endpoint |
|---|---|
| Generate a barcode | `POST /cash-load/barcode` |
| Find participating stores | `GET /cash-load/locations` |

## Generating a barcode

```
POST /cash-load/barcode
```

```json
{
  "owner": {
    "wallet_uuid": "987fcdeb-51a2-43d1-9c45-123456789abc"
  },
  "external_id": "barcode-2026-00042"
}
```

`owner` takes one of two keys.

| Key | Funds land in |
|---|---|
| `wallet_uuid` | That wallet |
| `account_uuid` | The account's primary wallet |

`external_id` is your [idempotency key](/guides/getting-started/idempotency). A retried request with the same value gets the original barcode back, not a second one.

The response is a barcode you can render as is.

```json
{
  "barcode": {
    "barcode_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "barcode_image": "iVBORw0KGgoAAA...",
    "barcode_data": "1234567890123",
    "barcode_format": "CODE-128",
    "limits": {
      "min": "1000",
      "max": "50000"
    },
    "expires_at": "2026-09-30T23:59:59Z"
  }
}
```

- **`barcode_image`** is a base64 PNG in `CODE-128`. Render it as delivered rather than rebuilding it from `barcode_data`.
- **`limits`** gives the minimum and maximum load for this barcode, in cents. Enforce them in your UI before the customer travels to the store.
- **`expires_at`** is when the barcode stops working. A barcode also stops working after one use.

You can pass `customer_location` with the customer's latitude and longitude when generating, so the barcode is issued for the store network nearest them.

## Finding stores

```
GET /cash-load/locations?postal_code=30303&radius=5
```

Search by `postal_code`, or by `latitude` and `longitude`, with a `radius` in miles from 0.1 to 25. The response returns store name, address, phone numbers, distance, and the network's `store_network_id`. The same identifier later shows up on the transaction's `type_details`, which ties a load back to where it happened.

## Statuses

A cash load runs `CREATED`, then `PROCESSING_PAYMENT`, then `COMPLETED`. The transaction posts as `CASH_LOADING` with a positive amount, and its `type_details` carries the store and barcode data. In Sandbox the whole flow is simulated. See [Cash Loading Testing](/guides/sandbox-testing/test-cash-loading) for the mock endpoint and failure scenarios.

## Related

- [Wallets](/guides/resources/wallets). Where loaded cash lands.
- [Transactions Overview](/guides/transactions/transactions-overview). `CASH_LOADING` and its `type_details`.
- [Cash Loading Testing](/guides/sandbox-testing/test-cash-loading). Simulating loads in Sandbox.
