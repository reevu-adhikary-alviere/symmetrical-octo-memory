---
title: "Global Money Transfers"
description: "Send cross-border payments and remittances to beneficiaries worldwide"
---

# Global Money Transfers

Send cross-border payments to an international beneficiary's bank account, e-wallet, card, or a cash pickup location. Currency conversion and routing run on the platform. You set up the beneficiary, create the quote, and send the remittance.

The flow has three steps, and the first two happen before any money moves:

1. Set up the recipient as a [beneficiary](/guides/resources/beneficiaries) of international type, with a payout method for how they want to receive the money.
2. Price the transfer with a quote, which fixes the FX rate, the fees, and the amount the beneficiary receives.
3. Commit the quote as a remittance.

| Operation | Endpoint |
|---|---|
| Create a quote | `POST /wallets/{wallet_uuid}/quote` |
| Send the transfer | `POST /wallets/{wallet_uuid}/remittances` |

The transfer posts as an `INTERNATIONAL_TRANSFER` transaction with a negative amount on the funding wallet.

## Quoting

```
POST /wallets/{wallet_uuid}/quote
```

```json
{
  "amount": 10000,
  "beneficiary_uuid": "771bab05-bfc3-49c5-9002-49ca3b0d61d3",
  "amount_currency": "ORIGIN_CURRENCY"
}
```

`amount_currency` decides what `amount` means: `ORIGIN_CURRENCY` quotes from the program's base currency, `DESTINATION_CURRENCY` quotes from the amount the beneficiary should receive. Quote from whichever side your customer thinks in.

The response carries everything you need to show before committing:

```json
{
  "quote": {
    "quote_uuid": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "exchange_rate": "19.4521",
    "send_amount": 194521,
    "currency": "MXN",
    "transaction_cost": 100,
    "expires_at": "2026-09-01T14:30:00Z"
  }
}
```

- **`send_amount`** is what the beneficiary receives, in the destination currency.
- **`transaction_cost`** is the total cost to the sender in cents, funding plus service fees.
- **`expires_at`** is the deadline. Quotes are rate locks, and rates move. Commit before expiry or requote.

Two pricing options exist for programs with external FX management: `exchange_rate` supplies your own rate, and `exchange_rate_markup` sets a percent markup over mid-market. Service fees on quotes are limited to `UPCHARGE` type.

## Sending

```
POST /wallets/{wallet_uuid}/remittances
```

```json
{
  "quote_uuid": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "external_id": "remittance-2026-00088",
  "transaction_purpose": "family support",
  "source_of_funds": "EMPLOYMENT_INCOME"
}
```

The quote drives the amount, the rate, and the destination, so the remittance body carries none of them. What it does carry:

| Field | Notes |
|---|---|
| `quote_uuid` | Required. The quote to commit |
| `external_id` | Your idempotency key. Retrying with the same value returns `409` with the original transaction |
| `payment_method_uuid` | Optional. Fund from a saved payment method instead of wallet balance |
| `funding_method` | Set to `CASH` when the sender pays with cash |
| `transaction_purpose` | Free-form compliance field. Valid values are corridor-specific |
| `source_of_funds` | One of `EMPLOYMENT_INCOME`, `OWNED_BUSINESS`, `FAMILY_INCOME`, `SAVINGS`, `INVESTMENTS`, `INHERITANCE`, `PROCEEDS_OF_SALE`, `PENSION` |

`transaction_purpose` and `source_of_funds` are regulatory fields, not metadata. Collect them deliberately in your flow. A remittance can be held for review when they are missing or implausible.

## Following the money

The transaction's `type_details.global_payments_details` carries the cross-border specifics:

- `exchange_rate`, the rate actually applied.
- `transaction_reference`, the code the beneficiary presents at a cash pickup location.
- `ready_for_collection` and `collected_at`, which record when a cash pickup became claimable and when it was claimed.
- `transaction_purpose` and `source_of_funds`, echoed back.

Cash pickup locations are searchable through the cash pickup endpoints (`GET /cash-pickup/locations`, `GET /cash-pickup/cities`) if you need to show the beneficiary where they can collect.

A remittance can be refunded through `POST /transactions/{transaction_uuid}/refund`. In Sandbox the whole flow is simulated, including failure and cancellation scenarios. See [Transfers Testing](/guides/sandbox-testing/test-transfers).

## Related

- [Beneficiaries](/guides/resources/beneficiaries). Set up recipients and payout methods.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses and lifecycle.
- [Internal Transfers](/guides/transactions/internal-transfers). Same-program wallet-to-wallet transfers.
- [Transfers Testing](/guides/sandbox-testing/test-transfers). Simulating remittances in Sandbox.
