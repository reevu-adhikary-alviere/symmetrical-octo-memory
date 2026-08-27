---
title: Alviere Docs
description: "Developer documentation for the Alviere HIVE platform."
---

# Alviere Developer Docs

Everything you need to integrate accounts, wallets, cards, and payments.

## Where to start

::::scalar-row
:::scalar-card{title="Quickstart" icon="rocket"}
Make your first API call.
[Get started](/guides/quickstart)
:::
:::scalar-card{title="Authentication" icon="lock"}
Get set up with credentials.
[Auth guide](/guides/authentication)
:::
:::scalar-card{title="Environments" icon="flask"}
Sandbox vs production.
[Learn more](/guides/environments)
:::
::::

## API Reference

::::scalar-row
:::scalar-card{title="Accounts" icon="users"}
Create and manage user profiles.
[View endpoints](/api-v2)
:::
:::scalar-card{title="Wallets" icon="wallet"}
Store and move funds.
[View endpoints](/api-v2)
:::
:::scalar-card{title="Cards" icon="credit-card"}
Issue virtual and physical cards.
[View endpoints](/api-v2)
:::
:::scalar-card{title="Transactions" icon="arrows-left-right"}
Payments, transfers, history.
[View endpoints](/api-v2)
:::
::::

## Example

```bash
curl -X POST https://api.snd.alviere.com/wallets \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"account_id": "acc_123", "currency": "USD"}'
```

Questions? Reach out to your integration partner or check the [API reference](/api-v2).