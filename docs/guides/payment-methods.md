---
title: "Payment Methods"
description: "Save cards and bank accounts on a customer's account so you can charge or pay out later"
---

# Payment Methods

A payment method is a saved card or bank account tied to an account (consumer, business, or cardholder). You'll use payment methods to load wallets, send withdrawals, or fund transactions like international transfers and P2P passthrough.

Save a payment method once, then reuse it on charges, payouts, or remittances.

## Types

### Card

Debit, credit, or prepaid cards.

**Statuses**

| Status | Description |
|--------|-------------|
| `ACTIVE` | Verified and operational |
| `FAILED` | Processing attempt failed |
| `EXPIRED` | Card has reached end-of-life |
| `REJECTED` | Declined by the system |
| `DELETED` | Removed from the system |

**Fail reasons**

| Reason | Description |
|--------|-------------|
| `CARD_TYPE_NOT_SUPPORTED` | Card type is not supported by the program |
| `CARD_NAME_MISMATCH` | Name on card doesn't match the issuer's records |
| `CARD_COUNTRY_NOT_ALLOWED` | Card issued by a country not allowed in the program |
| `ISSUED_CARD_NOT_ALLOWED_AS_PM` | Alviere-issued cards can't be used as a payment method |

### Bank

Bank accounts connected for direct debits, credits, and transfers. Plaid and similar integrations let your customers link a bank account in a few clicks.

**Statuses**

| Status | Description |
|--------|-------------|
| `ACTIVE` | Verified and ready for transactions |
| `PROCESSING` | Currently being verified |
| `FAILED` | Transaction or verification attempt failed |
| `REJECTED` | Declined by the system |
| `DELETED` | Removed from the system |

**Fail reasons**

| Reason | Description |
|--------|-------------|
| `CUSTOM` | Custom-defined failure reason |
| `TRANSACTION_FAILED` | Associated transaction failed |
| `NEEDS_UPDATE` | Bank details require an update |
| `ACCOUNT_MISMATCH` | Details don't match bank records |
| `INVALID_BANK_TYPE` | Bank account type not supported |
| `INVALID_PUBLIC_TOKEN` | Public token is not valid |
| `BANK_FAILED` | Bank verification failed (e.g. invalid routing number) |
