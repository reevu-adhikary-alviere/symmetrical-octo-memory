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

An international transfer can be canceled freely inside a 30-minute window. After that the payout provider decides, and it can refuse. Sandbox drives which answer you get off the **destination amount**, so you can test both branches without waiting.

All amounts below are in MXN or COP minor units. USD equivalents assume the sandbox default exchange rate of `0.05`.

### Bank payouts

| Scenario | Requirements | Outcome |
|---|---|---|
| Cancel inside the 30-minute window | Default behavior, any amount | Canceled successfully |
| Cancel after 30 minutes, provider accepts | Funding method `WALLET`, `BANK_PM`, or `CARD_PM` with destination amount `7600` or `13100` ($3.80 or $6.55). Funding method `CASH` accepts any amount | Canceled successfully despite the window having elapsed |
| Cancel after 30 minutes, provider rejects | Destination amount `13140` ($6.57) | The payout provider rejects the cancellation |

### Cash pickups

| Scenario | Requirements | Outcome |
|---|---|---|
| Cancellation accepted | Destination amount `7600` or `13100` ($3.80 or $6.55), any funding method | Canceled successfully |
| Rejected, cash not yet collected | Destination amount `13140` ($6.57), any funding method | Cancellation rejected, API returns `400` |
| Rejected, cash already collected | Any destination amount **outside** `7500`, `7600`, `11160`, `13000`, `13100`, `13140`, `10000`, `20000` | Cancellation rejected, API returns `400` |

:::scalar-callout{type="warning"}
The "already collected" case is the default for any amount you pick at random. If your test transfer refuses to cancel, check the destination amount against that list before assuming your integration is broken.
:::
