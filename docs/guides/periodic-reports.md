---
title: "Periodic Reports"
description: "Daily and monthly CSVs on SFTP for warehouse ingest and reconciliation. Data Reporting"
---

# Periodic Reports

Called Data Reporting in ops and on the SFTP. Same files.

Every program gets daily CSVs on SFTP with the same entities the APIs return. Use the APIs and `WALLET_TRANSACTION` webhooks for real-time flow. Use these files for warehouse backfill, BI, and end-of-day reconciliation.

Fields match the API docs. If a field is on the API, it is on the report with the same meaning.

## How it works

* **CSV, UTF-8, header row, one record per row.** Blank string field is empty. Non-string nulls are `null`.
* **UTC.** Generated daily at 08:00 UTC.
* **SFTP.** `sftp.program.alviere.com:22`, username is `program_uuid`, auth is private key.
* **Filename encodes the query.**
  `[ProgramName]_[Scope]-report_[Type]_[Frequency]_[From]_[To].csv`
  Snapshot omits `From`: `..._[Type]_[Frequency]_[To].csv`
  Example: `utility-pay-by-bank_payout-reconciliation-report_delta_daily_2026-03-23T000000Z_2026-03-23T235959Z.csv`

## Scopes

One file per scope. Identify it from the filename's `Scope` segment.

| Scope | What it holds |
|---|---|
| `consumer-transactions` (PREP-01) | Consumer wallet transactions |
| `cardholder-transactions` (PREP-02) | Cardholder transactions |
| `business-transactions` (PREP-03) | Business transactions |
| `issued-cards` (PREP-04) | Issued card inventory and status |
| `vault-transactions` (PREP-06) | Treasury vault movements |
| `card-payment-methods` (PREP-07) | Card PMs (type, last4, load/withdraw support) |
| `bank-payment-methods` (PREP-08) | Bank PMs (status, last4, Plaid flag) |
| `wallets` (PREP-09) | Wallet status, balances by bucket |
| `accounts` (PREP-10) | Account type, status, KYC stage/profile |
| `checks` (PREP-11) | Check deposits and status |
| `payout-methods` (PREP-12) | Payout methods and beneficiary link |
| `activities` (PREP-13) | Denied auths, PIN changes, NOCs, etc. |
| `beneficiaries` (PREP-14) | Beneficiary status and ID |
| `payout-reconciliation` (PREP-17) | Payout legs with settlement stamps |

## Types and frequency

| Type | Meaning | Frequency |
|---|---|---|
| `delta` | Last status of entities created/changed in the window | Daily or monthly |
| `historical` | Every event in the window | Daily or monthly |
| `snapshot` | Last status of **all** entities at generation time | Monthly only |

Availability by scope:

| Scope | Delta | Historical | Snapshot |
|---|:---:|:---:|:---:|
| Consumer/cardholder/business transactions | y | y | — |
| Issued cards | y | y | y |
| Vault transactions | y | y | — |
| Card/bank payment methods | — | y | y |
| Wallets | y | — | y |
| Accounts | — | y | y |
| Checks | y | y | y |
| Payout methods, activities, beneficiaries | varies | y | — |
| Payout reconciliation | y¹ | — | — |

¹ Delta: only `COMPLETED` or `PROCESSING_PAYMENT` with a settlement date; a transition from processing to completed the next day is not re-emitted.

Filename's `Frequency` is `daily` or `monthly`.

## Setup

**During implementation.** Generate a key pair via AWS Transfer Family, share the public key with Implementation over Sharefile. Alviere provisions the SFTP and confirms.

**After go-live.** Open a CARE ticket (`support@alviere.com` or Portal → Get Support) naming the exact report: `[ProgramName]_[Scope]-report_[Type]_[Frequency]_[From]_[To].csv`. Say if you need backfill from inception.

## Using the files

* **Join on UUIDs.** Use `transaction_uuid`, `wallet_uuid`, `account_uuid`, `payment_method_uuid`, `beneficiary_uuid`, not names. Relations match the API. See the primary-key diagram in the full client guide.
* **Ordered by `updated_at` ascending.** Treat the files as the reconciliation source of truth. Treat APIs and webhooks as the operational signal.
* **Pay by Bank.** `payout-reconciliation` (delta, daily) plus the transaction reports gives you settled legs. Pair with `WALLET_TRANSACTION` webhooks and `GET /transactions`. See [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction).

## Related

* [Transactions Overview](/guides/transactions/transactions-overview) — statuses and types
* [Webhooks](/guides/more/webhooks)
* [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction)
