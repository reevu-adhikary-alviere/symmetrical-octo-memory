---
title: "Incentives"
description: "Reward card spending with cashback and balance boosts"
---

# Incentives

Cashback and boosts pay out when an issued card spends. You attach rules to a card or to the program. Alviere applies them on `CARD_ISSUED_DEBIT`. That is the only `transaction_type` a rule matches. You do not call an incentives endpoint at authorization.

## Types

**Cashback.** Credits a portion of the spend back to the wallet, from the program's Promo Funds vault.

**Boost.** Temporarily increases available wallet balance at authorization, from the same vault.

:::scalar-callout{type="info"}
Fund Promo Funds before you turn rules on. See [Treasury Vaults](/guides/resources/treasury).
:::

## Scope

| Scope | Applies to |
|-------|------------|
| `GLOBAL` | Every card spend in the program |
| `ISSUED_CARD` | Only the issued cards the rule is attached to |

## Calculation

| Method | Fields | Example |
|--------|-------------|---------|
| **Fixed amount** | `value.amount` in cents | `amount: 500` → $5 cashback on any purchase |
| **Percentage** | `value.percent`, optionally `value.cap` | `percent: 10` → $10 on a $100 purchase |

`cap` is in cents and bounds a percentage payout. A rule with `percent: 10` and `cap: 5000` pays 10% up to $50, so a $1,000 transaction returns $50 rather than $100. Leave `cap` out for an uncapped percentage.

## Merchants

A rule can be limited to specific merchants with `merchants.merchant_ids`, `merchants.merchant_names`, or both. A rule with no `merchants` object applies at every merchant.

This is a separate list from `auth_rules.allowed_merchants` on the card. One decides where the incentive pays. The other decides where the card works at all. See [Merchant Controls](/guides/cards/merchant-controls).

## Expiration

Rules can expire two ways, both set under `expiration_rules`:

| Field | Description |
|--------|-------------|
| `expiration_date` | Valid until this date, then no longer available |
| `expiration_times` | The number of times the rule can be used per wallet before it expires |

## Attaching rules to a card

`ISSUED_CARD` rules reach a card through the card's own request, in one of two forms. Send `incentives` with either `rule_uuids` or `incentive_rules`, never both.

### Existing rules, by UUID

```json
{
  "external_id": "card-8871-a",
  "product_id": "885",
  "incentives": {
    "rule_uuids": [
      "4a2f9e51-7c1a-4f2e-b0d6-2f4c9a1e8b33"
    ]
  }
}
```

### Rules created with the card

```json
{
  "external_id": "card-8871-a",
  "product_id": "885",
  "incentives": {
    "incentive_rules": [
      {
        "external_id": "cashback-grocery-5pct",
        "incentive_type": "CASHBACK",
        "scope": "ISSUED_CARD",
        "description": "5% back, capped at $20",
        "value": {
          "percent": 5,
          "cap": 2000
        }
      }
    ]
  }
}
```

`scope` can only be `ISSUED_CARD` on card creation. A `GLOBAL` rule applies to every transaction in the program and is not something you attach to one card.

The same `incentives` object works on `PATCH`, so you can attach rules to a card after it exists. Rules currently on a card come back as `incentive_rule_uuids` on the card object.

Incentives are enabled per program. If yours is not configured for them, attaching rules returns a `400` validation error.

## Related

- [Issued Cards](/guides/cards/cards). Creating a card and the full request body.
- [Merchant Controls](/guides/cards/merchant-controls). Restricting where a card works, which is a different list.
- [Card Issuing Overview](/guides/cards/card-issuing-overview). Where incentives sit in the card API.
