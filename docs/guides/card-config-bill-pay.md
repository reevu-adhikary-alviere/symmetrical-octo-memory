---
title: "Bill Pay"
description: "Take bill payments by card for the billers on your platform, pass the card cost to the payer, and remit to each biller"
---

# Bill Pay

A payer settles a bill by card, the funds land in the biller's account, and the payer may cover the cost of paying by card through a convenience fee. Bill presentment, the amount due, notifications, and autopay scheduling live in your system. You call Alviere to charge the card and post the funds to the right biller.

## The parties

```
Your platform (the program)
├── Program fee revenue          your SERVICE_FEE per payment, if you charge one
├── Biller A   BUSINESS account, KYB complete
│   └── wallet                   receives A's payments, pays A's refunds
├── Biller B   BUSINESS account, KYB complete
│   └── wallet
└── Payers     guests paying once, or CONSUMER accounts with a saved card for autopay
```

**Billers** are `BUSINESS` accounts, one per biller, each through KYB with its officers attached as `STAKEHOLDER` accounts. The biller's wallet is the `destination.wallet_uuid` on every payment for that biller. Store it against your biller record at onboarding. [Accounts](/guides/resources/accounts) covers the statuses and the stages a biller can get stuck in during review.

**Payers** paying a one-off bill are guests. Their card is passed inline on the charge, so card data crosses your servers and sits inside your PCI scope. A payer who enrolls in autopay needs a `CONSUMER` account with a saved [payment method](/guides/resources/payment-methods). Tokenize it through the SDK and the card number never reaches you. Plan for both kinds of payer from the start.

## Onboard a biller

1. Create the `BUSINESS` account and its `STAKEHOLDER` accounts, and upload incorporation documents as [dossiers](/guides/resources/identity).
2. Watch the `ACCOUNT` webhook until the account is `ACTIVE`. A stop at `PENDING_USER` means the biller owes information. The `stage` field says which check is waiting.
3. Associate the biller's convenience fee rule with `PUT /v3/fee-rules/account-associations`. Skip this step if every biller pays the same fee from one `PROGRAM`-scoped rule.
4. Save the biller's bank account as a payment method so remittances have somewhere to go.

## Charge a card

A guest payment against an electric bill:

```bash
POST /v3/cards/debit
{
  "external_id": "bill_9f3a2c",
  "amount": "142.37",
  "currency": "USD",
  "source": {
    "card": {
      "pan": "4111111111111111",
      "exp_month": "12",
      "exp_year": "27",
      "security_code": "123",
      "name_on_card": "Jordan Rivera",
      "billing_address": { "line_1": "88 Elm St", "city": "Austin", "state": "TX", "country": "USA", "postal_code": "78701" }
    }
  },
  "destination": { "wallet_uuid": "<biller_wallet>" },
  "auth_type": "AUTHCAP",
  "channel": "ECOM",
  "merchant_details": {
    "name": "Travis County Electric",
    "descriptor": "TC ELECTRIC BILLPAY",
    "descriptor_city": "AUSTIN",
    "mcc": "4900"
  },
  "return_url": "https://pay.example.com/return?bill=9f3a2c",
  "ip_address": "203.0.113.42",
  "description": "Electric bill, May 2026",
  "metadata": { "biller_id": "biller_1042", "payer_account_last4": "4821", "invoice_id": "INV-2026-05-4821" }
}
```

`amount` is whatever your system says is due. Alviere charges what you send, so partial payments, overpayments, and minimum-due rules are yours to enforce before the call. `merchant_details.descriptor` puts the biller's name on the payer's statement. A payer who sees your platform's name instead of their utility's will call their bank. `metadata` carries the biller and the payer's account reference, and it comes back on every transaction and webhook, which is how you build the biller's remittance file.

Use `AUTHCAP`. A bill has nothing to ship, so a separate capture step would only delay the biller's funds. Use `channel: MOTO` for payments an agent keys in from a phone call.

The response is the transaction. `COMPLETED` means the payment went through. `FAILED` carries a `status_reason` such as `NON_SUFFICIENT_FUNDS` to show the payer. `PENDING` with `status_reason: 3DS_AUTH_REQUIRED` means the payer's bank wants to verify them. Redirect the payer to the `redirect_url` in `type_details.card_payment_details.3ds_challenge`. When they return, read the final result from `GET /v3/transactions/{transaction_uuid}` or the `WALLET_TRANSACTION` webhook, never from the redirect itself.

## The convenience fee

A convenience fee moves the card cost to the payer. It is a fee rule with `fee_type: CONVENIENCE_FEE` and `calc_type: UPCHARGE`. It increases what the payer's card is charged, and the fee is credited to the biller's wallet as a positive child transaction on the payment. It is the biller's money. Revenue for your platform is the service fee, described below.

```bash
POST /v3/fee-rules
{
  "external_id": "convenience_standard",
  "description": "Card convenience fee",
  "fee_scope": "PROGRAM",
  "fee_type": "CONVENIENCE_FEE",
  "calc_type": "UPCHARGE",
  "value": { "amount": "2.95" },
  "fee_criteria": { "transaction_types": ["PAYMENT"], "currencies": ["USD"] },
  "display": true
}
```

A fixed `amount` is the usual shape for bill pay. A `percent` with a `cap` works when bills vary widely. `display` must be `true`, because the payer has to see this fee before they agree to it.

