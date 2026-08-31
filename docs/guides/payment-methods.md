---
title: "Payment Methods"
description: "Save cards and bank accounts on a customer's account so you can charge or pay out later"
---

# Payment Methods

A payment method is a saved card or bank account tied to an account (consumer, business, or cardholder). Save it once, then reuse its `payment_method_uuid` to load a wallet, withdraw to a bank, or fund a transfer.

All payment methods live under an account. The account owns them, not the wallet.

```
POST /accounts/{account_uuid}/payment-methods/cards
POST /accounts/{account_uuid}/payment-methods/bank-accounts
POST /accounts/{account_uuid}/payment-methods/plaid-bank-accounts
```

## Pick the right type

| Use | Create | When |
|---|---|---|
| Card debit/credit | `POST .../cards` | One-off loads or OCT push-to-card where the customer types the card |
| Raw bank account (ACH/EFT/SWIFT/IBAN/CLABE) | `POST .../bank-accounts` | You already have routing + account number |
| Plaid-linked bank | `POST .../plaid-bank-accounts` | Recommended for US ACH. Plaid handles auth + verification |

Plaid is the default for bank. Use raw only if you collect routing/account yourself.

## Create a card

```bash
curl -X POST https://api.snd.alviere.com/accounts/{account_uuid}/payment-methods/cards \
  -H "Authorization: Bearer $TOKEN" -H "Version: 20211118" \
  -H "Content-Type: application/json" -d '{
    "external_id": "card_ext_1001",
    "pan": "4111111111111111",
    "exp_month": "12",
    "exp_year": "29",
    "security_code": "123",
    "name_on_card": "Jane Doe",
    "billing_address": {
      "line_1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postal_code": "10001"
    }
  }'
```

Required: `external_id` (your idempotent key), `pan`, `exp_month`, `exp_year`, `security_code`. If the account has no primary address on file, `billing_address` is required with all fields (`line_1`, `city`, `state`, `country`, `postal_code`).

The response is always `201` with a `card` object. Check `card.status`, not the HTTP code. A failed validation still returns `201` with `status: FAILED` and `validation.cvv_result` / `avs_result`. Duplicate on the same account with `ACTIVE`/`CREATED`/`PENDING` returns `400`.

Alviere-issued cards cannot be saved as a payment method (`ISSUED_CARD_NOT_ALLOWED_AS_PM`).

### What you get back

`payment_method_uuid`, `last_4`, `brand` (`VISA` etc), `type` (`CREDIT`/`DEBIT`/`PREPAID`), `status`, `flags.load_supported` / `flags.withdraw_supported`, `created_at`.

## Create a bank account (raw)

```bash
curl -X POST https://api.snd.alviere.com/accounts/{account_uuid}/payment-methods/bank-accounts \
  -H "Authorization: Bearer $TOKEN" -H "Version: 20211118" \
  -H "Content-Type: application/json" -d '{
    "external_id": "bank_ext_2001",
    "country": "USA",
    "currency": "USD",
    "bank_account_details": {
      "ach": { "routing_number": "021000021", "account_number": "123456789" }
    }
  }'
```

`bank_account_details` is one of: `ach` (US), `eft` (CA: `transit_number` + `institution_code`), `swift`, `iban`, `clabe`. Duplicate with `CREATED`/`ACTIVE`/`PROCESSING` returns `400`.

Response is `201` with `bank_account`. Check `status` and `verified`.

## Create a bank via Plaid (recommended)

Use Plaid Link to avoid handling routing numbers. See [Plaid Integration](/guides/more/plaid) for the Link flow.

```bash
# after onSuccess from Plaid Link: publicToken + plaid_account_id
curl -X POST https://api.snd.alviere.com/accounts/{account_uuid}/payment-methods/plaid-bank-accounts \
  -H "Authorization: Bearer $TOKEN" -H "Version: 20211118" \
  -H "Content-Type: application/json" -d '{
    "external_id": "bank_ext_2002",
    "country": "USA",
    "currency": "USD",
    "plaid_public_token": "public-sandbox-...",
    "plaid_account_id": "acc_..."
  }'
```

