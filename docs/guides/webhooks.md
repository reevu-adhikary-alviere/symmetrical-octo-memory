---
title: "Webhooks"
description: "Subscribe to real-time event notifications from the Alviere platform"
---

# Webhooks

Webhooks deliver events from Alviere to your system in real time. When a transaction settles, an account changes status, or a card is activated, Alviere posts the event to a URL you've registered, so you don't have to poll for it.

Events are grouped into **subscriptions**. Each subscription type posts to a URL you provide at subscription time.

:::scalar-callout{type="info"}
Webhooks are asynchronous and represent things that have already happened. They don't block or slow down the underlying operation.
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

Verify before you parse. The body you sign must be the **raw bytes off the wire**, not a re-serialized object: `JSON.parse` followed by `JSON.stringify` reorders keys and changes whitespace, and the signature will never match.

**Node.js (Express)**

```js
const crypto = require('crypto');
const express = require('express');

const app = express();
const SECRET = process.env.ALVIERE_WEBHOOK_SECRET;
const TOLERANCE_SECONDS = 300;

// express.raw, not express.json. You need the exact bytes Alviere signed.
app.post('/webhooks/alviere', express.raw({ type: 'application/json' }), (req, res) => {
  const id = req.get('Alviere-Webhook-Id');
  const timestamp = req.get('Alviere-Webhook-Timestamp');
  const signature = req.get('Alviere-Signature');

  if (!id || !timestamp || !signature) return res.sendStatus(400);

  // Reject stale deliveries so a captured payload can't be replayed later.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) {
    return res.sendStatus(400);
  }

  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${id}.${timestamp}.${req.body.toString('utf8')}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.sendStatus(401);
  }

  const event = JSON.parse(req.body.toString('utf8'));

  // Return 200 first, then process. The queue is FIFO and blocks behind you.
  res.sendStatus(200);
  enqueue(event);
});
```

**Python (Flask)**

```python
import hmac, hashlib, os, time
from flask import Flask, request, abort

app = Flask(__name__)
SECRET = os.environ["ALVIERE_WEBHOOK_SECRET"].encode()
TOLERANCE_SECONDS = 300

@app.post("/webhooks/alviere")
def alviere_webhook():
    webhook_id = request.headers.get("Alviere-Webhook-Id")
    timestamp = request.headers.get("Alviere-Webhook-Timestamp")
    signature = request.headers.get("Alviere-Signature")

    if not (webhook_id and timestamp and signature):
        abort(400)

    if abs(time.time() - int(timestamp)) > TOLERANCE_SECONDS:
        abort(400)

    # request.get_data() gives the raw body. request.get_json() does not.
    raw = request.get_data()
    signing_input = f"{webhook_id}.{timestamp}.".encode() + raw
    expected = hmac.new(SECRET, signing_input, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, signature):
        abort(401)

    enqueue(request.get_json())
    return "", 200
```

:::scalar-callout{type="warning"}
Compare signatures with a constant-time function (`crypto.timingSafeEqual`, `hmac.compare_digest`). A plain `==` leaks the correct signature one byte at a time to anyone who can measure your response latency.
:::

Two things worth building in from the start:

- **Deduplicate on `event_uuid`.** A retried delivery carries the same `event_uuid` with `event_retry` incremented. Storing processed IDs is what keeps a retry from double-crediting a customer.
- **Acknowledge, then process.** Alviere's queue is FIFO and retries block everything behind them. Return `200` as soon as the signature checks out and do the real work on a queue.

## Retry policy

Alviere expects a `200` HTTP status from your endpoint. If it gets anything else, the event is retried with polynomial backoff starting at 20ms and increasing up to 2 minutes between retries.

:::scalar-callout{type="warning"}
Retries are continuous and block subsequent messages, because Alviere maintains **FIFO (first-in, first-out) ordering**. A stuck event delays every event behind it. Make sure your endpoint returns `200` promptly.
:::

## Event payloads

The `entity` object contains the full entity state at the moment of the event. On a status change, for example, you receive the entity with its new status.

:::scalar-callout{type="info"}
Per-event payload examples for each subscription type are being expanded here. See the [V2 API Reference](/api-v2) for the current schemas.
:::

## How to subscribe

Contact your Alviere implementation manager to set up webhook subscriptions for your program.
