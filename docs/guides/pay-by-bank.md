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

1. **Bank linking.** Hosted or SDK flow so payers can connect their bank account.
2. **Recurring debits.** Stored mandates, automatic retries, NSF handling.
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

You must have the payer's authorization before you debit. Store the authorization yourself. Alviere does not store the mandate text for you.

Keep these fields for every debit:

* Payer name and contact information on file
* Authorized amount or a clear description of how the amount will vary
* Whether the debit is one-time or recurring, and the schedule if recurring
* Date and time the payer gave authorization, and how you captured it
* How you verified the payer controls the bank account (Plaid, micro-deposits, or SDK verification)

If the payer's bank submits a late return that claims the debit was not authorized, you will need to produce proof of authorization within 10 banking days. The proof is the fields above plus any supporting document the payer signed. If you cannot produce it, the bank may return the debit as `R10` or `R11` and you absorb the loss.

Sample authorization language you can adapt. This is not legal advice, have your counsel review it.

> I authorize [Your Company Name] to debit the bank account I have specified for the amount shown at checkout, or for the recurring amounts described in my service agreement. I understand I can revoke this authorization by contacting [support contact] and that revocation does not cancel amounts already owed. I confirm I am an authorized signer on this account.

For recurring debits, include the schedule and the way you will notify the payer before each debit when the amount varies.

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
| `R05` | Corporate account used a consumer SEC code | No, fix the SEC code before retrying |
| `R08` | Stop payment placed by the payer | Only with a new authorization, and ask the payer to lift the block |

Codes `R07`, `R10`, `R11`, `R29`, and `R51` are unauthorized claims and you should not retry without resolving the dispute with the payer.

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

A retried debit must look like the original or Nacha will treat it as a new unauthorized entry.

* A debit returned as `R01` or `R09` may be reinitiated at most two times.
* Set `company_entry_description` to `RETRY PYMT` on the retry. Keep `company_name`, `company_identification`, and `amount` identical to the original. Change other fields only to fix the error that caused the return.
* All retries must happen within 180 days of the original settlement date. After that, collect outside the ACH network.
* A debit returned as `R08` may be retried only after you have a new authorization and the payer has removed the stop payment block.
* If the debit failed because the account or routing number was wrong (`R03`, `R04`), correcting the number and resubmitting is not counted as a reinitiated entry because it targets a different account.

Recurring pre-authorized debits are treated differently. If the January monthly charge fails with `R01`, the February scheduled charge under the same standing authorization is not a retry. It is a new entry under the original authorization. The retry limits apply per entry, not per schedule.

## Reconciliation and webhooks

Do not reconcile on trace number alone. Trace numbers have only seven random digits. Collisions are rare but possible at scale. Instead, join on three fields:

1. Your `external_id` from `POST /v3/ach/debit`
2. The `transaction_id` returned in the response
3. The return's `return_reason_code` and `original_trace` in the webhook

Subscribe to `WALLET_TRANSACTION` webhooks. On submission you get a transaction in `PROCESSING`. On settlement it moves to `COMPLETED`. On return you get a child transaction that debits the wallet and carries `return_reason_code`. If you maintain an accounting feed, post both the parent and the child so the ledger stays auditable.

If a webhook fails, Alviere retries with polynomial backoff starting at 20 ms and up to 2 minutes between attempts. The queue is FIFO, so a blocked endpoint delays every event behind it. Return `200` quickly and process the payload asynchronously.

## Sandbox testing

The Sandbox at `https://mock.snd.alviere.com` lets you trigger return paths without waiting for the network.

* Use [Payment Methods testing](/guides/sandbox-testing/test-payments) to create bank accounts that are scripted to return `R01` or `R02` on the next debit.
* For ACH debit simulations, call the mock transfer lifecycle directly and request a return code. The mock creates a child transaction with the requested `Rxx` code so you can exercise your webhook handler and reconciliation logic.
* Test both the happy path (`COMPLETED` on settlement) and the two retry paths (`R01` then `COMPLETED` on `RETRY PYMT`) before you go live.

If a return code cannot be deterministically triggered in the current mock, document the gap in your runbook and test the webhook handler with a static JSON fixture instead of skipping the test.

## API endpoints

| Endpoint | Status | Use |
|---|---|---|
| `POST /v3/ach/debit` | Available | Debit a verified bank account. Requires a saved payment method and an authorization on file. Idempotent with `external_id`. |
| `POST /v3/ach/credit` | In development | Push funds to an external bank account. Tracked separately from payment acceptance. |
| Instant incoming rails | In development | Real-time settlement for eligible accounts. Timing and eligibility will be posted when the rail is live. |

See **Bank Payments** in the [V3 API Reference](/api-v3) for the current request and response schemas. Endpoints under `/v3/ach/*` share the same authentication as card payments. No separate key is needed.

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
