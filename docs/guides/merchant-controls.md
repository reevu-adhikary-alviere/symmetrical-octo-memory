---
title: "Merchant Controls"
description: "Restrict an issued card to an allow-list of merchants"
---

# Merchant Controls

A card can be locked to a set of merchants. Anything authorized outside that set is declined at the network, before it reaches your systems, so the control holds whether or not your service is up.

This is a per-card control, set through `auth_rules.allowed_merchants`. It is the only authorization rule available on an issued card.

## Setting an allow-list

Pass `auth_rules` when you create the card:

```bash
curl -X POST https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "card-4410-a",
    "product_id": "885",
    "auth_rules": {
      "allowed_merchants": {
        "allowed_merchant_ids": ["8123434", "8123777"],
        "allowed_merchant_names": ["Alviere", "Alviere, Inc."]
      }
    }
  }'
```

| Field | Notes |
|---|---|
| `allowed_merchant_ids` | Merchant IDs to accept. Only transactions whose merchant ID is in the list are authorized |
| `allowed_merchant_names` | Merchant names to accept. Only transactions whose merchant name is in the list are authorized |

A card with no `auth_rules`, or with both arrays empty, is unrestricted. That is the default, and it is what you see on most cards:

```json
{
  "auth_rules": {
    "allowed_merchants": {
      "allowed_merchant_ids": [],
      "allowed_merchant_names": []
    }
  }
}
```

Set either list and the card becomes restricted to what you listed. A transaction from a merchant that matches neither is declined.

## Choosing IDs or names

Both identify the same thing from different angles, and they behave differently in practice.

| | Merchant ID | Merchant name |
|---|---|---|
| Stability | Stable for a given acquirer relationship | Changes with rebrands, and varies by acquirer |
| Precision | Exact | Depends on the string the merchant sends |
| Getting one | Read it off a prior authorization for that merchant | Read it off a prior authorization for that merchant |

Prefer IDs where you have them, since they match exactly. Names are useful for a merchant that appears under several IDs, and they work best where the merchant submits the same name across its terminals. Confirm that against real authorizations before you rely on a name.

Whichever you use, take the value from a real authorization on your program rather than from the merchant's branding.

## Reading the current rules

`auth_rules` comes back on every card read, on `GET`, on `POST`, and in the `ISSUED_CARD` webhook payload, so you can see what a card is restricted to without keeping your own copy.

```bash
curl https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards/{card_uuid} \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18"
```

## Program configuration

Merchant allow-lists are enabled per card product. If yours is not configured for them, sending a list returns a `400` validation error and no rule is stored.

## What this does not cover

Merchant controls decide **where** a card works. They do not decide how much it can spend.

Spending caps on Alviere are set at the **account** level and apply across the account rather than to one card. Those enforce as daily and rolling-period limits and return a `400` validation error when hit. See [Accounts](/guides/resources/accounts) and [Error Codes](/guides/getting-started/error-codes) for lookup.

Do not model per-card spend caps on top of account limits. They are different features with different scopes, and an account limit hit on one card affects every card on that account.

## Related

- [Issued Cards](/guides/cards/cards). Setting `auth_rules` at creation.
- [Incentives](/guides/cards/incentives). Merchant-scoped cashback and boosts, which use a separate merchant list.
- [Card Operations](/guides/cards/card-operations). Freezing a card, which declines everything rather than restricting it.
