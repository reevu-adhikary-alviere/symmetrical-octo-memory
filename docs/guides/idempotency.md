---
title: "Idempotency"
description: "Use external_id to stop a retried request from creating a duplicate operation"
---

# Idempotency

A financial operation must never run twice because of a network retry. On Alviere you guard against that with **`external_id`** — your own unique identifier that you send on each write request.

## How it works

Set `external_id` to a value you control and can regenerate on retry (your order ID, or a UUID you persist). Alviere ties the operation to that value:

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

## Behavior

| Scenario | Result |
|----------|--------|
| First request with a given `external_id` | Processed normally |
| Repeat request with the same `external_id` | Rejected with **`409 Conflict`** — no second operation is created |

A duplicate is **rejected**, not silently replayed. So if a write returns `409`, treat it as "the original already went through" — look up that operation by its `external_id` and reconcile, rather than retrying again.

## Requirements

- `external_id` must be unique per operation
- On a retry, send the **same** `external_id` as the original request — that's what lets Alviere recognize the duplicate

:::scalar-callout{type="warning"}
Always set `external_id` on financial writes (card debits, ACH debits, and other money-movement requests) so a network retry can't create a duplicate charge.
:::
