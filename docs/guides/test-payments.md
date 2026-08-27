---
title: "Payment Method Testing"
description: "Test card numbers, 3DS scenarios, and bank account failures in Sandbox"
---

# Payment Method Testing

## Test cards

Use these card numbers to test card scenarios with the Payment Methods `Create Card` endpoint.

:::scalar-callout{type="warning"}
Sandbox isn't connected to external services, but you should still never use a real card number.
:::

| Card number | Card network | Sub-network |
|-------------|-------------|-------------|
| `4111111111111111` | VISA | CREDIT |
| `4000000760000002` | VISA | DEBIT |
| `4001370077777777` | VISA | PREPAID |
| `6011000990139424` | DISCOVER | CREDIT |
| `6011111111111117` | DISCOVER | DEBIT |
| `6011000991300009` | DISCOVER | PREPAID |
| `371449635398431` | AMEX | CREDIT |
| `378282246310005` | AMEX | DEBIT |
| `378734493671000` | AMEX | PREPAID |
| `5403879999999997` | MASTERCARD | CREDIT |
| `5152537170792358` | MASTERCARD | DEBIT |
| `5105105105105100` | MASTERCARD | PREPAID |

## Card payment methods: unhappy paths

| Status | Test conditions |
|--------|----------------|
| `DELETED` | Call the "Delete card" API endpoint |
| `FAILED` | Create a card with a zip code shorter than 5 digits or longer than 9 |

## 3D Secure scenarios

| Transaction amount | Status | Status reason |
|-------------------|--------|---------------|
| `$69.31` | `FAILED` | `3DS_NOT_ENROLLED` |
| `$81.45` | `FAILED` | `3DS_SYSTEM_ISSUE` |
| `$81.46` | `FAILED` | `3DS_ERROR` |
| `$39.87` | `FAILED` | `3DS_AUTH_EXPIRED` |
| Any other amount | `PENDING` | `3DS_AUTH_REQUIRED` |

## Bank payment methods: unhappy paths

| Status | Test conditions |
|--------|----------------|
| `DELETED` | Call the "Delete bank account" API endpoint |
| `FAILED` | Create a bank account with an invalid routing number |
