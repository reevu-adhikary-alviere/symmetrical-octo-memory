---
title: "Checks"
description: "Remote check deposit capture — process and track check deposits via your mobile app"
---

# Checks

The Check entity captures everything about a check deposit — front and back images, amount, currency, status, and payor details. All check activity is recorded as `CHECK_DEPOSIT` transactions.

## Remote check deposit

Remote check deposit lets customers deposit funds into their wallet by snapping front and back images of a check in your iOS or Android app — using Alviere's Mobile SDKs.

### How it works

1. The customer captures front and back images of the check in your mobile app.
2. They write the required endorsement text on the back per your program's guidelines.
3. Your app uploads the images via the Alviere API.
4. Alviere runs fraud detection and image verification.
5. The check is processed for approval and settlement.

:::scalar-callout{type="warning"}
Image quality issues (blurry, missing endorsement, etc.) lead to rejection — coach customers through a good capture in your UI.
:::

### Service fees

Programs can charge fees for check deposits and early fund access (e.g. $10 for early release). Only `calc_type: "DEDUCT"` is supported — fees are subtracted from the clearing amount to prevent negative balances, then routed to the Service Fees treasury vault.

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
| `ERROR` | Rejected by an automated system rule — see `status_reason` |
| `REJECTED` | Rejected by a compliance agent — see `rejected_reasons` |
| `APPROVED` | Approved, pending settlement |
| `CLEARED` | Settled |

## Error reasons

For checks in `ERROR` status, the `status_reason` field tells you what went wrong.

:::scalar-callout{type="info"}
The full reference of `status_reason` values for checks is being expanded — see the [V2 API Reference](/api-v2) for the current list.
:::

## Rejection reasons

For checks in `REJECTED` status, the `rejected_reasons` field tells you why a compliance agent declined the deposit.

:::scalar-callout{type="info"}
The full reference of `rejected_reasons` values is being expanded — see the [V2 API Reference](/api-v2) for the current list.
:::
