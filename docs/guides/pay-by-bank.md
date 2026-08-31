---
title: "Pay by Bank"
description: "Accept ACH debit payments with bank linking, scheduled payments, returns, and webhooks"
---

# Pay by Bank

Accept ACH debits from your payers' bank accounts. Pay by Bank gives you bank linking, instant verification, scheduled payments with retry handling, NSF logic, and settlement webhooks.

Use it anywhere you want a lower-cost alternative to card and can live with a 1-3 day settlement window. The savings matter most on recurring and high-ticket charges, where interchange takes a real bite out of the margin.

## When to use Pay by Bank

| Your use case | What to use |
|---|---|
| Embedded finance: accounts, wallets, KYC, card issuance | HIVE Platform guides + V2 API |
| ACH acceptance only (e.g. enterprise bill pay) | Pay by Bank + V3 ACH endpoints |
| Card at checkout with a convenience fee | [Bill Pay (Card)](/guides/payment-acceptance/use-cases/card-config-bill-pay) |
| Lower-cost recurring bill pay | Pay by Bank |

## What you'll build

1. **Bank linking.** Hosted or SDK flow so payers can connect their bank account.
2. **Scheduled payments.** One-time and recurring schedules via `POST /v3/schedule/payments`. Fixed amount, client owns the schedule, platform owns execution.
3. **Checkout.** Optional white-label payment page.
4. **Reconciliation.** Files and APIs to post settled payments into your accounting system.
5. **Returns.** NACHA return-window handling with webhook notifications.

Save bank accounts via [Payment Methods](/guides/resources/payment-methods) before debiting them.

## How an ACH debit moves

Every Pay by Bank charge starts with an authorization and ends when the return window closes. The steps in between are controlled by FedACH, not by Alviere, so cutoffs and weekends matter.

| Stage | What happens | Typical timing |
|---|---|---|
| Payer authorizes | You collect the mandate and verify the bank account | Immediate |
| You call `POST /v3/ach/debit` | Alviere validates the request and queues the debit | Immediate |
| Submitted to FedACH | The file goes to the network for processing | Same banking day if before the cutoff, next banking day if after |
| Settlement | Funds move between the payer bank and your program account | 1-3 banking days after submission |
| Funds available | The wallet reflects the settled amount | On settlement |
| Return window open | The payer bank can still return the debit | 2 banking days for business accounts, 60 calendar days for consumer accounts |

Settlement is not instant. If you need confirmation before fulfilling an order, hold fulfillment until you get a `COMPLETED` transaction or a `WALLET_TRANSACTION` webhook. Weekends and federal holidays do not count as banking days, so a Friday evening submission settles the following week.

## Authorization and mandate

You must have the payer's authorization before you debit, and on Alviere the mandate is part of the API rather than something you write yourself. Alviere serves the authorization text, versions it, and records which version the payer accepted.

`accepted_legal_texts` is **required on every ACH debit**. A debit without it is rejected.

### 1. Fetch the current authorization text

```bash
curl -G https://api.snd.alviere.com/v3/legal-texts \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d type=ACH_DEBIT_AUTHORIZATION
```

```json
{
  "legal_texts": [
    {
      "legal_text_uuid": "ee332079-3bf4-4f9d-8f2b-df980c459ee9",
      "latest": true,
      "type": "ACH_DEBIT_AUTHORIZATION",
      "version": "2",
      "title": "ACH Debit Authorization",
      "document_text": "By selecting this box...",
      "document_url": "https://example.com/legal/ach-debit-v2"
    }
  ]
}
```

Omit `version` to get the latest. Pass it to pin a specific one.

| Type | Use |
|---|---|
| `ACH_DEBIT_AUTHORIZATION` | The general ACH debit mandate |
| `ACH_AUTHORIZATION_INDIVIDUAL_PAYER` | Consumer payer authorization |
| `ACH_AUTHORIZATION_BUSINESS_PAYER` | Business payer authorization |
| `TERMS_AND_CONDITIONS` | Program terms |
| `PRIVACY_POLICY` | Program privacy policy |

### 2. Show it to the payer and capture acceptance

Render `document_text` (or link `document_url`) next to the checkbox or button the payer actually clicks. The text must be visible at the moment of consent, not buried behind a link nobody opens.

### 3. Pass the accepted UUID on the debit

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
Fetch the text at the time you display it rather than hardcoding a UUID. Legal texts are versioned, and a new version means the wording the payer agreed to has changed. A pinned UUID quietly keeps collecting consent against superseded language.
:::

### Records to retain

Alviere stores which legal text version the payer accepted. Keep the following alongside your order record:

* Payer name and contact information
* Authorized amount, or how a variable amount is determined
* Whether the debit is one-time or recurring, and the schedule if recurring
* Date, time, and channel where the payer accepted
* How you verified the payer controls the bank account (Plaid, micro-deposits, or SDK verification)

For recurring debits, you also owe the payer notice before each debit when the amount varies.

### Proof of authorization