Disclose it with `POST /v3/transactions/preview` before the payer confirms. Pass the biller's account, `type: PAYMENT`, and the amount due, and the response lists the fee and the total the card will be charged. Show both numbers on the confirmation screen. Do not compute the fee yourself in the frontend, because the rule can change and the preview is what will actually be charged.

Pick the scope once, for all billers. If every biller pays the same fee, one `PROGRAM`-scoped rule covers them with no association step. If any biller has a negotiated fee, make every convenience fee rule `ACCOUNT`-scoped, the standard one included, and associate each biller with exactly one. Rules stack, so a biller with both a `PROGRAM` rule and an `ACCOUNT` rule charges the payer both.

### Your platform fee

If you charge the biller per payment, that is a `SERVICE_FEE` with `calc_type: DEDUCT` at `PROGRAM` scope. It fires on every payment as a negative child on the biller's wallet, and the biller receives the net. Set `display: false` so it stays out of the payer's view.

### Worked example

A $142.37 bill, a $2.95 convenience fee kept by the biller, and a $0.50 platform fee.

| Step | Amount | Record |
|---|---|---|
| Payer's card is charged | $145.32 | `PAYMENT`, `amount: "142.37"`, on the biller's wallet |
| Convenience fee credited | +$2.95 | `CONVENIENCE_FEE` child, positive |
| Platform fee deducted | −$0.50 | `SERVICE_FEE` child, negative |
| Biller nets | $144.82 | |
| You net | $0.50 | |

## Autopay

Autopay by card is your scheduler calling the charge endpoint on the due date with the payer's saved card. Alviere's own payment schedules debit bank accounts under a mandate, which makes them the tool for ACH autopay. Card autopay runs on your side.

Enrollment is a charge with the payer present. Charge the current bill against the saved card with a `recurring` block of `initiator: CARDHOLDER`, `processing_model: UNSCHEDULED`, `sequence: INITIAL`. That stores the credential for later. Every automatic payment after that is:

```json
"recurring": {
  "initiator": "MERCHANT",
  "processing_model": "UNSCHEDULED",
  "sequence": "SUBSEQUENT"
}
```

`UNSCHEDULED` is the model for a variable amount on a merchant-initiated charge, which is what a bill is. If a biller offers fixed installment plans, use `INSTALLMENT` instead.

Give each bill its own `external_id`, for example the biller ID plus the invoice ID, so a scheduler that runs twice cannot collect twice. When an autopay charge declines, notify the payer and retry with `processing_model: RESUBMISSION` on a backoff of your choosing. Do not retry a `NON_SUFFICIENT_FUNDS` decline the same day.

## Refunds

An overpayment or a duplicate payment is reversed with `POST /v3/cards/reverse` against the original transaction, for any amount up to what remains refundable, with a `refund_reason` of `DUPLICATE`, `CUSTOMER_REQUEST`, or another value from the list. The `REFUND` lands on the biller's wallet with a negative amount and `parent_transaction_uuid` pointing at the payment.

The convenience fee is a separate transaction and the refund leaves it in place. Whether a refunded payer also gets the fee back is your policy and the biller's.

Because the refund debits the biller's wallet, a biller swept to zero every night cannot refund until the next payment arrives. Keep a small working balance in the biller's wallet, or time remittances so one day of collections stays behind.

## Chargebacks

The payer's bank raises a chargeback against one payment, and that payment belongs to a biller. Agree with each biller before launch who absorbs a lost chargeback. Your program manager will explain how your program handles them. Most of the defense is the descriptor. A payer who reads their utility's name on the statement has no reason to dispute it.

## Remit to billers

Collections settle into each biller's wallet on the card settlement schedule. Remittance is a withdrawal from that wallet to the bank account you saved for the biller. The usual shape is one `POST /v3/schedule/withdraws` per biller with `amount.type: RULE` and `rule_name: SETTLED_BALANCE` on a daily frequency, so each biller receives yesterday's collections without your remittance job touching the API. Bank settlement takes one to three banking days. A biller who pays for same-day remittance can be paid over `POST /v3/instant/transfer` instead, which settles in seconds. The on-demand, scheduled, and instant options are described in full under [Getting paid](/guides/payment-acceptance/use-cases/card-config-direct-merchant#getting-paid) in the direct merchant guide.

### The remittance file

Billers need to post each payment to the right customer account. `GET /v3/transactions` filtered by the biller's account returns every `PAYMENT` with its `metadata`, so the payer account reference and invoice ID you set at charge time come straight back, alongside the child fees and any `REFUND`. Build the biller's daily file from that, and reconcile the total against the sweep. A biller who wants a file drop rather than an API can take the same records from [Periodic Reports](/guides/reporting/periodic-reports), delivered as CSV over SFTP.

## Card and ACH together

The same biller accounts, fee rules, and remittance flow serve both rails. Offer [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) as the low-cost default for recurring bills and card as the option for payers who want instant confirmation or need to pay today. ACH autopay can run on Alviere's payment schedules while card autopay runs on yours.

## Related

- [Card Payments](/guides/payment-acceptance/online-payments/card-payments/introduction). The charge endpoint in full.
- [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). ACH bill pay, mandates, and scheduled debits.
- [Accounts](/guides/resources/accounts). Business account statuses and KYB stages.
- [Payment Methods](/guides/resources/payment-methods). Saving payer cards and biller bank accounts.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses, child transactions, and reversals.
- [Webhooks](/guides/more/webhooks). `ACCOUNT` for biller onboarding, `WALLET_TRANSACTION` for payments and refunds.
