---
title: "Wire"
description: "Receive wire transfers and reconcile them with Fedwire identifiers"
---

# Wire

Wires are how large, time-critical money reaches your customers. A wire sent
during the banking day lands the same day, and it lands for good. Payroll funding,
property deposits, treasury movements, and B2B invoices over the ACH comfort
threshold all arrive this way.

A wire credits the destination wallet and posts as a `WIRE_TRANSFER` transaction
carrying the Fedwire identifiers the sending bank stamped on it.

## Knowing a wire arrived

Subscribe to `WALLET_TRANSACTION`. A wire credit fires the same event as every
other wallet movement, with `transaction_type` set to `WIRE_TRANSFER`:

```json
{
  "event_type": "WALLET_TRANSACTION",
  "entity": {
    "transaction_uuid": "9fc8c952-9dd5-48a7-a082-f9fee2dd6caa",
    "account_uuid": "86e28f4b-c52d-4498-be89-a890b2298269",
    "wallet_uuid": "01f4746a-a916-418e-8c9f-ecce3260622a",
    "transaction_type": "WIRE_TRANSFER",
    "status": "COMPLETED",
    "amount": 12300,
    "currency": "USD",
    "type_details": {
      "wire_transfer_details": {
        "imad": "20250821SIM01D62638913",
        "omad": "676587528091661938019019632496121130",
        "originator_name": "ACME Industries",
        "originator_account": "4236598541"
      }
    }
  }
}
```

Amounts are in cents, so `12300` is $123.00. A wire credit posts positive.

## Reading the Fedwire identifiers

| Field | What it is |
|---|---|
| `imad` | Input Message Accountability Data. The sending bank's Fedwire reference, stamped when the wire was released. Formatted as the send date followed by the sender's identifier and a sequence number |
| `omad` | Output Message Accountability Data. The reference for the wire as delivered |
| `originator_name` | The party that sent the money |
| `originator_account` | The account it came from |

Every field is nullable. Not every wire arrives with a complete set, so render them
defensively rather than assuming presence.

`imad` and `omad` are the two values a bank will ask for when someone calls to
trace a payment. Store both against your own record of the transaction at the
moment it posts. Recovering them later means a support round trip you could have
avoided.

`originator_name` and `originator_account` are the only attribution a wire carries.
There is no free-text reference field to match against an invoice number, so
matching an incoming wire to what it pays for usually means the amount plus the
originator, confirmed against what the customer told you to expect.

## Where the details sit

The identifiers appear in both surfaces, at different depths.

| Surface | Path |
|---|---|
| `GET /transactions/{transaction_uuid}` | `transaction.wire_transfer_details` |
| `WALLET_TRANSACTION` webhook | `entity.type_details.wire_transfer_details` |

The REST response lifts the object to the top level of the transaction. The webhook
nests it under `type_details` alongside every other per-type detail object. Code
written against one will not read the other.

## Finality

A wire has no return window. Once it settles, the funds are yours and no
counterparty can claw them back the way an ACH originator can pull back a debit
within the return window. Reversing a wire means asking the originator to send a
new one in the other direction, at their discretion.

That cuts both ways, and it is the reason wires are used for high-value transfers:

- You can release goods, credit an account, or start work against a settled wire
  without holding for a return period.
- A wire sent to the wrong account is a recovery conversation between banks, not an
  API call.

See [Transactions Overview](/guides/transactions/transactions-overview) for how
`WIRE_TRANSFER` sits alongside the other types, and for status semantics.

## API reference

Read wire transactions through **Transactions** in the
[V2 API Reference](/api-v2). Webhook subscriptions are covered in
[Webhooks](/guides/more/webhooks).

## Related

- [Transactions Overview](/guides/transactions/transactions-overview). Statuses, types, and `type_details`.
- [Webhooks](/guides/more/webhooks). Subscribe to `WALLET_TRANSACTION`.
- [ACH](/guides/transactions/ach). Move money in and out on the lower-cost rail.
- [Global Money Transfers](/guides/transactions/global-money-transfers). Send funds internationally.
