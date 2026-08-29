---
title: "Cash Loading"
description: "Generate barcodes so customers can load cash into their wallet at retail locations"
---

# Cash Loading

Let customers turn physical cash into wallet balance at a retail register. You generate a one-time barcode through the API, the customer presents it at the register of a participating store, the cashier scans it and takes the cash, and a `CASH_LOADING` transaction credits the wallet.

Two endpoints cover it:

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

`owner` takes exactly one of two keys:

| Key | Funds land in |
|---|---|
| `wallet_uuid` | That wallet |
| `account_uuid` | The account's primary wallet |

`external_id` is your idempotency key. Sending the same value again returns `409` with the original barcode rather than a new one, so a retried request can never mint a second barcode.

The response is a render-ready barcode:

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

Three things on the barcode drive what you show the customer:

- **`barcode_image`** is a base64 PNG in `CODE-128` format. Render it as-is; do not rebuild the barcode from `barcode_data`.
- **`limits`** gives the min and max load amounts for this barcode, in cents. Enforce them in your UI before the customer travels to the store.
- **`expires_at`** is when the barcode stops working. Treat it as one-time: a barcode that has been used once will fail.

You can pass `customer_location` with the customer's latitude and longitude when generating. It helps route the load to the right store network.

## Finding stores

```
GET /cash-load/locations?postal_code=30303&radius=5
```

Search by `postal_code`, or by `latitude` and `longitude`, with a `radius` in miles from 0.1 to 25 (default 5). The response returns store name, address, phone numbers, distance, and the network's `store_network_id` — the same identifier that later shows up on the transaction's `type_details`, which is how you tie a load back to where it happened.

## Statuses

A cash load follows `CREATED` → `PROCESSING_PAYMENT` → `COMPLETED`. The transaction posts as `CASH_LOADING` with a positive amount, and its `type_details` carries the store and barcode data. In Sandbox the whole flow is simulated — see [Cash Loading Testing](/guides/sandbox-testing/test-cash-loading) for the mock endpoint and failure scenarios.

## Related

- [Wallets](/guides/resources/wallets). Where loaded cash lands.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses and lifecycle.
- [Cash Loading Testing](/guides/sandbox-testing/test-cash-loading). Simulating loads in Sandbox.
