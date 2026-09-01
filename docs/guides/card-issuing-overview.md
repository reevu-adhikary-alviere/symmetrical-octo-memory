---
title: "Card Issuing Overview"
description: "Issue branded debit, prepaid, and gift cards that spend directly from a wallet"
---

# Card Issuing Overview

Alviere issues Visa and Mastercard cards that spend from a wallet. Debit, prepaid, and gift. Physical plastic, virtual, or digital-first. Freeze, replace, restrict merchants, add the card to Apple Pay, Google Pay, or Samsung Pay, and show the PAN through the Alviere SDK so the number never hits your servers.

A debit card authorizes against the wallet balance the customer already sees. Prepaid and gift cards are loaded first. In every case spend hits that wallet. There is no nightly sweep to reconcile.

You do not mint a card product yourself. Your Alviere program manager configures it and gives you a `product_id`. That is a program fact, not an API call.

Card issuing is V2 (`Version: 2021-11-18`). It is not in the V3 reference. The `/v3/cards/*` paths are payment acceptance: charging a customer's card, not issuing one. If you opened V3 looking for issued cards, this is the page. The matching reference is [API v2](/api-v2) under Card issuance.

Every card belongs to exactly one wallet, fixed at creation. Most endpoints live under `/wallets/{wallet_uuid}/issued-cards`.

## Card spend

Spend is network activity. You do not originate it. Alviere posts it against the linked wallet and fires `WALLET_TRANSACTION`.

| What happened | How it shows up |
|---|---|
| A purchase | `CARD_ISSUED_DEBIT` |
| An ATM withdrawal | `CARD_ISSUED_ATM_DEBIT` |
| A merchant credit or refund | `CARD_ISSUED_CREDIT` |
| A dispute | `CARD_ISSUED_DISPUTE_DEBIT` or `CARD_ISSUED_DISPUTE_CREDIT` |
| A decline | No transaction. See [Activity](/guides/resources/activity) under `DENIED_AUTHORIZATION` |

The rest of the issued-card types are in [Transactions Overview](/guides/transactions/transactions-overview). Drive a purchase in Sandbox with the mock swipe in [Card Issuance Testing](/guides/sandbox-testing/test-cards).

## Before you issue

`product_id` determines the card's brand, genre, BIN range, whether it supports a PIN, how long the name on the card can be, and which optional fields you are allowed to send.

A `product_id` that is not configured for your program is rejected with a `400` validation error. It is a program setup issue rather than a malformed request — talk to your program manager. Look up the `error_code` on [Error Codes](/guides/getting-started/error-codes) if you need the exact value for triage.

## Genres

Genre describes the card's tangibility. It is a property of the card product, so it is fixed by the `product_id` you pass. There is no `genre` field on the create request.

| Genre | What it is | Usable when |
|---|---|---|
| `PHYSICAL` | A piece of plastic with the card number printed on it | After embossing, shipping, and activation |
| `VIRTUAL` | Exists only as an image, displayed in a mobile app, on a website, or in an email | Created `ACTIVE` |
| `DIGITAL` | Digital-first: an electronic representation of a physical card, carrying the **same PAN, CVV, and expiry** as the plastic | Created `ACTIVE` |

`VIRTUAL` and `DIGITAL` are not the same thing. A virtual card is a card in its own right with its own number. A digital-first card is the same card as a piece of plastic the cardholder also holds, so freezing, replacing, or expiring one is not independent of the other.

Neither is the same as adding a card to Apple Pay or Google Pay. That is push provisioning and works on cards of any genre. See [Digital Wallets](/guides/cards/digital-wallets).

Activation applies to physical card products only. See [Card Operations](/guides/cards/card-operations).

A virtual card can be converted to physical later if Alviere has approved it for your program. See [Physical Cards](/guides/cards/physical-cards).

### How many cards a wallet can hold

The number of cards a wallet may hold is set by your program configuration rather than by the API. Exceeding it returns a `400` validation error, and requesting a card type that is not allowed for that wallet type also returns a `400`. Both are configuration issues — talk to your program manager.

## Types

