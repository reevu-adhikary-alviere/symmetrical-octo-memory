---
title: "API Versions"
description: "When to use V2 (stable platform) vs. V3 (Payment Acceptance and new initiatives)"
---

# API Versions

Alviere has two API versions live today. The short answer:

| Version | Use it for |
|---|---|
| **V2** | Existing BAAS integrations: accounts, wallets, remittances, card issuance |
| **V3** | Payment Acceptance, card payments, bank payments, webhooks |

New Payment Acceptance work happens in V3. V2 keeps running for the integrations already built on it, and picks up new optional fields over time.

## V2: HIVE Platform

V2 is the production API most existing partners run today. It covers the full HIVE platform:

- Accounts, Wallets, Treasury, Dossiers
- Transactions, Global Payments, Beneficiaries
- Card Issuance, Check Deposits, Cash Loading
- Service Fees, Rewards & Incentives

Browse the [V2 API Reference](/api-v2) under **Core Platform**, **Money Movement**, and **Cards & Deposits**.

:::scalar-callout{type="info"}
V2 is stable. Existing endpoints can pick up new optional fields, but breaking changes and new resources land in V3 instead.
:::

## V3: Payment Acceptance and modernized platform operations

V3 introduces payment acceptance and modernized platform operations:

Card issuing is not in V3. See [Card Issuing Overview](/guides/cards/card-issuing-overview). The `/v3/cards/*` paths charge a customer's card. They do not issue one.

**Payment Acceptance**
- Card Payments: `/v3/cards/*`
- Bank Payments: `/v3/ach/debit`
- Instant rails: `/v3/instant/transfer` and `/v3/instant/request` (request for payment). See [Instant Payments](/guides/transactions/instant-payments)
- Fee Rules: `/v3/fee-rules/*`
- Scheduled Payments: `/v3/schedule/*`

**Platform & Operations**
- Authentication, Beneficiaries, Transactions, Webhooks

**Payouts & adjacent** (money out, not acceptance in)
- Push-to-card, ACH credit, fee rules, scheduled transactions

Browse the [V3 API Reference](/api-v3), grouped under **Payment Acceptance** and **Platform & Operations**.

## Which one should I integrate?

```
Building embedded finance (wallets, remittances, issuing)?
  → Start with V2 guides + V2 API Reference

Building card acceptance, ACH bill pay, or wallet auths?
  → Start with Payment Acceptance guides + V3 API Reference

Already on V2 and adding card payments?
  → Read Payment Acceptance guides; call V3 card endpoints alongside your V2 platform integration
```

## Related

- [Payment Acceptance](/guides/payment-acceptance/payment-acceptance)
- [Card Issuing Overview](/guides/cards/card-issuing-overview)
- [Platform Overview](/guides/overview/platform-overview)
- [Card Payments](/guides/payment-acceptance/online-payments/card-payments/introduction)
