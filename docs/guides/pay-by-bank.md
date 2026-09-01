---
title: "Pay by Bank"
description: "Accept ACH debit payments with bank linking, scheduled payments, returns, and webhooks"
---

# Pay by Bank

Accept ACH debits from your payers' bank accounts. Lower cost than card, 1-3 banking-day settlement, best for recurring and high-ticket charges.

Use it anywhere you can wait for funds and want to avoid interchange.

## When to use Pay by Bank

| Your use case | What to use |
|---|---|
| Embedded finance: accounts, wallets, KYC, card issuance | HIVE Platform guides + V2 API |
| ACH acceptance only (e.g. enterprise bill pay) | Pay by Bank + V3 ACH endpoints |
| Card at checkout with a convenience fee | [Bill Pay (Card)](/guides/payment-acceptance/use-cases/card-config-bill-pay) |
| Lower-cost recurring bill pay | Pay by Bank |

## What you'll build

1. **Bank linking.** Your checkout collects the bank account via the [Payment Methods](/guides/resources/payment-methods) API. Or drop in [Alviere Checkout](/guides/payment-acceptance/online-payments/alviere-checkout/introduction), an embedded web component that handles linking, mandate, and debit in your page. Alviere does not host a payment page.
2. **Scheduled payments.** One-time and recurring schedules via `POST /v3/schedule/payments`. You own the schedule, the platform executes.
3. **Reconciliation.** [Periodic Reports](/guides/reporting/periodic-reports) (CSV on SFTP) plus `GET /transactions` and `WALLET_TRANSACTION` webhooks.
4. **Returns.** NACHA return handling with webhook notifications.

## How an ACH debit moves

| Stage | What happens | Typical timing |
|---|---|---|
| Payer authorizes | You collect the mandate and verify the bank account | Immediate |
| You call `POST /v3/ach/debit` | Alviere validates and queues the debit | Immediate |
| Submitted to FedACH | File goes to the network | Same banking day if before cutoff, next banking day if after |
| Settlement | Funds move to your program account | 1-3 banking days |
| Funds available | Wallet reflects the settled amount | On settlement |
| Return window open | Payer bank can return the debit | 2 banking days (business), 60 calendar days (consumer) |

Hold fulfillment until the transaction is `COMPLETED` or you receive the `WALLET_TRANSACTION` webhook. Weekends and federal holidays are not banking days.

## Authorization and mandate

You need the payer's authorization before every debit. Alviere serves the text, versions it, and records acceptance. `accepted_legal_texts` is required on `POST /v3/ach/debit`.

### 1. Fetch the text

```bash
curl -G https://api.snd.alviere.com/v3/legal-texts \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d type=ACH_DEBIT_AUTHORIZATION
```

```json
{
  "legal_texts": [{
    "legal_text_uuid": "ee332079-3bf4-4f9d-8f2b-df980c459ee9",
    "latest": true,
    "type": "ACH_DEBIT_AUTHORIZATION",
    "version": "2",
    "title": "ACH Debit Authorization",
    "document_text": "By selecting this box...",
    "document_url": "https://example.com/legal/ach-debit-v2"
  }]
}
```

| Type | Use |
|---|---|
| `ACH_DEBIT_AUTHORIZATION` | General debit mandate |
| `ACH_AUTHORIZATION_INDIVIDUAL_PAYER` | Consumer payer |
| `ACH_AUTHORIZATION_BUSINESS_PAYER` | Business payer |

### 2. Show it and capture acceptance

Render `document_text` (or link `document_url`) next to the checkbox or button the payer clicks. It must be visible at consent, not behind a link.

### 3. Pass the UUID on the debit

```json
POST /v3/ach/debit
{
  "external_id": "order_1000456",
  "amount": "108.00",
  "currency": "USD",
  "source": { "payment_method_uuid": "550e8400-e29b-41d4-a716-446655440000" },
  "destination": { "wallet_uuid": "223e4567-e89b-12d3-a456-426614174000" },
  "accepted_legal_texts": ["ee332079-3bf4-4f9d-8f2b-df980c459ee9"]
}
```

:::scalar-callout{type="warning"}
Fetch at display time. Texts are versioned, and a pinned UUID keeps collecting consent against superseded language.
:::

### Records to retain

Keep alongside your order: payer name/contact, authorized amount (or how it varies), one-time vs recurring and the schedule, date/time/channel of acceptance, and how you verified the account (Plaid, micro-deposits, or SDK). For variable recurring debits, notify the payer before each debit.

If the payer's bank claims the debit was not authorized, you have **10 banking days** to produce proof: the accepted legal text version plus the records above. Otherwise the return (`R10`/`R11`) is absorbed.

## Handling returns

A return is the payer's bank sending the debit back. Alviere posts a `RETURN` transaction (amount negative, `parent_transaction_uuid` → original `PAYMENT`) and fires `WALLET_TRANSACTION`.

| Code | Reason | Can you retry |
|---|---|---|
| `R01` | Insufficient funds | Yes, up to two more times |
| `R09` | Uncollected funds | Yes, up to two more times |
| `R02` | Account closed | No. New account needed |
| `R03` | No account on file | No. Name or number mismatch |
| `R04` | Invalid account number | No. Malformed |
| `R08` | Stop payment | Only with new authorization and block lifted |

`R05`, `R07`, `R10`, `R11`, `R29`, `R51` are unauthorized. Do not retry without resolving with the payer. Codes surface as `type_details.ach_payment_details.return_code` / `return_reason` on the `RETURN`.

### Return windows and thresholds

* Commercial: 2 banking days. Consumer: 60 calendar days. Late returns (`R06`/`R31`) need your permission and the same 10-day proof window.
* Keep rates low over a rolling 60-day window:

