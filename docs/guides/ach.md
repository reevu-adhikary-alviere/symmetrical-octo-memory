---
title: "ACH"
description: "Move funds through the ACH network: pull to load wallets, push to send payouts"
---

# ACH

Move funds through the ACH network. ACH **pulls** debit a connected bank account to load funds into a wallet. ACH **pushes** credit an external bank account from a wallet for payouts and withdrawals. Both directions settle in 1-3 banking days and can be returned after settlement.

Save bank accounts as [Payment Methods](/guides/resources/payment-methods) before debiting or crediting them. Plaid or the SDK makes the connection step painless.

For ACH **payment acceptance** (incoming debits as a checkout option for billers), see [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). That guide covers mandates, return windows, R-codes, and retry rules in detail.

## How ACH moves funds

| Direction | What the API does | Typical timing | Return window |
|---|---|---|---|
| Pull (debit) | `POST /v3/ach/debit` debits the payer bank and credits your program account | Submitted same banking day if before cutoff, settled in 1-3 banking days | 2 banking days for business accounts, 60 calendar days for consumers |
| Push (credit) | `POST /wallets/{wallet_uuid}/withdraw` against a bank payment method debits your wallet and credits the external bank | Same timing. Funds sit in the wallet's `captive` bucket until the destination settles | Rare, the receiving bank can still refuse the credit |

### ACH is a rail, not a transaction type

There is no `ACH` transaction type, and looking for one is the most common reconciliation mistake on this API. ACH is the rail; the transaction type records the operation it carried.

| Type | ACH operation | Created by |
|---|---|---|
| `LOAD_FUNDS` | Pull | `POST /wallets/{wallet_uuid}/load` with a bank payment method |
| `BANK_DEBIT` | Pull | A debit against a payer's bank account |
| `PAYMENT` | Pull | `POST /v3/ach/debit` |
| `WITHDRAW_FUNDS` | Push | `POST /wallets/{wallet_uuid}/withdraw` to a bank account |
| `REFUND` | Either | A refund routed back over ACH |
| `RETURN` | Reversal | The payer's bank returning a pull |

A dedicated `POST /v3/ach/credit` is in development. Until it ships, withdraw is
the push path, and it is the one `WITHDRAW_FUNDS` above records.

Two consequences worth building around:

- An ACH debit created through `POST /v3/ach/debit` appears in your ledger as a `PAYMENT`. Filtering your ACH report on `BANK_DEBIT` alone will silently undercount it.
- `LOAD_FUNDS` and `WITHDRAW_FUNDS` are not ACH-exclusive. Both carry card as well. Check `type_details` to confirm the rail before you classify a transaction as ACH.

See [Transactions Overview](/guides/transactions/transactions-overview) for the full list of types.

Need the money there in seconds rather than days? See [Instant Payments](/guides/transactions/instant-payments).

Weekends and federal holidays are not banking days. A Friday evening submission settles the following week.

## Returns are part of the flow

A return is not an error in your integration. It is the payer bank sending the transfer back after settlement. The most common reasons are `R01` insufficient funds, `R02` account closed, `R03` no account on file, `R04` invalid number, and `R08` stop payment. Administrative returns must stay below 3.0% and unauthorized returns below 0.5% over a rolling 60-day window. Do not rely on `type_details.ach_payment_details.trace_number` alone to match a return. Use your `external_id`, the `transaction_uuid` from the `201` response, and the `RETURN` transaction's `parent_transaction_uuid`, `type_details.ach_payment_details.return_code`, and `return_reason` from the `WALLET_TRANSACTION` webhook.

For the full return handling story, including retry limits and the 10-day proof-of-authorization window, see [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). The V3 request has no `company_entry_description` field. Retries are new `POST /v3/ach/debit` calls with a new `external_id`.

## API reference

ACH endpoints live in the [V2 API Reference](/api-v2) under **Money Movement**, and in the [V3 API Reference](/api-v3) under **Bank Payments**. The V3 endpoints use the same authentication as card payments.

## Related

* [Payment Methods](/guides/resources/payment-methods). Save bank accounts before ACH.
* [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). Mandates, R-codes, retries, and reconciliation.
* [Transactions Overview](/guides/transactions/transactions-overview). Statuses and lifecycle.
* [Webhooks](/guides/more/webhooks). Subscribe to `WALLET_TRANSACTION` for settlement and return events.
* [Sandbox Testing](/guides/sandbox-testing/mock-services). Trigger returns without waiting for the network.
