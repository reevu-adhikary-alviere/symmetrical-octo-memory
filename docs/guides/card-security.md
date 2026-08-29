---
title: "Card Data and PCI"
description: "Retrieve card numbers and set PINs without pulling your systems into PCI scope"
---

# Card Data and PCI

Two endpoints return or accept raw card material: the one that gives you a full PAN and CVV, and the one that sets a PIN. Both are **restricted to Alviere's SDK or preauthorized clients**.

That restriction is the point of this page. Everywhere else in the card API you handle identifiers like `card_uuid`, `last_4`, and `external_id`. Those carry no cardholder data and put your systems under no obligation. These two endpoints are different, and calling them from your own backend changes what your infrastructure is subject to.

## Get card sensitive data

```bash
curl https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards/{card_uuid}/sensitive-data \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18"
```

```json
{
  "card_pan": "5412750000000000",
  "card_security_code": "123"
}
```

This is the only endpoint that returns a full card number. Create, get, list, and the `ISSUED_CARD` webhook all return `last_4` and nothing more.

:::scalar-callout{type="warning"}
Call this from the Alviere SDK, not from your own backend. A response containing a PAN that reaches your servers brings them into PCI DSS scope, and it does so retroactively for anything that logged, cached, or proxied the response, load balancer logs and error trackers included.
:::

The intended pattern is that your app asks the Alviere SDK to display the card, and the SDK fetches and renders it on the device. The card number never passes through your servers, and you never store it.

If you have a case that genuinely requires your backend to hold card data, that is a conversation with your Alviere program manager before you write the code, not after. Access is granted per client.

## Set a PIN

```bash
curl -X PUT https://api.snd.alviere.com/issued-cards/{card_uuid}/pin \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "1234"
  }'
```

Returns `204`. Note the path. Like replace, this endpoint takes the `card_uuid` alone and is not wallet-scoped.

The same restriction applies: this endpoint is for the Alviere SDK or a preauthorized client. A PIN typed into your own UI and posted to your own backend is a PIN your backend is now responsible for.

| Field | Format |
|---|---|
| `pin` | 4 to 9 digits. The exact length is set by your card program |

**The card must be `ACTIVE`.** A PIN cannot be set on a card in `READY_TO_ACTIVATE`. Activation comes first, then the PIN. On physical cards, collect the PIN in the step after activation rather than alongside it.

Alongside the card's status, the request is checked against the account that owns it, that the wallet is active, that the consumer is active, and that the card is not blocked. The PIN itself is checked against the length your card program allows.

| Error | Meaning |
|---|---|
| `510066` | The submitted PIN is not valid for this program's rules |
| `510073` | The program's PIN length is not configured |

The same endpoint sets and changes a PIN. There is no separate change-PIN call, and no endpoint reads a PIN back. See below.

## Generating a PIN at issue

If you would rather not run a PIN capture flow, set `auto_pin_generation` on the create request and Alviere generates one:

```json
{
  "external_id": "card-8871-a",
  "product_id": "885",
  "auto_pin_generation": true
}
```

It defaults to `false`, and it is not sufficient on its own. Automatic generation also needs a PIN length configured on your card product. **Automatic generation runs only when that length is configured, and the create request succeeds either way.** Check `pin_set` on the response to confirm which you got.

Confirm the behaviour on your first card in Sandbox rather than assuming the flag worked. Check `pin_set`.

Like a PIN you set yourself, a generated PIN is applied only once the card is `ACTIVE`.

## PINs are write-only

There is no endpoint that returns a PIN, and the value is not stored or logged anywhere in Alviere's systems. That is deliberate, and it holds for generated PINs too: nobody at Alviere and nobody at your company can look up a cardholder's PIN.

A cardholder who has forgotten their PIN sets a new one. There is no recovery path, so build the "forgot my PIN" flow as a set-a-new-PIN flow.

## Knowing whether a PIN exists

`pin_set` on the card object is `true` once a PIN has been set. It is a boolean, and it is the only PIN state the API exposes.

Use it to decide whether to prompt a cardholder to set one, and to confirm `auto_pin_generation` did what you expected. Getting `pin_set` to `true` before the cardholder reaches an ATM is the goal.

## PINs on digital-first cards

Setting a PIN on a `DIGITAL` card is what enables it for card-present transactions. Until it has one, a digital-first card is limited to the transactions its number alone can carry.

Here the PIN decides what the card can do at all, rather than being a convenience at ATMs and terminals. If your program issues digital-first cards, prompt for a PIN as part of onboarding rather than leaving it as an optional step.

## What is safe to hold

| Field | Safe to store and log |
|---|---|
| `card_uuid` | Yes. This is the identifier to use everywhere |
| `external_id` | Yes. It is yours |
| `last_4` | Yes. Standard for display and support |
| `card_expiration` | Yes |
| `brand`, `status`, `type`, `genre` | Yes |
| `card_image` | Yes. Card art, no PAN. See [Physical Cards](/guides/cards/physical-cards) |
| `card_pan` | **No** |
| `card_security_code` | **No** |
| `pin` | **No** |

Activation is the one place the boundary is less obvious. `PUT .../activate` takes `last_4`, `expiration_date`, and an optional `security_code`. The CVV there is supplied by the cardholder reading their own card, for one call, and is not stored. Do not retain it after the activation request, and do not log the request body.

## Related

- [Card Operations](/guides/cards/card-operations). Activating a card and what the activation fields are for.
- [Digital Wallets](/guides/cards/digital-wallets). The other flow that moves card material, handled entirely by SDKs.
- [Issued Cards](/guides/cards/cards). The fields returned on a normal card read.
