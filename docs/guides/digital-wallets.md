---
title: "Digital Wallets"
description: "Push-provision an issued card into Apple Pay, Google Pay, or Samsung Pay"
---

# Digital Wallets

Push provisioning puts a card into Apple Pay, Google Pay, or Samsung Pay from inside your app, so the cardholder taps a button rather than typing a card number they may not have to hand.

This is unrelated to the `DIGITAL` card genre, which describes a card's tangibility rather than a wallet. Cards of any genre are provisioned the same way.

Alviere does not add the card to the wallet. It gives you the encrypted payload the wallet provider needs, and the provider's SDK on the device does the adding. Your backend is a relay in the middle of a conversation between the device and the wallet provider.

## The flow

1. Your app asks the wallet provider's SDK for provisioning parameters. What comes back differs per provider.
2. Your backend sends those parameters to Alviere on `PUT .../mobile-wallet`.
3. Alviere returns `provisioning_request_data`.
4. Your app hands `provisioning_request_data` to the wallet provider's SDK, which completes the add.

Steps 1 and 4 are the wallet provider's SDK, not Alviere's API. Follow their documentation for those; this page covers steps 2 and 3.

## Request

```bash
curl -X PUT https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards/{card_uuid}/mobile-wallet \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_provider": "APPLE_PAY",
    "parameters": {
      "apple_pay": {
        "cert1": "308202ef30820...",
        "cert2": "308202a130820...",
        "nonce": "9c023092",
        "nonce_signature": "4082f883ae62..."
      }
    }
  }'
```

`wallet_provider` is the only required field, and it takes `APPLE_PAY`, `GOOGLE_PAY`, or `SAMSUNG_PAY`. The `parameters` object must match it.

### Apple Pay

All four values come from Apple's SDK and are all required. `cert1`, `cert2`, and `nonce_signature` are hexlified binary, case insensitive. `nonce` is exactly 8 hex characters.

| Field | Notes |
|---|---|
| `cert1` | Leaf certificate, signed using `cert2` |
| `cert2` | Subordinate certificate, signed by the wallet provider's CA |
| `nonce` | 8 characters |
| `nonce_signature` | Signature over the nonce |

### Google Pay and Samsung Pay

Both take the same two fields, and both are values the provider's SDK returns to your app.

| Field | Notes |
|---|---|
| `client_wallet_account_id` | Required for VISA cards |
| `client_device_id` | Required for VISA cards |

```json
{
  "wallet_provider": "GOOGLE_PAY",
  "parameters": {
    "google_pay": {
      "client_wallet_account_id": "…",
      "client_device_id": "…"
    }
  }
}
```

These fields are brand-sensitive, so send what the card's brand calls for rather than sending both unconditionally:

| Error | Meaning |
|---|---|
| `510028` | Card brand is not supported |
| `510030` | Mastercard parameters not present for a Mastercard card |
| `510031` | VISA parameters not present for a VISA card |

Apple Pay does not use these two fields.

Alviere issues Visa and Mastercard cards, so `brand` on the card object tells you which set of parameters to send. Read it before you build the request rather than sending both.

## Response

```json
{
  "result": "SUCCESS",
  "provisioning_request_data": {
    "apple_pay": {
      "activation_data": "…",
      "encrypted_pass_data": "…",
      "ephemeral_public_key": "…"
    }
  }
}
```

:::scalar-callout{type="warning"}
Branch on `result`, not on the HTTP status. Both outcomes return `200`, and `result` is what tells you the card reached the wallet.
:::

| Field | Notes |
|---|---|
| `result` | `SUCCESS` or `FAILED`. Always present |
| `error_code` | Present only when `result` is `FAILED` |
| `provisioning_request_data` | The payload for the wallet provider's SDK. Shape depends on the provider |

The payload shape differs per provider, so read the key matching the provider you asked for:

| Provider | Key | Contents |
|---|---|---|
| Apple Pay | `apple_pay` | `activation_data`, `encrypted_pass_data`, `ephemeral_public_key` |
| Google Pay | `google_pay` | `opaque_payment_data` |
| Samsung Pay | `samsung_pay` | `payload` |

Pass these through to the SDK exactly as received. They are encrypted for the wallet provider, they are single-use, and there is nothing in them for your application to read, parse, or store. Treat the whole object as opaque and do not log it.

## Retrying

When `result` is `FAILED`, `error_code` says why. The usual causes are a nonce that has already been used, certificates that do not match the card's brand, and a card that is not yet in a state the provider accepts.

Retry from step 1. The parameters from the wallet provider's SDK are tied to a single attempt, so ask the SDK for fresh ones and send those.

## When to provision

Provision once the card is `ACTIVE`. A card still in `PROCESSING`, or a physical card the cardholder has not activated yet, is not ready.

Replacing a card issues a new PAN and a new `card_uuid`, so a replaced card has to be provisioned again against the new `card_uuid`. See [Card Operations](/guides/cards/card-operations).

## Related

- [Issued Cards](/guides/cards/cards). Creating the card you are provisioning.
- [Card Operations](/guides/cards/card-operations). Freeze, unfreeze, and replace, and what each does to a provisioned card.
- [Card Data and PCI](/guides/cards/card-security). The other endpoint that returns card material, and the rules around it.
