---
title: "Alviere Checkout"
description: "Drop a prebuilt, themeable checkout into your page and get paid: bank payments by default, cards optional"
---

# Alviere Checkout

Accept payments with a prebuilt checkout you drop into your page in a few lines of HTML. Alviere Checkout is a set of web components. Load the script, place one tag, and your buyer gets a branded Pay surface that handles bank-account entry, the mandate, and the debit. You get an event when the money's in.

It leads with **bank payments** (ACH), Alviere's specialty, and cards are available as an option. Because it ships as web components, it drops into any stack (React, Vue, plain HTML) without a framework dependency.

## How it works

1. Your server creates a short-lived session for the buyer.
2. You drop `<alviere-checkout-express>` into your checkout page with the amount and where funds should land.
3. The buyer pays; the component runs account lookup, mandate, and debit as a single surface.
4. You receive an `alviere:flow:complete` event with the transaction. Record the order and you're done.

The funds settle into the wallet you set as `destination-wallet-uuid`. That's the same settlement model as the [card](/guides/payment-acceptance/online-payments/card-payments/introduction) and [bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) APIs.

## Next steps

- [Web](/guides/payment-acceptance/online-payments/alviere-checkout/web). Load the SDK, drop in the component, handle the result, and theme it.
- [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). The ACH rail Checkout runs on.
- [Payment Methods](/guides/resources/payment-methods)
