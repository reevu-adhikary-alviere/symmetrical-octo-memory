---
title: Welcome
description: "Explore Alviere HIVE products, integration use cases, and developer tools."
---

# Alviere product docs

Explore the products and guides for integrating with Alviere HIVE.

New to HIVE? [Start with the quickstart](/guides/getting-started/quickstart) or [learn how the platform fits together](/guides/overview/platform-overview).

Your Program determines which products and partner services are available. Your Alviere program manager configures it and issues your Portal access and API credentials.

## Platform products

Explore the resources and money movement flows in your integration.

::::scalar-row
:::scalar-card{title="Accounts & identity" icon="../assets/icons/lucide/users-round.svg" iconPosition="title"}
Create consumer and business accounts and manage identity verification.

[Explore accounts](/guides/resources/accounts)
:::
:::scalar-card{title="Wallets" icon="../assets/icons/lucide/wallet.svg" iconPosition="title"}
Manage customer balances and the wallets that hold their funds.

[Explore wallets](/guides/resources/wallets)
:::
::::

::::scalar-row
:::scalar-card{title="Payment acceptance" icon="../assets/icons/lucide/credit-card.svg" iconPosition="title"}
Integrate card payments, pay by bank, and Alviere Checkout.

[Explore payment acceptance](/guides/payment-acceptance/payment-acceptance)
:::
:::scalar-card{title="Card issuing" icon="../assets/icons/lucide/credit-card.svg" iconPosition="title"}
Issue cards and manage their lifecycle, controls, and digital wallets.

[Explore card issuing](/guides/cards/card-issuing-overview)
:::
::::

::::scalar-row
:::scalar-card{title="Money movement" icon="../assets/icons/lucide/arrow-left-right.svg" iconPosition="title"}
Find guides for internal transfers, ACH, wire, and instant payments.

[Explore money movement](/guides/transactions/transactions-overview)
:::
:::scalar-card{title="Treasury vaults" icon="../assets/icons/lucide/vault.svg" iconPosition="title"}
Manage program funds for prefunding, settlement, reserves, and fees.

[Explore treasury](/guides/resources/treasury)
:::
::::

## Use cases

Start with the flow you want to build.

::::scalar-row
:::scalar-card{title="Direct merchant ecommerce" icon="../assets/icons/lucide/shopping-bag.svg" iconPosition="title"}
Accept payments for goods and services sold by your business.

[Build merchant payments](/guides/payment-acceptance/use-cases/card-config-direct-merchant)
:::
:::scalar-card{title="Marketplace payments" icon="../assets/icons/lucide/store.svg" iconPosition="title"}
Charge buyers, direct funds to seller wallets, and collect commissions.

[Build marketplace payments](/guides/payment-acceptance/use-cases/card-config-marketplace)
:::
::::

::::scalar-row
:::scalar-card{title="Bill payments" icon="../assets/icons/lucide/receipt-text.svg" iconPosition="title"}
Collect a card payment and route funds to the biller.

[Build bill payments](/guides/payment-acceptance/use-cases/card-config-bill-pay)
:::
:::scalar-card{title="Consumer banking app" icon="../assets/icons/lucide/smartphone.svg" iconPosition="title"}
Start from the Bootstrap App for onboarding, wallets, cards, and transfers.

[Explore the Bootstrap App](/guides/sdks/bootstrap-app/introduction)
:::
::::

## Developer tools

Set up your integration, handle events, and test documented scenarios.

::::scalar-row
:::scalar-card{title="Quickstart" icon="../assets/icons/lucide/rocket.svg" iconPosition="title"}
Set up your first authenticated API request.

[Start integrating](/guides/getting-started/quickstart)
:::
:::scalar-card{title="Authentication" icon="../assets/icons/lucide/key-round.svg" iconPosition="title"}
Authenticate requests with the credentials assigned to your Program.

[Set up authentication](/guides/getting-started/authentication)
:::
::::

::::scalar-row
:::scalar-card{title="API reference" icon="../assets/icons/lucide/book-open.svg" iconPosition="title"}
Choose the API version for your integration before exploring endpoints.

[Choose an API version](/guides/getting-started/api-versions)
:::
:::scalar-card{title="SDKs" icon="../assets/icons/lucide/terminal.svg" iconPosition="title"}
Integrate browser and mobile functionality with Alviere SDKs.

[Explore SDKs](/guides/sdks/overview)
:::
::::

::::scalar-row
:::scalar-card{title="Webhooks" icon="../assets/icons/lucide/webhook.svg" iconPosition="title"}
Subscribe to events and receive asynchronous updates.

[Receive events](/guides/more/webhooks)
:::
:::scalar-card{title="Sandbox & mock services" icon="../assets/icons/lucide/flask-conical.svg" iconPosition="title"}
Test the supported mock scenarios before connecting to Production.

[Explore test scenarios](/guides/sandbox-testing/mock-services)
:::
::::

## Integration essentials

- [Environments](/guides/getting-started/environments): Sandbox and Production URLs and behavior. Sandbox does not connect to live financial rails.
- [Error codes](/guides/getting-started/error-codes): interpret API failures and their descriptions.
- [Idempotency](/guides/getting-started/idempotency): handle retries without repeating an operation.
- [Changelog](/guides/more/changelog): follow changes to the platform.
