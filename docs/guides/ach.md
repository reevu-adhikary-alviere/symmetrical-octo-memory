---
title: "ACH"
description: "Move funds through the ACH network — pull to load wallets, push to send payouts"
---

# ACH

Move funds through the ACH network. ACH **pulls** debit a connected bank account to load funds into a wallet; ACH **pushes** credit an external bank account from a wallet (payouts, withdrawals). Settlement typically takes 1-3 business days.

Save bank accounts as [Payment Methods](/guides/resources/payment-methods) before debiting or crediting them — Plaid or our SDK flows make the connection step painless.

For ACH **payment acceptance** (incoming debits as a checkout option for billers), see [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction).

## API reference

ACH endpoints live in the [V2 API Reference](/api-v2) under **Money Movement**, and in the [V3 API Reference](/api-v3) under **Payment Acceptance**.

## Related

- [Payment Methods](/guides/resources/payment-methods) — save bank accounts before ACH
- [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) — ACH-based payment acceptance
- [Transactions Overview](/guides/transactions/transactions-overview) — statuses and lifecycle
