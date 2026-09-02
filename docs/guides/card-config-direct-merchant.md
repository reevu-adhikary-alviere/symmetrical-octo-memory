---
title: "Direct Merchant Ecommerce"
description: "Sell your own goods online, charge cards at your checkout, and settle into one merchant account"
---

# Direct Merchant Ecommerce

You sell your own goods or services and take card payments at your own checkout. There is one business and one merchant account, and every sale settles into its balance. With no split to design, the work is the checkout experience and getting the money from that balance to your bank.

## Set up

Your business is a `BUSINESS` account on the program, with its officers attached as `STAKEHOLDER` accounts for KYB. The account's balance lives in a wallet, and that wallet's UUID is the `destination.wallet_uuid` on every charge. Store it in configuration once and never pass anything else. Save your bank account on the same account as a payment method. That is where payouts go.

A guest buyer's card goes inline on the charge request, which puts card data on your servers and inside your PCI scope. A returning buyer is a `CONSUMER` account with a saved [payment method](/guides/resources/payment-methods). Let the SDK tokenize it and you store a reference, not a card number. Anything you charge without the buyer present, such as a subscription or a delayed charge, needs a saved card. Guests are fine for one-off sales to strangers. Save cards as soon as you have repeat customers.

## Charge a card

```bash
POST /v3/cards/debit
{
  "external_id": "order_1000456",
  "amount": "108.00",
  "currency": "USD",
  "source": { "payment_method_uuid": "<buyer_saved_card>" },
  "destination": { "wallet_uuid": "<your_wallet>" },
  "auth_type": "AUTHCAP",
  "channel": "ECOM",
  "merchant_details": {
    "name": "Acme Coffee",
    "descriptor": "ACME COFFEE",
    "descriptor_city": "BROOKLYN",
    "mcc": "5814"
  },
  "ip_address": "203.0.113.42",
  "browser_info": { "user_agent": "...", "accept_header": "..." },
  "return_url": "https://shop.example.com/checkout/return?order=1000456",
  "description": "Order #1000456",
  "metadata": { "order_id": "1000456" }
}
```

`amount` is the full order total including tax and shipping, as a decimal string. `external_id` is your order reference and it makes the call idempotent. A retry with the same value returns the original transaction with a `409` instead of charging twice. `channel` defaults to `ECOM`. Use `MOTO` for orders you key in from a phone call.

`merchant_details.descriptor` is what the buyer sees on their statement. Make it match the name on your storefront, because a buyer who does not recognize a charge disputes it. The `ip_address` and `browser_info` fields feed risk scoring and 3-D Secure. Send them whenever you have them, because a charge with no device data is more likely to be challenged.

The response is the transaction. Read `status` and `status_reason` together.

| `status` | `status_reason` | What happened |
|---|---|---|
| `COMPLETED` | | Authorized. If `type_details.card_payment_details.captured_at` is set, captured too and the money is on its way to you. If it is absent, capture it later |
| `PENDING` | `3DS_AUTH_REQUIRED` | The buyer's bank wants to verify them. See below |
| `FAILED` | `NON_SUFFICIENT_FUNDS` and others | Declined. Show the buyer a retry with a different card |

The card payment details also carry `avs_result` and `cvv_result`, so you can add your own rule, such as refusing to ship to an address that failed verification.

### 3-D Secure

When the buyer's bank requires verification, or you asked for it with `3ds_preference: ENABLED` on an inline card, the charge comes back `PENDING` with `status_reason: 3DS_AUTH_REQUIRED` and a `redirect_url` under `type_details.card_payment_details.3ds_challenge`. Send the buyer there. The challenge has an `expires_at`, usually about ten minutes out. After they verify, their bank sends them to your `return_url` and Alviere finalizes the transaction on its own. Do not read the outcome from the redirect. Fetch the transaction with `GET /v3/transactions/{transaction_uuid}` or wait for the `WALLET_TRANSACTION` webhook, then show the buyer the result.

Sandbox triggers each 3DS outcome by amount. [Test Payments](/guides/sandbox-testing/test-payments) has the table.

### Authorize now, capture on shipment

If you ship physical goods, authorize at checkout and capture when the order leaves the warehouse. Send `auth_type: AUTH`, and the response is `COMPLETED` with no `captured_at`. When you ship, call `POST /v3/cards/capture` with the transaction UUID. Capture a smaller amount if an item was cancelled, and the difference is released to the buyer's card. If the whole order is cancelled before shipping, `POST /v3/cards/reverse` voids the authorization, returns `204`, and creates no refund transaction.

## Subscriptions and cards on file

Charging a saved card without the buyer present takes a `recurring` block on the charge. It tells the card network who initiated the charge and why, which is what keeps off-session charges from being declined as unexpected.

