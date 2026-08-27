---
title: "Webhooks"
description: "Subscribe to real-time event notifications from the Alviere platform"
---

# Webhooks

Webhooks deliver events from Alviere to your system in real time. When a transaction settles, an account changes status, or a card is activated, Alviere posts the event to a URL you've registered — so you don't have to poll for it.

Events are grouped into **subscriptions**. Each subscription type posts to a URL you provide at subscription time.

:::scalar-callout{type="info"}
Webhooks are asynchronous and represent things that have already happened — they don't block or slow down the underlying operation.
:::

## Subscriptions

| Subscription | Events covered |
|-------------|------------|
| `ACCOUNT` | Account lifecycle (creation, status changes, KYC updates) |
| `WALLET_TRANSACTION` | Wallet transaction lifecycle (loads, withdrawals, transfers, settlements) |
| `ISSUED_CARD` | Issued card lifecycle (creation, activation, blocking, replacement) |
| `BENEFICIARY` | Beneficiary lifecycle (creation, status changes) |
| `BANK_PM` | Bank payment method lifecycle (creation, verification, deletion) |
| `CARD_PM` | Card payment method lifecycle (creation, verification, deletion) |
| `CHECK` | Check deposit transaction lifecycle |
| `DOSSIER` | Dossier lifecycle (upload, verification, expiration) |
| `PAYMENT_INSTRUMENT` | Payment instrument lifecycle |
| `ACTIVITY` | Account-level activities (card replacements, denied authorizations) |

## Payload format

Every webhook event follows this structure:

```json
{
  "event_uuid": "082fd7f7-7e9e-4679-bd16-ed9f5a55d827",
  "program_uuid": "04d3ac6e-82d3-4f52-b82f-6cc0320928af",
  "event_date": "2021-06-17T11:02:08.143Z",
  "event_retry": 0,
  "event_type": "WALLET_TRANSACTION",
  "event_version": "2021-11-18.1",
  "entity": {
    ...
  }
}
```

| Field | Description |
|-------|-------------|
| `event_uuid` | Unique identifier for this event |
| `program_uuid` | Your program's identifier |
| `event_date` | ISO 8601 timestamp of the event |
| `event_retry` | Number of delivery attempts (0 = first attempt) |
| `event_type` | The subscription type |
| `event_version` | API version of the event payload |
| `entity` | The full entity object that triggered the event |

## Authentication

When you set up a subscription, you'll provide:

- Subscription type
- Target endpoint (must be a complete HTTPS URL)
- Authentication method and credentials
- Event version

### Option 1: Header-based (default)

Alviere sends an `Alviere-Auth` header containing the security key you provided when you subscribed.

### Option 2: HMAC signature

For tighter security, use HMAC-SHA256 signature verification. Hand your shared secret to your implementation manager and Alviere will sign every payload.

HMAC-authenticated webhooks include these headers:

| Header | Description |
|--------|-------------|
| `Alviere-Signature` | HMAC-SHA256 signature of the payload |
| `Alviere-Webhook-Id` | Unique identifier for the webhook delivery |
| `Alviere-Webhook-Timestamp` | Unix timestamp when the webhook was sent |

#### Verification steps

1. Build the signing input: `<webhook_id>.<timestamp>.<minified_json_body>`
2. Calculate HMAC-SHA256 using your shared secret
3. Compare your result with the `Alviere-Signature` header

#### Verification examples

:::scalar-callout{type="info"}
Sample HMAC verification code (Node.js, Python, Go, etc.) is being expanded here. For now, follow the three steps above using your language's standard crypto library.
:::

## Retry policy

Alviere expects a `200` HTTP status from your endpoint. If it gets anything else, the event is retried with polynomial backoff starting at 20ms and increasing up to 2 minutes between retries.

:::scalar-callout{type="warning"}
Retries are continuous and block subsequent messages — Alviere strictly maintains **FIFO (first-in, first-out) ordering**. A stuck event delays every event behind it. Make sure your endpoint returns `200` promptly.
:::

## Event payloads

The `entity` object contains the full entity state at the moment of the event. On a status change, for example, you receive the entity with its new status.

:::scalar-callout{type="info"}
Per-event payload examples for each subscription type are being expanded here — see the [V2 API Reference](/api-v2) for the current schemas.
:::

## How to subscribe

Contact your Alviere implementation manager to set up webhook subscriptions for your program.