If the payer's bank submits a late return claiming the debit was not authorized, you have **10 banking days** to produce proof. That proof is the accepted legal text version plus the records above. If you cannot produce it, the bank may return the debit as `R10` or `R11` and you absorb the loss.

This is why the version matters. "The payer accepted `ACH_DEBIT_AUTHORIZATION` version 2 on this date" is a defensible answer; "we showed them some text" is not.

## Handling returns

A return means the payer's bank sent the debit back. Alviere reconciles the return to the original transfer for you and posts a new transaction that reduces the wallet balance. You see the return code and the link to the original transaction in the API and in the `WALLET_TRANSACTION` webhook.

### Common return codes

There are about 80 codes, but most volume comes from a handful. Use this table to decide whether you can retry.

| Code | Reason | Can you retry |
|---|---|---|
| `R01` | Insufficient funds | Yes, up to two more times |
| `R09` | Uncollected funds | Yes, up to two more times |
| `R02` | Account closed | No, contact the payer for a new account |
| `R03` | No account on file | No, the account number does not match the name |
| `R04` | Invalid account number | No, the number is malformed or wrong |
| `R08` | Stop payment placed by the payer | Only with a new authorization, and ask the payer to lift the block |

Codes `R05`, `R07`, `R10`, `R11`, `R29`, and `R51` are unauthorized claims and you should not retry without resolving the dispute with the payer. You will see these as `type_details.ach_payment_details.return_code` and `return_reason` on the `RETURN` transaction.

### Return windows and thresholds

Nacha counts business days for commercial accounts and calendar days for consumers. That difference is easy to miss and it is the reason some teams get surprised by a return weeks after settlement.

* Commercial debits can be returned within 2 banking days.
* Consumer debits can be returned within 60 calendar days.

If the payer resolves an unauthorized claim late, the payer bank may ask your bank for permission to send a late return. If you agree, the return arrives as `R06` or `R31`. You have the same 10 banking day window to provide proof of authorization.

Originators must keep return rates low over a rolling 60-day window or they risk Nacha sanctions:

| Return category | Threshold |
|---|---|
| Administrative (`R02`, `R03`, `R04`) | 3.0% |
| Unauthorized (`R05`, `R07`, `R10`, `R11`, `R29`, `R51`) | 0.5% |
| Overall return rate | 15% |

Monitor these rates per program. If you are close to a threshold, tighten verification before you retry.

## Retries and reinitiating

Nacha limits how you may retry a returned debit. Those limits sit on top of the Alviere API. You always retry by creating a new `POST /v3/ach/debit` with a new `external_id`, the same `amount`, `currency`, `payment_method_uuid`, and `wallet_uuid`, and a fresh authorization where the rules require it.

* A debit returned as `R01` or `R09` may be reinitiated at most two times within 180 days of the original settlement date. After 180 days, collect outside the ACH network.
* A debit returned as `R08` may be retried only after you have a new authorization and the payer has removed the stop payment block.
* If the debit failed because the account or routing number was wrong (`R03`, `R04`), correcting the number and resubmitting is not counted as a reinitiated entry because it targets a different account.

Pre-authorized scheduled debits are not retries. If the January occurrence of a `POST /v3/schedule/payments` schedule with `frequency: MONTHLY`, `day_of_month: "1"` fails with `R01`, the February occurrence under the same standing authorization is a new entry. The retry limits apply per occurrence, not per schedule. For a single debit you retry with a new `POST /v3/ach/debit` and a new `external_id`. For a schedule you create the schedule once via `POST /v3/schedule/payments` and the platform creates one `PAYMENT` per occurrence. Check `GET /v3/schedule/{schedule_uuid}/executions` for occurrence history. Keep the same `amount` and `currency` on a retry. Use a new `external_id` so the original and the retry stay distinct in `GET /v3/transactions` and in webhooks.

## Reconciliation and webhooks

Do not reconcile on `type_details.ach_payment_details.trace_number` alone. The field is present on every ACH transaction, but at scale you want stronger keys. Join on three fields instead:

1. Your `external_id` from `POST /v3/ach/debit`
2. The `transaction_uuid` returned in the `201` response
3. The `RETURN` transaction's `parent_transaction_uuid`, `type_details.ach_payment_details.return_code`, `type_details.ach_payment_details.return_reason`, and `type_details.ach_payment_details.trace_number`

Subscribe to `WALLET_TRANSACTION` webhooks. On submission you get a `PAYMENT` transaction in `CREATED` or `PROCESSING`. On settlement it moves to `COMPLETED`. On return you get a second transaction with `type: RETURN`, `parent_transaction_uuid` pointing to the original `PAYMENT`, and `type_details.ach_payment_details.return_code` and `return_reason` populated. The return amount is negative. If you maintain an accounting feed, post both the parent and the child so the ledger stays auditable.

If a webhook fails, Alviere retries with polynomial backoff starting at 20 ms and up to 2 minutes between attempts. The queue is FIFO, so a blocked endpoint delays every event behind it. Return `200` quickly and process the payload asynchronously.

