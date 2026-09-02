---
title: "Transactions Overview"
description: "Transaction scopes, statuses, and types: how Alviere records money movement"
---

# Transactions Overview

A transaction represents a single financial operation or movement of funds on the HIVE Platform. Alviere captures every monetary action as a transaction, whether that's loading funds, a card purchase, a transfer, or a fee, so you have an auditable record of where money came from and where it went.

## Transaction scopes

Transactions exist in three scopes depending on where the funds move:

```mermaid
graph LR
    PM["Payment Method<small>Card / Bank</small>"]
    W["Wallet"]
    TV["Treasury Vault"]
    EXT["External Bank"]

    PM -->|"Load / Passthrough"| W
    W -->|"Withdraw"| PM
    W <-->|"Wallet Transfer"| W
    W <-->|"Vault Transfer"| TV
    TV <-->|"External"| EXT
```

| Scope | Description |
|-------|-------------|
| **Wallet** | Tracks money in and out on a wallet's ledger |
| **Passthrough** | Child transactions that fund a parent transaction directly from a payment method (e.g. card → international transfer), without touching the wallet ledger |
| **Vault** | Transfers between wallets and treasury vaults, or between vaults and external banks |

## Statuses

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> PROCESSING
    CREATED --> PENDING
    CREATED --> WAITING
    PROCESSING --> PROCESSING_PAYMENT
    PROCESSING --> COMPLETED
    PROCESSING --> FAILED
    PROCESSING --> ERROR
    PROCESSING --> MANUAL_REVIEW
    PROCESSING_PAYMENT --> COMPLETED
    PROCESSING_PAYMENT --> FAILED
    PENDING --> PROCESSING
    WAITING --> PROCESSING
    MANUAL_REVIEW --> COMPLETED
    MANUAL_REVIEW --> REJECTED
    CREATED --> CANCELED_USER
    CREATED --> CANCELED_SYSTEM
    PROCESSING --> VOIDED
