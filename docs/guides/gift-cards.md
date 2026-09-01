---
title: "Gift Cards"
description: "Issue a card that opens with a fixed balance, and charge an activation fee against it"
---

# Gift Cards

A gift card is an issued card that opens with a fixed balance, set at the moment it is issued and funded by you rather than by the cardholder. Everything else about it works exactly as it does for any other card: creation, statuses, freezing, physical fulfilment.

Gift is a card **type**, and type comes from the card product. You issue one by creating a card with a `product_id` whose type is `GIFT`, not by naming the type on the request.

## Where the money comes from

A gift card is loaded from **program funds**, drawn from your `CARD_FUNDING` treasury vault. That is what separates it from `PREPAID_NON_RELOADABLE`, which is otherwise similar: a non-reloadable prepaid card is loaded once with the **consumer's** funds.

So the choice between the two is a funding question before it is a product question. If your customer is paying for the balance, that is prepaid. If you are, that is gift.

Fund the `CARD_FUNDING` vault before you issue. A gift card is created with its balance already on it, so there is no separate load step to retry if the vault is short.

## Opening balance

`initial_balance` is the amount the card starts with, in cents.

```bash
curl -X POST https://api.snd.alviere.com/wallets/{wallet_uuid}/issued-cards \
  -H "Authorization: Bearer $ALVIERE_API_KEY" \
  -H "Version: 2021-11-18" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "gift-2201-a",
    "product_id": "912",
    "initial_balance": 30000
  }'
```

`30000` is $300.00. The minimum is `1`.

The field is strictly conditional, and it fails in both directions with a `400` validation error:

| Situation | Result |
|---|---|
| Gift product, `initial_balance` sent | Card is created with that balance |
| Gift product, `initial_balance` omitted | `400` — required field missing |
| Non-gift product, `initial_balance` sent | `400` — field not allowed for this product |

Branch on the product before you build the request, and send `initial_balance` only for gift products.

`initial_balance` also comes back on the card object, where it records what the card opened with. It is not a live balance and does not go down as the card is spent. Read the wallet for that.

## Activation fees

`service_fees` charges a fee when the card becomes active, deducted from the card itself. On an issued card, service fees are always `DEDUCT`: the money comes out of the card's balance rather than being billed to you or to the cardholder separately.

```json
{
  "external_id": "gift-2201-a",
  "product_id": "912",
  "initial_balance": 30000,
  "service_fees": [
    {
      "description": "Gift card activation fee",
      "category": {
        "activation_fee": {
          "value": {
            "amount": 500
          }
        }
      }
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `description` | Yes | Labels the resulting fee transaction. Up to 255 characters |
| `category.activation_fee` | Yes | The only fee category available at issue |
| `category.activation_fee.value.amount` | Yes | Fixed amount in cents, 1 to 99999999 |

The fee is a fixed amount. There is no percentage option on an issued card activation fee.

Because the fee deducts from the card, the opening balance has to cover it. A $300 card with a $5 activation fee gives the cardholder $295. The balance has to cover the fees at creation — a `400` is returned if it does not. That means a card that goes active has always settled its own fee.

Common fee validation errors (`400`) are an invalid service fee, a duplicate service fee `external_id`, or an initial balance that does not cover the deducted fees.

Service fees are not gift-only. They are most useful here because a gift card has a balance to deduct from at the moment it activates.

## Non-reloadable prepaid cards

`PREPAID_NON_RELOADABLE` is a card type you will see on the card object and in `CARD_CREATED` activities. It must be preloaded before it can authorize, and it can be loaded only once, with consumer funds. Once that balance is spent, the card is done.

There is no public endpoint for creating one directly. Non-reloadable cards are set up through your card product configuration, so talk to your program manager if you need them rather than looking for a create call.

## Related

- [Issued Cards](/guides/cards/cards). The full create request and the card object.
- [Card Issuing Overview](/guides/cards/card-issuing-overview). Card types and how `product_id` determines them.
- [Incentives](/guides/cards/incentives). Cashback and boosts, which move money the other way.