## Sandbox testing

The Sandbox at `https://mock.snd.alviere.com` runs disconnected from FedACH, so you can exercise your integration without touching a real bank. You do not have to wait days for a return, and you do not have to fake one with fixtures: the mock service originates a real return through the same processing flow production uses.

Trigger a return against any originated transaction:

```bash
curl -X POST https://mock.snd.alviere.com/generateReturn \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $MOCK_API_KEY" \
  -d '{
    "transaction_uuid": "f84a40dd-3fbc-4478-bf89-ca5b30a95272",
    "return_code": "R01"
  }'
```

The call returns `204 No Content` and processes asynchronously, so the return lands on the transaction and fires your webhook a moment later rather than in the response.

Nine return codes are supported: `R01`, `R02`, `R03`, `R04`, `R06`, `R08`, `R16`, `R20`, and `R29`. That covers insufficient funds, the unrecoverable account errors, a stop payment, a frozen account, and one unauthorized claim, which is enough to exercise every branch of the retry logic in [Retries and reinitiating](#retries-and-reinitiating).

Eligible transaction types are `LOAD_FUNDS`, `PAYMENT`, `WITHDRAW_FUNDS`, and `BANK_DEBIT`. Attempting a return on anything else returns `400`, an unknown transaction returns `404`, and a transaction that has already been returned returns `409`.

Before you go live, cover at minimum:

* The happy path, `PAYMENT` → `COMPLETED`.
* A retryable return: originate, `generateReturn` with `R01`, then a new `POST /v3/ach/debit` with a new `external_id` that succeeds.
* A terminal return: `generateReturn` with `R02`, and confirm your code does **not** retry it.
* Bank account setup failure, via [Payment Methods testing](/guides/sandbox-testing/test-payments). An invalid routing number drives the payment method to `FAILED`.

See [ACH returns and NOCs](/guides/sandbox-testing/test-payments#ach-returns-and-nocs) for Notification of Change simulation, which corrects account details for future entries without reversing funds.

## API endpoints

| Endpoint | Status | Use |
|---|---|---|
| `POST /v3/ach/debit` | Available | Debit a verified bank account. Requires `payment_method_uuid` and `wallet_uuid`, plus `amount`, `currency`, and a unique `external_id`. A duplicate `external_id` returns `409` with the existing `PAYMENT`. |
| `POST /v3/instant/transfer` | Available | Send an instant payment. See [Instant Payments](/guides/transactions/instant-payments). |
| `POST /v3/instant/request` | Available | Request a payment (RfP) from a payer. See [Instant Payments](/guides/transactions/instant-payments). |

See **Bank Payments** in the [V3 API Reference](/api-v3) for the current schemas. The request takes `external_id`, `amount`, `currency`, `source.payment_method_uuid`, `destination.wallet_uuid`, `accepted_legal_texts` (required), and optionally `description`, `metadata`, and `execute_at`. There is no `company_entry_description` or `company_name` field on the request. Those Nacha fields are handled by the platform. Responses carry `transaction_uuid`, `type` (`PAYMENT` or `RETURN`), `status`, `returned`, and `type_details.ach_payment_details.trace_number`, `service_type`, `return_code`, and `return_reason`.

## Future-dating a debit

Pass `execute_at` as an RFC 3339 timestamp to hold a debit until a future moment:

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

The transaction is created in `WAITING` and moves no money until its execution time, then releases through the ordinary payment lifecycle. You can cancel it while it is still `WAITING`.

Use this for a single dated debit, such as an invoice due on a known date. For a standing arrangement that repeats, create a schedule with `POST /v3/schedule/payments` instead, which produces one `PAYMENT` per occurrence under the same authorization.

## Card vs. bank payments

|  | Card ([Bill Pay](/guides/payment-acceptance/use-cases/card-config-bill-pay)) | ACH (Pay by Bank) |
|---|---|---|
| Cost to the biller | Higher (interchange) | Lower |
| Payer experience | Instant confirmation | Bank link + debit |
| Typical fee model | Convenience fee to payer | Often lower or none |
| Settlement | Seconds to minutes for auth, next-day funding | 1-3 banking days, with a return window after settlement |
| Failure handling | Declines and disputes at auth time | Returns can arrive days later, after you have already delivered value |
| Best for | Payers who want card | Cost-sensitive recurring bill pay and high-ticket charges where you can wait for funds |

Many bill-pay platforms offer both rails through Alviere. Offer Pay by Bank as the default for recurring charges and keep card as a convenience option with a fee.

## Related

* [Bill Pay (Card)](/guides/payment-acceptance/use-cases/card-config-bill-pay)
* [Payment Methods](/guides/resources/payment-methods)
* [Which API version?](/guides/getting-started/api-versions)
* [Transactions Overview](/guides/transactions/transactions-overview)
* [Webhooks](/guides/more/webhooks)
* [Sandbox Testing](/guides/sandbox-testing/mock-services)