| Category | Threshold |
|---|---|
| Administrative (`R02`, `R03`, `R04`) | 3.0% |
| Unauthorized (`R05`, `R07`, `R10`, `R11`, `R29`, `R51`) | 0.5% |
| Overall | 15% |

## Retries and reinitiating

Retry by creating a new `POST /v3/ach/debit` with a new `external_id` (same `amount`/`currency`/`payment_method_uuid`/`wallet_uuid`, fresh authorization where required).

* `R01`/`R09`: at most two reinitiations within 180 days of settlement. After 180 days, collect outside ACH.
* `R08`: only after new authorization and the payer lifts the stop.
* `R03`/`R04` corrected to a different account is not a reinitiated entry.

Scheduled debits are not retries. If the January occurrence of `POST /v3/schedule/payments` (`frequency: MONTHLY`, `day_of_month: "1"`) fails with `R01`, the February occurrence is a new entry. Retry limits apply per occurrence. Check `GET /v3/schedule/{schedule_uuid}/executions` for history.

## Reconciliation and webhooks

Join on: `external_id` (your id) + `transaction_uuid` (from `201`) + the `RETURN`'s `parent_transaction_uuid` / `return_code` / `return_reason` / `trace_number`. Do not join on `trace_number` alone.

`WALLET_TRANSACTION` gives you `PAYMENT` (`CREATED` → `PROCESSING` → `COMPLETED`) and on return a second `RETURN` with `parent_transaction_uuid`. Post both so the ledger stays auditable. For warehouse and end-of-day, use [Periodic Reports](/guides/reporting/periodic-reports) (CSV on SFTP, same UUIDs).

Webhooks retry with polynomial backoff from 20ms up to 2 minutes and are FIFO. Return `200` quickly and process asynchronously.

## Sandbox testing

Mock at `https://mock.snd.alviere.com` runs disconnected from FedACH.

```bash
curl -X POST https://mock.snd.alviere.com/generateReturn \
  -H 'Content-Type: application/json' -H "x-api-key: $MOCK_API_KEY" \
  -d '{"transaction_uuid": "f84a40dd-3fbc-4478-bf89-ca5b30a95272", "return_code": "R01"}'
```

`204 No Content`, processed asynchronously and fires the webhook. Supported: `R01`, `R02`, `R03`, `R04`, `R06`, `R08`, `R16`, `R20`, `R29` on `LOAD_FUNDS`/`PAYMENT`/`WITHDRAW_FUNDS`/`BANK_DEBIT` (`400`/`404`/`409` otherwise).

Cover: happy path `PAYMENT` → `COMPLETED`; `R01` then retry with new `external_id`; `R02` and confirm no retry; bank `FAILED` via invalid routing number ([Payment Methods testing](/guides/sandbox-testing/test-payments)). See [ACH returns and NOCs](/guides/sandbox-testing/test-payments#ach-returns-and-nocs) for `generateNoc`.

## API endpoints

| Endpoint | Status | Use |
|---|---|---|
| `POST /v3/ach/debit` | Available | Debit a verified bank account. Requires `payment_method_uuid` + `wallet_uuid` + `amount`/`currency`/`external_id`/`accepted_legal_texts`. Duplicate `external_id` → `409`. |
| `POST /v3/instant/transfer` | Available | Send an instant payment. See [Instant Payments](/guides/transactions/instant-payments). |
| `POST /v3/instant/request` | Available | Request a payment (RfP). See [Instant Payments](/guides/transactions/instant-payments). |

Schemas: **Bank Payments** in [V3 API Reference](/api-v3). There is no `company_entry_description` or `company_name`. The platform handles the Nacha fields. Responses carry `transaction_uuid`, `type`, `status`, `type_details.ach_payment_details.trace_number`/`return_code`/`return_reason`.

## Future-dating a debit

```json
{
  "external_id": "invoice_2201",
  "amount": "480.00",
  "currency": "USD",
  "source": { "payment_method_uuid": "550e8400-e29b-41d4-a716-446655440000" },
  "destination": { "wallet_uuid": "223e4567-e89b-12d3-a456-426614174000" },
  "accepted_legal_texts": ["ee332079-3bf4-4f9d-8f2b-df980c459ee9"],
  "execute_at": "2026-09-01T14:00:00Z"
}
```

Created in `WAITING`, moves no money until `execute_at`, then follows the normal lifecycle (cancel while `WAITING`). For repeating charges use `POST /v3/schedule/payments` instead.

## Card vs. bank payments

|  | Card ([Bill Pay](/guides/payment-acceptance/use-cases/card-config-bill-pay)) | ACH (Pay by Bank) |
|---|---|---|
| Cost to biller | Higher (interchange) | Lower |
| Payer experience | Instant confirmation | Bank link + debit |
| Fee model | Convenience fee to payer | Often lower or none |
| Settlement | Seconds-minutes auth, next-day funding | 1-3 banking days + return window |
| Failure handling | Declines/disputes at auth | Returns days later, after you delivered value |
| Best for | Payers who want card | Recurring/high-ticket where you can wait for funds |

Offer Pay by Bank as the default for recurring charges, keep card as a convenience option with a fee.

## Related

* [Bill Pay (Card)](/guides/payment-acceptance/use-cases/card-config-bill-pay)
* [Payment Methods](/guides/resources/payment-methods)
* [Which API version?](/guides/getting-started/api-versions)
* [Transactions Overview](/guides/transactions/transactions-overview)
* [Webhooks](/guides/more/webhooks)
* [Periodic Reports](/guides/reporting/periodic-reports)
* [Sandbox Testing](/guides/sandbox-testing/mock-services)
