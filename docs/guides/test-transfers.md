---
title: "International Transfer Testing"
description: "Simulate transfer failures, refunds, and cancellations in Sandbox"
---

# International Transfer Testing

## Failure scenarios

| Transaction amount | Outcome |
|-------------------|---------|
| `$5.00` or `$10.00` | Transaction status becomes `FAILED` |

### Bank payout: transfer fails after funds are pushed

**Requirements:**
- Funding method: `CASH`
- Destination amount: `10000` or `20000` (MXN/COP)
- USD equivalent: `$5.00` or `$10.00` (default exchange rate of `0.05`)

**Outcome:** After ~15 seconds, the `INTERNATIONAL_TRANSFER` moves to `FAILED`. A `REFUND` transaction is created in `PENDING` with `status_reason` `REQUIRES_REFUND_METHOD`. You set the `refund_method` via the refund transaction endpoint.

### Cash payout: beneficiary fails to collect

**Requirements:**
- Funding method: `CASH`
- Destination amount: `10000` or `20000` (MXN/COP)
- USD equivalent: `$5.00` or `$10.00` (default exchange rate of `0.05`)

**Outcome:** After ~15 seconds, the `INTERNATIONAL_TRANSFER` stays `COMPLETED`. A `REFUND` transaction is created in `PENDING` with `status_reason` `REQUIRES_REFUND_METHOD`. You set the `refund_method` via the refund transaction endpoint.

:::scalar-callout{type="info"}
The 15-second delay is for testing only. Production timing is different.
:::

## Cancellation scenarios

### Bank payouts

:::scalar-callout{type="info"}
The full reference of bank payout cancellation scenarios is being expanded. See the [V2 API Reference](/api-v2) for the current list.
:::

### Cash pickups

:::scalar-callout{type="info"}
The full reference of cash pickup cancellation scenarios is being expanded. See the [V2 API Reference](/api-v2) for the current list.
:::
