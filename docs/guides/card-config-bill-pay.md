---
title: "Bill Pay"
description: "Let payers pay their bills by card, with an optional convenience fee"
---

# Bill Pay

A payer (consumer or business) pays a biller by card. Funds settle into the biller's account. Bill presentment, notifications, and autopay scheduling stay in your stack. You call Alviere to charge the card and post the funds.

The pattern fits any platform that collects payments on behalf of the organizations doing the billing, whether that's one biller or thousands.

Card is a great **convenience rail** when payers want instant confirmation. Many programs offer ACH alongside via [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) for cost-sensitive payers.

## How this connects to your stack

| Your system | Examples | How it ties to Alviere |
|---|---|---|
| Biller roster, account numbers | Your CRM, biller systems | Pass `metadata` linking payer reference to biller account |
| Invoice / amount due | Biller billing systems | The `amount` you send is the validated balance |
| Notifications | Your email/SMS | Subscribe to webhooks for success and failure events |
| Autopay / scheduling | Your scheduler | Trigger `POST /v3/cards/debit` on the due date |
| Legacy ACH / lockbox | Biller's bank | Can run alongside. Only the card path runs through Alviere |

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
