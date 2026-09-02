---
title: "Instant Payments"
description: "Push funds in seconds over FedNow and TCH RTP, or ask a payer to send them"
---

# Instant Payments

Move money in seconds instead of banking days. Instant payments run on the two US
real-time rails, FedNow and TCH RTP, which clear and settle around the clock,
including weekends and holidays. Use them when the recipient is waiting on the money.

| Operation | Endpoint | Direction |
|---|---|---|
| Send an instant payment | `POST /v3/instant/transfer` | Push funds out of a wallet |
| Request a payment (RfP) | `POST /v3/instant/request` | Ask a payer to push funds in |

Both rails are credit-push. Money only moves when the paying side sends it, which is
why pulling funds means asking rather than debiting.

## Sending an instant payment

Debit a wallet and credit a bank account.

```
POST /v3/instant/transfer
```

```json
{
  "external_id": "inv-2026-0001",
  "amount": "250.00",
  "currency": "USD",
  "source": {
    "wallet_uuid": "223e4567-e89b-12d3-a456-426614174000"
  },
  "destination": {
    "payout_method_uuid": "d31600ed-75dd-4aef-9dcb-0b95e27da302"
  },
  "network": "FEDNOW",
  "description": "Invoice 2026-0001",
  "metadata": {
    "invoice_id": "2026-0001"
  }
}
```

`destination` takes one of two keys, and which one you send decides who gets paid.

| Key | Pays |
|---|---|
| `payout_method_uuid` | A third party, through a [beneficiary's payout method](/guides/resources/beneficiaries) |
| `payment_method_uuid` | Your own customer, through a bank account they have already saved as a [payment method](/guides/resources/payment-methods) |

`description` is optional, capped at 140 characters, and travels to the recipient's
bank statement. It is the only free text the rail carries, so spend it on something
the recipient will recognise, like an invoice number.

`amount` is a decimal string, as on every V3 endpoint. `"250.00"` is $250.00. V2 endpoints take cents instead.

### Choosing a network

`network` is required and takes `FEDNOW` or `TCH_RTP`. The two rails have different
membership, so the receiving bank has to be reachable on the one you pick. Treat it
as a property of the destination rather than a preference of yours.

## Requesting a payment

A Request for Payment asks a payer to push funds to your wallet. The payer sees the
request in their own banking app and chooses whether to pay it.

```
POST /v3/instant/request
```

```json
{
  "external_id": "rfp-2026-0001",
  "source": {
    "payment_method_uuid": "550e8400-e29b-41d4-a716-446655440000"
  },
  "destination": {
    "wallet_uuid": "3b0c5dd8-83fc-4d62-b54b-3780148e50c9"
  },
  "amount": "1000.00",
  "currency": "USD",
  "network": "TCH_RTP",
  "expires_at": "2026-06-28T23:59:59.000Z",
  "description": "Rent request June 2026"
}
```

- **TCH RTP only.** FedNow does not carry requests for payment.
- **`expires_at` is required.** The request closes itself at that moment and can no
  longer be paid. Set it to something a payer can realistically act within.
- **Payment is not guaranteed.** An RfP is an ask, not a debit. Build for the case
  where nobody pays, and reconcile on the transaction rather than on having sent the
  request.

The payer is identified by a bank-account payment method you already hold, so link
the account before you can ask it for money.

## Following the money

A send posts as an `INSTANT_BANK_TRANSFER` transaction, a request as an
`INSTANT_PAYMENT_REQUEST`.

```json
{
  "transaction": {
    "transaction_uuid": "9d64e7be-6a24-48dd-9f84-b2a3f7305e22",
    "external_id": "inv-2026-0001",
    "type": "INSTANT_BANK_TRANSFER",
    "status": "PROCESSING_PAYMENT",
    "amount": "-250.00",
    "currency": "USD",
    "funds_source": {
      "wallet_uuid": "223e4567-e89b-12d3-a456-426614174000"
    },
    "funds_destination": {
      "payout_method_uuid": "d31600ed-75dd-4aef-9dcb-0b95e27da302"
    },
    "type_details": {
      "instant_transfer_details": {
        "network": "FEDNOW"
      }
    }
  }
}
```

:::scalar-callout{type="warning"}
**A `201` is not settlement.** The synchronous response is the Alviere transaction
record, and at that point the bank leg may only be acknowledged. Do not release
goods, mark an invoice paid, or notify a recipient on the `201` alone.
:::

Poll `GET /v3/transactions/{transaction_uuid}` or listen for the transaction webhook
for the terminal `COMPLETED` or `REJECTED`. In flight, a send sits at
`PROCESSING_PAYMENT`. A fresh RfP sits at `CREATED` until the payer acts.

Note the sign. A send returns `amount` as a negative decimal string, because the
funds debit the source wallet in the ledger. Sum amounts rather than branching on
type when you compute a balance. See
[Transactions Overview](/guides/transactions/transactions-overview) for the full
status model.

## When a payment is rejected

Read `status_reason` first. It is present on every rejection and carries the reason
in a form you can show or log.

`type_details.instant_transfer_details.iso_reason_code` carries an ISO 20022 code
such as `AC03`, `AG01`, or `AM09`, but only when the rail returned one. It is absent
otherwise, so never branch on it alone. Fall back to `status_reason`.

Instant rails are final. A settled instant payment does not come back the way an ACH
debit can be returned inside a return window, so validate the destination before you
send rather than planning to reverse afterwards.

## Idempotency

`external_id` is your [idempotency key](/guides/getting-started/idempotency) and is what makes both
endpoints safe to retry. Generate it before the first attempt and reuse it on every
retry of the same payment.

## Related

- [ACH](/guides/transactions/ach). Cheaper, slower, and returnable.
- [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). Accept bank payments as a checkout option.
- [Beneficiaries & Payouts](/guides/resources/beneficiaries). Set up third-party recipients.
- [Payment Methods](/guides/resources/payment-methods). Link the bank accounts an RfP can ask.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses, types, and `type_details`.