```

| Status | Description |
|--------|-------------|
| `CREATED` | Transaction initialized |
| `PROCESSING` | In progress. A ledger transaction requiring a payment action |
| `PROCESSING_PAYMENT` | Funds being sourced from a payment method (e.g. card) |
| `COMPLETED` | Funds successfully transferred |
| `FAILED` | Could not process (e.g. declined card) |
| `ERROR` | A system anomaly prevented processing |
| `CANCELED_USER` | Halted by customer or agent via Portal |
| `CANCELED_SYSTEM` | Canceled by an automated system rule |
| `VOIDED` | Nullified before payment execution. No debit or credit occurred |
| `PENDING` | Awaiting customer action or fund settlement |
| `MANUAL_REVIEW` | Under review by Alviere's compliance and risk team |
| `WAITING` | On standby for wallet balance availability or prefunding vault input |
| `REJECTED` | Declined after manual review by risk/fraud |

## Transaction types

The API reference enumerates 47 transaction types, and `WIRE_TRANSFER` is a real one it currently omits. You will never handle all of them: your program's modules determine which ones you can actually produce. What matters when you build is knowing which types you originate yourself, which ones Alviere posts on your behalf, and which ones can show up unannounced days after the fact.

Nine of them never appear on a wallet ledger. They exist at the vault or passthrough scope, so if you are reading `GET /wallets/{wallet_uuid}/transactions` you will not see them. Read `GET /transactions` instead.

## Types are operations, not rails

This is the distinction that trips people up most, so it is worth stating before the tables.

A transaction type tells you **what operation happened**. It does not tell you **which rail carried the money**. The two are orthogonal, and there is no `ACH` transaction type because ACH is not an operation.

ACH shows up under whichever type matches the operation:

| Type | The ACH operation |
|---|---|
| `LOAD_FUNDS` | Pull. Debits a bank account to fund a wallet |
| `BANK_DEBIT` | Push. Pays a beneficiary's bank payout method |
| `PAYMENT` | Pull. What `POST /v3/ach/debit` creates |
| `WITHDRAW_FUNDS` | Push. Credits an external bank account |
| `REFUND` | Sometimes, when the refund goes back over ACH |
| `RETURN` | The payer's bank sending a pull back |

So an ACH debit created through `POST /v3/ach/debit` lands in your ledger as a `PAYMENT`, not as anything named ACH. If you are reconciling ACH volume, filtering for a single type will undercount it.

The same logic runs the other way: `LOAD_FUNDS` and `WITHDRAW_FUNDS` are not ACH-only. Both also carry card. The type is the operation; check `type_details` for the rail.

The sandbox agrees with this grouping. `POST mock.snd.alviere.com/generateReturn` accepts exactly `LOAD_FUNDS`, `PAYMENT`, `WITHDRAW_FUNDS`, and `BANK_DEBIT`, because those are the pulls and pushes that ACH can return. See [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction).

### Money in

| Type | What creates it | Wallet scope |
|---|---|---|
| `LOAD_FUNDS` | `POST /wallets/{wallet_uuid}/load`. Pulls from a saved card or bank payment method. Over ACH this is a pull | Yes |
| `CASH_LOADING` | A barcode redeemed at a retail location | Yes |
| `CHECK_DEPOSIT` | `POST /wallets/{wallet_uuid}/check-deposits` | Yes |
| `BANK_CREDIT` | An incoming ACH credit from an external bank account | Yes |
| `INSTANT_BANK_TRANSFER` | An incoming instant payment over FedNow or TCH RTP, paid against a request. See [Instant Payments](/guides/transactions/instant-payments) | Yes |
| `PAYMENT` | A V3 acceptance charge. Both `POST /v3/cards/debit` and `POST /v3/ach/debit` create one | Yes |
| `PREFUND` | The prefunding vault advancing funds before settlement | No |

### Money out

| Type | What creates it | Wallet scope |
|---|---|---|
| `WITHDRAW_FUNDS` | `POST /wallets/{wallet_uuid}/withdraw` to an external card or bank. Over ACH this is a push | Yes |
| `BANK_DEBIT` | `POST /wallets/{wallet_uuid}/transfer` to a beneficiary's bank payout method | Yes |
| `INTERNATIONAL_TRANSFER` | `POST /wallets/{wallet_uuid}/remittances` to an international beneficiary | Yes |
| `CHECK_DISBURSEMENT` | A check issued out of a wallet | Yes |
| `INSTANT_BANK_TRANSFER` | `POST /v3/instant/transfer` over FedNow or TCH RTP. Pushes funds out of a wallet. See [Instant Payments](/guides/transactions/instant-payments) | Yes |
| `EXTERNAL_CREDIT`, `EXTERNAL_DEBIT` | Movement between a treasury vault and the external bank behind it | No |

### Internal transfers

| Type | What creates it | Wallet scope |
|---|---|---|
| `WALLET_TRANSFER` | Movement between two wallets on the same program | Yes |
| `TRANSFER` | Internal vault movement: `POST /treasury/transfer` between treasury vaults, or `POST /wallets/{wallet_uuid}/credit` and `/debit` moving funds between a wallet and the Operations, Promo Funds, or Providers vault | Yes |

### Reversals and money coming back

These are the ones that arrive late. Every one of them carries `parent_transaction_uuid` pointing at the transaction it undoes, and every one of them can land after you have already delivered value.

| Type | What creates it | Wallet scope |
|---|---|---|
| `RETURN` | The payer's bank returning an ACH debit. Carries `type_details.ach_payment_details.return_code` | Yes |
| `CHECK_DEPOSIT_RETURN` | A deposited check coming back unpaid | Yes |
| `REFUND` | `POST /transactions/{transaction_uuid}/refund` | Yes |
| `REVERSAL` | `POST /transactions/{transaction_uuid}/reverse` | Yes |
| `CHARGEBACK` | A cardholder disputing a charge through their issuer | Yes |
| `LOAD_PULLBACK` | A completed load being pulled back | Yes |

### Fees and incentives

| Type | What creates it | Wallet scope |
|---|---|---|
| `SERVICE_FEE` | A configured fee rule firing on a transaction | Yes |
| `SERVICE_FEE_REVERSAL` | `POST /wallets/{wallet_uuid}/service-fees/{transaction_uuid}/reverse` | Yes |
| `CASHBACK` | A cashback incentive rule paying out from the Promo Funds vault | Yes |
| `BOOST` | A boost incentive rule crediting balance at authorization | Yes |

### Issued cards

Every one of these is posted by Alviere in response to network activity. You do not originate them.

| Type | Meaning |
|---|---|
| `CARD_ISSUED_DEBIT` | A purchase on an issued card |
| `CARD_ISSUED_ATM_DEBIT` | An ATM withdrawal |
| `CARD_ISSUED_OTC_DEBIT` | An over-the-counter cash withdrawal |
| `CARD_ISSUED_CREDIT` | A credit back to the card, such as a merchant refund |
| `CARD_ISSUED_TERMINAL_CREDIT` | A credit originated at a terminal |
| `CARD_ISSUED_DISPUTE_DEBIT` | Funds removed while a dispute is open |
| `CARD_ISSUED_DISPUTE_CREDIT` | Funds returned when a dispute resolves in the cardholder's favor |
| `CARD_ISSUED_FEE` | A fee charged against the card |
| `CARD_ISSUED_INITIAL` | The initial load at issuance |
| `CARD_ISSUED_REISSUE` | A reissue, same PAN with a new expiry |
| `CARD_ISSUED_ADJUSTMENT`, `CARD_ISSUED_RESET` | Corrections posted by the issuing platform |

### Passthrough

Passthrough transactions fund a parent transaction straight from a payment method without the money ever landing in the wallet ledger. You see them as children of the parent, not as wallet activity.

| Type | Funds the parent from | Wallet scope |
|---|---|---|
| `CARD_PASSTHROUGH` | A card payment method | No |
| `BANK_PASSTHROUGH` | A bank payment method | No |
| `REFUND_PASSTHROUGH` | Refunding a passthrough-funded parent | No |

### Platform and ledger operations

| Type | Meaning | Wallet scope |
|---|---|---|
| `ACH_PRENOTE` | A zero-dollar ACH entry that validates a bank account before live debits run against it | No |
| `ADJUSTMENT` | A manual ledger correction | Yes |
| `TRANSIT_TRANSFER` | Movement of funds through the transit bucket | No |
| `INTERNAL_CREDIT` | An internal credit posted by the platform | No |
| `NEGATIVE_LOSS` | A negative balance written off against the program's loss reserve | Yes |
| `RECOVERY` | Funds recovered against a previously written-off balance | Yes |

:::scalar-callout{type="warning"}
Do not switch on `transaction_type` alone when deciding whether money moved in or out. Check the sign of `amount`: returns, reversals, and dispute debits post as negative amounts against the same wallet.
:::

Per-type fields live under `type_details`, a discriminated object keyed on the transaction type.

Both list endpoints filter by transaction type server-side, through a query parameter named `type`. That is not `transaction_type`, which is the field name on the response object and easy to grep past. `type` takes any of the 38 wallet-scope types, comma-separated for multiples:

```
GET /transactions?type=LOAD_FUNDS,WITHDRAW_FUNDS
```

Combine it with `status`, `start_date` and `end_date`, and the entity filters (`account_uuid`, `wallet_uuid`, `beneficiary_uuid`, `issued_card_uuid`, `payment_method_uuid`).

One boundary: the `type` enum covers only the wallet-scope list. The vault- and passthrough-scope types from the tables above are not filterable this way. That includes `PREFUND`, `ACH_PRENOTE`, the passthrough family, and the treasury movements. If you need those, read `GET /transactions` without a type filter and match on `transaction_type` in the response.
