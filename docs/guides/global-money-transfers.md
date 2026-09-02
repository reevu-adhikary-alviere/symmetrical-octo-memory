---
title: "Global Money Transfers"
description: "Send cross-border payments and remittances to beneficiaries worldwide"
---

# Global Money Transfers

Send cross-border payments to an international beneficiary's bank account, e-wallet, card, or a cash pickup location. Alviere handles the currency conversion and the routing. You set up the beneficiary, price the transfer with a quote, and commit the quote. No money moves until the last step.

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

`amount_currency` decides what `amount` means. `ORIGIN_CURRENCY` quotes from the program's base currency and `DESTINATION_CURRENCY` from the amount the beneficiary should receive. Quote from whichever side your customer thinks in.

The response carries what you show the sender before they confirm.

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
- **`expires_at`** is when the locked rate lapses. Commit before it or request a new quote.

Programs that manage their own FX can pass `exchange_rate` to supply the rate, or `exchange_rate_markup` for a percent markup over mid-market. Service fees on a quote must be `UPCHARGE`.

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

The quote already fixed the amount, the rate, and the destination, so the remittance body carries none of them.

| Field | Notes |
|---|---|
| `quote_uuid` | Required. The quote to commit |
| `external_id` | Your [idempotency key](/guides/getting-started/idempotency) |
| `payment_method_uuid` | Optional. Fund from a saved payment method instead of wallet balance |
| `funding_method` | Set to `CASH` when the sender pays with cash |
| `transaction_purpose` | Free-form compliance field. Valid values are corridor-specific |
| `source_of_funds` | One of `EMPLOYMENT_INCOME`, `OWNED_BUSINESS`, `FAMILY_INCOME`, `SAVINGS`, `INVESTMENTS`, `INHERITANCE`, `PROCEEDS_OF_SALE`, `PENSION` |

`transaction_purpose` and `source_of_funds` are regulatory fields, not metadata. Ask the sender for them as part of the flow rather than defaulting them, because a remittance with a missing or implausible value can be held for review.

## Following the money

The transaction's `type_details.global_payments_details` carries the cross-border specifics.

- `exchange_rate`, the rate actually applied.
- `transaction_reference`, the code the beneficiary presents at a cash pickup location.
- `ready_for_collection` and `collected_at`, which record when a cash pickup became claimable and when it was claimed.
- `transaction_purpose` and `source_of_funds`, echoed back.

Cash pickup locations are searchable through the cash pickup endpoints (`GET /cash-pickup/locations`, `GET /cash-pickup/cities`) if you need to show the beneficiary where they can collect.

When a remittance is refunded and the sender paid in cash, the `REFUND` sits in `PENDING` until you tell Alviere how the sender gets the money back. `PUT /transactions/{transaction_uuid}/refund` with `refund_method` set to `CASH` or `CHECK` releases it. In Sandbox the whole flow is simulated, including failure and cancellation scenarios. See [Transfers Testing](/guides/sandbox-testing/test-transfers).

## Related

- [Beneficiaries](/guides/resources/beneficiaries). Set up recipients and payout methods.
- [Transactions Overview](/guides/transactions/transactions-overview). `INTERNATIONAL_TRANSFER` and the passthrough children.
- [Internal Transfers](/guides/transactions/internal-transfers). Same-program wallet-to-wallet transfers.
- [Transfers Testing](/guides/sandbox-testing/test-transfers). Simulating remittances in Sandbox.