If the bank later needs re-auth (`status: PENDING` + `NEEDS_UPDATE`), request an update token and call `PUT /accounts/{account_uuid}/payment-methods/plaid-bank-accounts/{payment_method_uuid}/activate`. [Plaid update mode](/guides/more/plaid#updating-an-account).

## Statuses and what to do

### Card

| Status | Means | Action |
|--------|-------|--------|
| `ACTIVE` | Verified and ready | Use it |
| `PENDING` / `CREATED` | Being verified | Wait, poll `GET .../cards/{pm_uuid}` |
| `FAILED` | Validation failed | Check `fail_reason` / `validation.error_code`, fix and retry with new `external_id` |
| `REJECTED` | Declined by system | Don't retry same card |
| `EXPIRED` | Past expiry | Ask for new card |
| `DELETED` | Removed | Create again if needed |

**Fail reasons:** `CARD_TYPE_NOT_SUPPORTED`, `CARD_NAME_MISMATCH`, `CARD_COUNTRY_NOT_ALLOWED`, `ISSUED_CARD_NOT_ALLOWED_AS_PM`. `cvv_result` / `avs_result` are always returned on create.

### Bank

| Status | Means | Action |
|--------|-------|--------|
| `ACTIVE` | Verified, `verified: true` | Use for `load` / `withdraw` |
| `PROCESSING` | Being verified | Wait |
| `PENDING` | Needs update (Plaid) | Re-auth via Plaid update mode |
| `FAILED` / `REJECTED` | Failed | Check `fail_reason` |
| `DELETED` | Removed | Create again |

**Fail reasons:** `CUSTOM`, `TRANSACTION_FAILED`, `NEEDS_UPDATE`, `ACCOUNT_MISMATCH`, `INVALID_BANK_TYPE`, `INVALID_PUBLIC_TOKEN`, `BANK_FAILED` (e.g. bad routing). `flags.debit` / `flags.credit` (or `load_supported` / `withdraw_supported`) tells you if the account can be debited or credited.

Always read `payment_method_uuid` from the `201` body — that's the handle for every later money-movement call.

## Using a payment method

* **Load a wallet:** `POST /wallets/{wallet_uuid}/load` with `payment_method_uuid` — funds land in `transit` (prefunded) or `pending` then `balance`. See [Wallets](/guides/resources/wallets).
* **Withdraw to bank/card:** `POST /wallets/{wallet_uuid}/withdraw` with `payment_method_uuid` — amount is held in `captive` until settled.
* **Other flows:** international transfers, `POST /v3/ach/debit` (Pay by Bank) — all take the same UUID.

## Manage

| Operation | Endpoint |
|---|---|
| List cards | `GET /accounts/{account_uuid}/payment-methods/cards` |
| Get card | `GET /accounts/{account_uuid}/payment-methods/cards/{payment_method_uuid}` |
| Update card | `PATCH /payment-methods/cards/{payment_method_uuid}` |
| Delete card | `DELETE /accounts/{account_uuid}/payment-methods/cards/{payment_method_uuid}` — `204`. Not allowed when `FAILED` |
| List banks | `GET /accounts/{account_uuid}/payment-methods/bank-accounts` |
| Get bank | `GET /accounts/{account_uuid}/payment-methods/bank-accounts/{payment_method_uuid}` |
| Update bank | `PATCH /payment-methods/bank-accounts/{payment_method_uuid}` |
| Delete bank | `DELETE /accounts/{account_uuid}/payment-methods/bank-accounts/{payment_method_uuid}` — `204`. Not allowed when `CREATED`/`FAILED`/`REJECTED` |

`external_id` must be unique per account — duplicate returns `409` on Plaid, `400` on raw. Use `primary: true` to mark a default. `metadata` is free-form on all creates.

## Related

* [Plaid Integration](/guides/more/plaid) — Link setup, OAuth, sandbox test credentials
* [Wallets](/guides/resources/wallets) — `transit` / `pending` / `captive` buckets
* [ACH](/guides/transactions/ach) / [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) — using a bank PM to pull funds
