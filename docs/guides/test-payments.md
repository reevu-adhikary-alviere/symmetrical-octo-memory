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

## ACH returns and NOCs

Sandbox is disconnected from FedACH, so returns and Notifications of Change are triggered on demand rather than waiting on the network. Both are processed through the same flow as production, so what you get back is a real return or NOC on a real transaction, not a canned response.

Neither call is needed in production.

### Simulate a return

A return reverses a previously originated transaction.

```bash
curl -X POST https://mock.snd.alviere.com/generateReturn \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $MOCK_API_KEY" \
  -d '{
    "transaction_uuid": "f84a40dd-3fbc-4478-bf89-ca5b30a95272",
    "return_code": "R01"
  }'
```

| Attribute | Required | Description |
|---|---|---|
| `transaction_uuid` | Yes | The originated transaction to return |
| `return_code` | Yes | The ACH return reason code to simulate |

**Supported return codes**

| Code | Meaning | Retryable |
|---|---|---|
| `R01` | Insufficient funds | Yes, up to two more times |
| `R02` | Account closed | No |
| `R03` | No account, unable to locate account | No |
| `R04` | Invalid account number | No |
| `R06` | Returned per ODFI request | No |
| `R08` | Payment stopped | Only with a new authorization |
| `R16` | Account frozen | No |
| `R20` | Non-transaction account | No |
| `R29` | Corporate customer advises not authorized | No, resolve the dispute first |

### Simulate a Notification of Change

A NOC does **not** reverse funds. It is the receiving bank telling you to correct something about the account before you originate again. Ignoring NOCs is how programs drift into administrative return territory, so it is worth handling them properly and worth testing.

```bash
curl -X POST https://mock.snd.alviere.com/generateNoc \
  -H 'Content-Type: application/json' \
  -H "x-api-key: $MOCK_API_KEY" \
  -d '{
    "transaction_uuid": "f84a40dd-3fbc-4478-bf89-ca5b30a95272",
    "change_code": "C01",
    "corrected_data": "987654321"
  }'
```

| Attribute | Required | Description |
|---|---|---|
| `transaction_uuid` | Yes | The originated transaction |
| `change_code` | Yes | What the receiving bank says needs correcting |
| `corrected_data` | Yes | The corrected value, e.g. the new account number for `C01` |

**Supported change codes**

| Code | What to correct |
|---|---|
| `C01` | Account number |
| `C02` | Routing number |
| `C03` | Routing number and account number |
| `C05` | Transaction code |
| `C06` | Account number and transaction code |
| `C07` | Routing number, account number, and transaction code |
| `C13` | Addenda format error |

:::scalar-callout{type="info"}
`corrected_data` is passed through as-is. The mock service does not validate its format against the change code, so a `C02` with an eight-digit value will be accepted even though a routing number is nine.
:::

### Shared behavior

Both endpoints return `204 No Content` and process asynchronously. Watch for the result on the transaction or through your `WALLET_TRANSACTION` webhook rather than in the response body.

Both accept the same transaction types: `LOAD_FUNDS`, `PAYMENT`, `WITHDRAW_FUNDS`, `BANK_DEBIT`.

| Status | Condition |
|---|---|
| `400` | Missing attribute, unsupported code, or ineligible transaction type |
| `404` | Transaction not found |
| `409` | Transaction has already been returned |

See [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) for what to do with each return code once you receive it.
