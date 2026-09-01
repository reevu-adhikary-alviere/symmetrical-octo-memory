---
title: "Bill Pay"
description: "Let payers pay their bills by card, with an optional convenience fee"
---

# Bill Pay

A payer (consumer or business) pays a biller by card. Funds settle into the biller's account. Bill presentment, notifications, and autopay scheduling stay in your stack. You call Alviere to charge the card and post the funds.

The pattern fits one biller or thousands. Your system holds the biller roster and the amount due. On the due date, or when the payer clicks pay, you call `POST /v3/cards/debit` with the validated balance and put the biller and payer references in `metadata`. Webhooks tell you when the payment succeeds or fails so you can notify the payer.

## How accounts are set up

```
Your platform (the program)
└── Biller accounts         one per biller
    └── Biller balance        where card payments land
```

**Payer accounts are optional.** Many bill-pay flows are **guest card pay**. Pass card details inline on the charge without creating a `CONSUMER` account.

## Charge a card

```json
POST /v3/cards/debit
{
  "amount": "142.37",
  "destination": {
    "wallet_uuid": "<biller_account>"
  },
  "source": {
    "card": { }
  },
  "external_id": "billpay_9f3a2c",
  "metadata": {
    "biller_id": "biller_1042",
    "account_number_last4": "4821"
  },
  "description": "Electric bill May 2024"
}
```

## Adding a convenience fee

Billers often charge a flat fee to cover card processing. Configure a fee rule and the payer's card is charged the bill plus the fee:

- Fee type: `CONVENIENCE_FEE`, mode `UPCHARGE`, scope `PROGRAM`
- Payer's card is charged: **amount due + fee**
- Biller's account is credited: **amount due only**
- Fee revenue goes to your platform or the biller, depending on program configuration

## Card vs. ACH for bill pay

Card gives payers instant confirmation; ACH costs the biller less. Many bill-pay platforms offer both rails through Alviere. See [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) for the full cost-and-experience comparison.

## Related

- [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction)
- [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction)
- [Payment Acceptance overview](/guides/payment-acceptance/payment-acceptance)
