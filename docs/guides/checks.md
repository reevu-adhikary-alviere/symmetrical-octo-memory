---
title: "Checks"
description: "Remote check deposit capture: process and track check deposits via your mobile app"
---

# Checks

The Check entity captures everything about a check deposit: front and back images, amount, currency, status, and payor details. All check activity is recorded as `CHECK_DEPOSIT` transactions.

## Remote check deposit

Remote check deposit lets customers deposit funds into their wallet by snapping front and back images of a check in your iOS or Android app, using Alviere's Mobile SDKs.

### How it works

1. The customer captures front and back images of the check in your mobile app.
2. They write the required endorsement text on the back per your program's guidelines.
3. Your app uploads the images via the Alviere API.
4. Alviere runs fraud detection and image verification.
5. The check is processed for approval and settlement.

:::scalar-callout{type="warning"}
Image quality issues (blurry, missing endorsement, etc.) lead to rejection. Coach customers through a good capture in your UI.
:::

### Service fees

Programs can charge fees for check deposits and early fund access (e.g. $10 for early release). Only `calc_type: "DEDUCT"` is supported. Alviere subtracts the fee from the clearing amount to prevent negative balances, then routes it to the Service Fees treasury vault.

## Check lifecycle

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> PREVERIFIED : image uploaded
    PREVERIFIED --> PROCESSING : passes verification
    PROCESSING --> APPROVED
    PROCESSING --> REJECTED : compliance agent
    PROCESSING --> ERROR : automated rule
    CREATED --> CANCELED : fraud team
    APPROVED --> CLEARED : settled
```

| Status | Description |
|--------|-------------|
| `CREATED` | Check submitted via API |
| `PREVERIFIED` | Image uploaded and passed cybersecurity pre-verification |
| `PROCESSING` | Passed initial verification, undergoing approval and settlement |
| `CANCELED` | Canceled by the fraud team due to account behavior |
| `ERROR` | Rejected by an automated system rule. See `status_reason` |
| `REJECTED` | Rejected by a compliance agent. See `rejected_reasons` |
| `APPROVED` | Approved, pending settlement |
| `CLEARED` | Settled |

## Error reasons

For checks in `ERROR` status, `status_reason` tells you what an automated rule caught. The split that matters is whether the customer can fix it by recapturing, or whether the deposit is dead.

**Recapturable. Send the customer back to the camera.**

| Value | What went wrong |
|---|---|
| `FRONT_IMAGE` | The front image failed verification |
| `BACK_IMAGE` | The back image failed verification, most often a missing endorsement |
| `FRONT_BACK_IMAGE` | Both images failed |
| `AMOUNT` | The amount read off the check does not match what was submitted |

**Not recapturable. Do not prompt for another photo.**

| Value | What went wrong |
|---|---|
| `INTERNAL_DUPLICATE` | This check was already deposited on your program |
| `EXTERNAL_DUPLICATE` | This check was already deposited somewhere else |
| `INVALID_DOCUMENT` | The image is not a check |
| `INVALID_DATA` | The submitted data failed validation |
| `BLACKLIST` | The check or payor is blocked |
| `SYSTEM` | An internal processing failure. Retry once, then escalate |
| `OTHER` | Unclassified. Escalate to support |

:::scalar-callout{type="warning"}
Both duplicate reasons are a fraud signal, not a user error. Re-prompting for a photo on `INTERNAL_DUPLICATE` or `EXTERNAL_DUPLICATE` invites the customer to try again on a check that has already been paid.
:::

## Rejection reasons

A check in `REJECTED` status was declined by a compliance agent rather than by an automated rule. Two fields carry the outcome:

| Field | Contents |
|---|---|
| `rejected_reasons` | An array of reason strings. Free-form, not a fixed enum |
| `rejected_reasons_description` | An array of explanations written by the reviewing agent |

Because neither field is enumerated, do not branch your application logic on their contents and do not surface them to the customer verbatim. Treat `REJECTED` as terminal for that deposit, tell the customer the deposit could not be accepted, and route the reason strings to your support queue where a person reads them.

`ERROR` and `REJECTED` are not interchangeable. `ERROR` came from an automated rule and often means recapture; `REJECTED` came from a human and never does.
