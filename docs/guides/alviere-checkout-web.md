---
title: "Alviere Checkout — Web"
description: "Load the SDK, drop in the <alviere-checkout-express> web component, handle events, and theme it"
---

# Web

Embed Alviere Checkout into any web page with the `<alviere-checkout-express>` web component. This is the hands-on companion to the [Alviere Checkout overview](/guides/payment-acceptance/online-payments/alviere-checkout/introduction).

## 1. Load the SDK

```html
<script
  type="module"
  src="https://js.prd.alvierecdn.com/checkout/0.1.0/checkout-web-components.js"
  integrity="sha384-<release-hash>"
  crossorigin="anonymous"
></script>
```

Wait for every custom element to register by listening for the global ready event:

```js
window.addEventListener('alviere:ready', () => {
  // every <alviere-*> tag is now defined
});
```

## 2. Drop in the checkout

```html
<alviere-checkout-express
  env="prd"
  account-uuid="ff898aa6-e922-4401-b734-077fee4838f7"
  destination-wallet-uuid="ff898aa6-e922-4401-b734-077fee4838f7"
  amount="108.00"
  currency="USD"
  merchant-name="Reevu's Shop"
  merchant-mark="R"
  product-name="The First Hour Kit"
  product-meta="Ash & Paper · Brass token · Prompt deck · Scent card"
  statement-descriptor="REEVU SHOP DEBIT"
  methods="bank"
></alviere-checkout-express>
```

The funds settle into the wallet you set as `destination-wallet-uuid` — the same settlement model as the [card](/guides/payment-acceptance/online-payments/card-payments/introduction) and [bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) APIs.

:::scalar-callout{type="warning"}
**Never ship `client-secret` to a browser.** In production, your server mints a short-lived session via `/sdk/auth/generate/web/session` and the component consumes that token. `client-id` / `client-secret` attributes are for local development only.
:::

### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `env` | `prd \| tst \| dev` | `tst` | Alviere API environment |
| `account-uuid` | string | — | Merchant/payee account UUID |
| `destination-wallet-uuid` | string | — | Where the debit settles |
| `amount` | string | `0.00` | Decimal amount, e.g. `108.00` |
| `currency` | string | `USD` | ISO 4217 currency code |
| `merchant-name` | string | — | Used in the mandate text and panel header |
| `merchant-mark` | string | first letter | Single-character merchant glyph |
| `product-name` | string | — | Eyebrow line on the order summary |
| `product-meta` | string | — | Sub-line describing the product |
| `statement-descriptor` | string | — | Shown to the buyer before they commit |
| `methods` | `bank \| card \| bank,card` | `bank` | Payment methods to offer |
| `default-method` | `bank \| card` | `bank` | Tab selected on load |
| `default-email` | string | — | Prefill the email field |
| `default-name` | string | — | Prefill the account-holder name |

## 3. Handle the result

Every event bubbles and is `composed`, so one listener on the host element catches them all:

```js
const checkout = document.querySelector('alviere-checkout-express');

checkout.addEventListener('alviere:flow:complete', (e) => {
  // e.detail: { transactionUuid, paymentMethodUuid, externalId, amount, currency }
  fetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ transaction_uuid: e.detail.transactionUuid, amount: e.detail.amount }),
  });
});

checkout.addEventListener('alviere:flow:step-error', (e) => {
  console.error('Checkout failed:', e.detail.error);
});
```

| Event | Detail |
|---|---|
| `alviere:payment:processing` | `{ transactionUuid, externalId }` — debit created, awaiting bank |
| `alviere:flow:complete` | `{ transactionUuid, paymentMethodUuid, externalId, amount, currency }` |
| `alviere:flow:step-error` | `{ step, error, externalId }` |

## 4. Theming

The component renders in a shadow DOM, so your page styles never leak in — only design tokens do. Override any `--alv-*` token on `:root` or a wrapping element:

```css
:root {
  --alv-purple: #7a4dff;      /* accent color */
  --alv-radius-pill: 12px;    /* button corner radius */
  --alv-font-sans: 'Inter', system-ui, sans-serif;
}
```

## Production checklist

- Use the scoped-session endpoint — never put `client-secret` in the browser
- Pin the script with Subresource Integrity (`integrity=`) and `crossorigin="anonymous"`
- Set a strict referrer policy (`strict-origin-when-cross-origin`)
- Keep a CSP that disallows `eval` and third-party inline scripts

## Related

- [Accept bank payments](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) — the ACH rail Checkout runs on
- [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction) — enable cards with `methods="bank,card"`
- [Payment Methods](/guides/resources/payment-methods)
