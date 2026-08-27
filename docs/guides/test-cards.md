---
title: "Card Issuance Testing"
description: "Simulate card activation, swipes, brands, and shipping outcomes in Sandbox"
---

# Card Issuance Testing

When you issue a card, it flows through statuses until it becomes `ACTIVE`:

`CREATED` → `PROCESSING` → … → `READY_TO_ACTIVATE` → `ACTIVE`

In Sandbox, cards can't advance through these statuses automatically since the system isn't connected to external production environments. Use the mock endpoints below to drive a card through its lifecycle.

## Simulate card activation

To advance a card from `PROCESSING` to `READY_TO_ACTIVATE`, call the mock ship endpoint:

```bash
curl --location --request POST 'https://mock.snd.alviere.com/shipCard' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "card_uuid": "94fdd7cf-9c8c-4996-a852-4dda59153568"
  }'
```

Then call the `Activate Card` endpoint to activate the card. The last 4 digits and expiration date are in the Portal under the cardholder's issued card section.

:::scalar-callout{type="info"}
You won't need this step in production. The card must be in `SET_TO_EMBOSS` or `PROCESSING` status before you call this endpoint. `CREATED` won't work.
:::

## Simulate a card swipe

Once a card is active, use the mock swipe endpoint to generate a card transaction:

```bash
curl --location --request POST 'https://mock.snd.alviere.com/swipeCard' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "card_uuid": "b053ccd1-6f93-46c2-8384-68d4a040ca08",
    "amount": 199
  }'
```

Swap in your `card_uuid` and `amount`. A successful response returns `200 Success` and the transaction shows up in the Portal with status `PROCESSING_PAYMENT`.

:::scalar-callout{type="info"}
You won't need this step in production.
:::

## Card brands

You can simulate different card brands at card creation by setting a specific first name:

| Test conditions | Card brand |
|-----------------|------------|
| `firstName` = `Mestre` | MASTERCARD |
| `firstName` = `Vision` | VISA |
| `firstName` = `Baymax` | AMEX |
| `firstName` = `DISCO` | DISCOVERY |

## Shipping address and returned mail

To simulate returned mail on a physical card, use one of these addresses in the `Create Card` request:

| Shipping address | Card status |
|-----------------|-------------|
| `line_1` = `703 Lisbon Ave`, `postal_code` starts with `71762`, `state` = `AR` | `RETURNED_MAIL` |
| `line_1` = `124 Main st`, `postal_code` starts with `99901`, `state` = `AK` | `RETURNED_MAIL` |
| `line_1` = `567 Park Ave`, `postal_code` starts with `36535`, `state` = `AL` | `RETURNED_MAIL` |
