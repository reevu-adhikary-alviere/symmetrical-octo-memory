---
title: "Direct Merchant Ecommerce"
description: "Sell your own goods online and receive card payments into a single merchant account"
---

# Direct Merchant Ecommerce

You sell your own goods or services and receive card payments into one account. There's no marketplace split at checkout. You're both the seller and the one getting paid.

Your checkout calls `POST /v3/cards/debit` once the order is ready to pay. Send the full amount including tax, put your order ID in `external_id` and `metadata`, and run any fraud checks before the call. Settled transactions come back through webhooks and `GET /transactions` for your accounting.

## Charge a card

```json
POST /v3/cards/debit
{
  "amount": "25.99",
  "currency": "USD",
  "source": {
    "payment_method_uuid": "<saved>"
  },
  "destination": {
    "wallet_uuid": "<merchant_account>"
  },
  "auth_type": "AUTHCAP",
  "channel": "ECOM",
  "external_id": "order_1000456",
  "metadata": { "order_id": "1000456" }
}
```

What happens when you make this call:

1. The card is authorized and captured.
2. Funds settle into your merchant account.
3. If you've configured a `SERVICE_FEE` rule, the Alviere processing fee is deducted automatically and shows up as a child transaction on the charge.

## Fees

Two options for billing:

- **Configured fee rule**. `SERVICE_FEE`, `DEDUCT` deducts the Alviere processing fee from your account at charge time.
- **External billing**. No fee rule; you're billed separately off-platform.

## Related

- [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction)
- [Payment Acceptance overview](/guides/payment-acceptance/payment-acceptance)
- [Payment Methods](/guides/resources/payment-methods). Save cards before charging them.
