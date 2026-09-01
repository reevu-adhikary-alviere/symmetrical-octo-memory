---
title: Welcome
description: "Guides, API reference, and SDKs for building payments, cards, and money movement on the Alviere HIVE platform"
---

# Welcome to Alviere HIVE

Platform definitions, integration guides, SDKs, webhooks, and the HIVE API reference — embedded-finance infrastructure for accounts, wallets, cards, and money movement.

HIVE is accessed through **Programs**: isolated workspaces of modules and configuration. Data does not cross Programs, even under the same Brand. Limits, card settings, fees, and KYC/KYB are owned by your program manager, not the API. New to the model? Start with [Platform Overview](/guides/overview/platform-overview).

## Get started

::::scalar-row
:::scalar-card{title="Quickstart" icon="rocket"}
Make your first authenticated call against sandbox and list an account's wallets.
[Open Quickstart](/guides/getting-started/quickstart)
:::
:::scalar-card{title="Authentication" icon="lock"}
How to sign requests, manage credentials, and keep secrets off the client.
[Authentication](/guides/getting-started/authentication)
:::
:::scalar-card{title="Environments" icon="flask"}
Sandbox and production base URLs, version headers, and what sandbox simulates.
[Environments](/guides/getting-started/environments)
:::
::::

## Explore HIVE

::::scalar-row
:::scalar-card{title="Accept payments" icon="storefront"}
Card and bank (ACH) acceptance over V3 — direct, marketplace, bill pay, and a hosted checkout.
[Payment Acceptance](/guides/payment-acceptance/payment-acceptance)
:::
:::scalar-card{title="Issue cards" icon="credit-card"}
Debit, prepaid, and gift cards that spend from a wallet, with physical, virtual, and digital-first options.
[Card Issuing](/guides/cards/card-issuing-overview)
:::
:::scalar-card{title="Move money" icon="arrows-left-right"}
ACH, inbound wires, instant payments, global transfers, checks, cash loading, and wallet-to-wallet.
[Transactions](/guides/transactions/transactions-overview)
:::
::::

Those three are motions on one program. If you are scoping an evaluation, they are not the platform — the primitives below are.

## Foundations

Most integrations use the same building blocks regardless of which motion you start with:

- **[Accounts, Wallets, Treasury, and Identity](/guides/resources/accounts)** — accounts hold wallets; wallets hold funds and cards; [treasury vaults](/guides/resources/treasury) hold program funds; dossiers hold KYC/KYB. [Payment Methods](/guides/resources/payment-methods) and [Beneficiaries](/guides/resources/beneficiaries) connect external cards, bank accounts, and payout destinations. [Activity](/guides/resources/activity) and [Periodic Reports](/guides/reporting/periodic-reports) give you the auditable ledger and reconciliation.
- **[Sandbox Testing](/guides/sandbox-testing/mock-services)** — drive a realistic lifecycle in sandbox: KYC scenarios, card issuance, payment method verification, returns, and fraud and sanctions screens, without touching production.
- **[Webhooks](/guides/more/webhooks)** — subscribe to `ISSUED_CARD`, `WALLET_TRANSACTION`, and other events instead of polling. Payload shapes are documented per subscription.
- **[SDKs](/guides/sdks/overview)** — REST APIs or SDKs per surface: [UI](https://websdk.alviere.com/quick-start/overview) (`@alviere/ui`) and headless [Core](https://websdk.alviere.com/core/overview) (`@alviere/core`) for web, [JavaScript SDK](/guides/sdks/overview) via web sessions, and four packages for iOS/Android. The [Bootstrap App](/guides/sdks/bootstrap-app/introduction) is a forkable reference. Card display and PIN entry are SDK-only.

Common integration requirements live under [Getting Started](/guides/getting-started/quickstart): [Authentication](/guides/getting-started/authentication), [Environments](/guides/getting-started/environments), [Error Codes](/guides/getting-started/error-codes), [Metadata](/guides/getting-started/metadata), and [Idempotency](/guides/getting-started/idempotency).

## API reference

HIVE has two live versions. [Which API version?](/guides/getting-started/api-versions) explains the split:

- **[API v2](/api-v2)** — accounts, wallets, card issuance, transactions, beneficiaries, and most platform resources. Also the stable path for existing integrations.
- **[API v3](/api-v3)** — payment acceptance (`/v3/cards/*`, `/v3/ach/debit`), instant payments, fee rules, and webhooks.

Both references are OpenAPI and sit alongside these guides in the header. Start with the guides for the flow, then open the reference for the exact request shape.

---

New here? [Start with the Quickstart](/guides/getting-started/quickstart) or skim [Platform Overview](/guides/overview/platform-overview) to see how Programs, Modules, and Entities fit together.
