---
title: "Incentives"
description: "Reward card spending with cashback and balance boosts"
---

# Incentives

Incentives reward cardholders based on how they spend. You configure the rules at the program level and they apply automatically to qualifying transactions — no work to do at charge time.

## Incentive types

### Cashback

Returns a portion of the cardholder's spend as a credit to their wallet. Use cashback to encourage repeat spending by promising a rebate.

### Boost

Temporarily boosts the cardholder's available wallet balance during card authorization. Use boosts to encourage larger transactions or specific spending behaviors at the moment of purchase.

## Scope

| Scope | Applies to |
|-------|------------|
| `GLOBAL` | Every transaction in the program — all cardholders qualify regardless of card |
| `ISSUED_CARD` | Only transactions on the specific issued cards the rule is attached to |

## Calculation

| Method | How it works | Example |
|--------|-------------|---------|
| **Fixed amount** | Predetermined sum, regardless of transaction size | $5 cashback on any purchase |
| **Percentage** | Fraction of the transaction amount | 10% cashback → $10 on a $100 purchase |

## Expiration

Rules can expire two ways:

| Method | Description |
|--------|-------------|
| **Date-based** | Valid until a specific date, then no longer available |
| **Usage-based** | Expires after a set number of uses per cardholder |

:::scalar-callout{type="info"}
Cashback and boost payouts pull from the program's **Promo Funds** treasury vault — make sure it's funded before enabling incentive rules.
:::
