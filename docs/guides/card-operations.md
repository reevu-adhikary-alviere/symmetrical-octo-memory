---
title: "Card Operations"
description: "Activate, freeze, unfreeze, cancel, and replace an issued card"
---

# Card Operations

Everything you do to a card after it exists. Each of these is a single call, and all but replace return `204 No Content` with no body. Read the resulting state from the `ISSUED_CARD` webhook or a follow-up `GET`.

| Operation | Endpoint |
|---|---|
| Activate | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/activate` |
| Freeze | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/freeze` |
| Unfreeze | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/unfreeze` |
| Cancel | `DELETE /wallets/{wallet_uuid}/issued-cards/{card_uuid}` |
| Replace | `POST /issued-cards/{card_uuid}/reissue_replace` with `action: REPLACE` |

## Activate

Activation applies to physical card products only. Calling it on a card that is not physical returns a `400` validation error.

There are two ways a physical card gets activated, and both end in the same place:

| Path | How it happens |
|---|---|
| API | You call the endpoint below, from your own activation flow |
| Phone | The cardholder calls the card program's activation line and activates it there. Alviere is notified and moves the card to `ACTIVE` on its own |

You do not have to build the API flow to have working cards, and you should not assume a card only becomes `ACTIVE` because you called something. Subscribe to `ISSUED_CARD` and treat the status as the source of truth.

Through the API, the cardholder proves they are holding the card by reading data off it:

```bash
curl -X PUT https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards/{card_uuid}/activate \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18" \
  -H "Content-Type: application/json" \
  -d '{
    "last_4": "1234",
    "expiration_date": "02/25",
    "security_code": "123"
  }'
```

| Field | Required | Format |
|---|---|---|
| `last_4` | Yes | Four digits |
| `expiration_date` | Yes | `MM/YY` |
| `security_code` | No | Three digits |

The card must be in `READY_TO_ACTIVATE`. Common failures return a `400` validation error:

- Card is not ready to activate (not in `READY_TO_ACTIVATE`)
- Card is already active
- Card is not physical
- The owning account is not in a state that permits activation
- Activation data was missing from the request

In Sandbox, advance a card to `READY_TO_ACTIVATE` with the mock ship endpoint described in [Card Issuance Testing](/guides/sandbox-testing/test-cards).

Set the PIN after activation, not before. A PIN can only be set on an `ACTIVE` card. See [Card Data and PCI](/guides/cards/card-security).

## Freeze and unfreeze

Freezing is the reversible control. Every authorization on a frozen card is declined, and unfreezing puts the card back to `ACTIVE`.

```bash
curl -X PUT https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards/{card_uuid}/freeze \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18"
```

Neither call takes a body. Unfreeze is the same request against `/unfreeze` and puts the card back to `ACTIVE`.

A card in a final status cannot be frozen. The API returns a `400` validation error when the card's current status does not permit the action, for example when the card is not `ACTIVE`.

Two boolean fields on the card object describe this, and they are not the same field:

| Field | Meaning |
|---|---|
| `frozen` | The card is currently frozen |
| `blocked` | The card is blocked and will decline |

A card can be blocked without being frozen. If unfreeze does not bring a card back, check `blocked`. A blocked card returns a `400` validation error and unfreezing will not clear it.

:::scalar-callout{type="info"}
Freeze is the right response to a card the cardholder has misplaced. It keeps the card number, so everything the cardholder has saved with a merchant carries on working once they unfreeze. Reserve replace for confirmed loss or compromise, where a new card number is the point.
:::

## Cancel

```bash
curl -X DELETE https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards/{card_uuid} \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18"
```

`CANCELED` is final. There is no uncancel, and the card cannot be reactivated or unfrozen afterwards. Cancelling a card that is already cancelled returns `409`.

A card can also reach a final status without you calling anything. `EXPIRED` follows the expiration date, and `LOST_STOLEN` follows a report. Both are final in the same way.

## Replace

Replace issues a new card and retires the old one. The new card has a **new `card_uuid`, a new PAN, a new expiry, and a new CVV**. That is what stops a compromised card being used, and it is why replace is the wrong tool for a card that is merely misplaced.

`action` is `REPLACE`. `reason` records why you did it, and does not change the outcome.

```bash
curl -X POST https://api.snd.alviere.com/issued-cards/{card_uuid}/reissue_replace \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "card-8871-b",
    "action": "REPLACE",
    "reason": "DATA_COMPROMISED",
    "description": "Cardholder reported a skimmed transaction"
  }'
```

Note the path: replace is one of two card endpoints that is not wallet-scoped. It takes the `card_uuid` alone.

`external_id` is your ID for the **new** card and must be unused, exactly as on create. A `201` returns the new card object.

| Field | Required | Notes |
|---|---|---|
| `external_id` | Yes | Must be unique. Reusing one returns `409` |
| `action` | Yes | `REPLACE` |
| `reason` | Yes | `DAMAGED`, `ATM_MALFUNCTION`, `DATA_COMPROMISED`, `ABOUT_TO_EXPIRE`, `EXPIRED`, `OTHER` |
| `description` | No | Free text for your own records |
| `shipping_address` | No | Send the new card somewhere else |
| `custom_fields.shipping_method` | No | `DEFAULT` or `EXPRESS_FEDEX` |
| `service_fees` | No | A fee charged for the replacement |

Pick the accurate `reason`. It is what you and Alviere will be reading back in disputes and audits, and `DATA_COMPROMISED` in particular is worth recording honestly.

Replacement is refused in a few cases, all with a `400` validation error:

- The wallet balance does not cover the replacement service fee
- Replace is not allowed for this card genre
- Replace is not allowed from this card status
- This card has already been replaced
- Duplicate replace request (or `409` when the `external_id` collides)

A replacement lands in the account activity feed as `CARD_REPLACEMENT`. See [Activity](/guides/resources/activity).

### After a replacement

The new card has a new number, so anywhere the cardholder saved the old one needs updating. Prompt them to re-enter the card on their subscriptions and saved checkouts, and give them a way to see the new details straight away through the Alviere SDK.

Handling it at replacement time keeps the cardholder in one flow, with a single prompt and the new card in front of them.

## Related

- [Issued Cards](/guides/cards/cards). Creating, reading, and updating cards.
- [Card Data and PCI](/guides/cards/card-security). Setting a PIN and retrieving the PAN.
- [Physical Cards](/guides/cards/physical-cards). Shipping, embossing, and returned mail.
- [Activity](/guides/resources/activity). Card events in the account activity feed.
