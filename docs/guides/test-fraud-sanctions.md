---
title: "Fraud & Sanctions Testing"
description: "Trigger transaction-level fraud and sanctions checks in Sandbox"
---

# Fraud & Sanctions Testing

## Transaction fraud checks

For transactions that run fraud checks during authorization, specific amounts produce different outcomes:

| Test conditions | Outcome |
|-----------------|---------|
| Consumer email domain `@example.com` + amount `$33.34` | Transaction status = `MANUAL_REVIEW` |
| Consumer email domain `@example.com` + amount `$33.35` | Transaction status = `FAILED` |

### Applicable transaction types

- `LOAD_FUNDS`
- `INTERNATIONAL_TRANSFER`
- `CARD_ISSUED_INITIAL`
- `WITHDRAW_FUNDS`
- `BANK_DEBIT`
- `PAYMENT`
- `WALLET_TRANSFER`
- `CHECK_DEPOSIT`

## Transaction sanctions checks

For transactions that run sanctions checks during authorization:

| Test conditions | Outcome |
|-----------------|---------|
| Transaction amount `$5.56` | Transaction status = `MANUAL_REVIEW` |

### Applicable transaction types

- `INTERNATIONAL_TRANSFER`
- `BANK_DEBIT` to local beneficiaries
