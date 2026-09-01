---
title: "ACH"
description: "Move funds through the ACH network: pull to load wallets, push to send payouts"
---

# ACH

Move funds through the ACH network. ACH **pulls** debit a connected bank account to load funds into a wallet. ACH **pushes** credit an external bank account from a wallet for payouts and withdrawals. Both directions settle in 1-3 banking days and can be returned after settlement.

Save bank accounts as [Payment Methods](/guides/resources/payment-methods) before debiting or crediting them. Plaid or the SDK handles the account connection.

For ACH **payment acceptance** (incoming debits as a checkout option for billers), see [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). That guide covers mandates, return windows, R-codes, and retry rules in detail.

## How ACH moves funds

| Direction | What the API does | Typical timing | Return window |
|---|---|---|---|
| Pull (debit) | `POST /v3/ach/debit` debits the payer bank and credits your program account | Submitted same banking day if before cutoff, settled in 1-3 banking days | 2 banking days for business accounts, 60 calendar days for consumers |
| Push (credit) | `POST /wallets/{wallet_uuid}/withdraw` against a bank payment method debits your wallet and credits the external bank | Same timing. Funds sit in the wallet's `captive` bucket until the destination settles | Rare, the receiving bank can still refuse the credit |

### ACH is a rail, not a transaction type

There is no `ACH` transaction type. ACH is the rail, and the transaction type records the operation it carried. Reports that filter on a single type will miss ACH activity.

| Type | ACH operation | Created by |
|---|---|---|
| `LOAD_FUNDS` | Pull | `POST /wallets/{wallet_uuid}/load` with a bank payment method |
| `BANK_DEBIT` | Pull | A debit against a payer's bank account |
| `PAYMENT` | Pull | `POST /v3/ach/debit` |
| `WITHDRAW_FUNDS` | Push | `POST /wallets/{wallet_uuid}/withdraw` to a bank account |
| `REFUND` | Either | A refund routed back over ACH |
| `RETURN` | Reversal | The payer's bank returning a pull |

An ACH debit created through `POST /v3/ach/debit` appears in your ledger as a `PAYMENT`, so a report filtered on `BANK_DEBIT` alone undercounts it. In the other direction, `LOAD_FUNDS` and `WITHDRAW_FUNDS` also carry card transactions. Check `type_details` to confirm the rail before you classify a transaction as ACH.

See [Transactions Overview](/guides/transactions/transactions-overview) for the full list of types.

For settlement in seconds instead of days, see [Instant Payments](/guides/transactions/instant-payments).

Weekends and federal holidays are not banking days. A Friday evening submission settles the following week.

## Returns are part of the flow

A return is the payer bank sending the transfer back after settlement. Your integration did nothing wrong, and you should expect a steady trickle of them. The common codes are `R01` insufficient funds, `R02` account closed, `R03` no account on file, `R04` invalid number, and `R08` stop payment.

The network caps your return rates. Administrative returns must stay below 3.0% and unauthorized returns below 0.5% over a rolling 60-day window.

To match a return to the original debit, use the `RETURN` transaction's `parent_transaction_uuid` together with your `external_id` and the `transaction_uuid` from the `201` response. The `WALLET_TRANSACTION` webhook carries `type_details.ach_payment_details.return_code` and `return_reason`. The `trace_number` alone is not a reliable key.

For the full return handling story, including retry limits and the 10-day proof-of-authorization window, see [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). The V3 request has no `company_entry_description` field. Retries are new `POST /v3/ach/debit` calls with a new `external_id`.

## API reference

ACH endpoints live in the [V2 API Reference](/api-v2) under **Money Movement**, and in the [V3 API Reference](/api-v3) under **Bank Payments**. The V3 endpoints use the same authentication as card payments.

## Related

* [Payment Methods](/guides/resources/payment-methods). Save bank accounts before ACH.
* [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). Mandates, R-codes, retries, and reconciliation.
* [Transactions Overview](/guides/transactions/transactions-overview). Statuses and lifecycle.
* [Webhooks](/guides/more/webhooks). Subscribe to `WALLET_TRANSACTION` for settlement and return events.
* [Sandbox Testing](/guides/sandbox-testing/mock-services). Trigger returns without waiting for the network.