| Type | Funding |
|---|---|
| `DEBIT` | Authorizes against the balance of the account's wallet |
| `PREPAID` | Must be preloaded with a balance before it can authorize. Can be reloaded |
| `PREPAID_NON_RELOADABLE` | Must be preloaded, and can be loaded **once**, with consumer funds |
| `GIFT` | Opens with a fixed balance set at issuance, funded from **program funds**. See [Gift Cards](/guides/cards/gift-cards) |

What separates the last two is where the money comes from, not how many times the card can be loaded. A non-reloadable prepaid card is loaded with the consumer's own funds. A gift card is loaded from your program's funds.

Type is also driven by the card product. Passing a type-specific field to the wrong product fails with a `400` — `initial_balance` sent for a non-gift product, or omitted for a gift product. Branch on the HTTP status and handle it as a validation error.

## The endpoints

Every request needs the `Authorization` and `Version` headers. Send `Version: 2021-11-18`.

| Operation | Endpoint | Covered in |
|---|---|---|
| Create a card | `POST /wallets/{wallet_uuid}/issued-cards` | [Issued Cards](/guides/cards/cards) |
| List a wallet's cards | `GET /wallets/{wallet_uuid}/issued-cards` | [Issued Cards](/guides/cards/cards) |
| Get one card | `GET /wallets/{wallet_uuid}/issued-cards/{card_uuid}` | [Issued Cards](/guides/cards/cards) |
| Update a card | `PATCH /wallets/{wallet_uuid}/issued-cards/{card_uuid}` | [Issued Cards](/guides/cards/cards) |
| Cancel a card | `DELETE /wallets/{wallet_uuid}/issued-cards/{card_uuid}` | [Card Operations](/guides/cards/card-operations) |
| Activate a card | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/activate` | [Card Operations](/guides/cards/card-operations) |
| Freeze a card | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/freeze` | [Card Operations](/guides/cards/card-operations) |
| Unfreeze a card | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/unfreeze` | [Card Operations](/guides/cards/card-operations) |
| Set a PIN | `PUT /issued-cards/{card_uuid}/pin` | [Card Data and PCI](/guides/cards/card-security) |
| Replace | `POST /issued-cards/{card_uuid}/reissue_replace` | [Card Operations](/guides/cards/card-operations) |
| Add to a digital wallet | `PUT /wallets/{wallet_uuid}/issued-cards/{card_uuid}/mobile-wallet` | [Digital Wallets](/guides/cards/digital-wallets) |
| Get the card image | `GET /wallets/{wallet_uuid}/issued-cards/{card_uuid}/image` | [Physical Cards](/guides/cards/physical-cards) |
| Get PAN and CVV | `GET /wallets/{wallet_uuid}/issued-cards/{card_uuid}/sensitive-data` | [Card Data and PCI](/guides/cards/card-security) |

Two endpoints are not wallet-scoped. `PUT /issued-cards/{card_uuid}/pin` and `POST /issued-cards/{card_uuid}/reissue_replace` take the `card_uuid` alone.

## Staying in sync

You do not need to poll. Two webhook subscriptions cover the card:

| Subscription | Fires on |
|---|---|
| `ISSUED_CARD` | Any change to the card entity, including every status transition. The payload carries the full card in its state at that moment |
| `WALLET_TRANSACTION` | Card spend, as a transaction against the linked wallet |

`CARD_CREATED` and `CARD_REPLACEMENT` also land as account activities. See [Activity](/guides/resources/activity).

## Related

- [Issued Cards](/guides/cards/cards). Creating, reading, and updating cards.
- [Card Operations](/guides/cards/card-operations). Activate, freeze, cancel, replace.
- [Merchant Controls](/guides/cards/merchant-controls). Restricting where a card works.
- [Activity](/guides/resources/activity). Declines, `CARD_CREATED`, and `CARD_REPLACEMENT`.
- [Transactions Overview](/guides/transactions/transactions-overview). Issued-card spend types.
- [Incentives](/guides/cards/incentives). Cashback and balance boosts on card spend.
- [Card Issuance Testing](/guides/sandbox-testing/test-cards). Driving a card through its lifecycle in Sandbox.