```json
"recurring": {
  "initiator": "MERCHANT",
  "processing_model": "SUBSCRIPTION",
  "sequence": "SUBSEQUENT"
}
```

The first charge in a series is made with the buyer present, `initiator: CARDHOLDER` and `sequence: INITIAL`. That is the charge that stores the credential for later use. Every rebill after it is `initiator: MERCHANT` and `sequence: SUBSEQUENT`. Pick the `processing_model` that matches what you are doing.

| `processing_model` | Use it for |
|---|---|
| `SUBSCRIPTION` | Fixed amount on a fixed interval |
| `UNSCHEDULED` | Variable amount when usage dictates, such as a metered plan |
| `INSTALLMENT` | A known number of payments against one purchase |
| `DELAYED_CHARGE` | An extra charge after the original, such as damage or incidentals |
| `NO_SHOW` | A cancellation fee |
| `RESUBMISSION` | Retrying a charge that was declined |
| `CARD_ON_FILE` | The buyer came back and chose their saved card themselves |

You run the schedule. Alviere's payment schedules debit bank accounts under a mandate, not cards, so card rebills come from your own scheduler calling the charge endpoint on the due date. Give each cycle its own `external_id`, such as the subscription ID plus the period, so a retried job cannot double-bill. When a rebill declines, retry with `processing_model: RESUBMISSION` on your own backoff rather than hammering the card.

## Fees

Your processing fee reaches you one of two ways, and your program manager sets which. With a fee rule, a `SERVICE_FEE` with `calc_type: DEDUCT` at `PROGRAM` scope fires on every charge and appears as a negative child transaction on the sale, so your wallet receives the net. With external billing, there is no fee rule and the wallet receives the gross. The child transaction is the only visible difference, and your reconciliation should expect one or the other, not both.

To pass a fee to the buyer, create a `CONVENIENCE_FEE` with `calc_type: UPCHARGE` and `display: true`. The buyer's card is charged the order total plus the fee, and the fee is credited to your wallet as a positive child. Before you charge, call `POST /v3/transactions/preview` with your account, `type: PAYMENT`, and the amount. It returns every fee that will apply and the total, so the buyer sees the real number before they confirm.

## Refunds

`POST /v3/cards/reverse` with the transaction UUID, an amount up to what remains refundable, and a `refund_reason` creates a `REFUND` transaction with a negative amount on your wallet, linked to the sale by `parent_transaction_uuid`. Refund part of an order, or refund the same order more than once until it is exhausted. Give each refund its own `external_id`.

The refund comes out of your wallet, so sweeping every dollar to your bank the moment it settles leaves nothing to refund from. Keep a working balance, or time payouts so a few days of sales are always on hand.

## Chargebacks

A chargeback arrives against a specific charge, and your program manager works it with you. You can prevent most of them. Match the descriptor to your brand, honor refunds quickly, capture on shipment rather than at checkout, and do not ship to an address that failed verification.

## Getting paid

Sales settle into your balance on the card settlement schedule. The wallet's `balance` is what has settled, and `available` is what you can move now. Get it to your bank in any of these ways.

**On demand.** `POST /wallets/{wallet_uuid}/withdraw` for an amount. It moves to the `captive` bucket until your bank settles it, one to three banking days.

**On a schedule.** `POST /v3/schedule/withdraws` with `amount.type: RULE` and `rule_name: SETTLED_BALANCE` sweeps whatever has settled on a daily, weekly, or monthly cadence. Occurrences on weekends and holidays run the next banking day, and an occurrence that finds nothing records a `SKIPPED` execution.

**Instantly.** `POST /v3/instant/transfer` with your bank payment method as the destination settles in seconds. See [Instant Payments](/guides/transactions/instant-payments).

## Reconciliation

`GET /v3/transactions` filtered by your account lists every sale with its child fees, every refund with its parent, and every withdrawal with its status. The `metadata.order_id` you set on the charge comes back on all of them, so join on that. For an end-of-day or month-end close, pull [Periodic Reports](/guides/reporting/periodic-reports) instead. They are the same transactions and UUIDs as CSV on SFTP.

## Related

- [Card Payments](/guides/payment-acceptance/online-payments/card-payments/introduction). The charge endpoint in full.
- [Payment Methods](/guides/resources/payment-methods). Saving buyer cards and your payout bank account.
- [Idempotency](/guides/getting-started/idempotency). How `external_id` protects every write.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses, child transactions, and reversals.
- [Test Payments](/guides/sandbox-testing/test-payments). Card numbers and amounts that trigger each outcome.
- [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). Accept ACH at the same checkout.
