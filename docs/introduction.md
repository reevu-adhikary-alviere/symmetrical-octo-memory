---
title: Introduction
description: "Start here for the HIVE platform docs: guides, API reference, SDKs, and example requests."
---

# Introduction

:::scalar-callout{type="info"}
HIVE Platform: embedded finance APIs for banking, payments, and card issuing.
:::

Build banking, payments, and card issuing into your product. One integration, complete financial infrastructure.

::scalar-button{title="Get Started" href="/guides/quickstart"}



## Start building in minutes

::::scalar-row
:::scalar-card{title="Quickstart" icon="check-circle"}
Set up authentication, make your first API call, and create a test account in under 5 minutes.  
[Open the quickstart](/guides/quickstart)
:::
:::scalar-card{title="Authentication" icon="lock"}
OAuth 2.0, API keys, token refresh, and scopes for your integration.  
[Authentication guide](/guides/authentication)
:::
:::scalar-card{title="Sandbox Environment" icon="flask"}
Test with mock data and simulated responses before going live.  
[Sandbox overview](/guides/environments)
:::
::::

:::scalar-callout{type="warning"}
Production access requires platform approval. Reach out to your Alviere contact to enable live credentials.
:::

## Explore the API

The HIVE APIs are available in two versions. Use the version that matches your integration plan and program launch timeline.

::::scalar-row
:::scalar-card{title="Accounts" icon="users"}
Consumer and business account profiles.  
[Explore API v2](/api-v2)
:::
:::scalar-card{title="Wallets" icon="wallet"}
Multi-currency wallets and balances.  
[Explore API v2](/api-v2)
:::
:::scalar-card{title="Cards" icon="credit-card"}
Virtual and physical card issuance.  
[Explore API v2](/api-v2)
:::
:::scalar-card{title="Transactions" icon="arrows-left-right"}
Payments, transfers, and activity.  
[Explore API v2](/api-v2)
:::
::::

::::scalar-row
:::scalar-card{title="Authentication" icon="key"}
Access tokens, sessions, and client credentials.  
[Explore API v2](/api-v2)
:::
:::scalar-card{title="Beneficiaries" icon="user-circle"}
Payout recipients and verification.  
[Explore API v2](/api-v2)
:::
:::scalar-card{title="Webhooks" icon="bell"}
Real-time event delivery.  
[Explore API v3](/api-v3)
:::
:::scalar-card{title="Payment Acceptance" icon="credit-card"}
Card, bank, and wallet payment rails.  
[Explore API v3](/api-v3)
:::
::::

## Simple, powerful API

Use clean REST endpoints to create accounts, issue cards, and move money.

::::scalar-tabs
:::scalar-tab{ title="cURL" }
```bash
# Create a new wallet for a user
curl -X POST https://api.snd.alviere.com/wallets \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "acc_1234567890",
    "currency": "USD",
    "nickname": "Primary Wallet"
  }'
```
:::
:::scalar-tab{ title="JavaScript" }
```javascript
import { Alviere } from '@alviere/sdk';

const alviere = new Alviere({
  apiKey: process.env.ALVIERE_API_KEY
});

const wallet = await alviere.wallets.create({
  accountId: 'acc_1234567890',
  currency: 'USD',
  nickname: 'Primary Wallet'
});
```
:::
:::scalar-tab{ title="Python" }
```python
from alviere import Alviere

alviere = Alviere(api_key=os.environ["ALVIERE_API_KEY"])

wallet = alviere.wallets.create(
    account_id="acc_1234567890",
    currency="USD",
    nickname="Primary Wallet"
)
```
:::
::::

Key capabilities include:

- Predictable, resource-based JSON APIs
- Idempotent requests for safe retries
- Webhooks for real-time event notifications
- SDK support for web and mobile stacks

## SDKs and tools

::::scalar-row
:::scalar-card{title="JavaScript SDK" icon="terminal"}
`npm install @alviere/sdk`
:::
:::scalar-card{title="iOS SDK" icon="apple-logo"}
Swift Package Manager distribution.
:::
:::scalar-card{title="Android SDK" icon="android-logo"}
Published on Maven Central.
:::
:::scalar-card{title="REST API" icon="code"}
OpenAPI 3.0 specs for tooling and codegen.
:::
::::

::scalar-fineprint[Need help fast? Contact support for onboarding, credentials, or troubleshooting.]{}
