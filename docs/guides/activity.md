---
title: "Activity"
description: "Non-transactional account events: card creation, denied authorizations, and card replacements"
---

# Activity

Activity records account-level events that moved no money and therefore never appear as transactions. Today that means three things: cards being created, card authorizations being declined, and cards being replaced or reissued. Use activity to drive in-app notifications, support tooling, and audit trails.

If money moved, it is a [transaction](/guides/transactions/transactions-overview), not an activity. The two feeds do not overlap.

## Listing activities

```bash
curl -G https://api.snd.alviere.com/activities \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d account_uuid=6bff373e-f376-4af7-872a-8520756767e5 \
  -d type=DENIED_AUTHORIZATION \
  -d created_after=2025-08-01T00:00:00Z \
  -d limit=50
```

| Filter | Values |
|---|---|
| `account_uuid` | Scope to one account |
| `wallet_uuid` | Scope to one wallet |
| `type` | `CARD_CREATED`, `DENIED_AUTHORIZATION`, or `CARD_REPLACEMENT` |
| `entity_type` | `ISSUED_CARD` |
| `entity_uuid` | Scope to one entity, currently one issued card |
| `created_after`, `created_before` | Timestamp range |
| `limit`, `offset` | Pagination |

Fetch a single record with `GET /activities/{activity_uuid}`.

Every activity carries `activity_uuid`, `type`, and `created_at`. The type-specific payload lives under `type_details`, keyed by type.

## Denied authorizations

A denied authorization is a card transaction the network asked about and Alviere declined: a swipe, an ATM withdrawal, an online purchase. No funds moved, so there is no transaction record. This feed is the only place the attempt shows up.

`type_details.denied_authorization_details` carries:

| Field | Use |
|---|---|
| `card_uuid` | Which card was used |
| `denied_reasons` | Array of reasons for the decline |
| `amount`, `currency` | What was attempted |
| `merchant_name`, `merchant_id` | Where it was attempted |
| `terminal_id` | Which terminal |
| `network`, `subnetwork` | Card network the attempt came through |
| `is_international` | Whether the attempt was cross-border |

:::scalar-callout{type="warning"}
`denied_reasons` is a free-form array of strings, not a fixed enum. Do not branch application logic on its contents. Use it in support tooling where a person reads it, and drive customer-facing messaging off the card's own `status` instead: a `FROZEN` or `LOST_STOLEN` card explains the decline without parsing anything.
:::

This is the feed behind "why was my card declined?" in your app, and behind the support screen your agents open when a customer calls about it. Polling it after a failed purchase is usually faster than waiting for the customer to describe what happened.

## Card replacement and reissuing

Both operations come through `POST /issued-cards/{card_uuid}/reissue_replace` and both land here as `CARD_REPLACEMENT` activities. The difference is what happens to the PAN.

| | Replacement | Reissue |
|---|---|---|
| New PAN | Yes | No, same PAN |
| Expiry and CVV | New | New |
| Recurring payments on the card | Break. The merchant has to be updated | Keep working |
| Typical trigger | Loss, theft, confirmed or suspected fraud | Card nearing expiry, damaged, or a security refresh |

Issuing a new PAN is the point of a replacement: it stops continued unauthorized use. That is also why it breaks every card-on-file at every merchant, which is worth telling the cardholder before you do it.

`type_details.card_replacement_details` carries:

| Field | Use |
|---|---|
| `card_uuid` | The card being replaced |
| `replacement_card_uuid` | The new card. Present on replacement, absent on reissue |
| `reason` | Why the card was replaced |
| `reason_description` | Free text, populated when `reason` is `OTHER` |
| `waive_fees` | Whether the replacement fee was waived |
| `waive_fees_reason`, `waive_fees_description` | Why it was waived |

The presence or absence of `replacement_card_uuid` is the reliable way to tell a replacement from a reissue in your own processing.

## Card created

A `CARD_CREATED` activity fires when a card is issued on the account. It is the cheapest way to keep your own card list in sync without polling `GET /issued-cards`.

`type_details.card_created_details` carries:

| Field | Values |
|---|---|
| `card_uuid` | The new card |
| `type` | `DEBIT`, `PREPAID`, `PREPAID_NON_RELOADABLE`, `GIFT` |
| `genre` | `DIGITAL`, `VIRTUAL`, `PHYSICAL` |
| `brand` | Card brand, e.g. `VISA` |
| `product_id` | The product ID assigned when your card issuance service was set up |

`genre` is what tells you whether anything physical is being mailed, and therefore whether the cardholder should expect a `READY_TO_ACTIVATE` step. See [Issued Cards](/guides/cards/cards) for the full lifecycle.

## Related

- [Issued Cards](/guides/cards/cards). Card statuses and lifecycle.
- [Transactions Overview](/guides/transactions/transactions-overview). Everything that moved money.
- [Webhooks](/guides/more/webhooks). Subscribe to `ACTIVITY` to receive these events instead of polling.
