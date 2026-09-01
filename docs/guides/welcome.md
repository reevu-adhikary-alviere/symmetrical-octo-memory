---
title: Welcome
description: "Guides, API reference, and SDKs for building payments, cards, and money movement on the Alviere HIVE platform"
---

# Welcome to Alviere HIVE

This portal contains platform definitions, integration guides, SDK documentation, webhook guidance, and the HIVE API reference for building payments, cards, and money movement on Alviere HIVE. HIVE is embedded-finance infrastructure — accounts, wallets, cards, and money movement behind clear APIs — so teams that do not run a bank can still hold funds, issue cards, and accept payments without assembling the underlying rails themselves.

Clients access HIVE through **Programs**. Each Program is a configured instance of modules, controls, and entities for a specific implementation. A client can operate multiple Programs, each with an independent entity namespace — data does not cross Programs, even under the same Brand. Transaction limits, card settings, service fees, KYC/KYB requirements, and fraud controls are Program configuration managed by your Alviere program manager; configuration itself is not changed through the API.

HIVE is organized around **Programs**, **Modules**, and **Entities** (accounts, wallets, cards, transactions — the objects you call). If that map is new, start with [Platform Overview](/guides/overview/platform-overview) before you pick an endpoint.

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
- **[SDKs](/guides/sdks/overview)** — integrate through REST APIs or SDKs depending on the surface: [UI SDK](https://websdk.alviere.com/quick-start/overview) (`@alviere/ui` — Web Components + Svelte) and headless [Core SDK](https://websdk.alviere.com/core/overview) (`@alviere/core`) for web, [JavaScript SDK](/guides/sdks/overview) for browser payment/fraud/card flows via web sessions, and four packages for iOS and Android. The complete [Bootstrap App](/guides/sdks/bootstrap-app/introduction) is a reference implementation you can fork. Card display and PIN entry are SDK-only by design.

Common integration requirements live under [Getting Started](/guides/getting-started/quickstart): [Authentication](/guides/getting-started/authentication), [Environments](/guides/getting-started/environments), [Error Codes](/guides/getting-started/error-codes), [Metadata](/guides/getting-started/metadata), and [Idempotency](/guides/getting-started/idempotency).

## API reference

HIVE has two live versions. [Which API version?](/guides/getting-started/api-versions) explains the split:

- **[API v2](/api-v2)** — accounts, wallets, card issuance, transactions, beneficiaries, and most platform resources. Also the stable path for existing integrations.
- **[API v3](/api-v3)** — payment acceptance (`/v3/cards/*`, `/v3/ach/debit`), instant payments, fee rules, and webhooks.

Both references are OpenAPI and sit alongside these guides in the header. Start with the guides for the flow, then open the reference for the exact request shape.

---

New here? [Start with the Quickstart](/guides/getting-started/quickstart) or skim [Platform Overview](/guides/overview/platform-overview) to see how Programs, Modules, and Entities fit together.
