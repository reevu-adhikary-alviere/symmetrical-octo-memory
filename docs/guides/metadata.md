---
title: "Metadata"
description: "Attach your own key-value data to Alviere entities for lookups and reconciliation"
---

# Metadata

Most Alviere entities support a `metadata` field — a free-form set of key-value pairs you control. Alviere doesn't use or process this data; it's there for you to tie Alviere objects to records in your own systems.

## Common uses

- **Link IDs** — attach your system's unique ID to an Alviere entity so you can look up the same record from both sides (e.g. your customer ID on an account, store location on a load, promo code on a card)
- **Customer notes** — store internal IDs or comments about a customer

## Adding metadata

Include the `metadata` object when creating (`POST`) or updating (`PATCH`) an entity:

```json
PATCH /accounts/{account_uuid}

{
  "information": {
    "consumer_information": {
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "metadata": {
    "customer_id": "35082920"
  }
}
```

## Removing metadata

Send a `PATCH` with an empty metadata object:

```json
PATCH /accounts/{account_uuid}

{
  "metadata": {}
}
```

:::scalar-callout{type="warning"}
Don't store sensitive information in metadata — no bank account numbers, card details, full SSNs, or anything you wouldn't want surfaced in plain text.
:::
