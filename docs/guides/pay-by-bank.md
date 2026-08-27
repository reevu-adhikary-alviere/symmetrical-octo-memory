---
title: "Pay by Bank"
description: "Accept ACH debit payments with bank linking, recurring debits, returns, and webhooks"
---

# Pay by Bank

Accept ACH debits from your payers' bank accounts. Pay by Bank gives you bank linking, instant verification, recurring debits with retry handling, NSF logic, and settlement webhooks.

Use it anywhere you want a lower-cost alternative to card and can live with a 1-3 day settlement window. The savings matter most on recurring and high-ticket charges, where interchange takes a real bite out of the margin.

## When to use Pay by Bank

| Your use case | What to use |
|---|---|
| Embedded finance: accounts, wallets, KYC, card issuance | HIVE Platform guides + V2 API |
| ACH acceptance only (e.g. enterprise bill pay) | Pay by Bank + V3 ACH endpoints |
| Card at checkout with a convenience fee | [Bill Pay (Card)](/guides/payment-acceptance/use-cases/card-config-bill-pay) |
| Lower-cost recurring bill pay | Pay by Bank |

## What you'll build

1. **Bank linking**. Hosted or SDK flow so payers can connect their bank account.
2. **Recurring debits**. Stored mandates, automatic retries, NSF handling.
3. **Checkout**. Optional white-label payment page.
4. **Reconciliation**. Files and APIs to post settled payments into your accounting system.
5. **Returns**. NACHA return-window handling with webhook notifications.

Save bank accounts via [Payment Methods](/guides/resources/payment-methods) before debiting them.

## API endpoints

| Endpoint | Status |
|---|---|
| `POST /v3/ach/debit` | Available |
| `POST /v3/ach/credit` | In development |
| Instant incoming rails | In development |

See **Bank Payments** in the [V3 API Reference](/api-v3).

## Card vs. bank payments

| | Card ([Bill Pay](/guides/payment-acceptance/use-cases/card-config-bill-pay)) | ACH (Pay by Bank) |
|---|---|---|
| Cost to the biller | Higher (interchange) | Lower |
| Payer experience | Instant confirmation | Bank link + debit |
| Typical fee model | Convenience fee to payer | Often lower or none |
| Best for | Payers who want card | Cost-sensitive recurring bill pay |

Many bill-pay platforms offer both rails through Alviere.

## Related

- [Bill Pay (Card)](/guides/payment-acceptance/use-cases/card-config-bill-pay)
- [Payment Methods](/guides/resources/payment-methods)
- [Which API version?](/guides/getting-started/api-versions)
