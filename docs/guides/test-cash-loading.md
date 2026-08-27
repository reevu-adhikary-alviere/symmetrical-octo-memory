---
title: "Cash Loading Testing"
description: "Simulate cash load transactions using barcodes in Sandbox"
---

# Cash Loading Testing

Cash load transactions flow through these statuses:

`CREATED` → `PROCESSING_PAYMENT` → `COMPLETED`

Cash loads are simulated in Sandbox since the system isn't connected to external retail networks.

## Simulate a cash load

Call the mock endpoint with a valid barcode UUID and amount:

```bash
curl --location 'https://mock.snd.alviere.com/cashloadWithBarcode' \
  --header 'Content-Type: application/json' \
  --data '{
    "barcode_uuid": "f84a40dd-3fbc-4478-bf89-ca5b30a95272",
    "amount": 123.12
  }'
```

**Requirements:**
- Barcode UUID must be valid and not previously used
- Barcode must belong to a `CHECKING` wallet
- Amount must meet the minimum ($5 USD)

A successful response returns `200 Success`.

## Success response

```json
{
  "transaction": {
    "transaction_uuid": "776b2949-ac18-4238-98db-e1482207bc8f",
    "wallet_uuid": "6bff373e-f376-4af7-872a-8520756767e5",
    "account_uuid": "6bff373e-f376-4af7-872a-8520756767e5",
    "external_id": "db6e0e7d-e323-4258-8ce5-18090209d525",
    "transaction_type": "CASH_LOADING",
    "status": "COMPLETED",
    "amount": 200,
    "currency": "USD",
    "type_details": {
      "payments_details": {
        "cash_loading": {
          "cash_loading_location": {
            "store_network_id": "7805446fa58cb76d059c828c3c0bda49",
            "store_name": "Dollar General",
            "terminal_id": "terminal-000",
            "barcode_data": "1234567890"
          }
        }
      }
    },
    "refunded": false,
    "disputed": false,
    "created_at": "2025-05-20T09:30:20.440433Z",
    "updated_at": "2025-05-20T09:30:20.440433Z"
  }
}
```

## Simulate a failed cash load

To trigger a failure, use a barcode UUID that's already been used. The response shows `status: "FAILED"`:

```json
{
  "transaction": {
    "transaction_uuid": "776b2949-ac18-4238-98db-e1482207bc8f",
    "wallet_uuid": "6bff373e-f376-4af7-872a-8520756767e5",
    "account_uuid": "6bff373e-f376-4af7-872a-8520756767e5",
    "external_id": "db6e0e7d-e323-4258-8ce5-18090209d525",
    "transaction_type": "CASH_LOADING",
    "status": "FAILED",
    "amount": 200,
    "currency": "USD",
    "type_details": {
      "payments_details": {
        "cash_loading": {
          "cash_loading_location": {
            "store_network_id": "7805446fa58cb76d059c828c3c0bda49",
            "store_name": "Dollar General",
            "terminal_id": "terminal-000",
            "barcode_data": "1234567890"
          }
        }
      }
    },
    "refunded": false,
    "disputed": false,
    "created_at": "2025-05-20T09:30:20.440433Z",
    "updated_at": "2025-05-20T09:30:20.440433Z"
  }
}
```
