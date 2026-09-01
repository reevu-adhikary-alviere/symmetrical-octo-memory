---
title: Welcome
description: "Platform definitions, integration guides, SDK documentation, webhook guidance, and the HIVE API reference"
---

# Welcome to Alviere HIVE

This portal documents how to integrate with the Alviere HIVE platform. It has platform definitions, integration guides, SDK documentation, webhook guidance, and the HIVE API reference.

## The Alviere HIVE platform

HIVE is the platform behind Alviere's financial services. Alviere runs some of it directly and delivers the rest through bank and network partners.

You access HIVE through a Program. A Program holds the modules, configuration, controls, and entities for one financial-services implementation.

## Core concepts

The core concepts are Programs, Accounts, Wallets, Treasury Vault, and the money movement flows between them. [Platform Overview](/guides/overview/platform-overview) has the full module and entity map.

### Program

A Program is a configured set of Alviere modules for one client. A client can run several Programs. Each has its own entity namespace, and data never crosses between them, even when the same client owns both.

The Program configuration sets transaction limits, card settings, service fees, KYC and KYB requirements, fraud controls, and compliance rules.

Your Alviere program manager owns that configuration. The API cannot change it.

## Integration options

Your application talks to HIVE through the REST APIs or one of the SDKs. Which one fits depends on where the code runs and what it needs to do.

### [The HIVE APIs](/api-v2)

The API reference lists every operation with its request parameters, response objects, and any operation-specific rules. There are two versions. [Which API version?](/guides/getting-started/api-versions) explains when to use V2 and when to use V3.

The APIs are REST. They use standard HTTP methods, status codes, and bearer authentication.

### [UI SDK](https://websdk.alviere.com/quick-start/overview)

`@alviere/ui` is a component library for onboarding and payment flows. It ships forms, multi-step flows, and validated inputs.

The package includes framework-independent Web Components and typed Svelte components. Both expose the same properties and events.

UI SDK components use `@alviere/core` for authentication, validation, encryption, and calls to Alviere services.

### [Core SDK](https://websdk.alviere.com/core/overview)

`@alviere/core` is the headless layer under the UI SDK. It has typed services for account management, payments, wallets, authentication, request encryption, validation, logging, and error handling.

Core has no interface components. Use it when your application already has its own design system and you want Alviere functionality inside it.

### [JavaScript SDK](/guides/sdks/overview)

The JavaScript SDK handles browser-side payment, fraud, and card functionality.

Your backend creates an authenticated web session. Your frontend loads the SDK with the session identifier and calls it from there. See [SDKs](/guides/sdks/overview).

The SDK collects payment methods, gathers fraud device data, and runs card operations such as PIN management.

### [Mobile SDKs](/guides/sdks/overview)

The Mobile SDK documentation covers adding Alviere functionality to native iOS and Android applications.

## Integration guides

The guides cover what every integration needs before it can move money.

### [Integration overview](/guides/getting-started/quickstart)

The quickstart walks through URLs, request and response formats, HTTP methods, and status codes, then makes a first authenticated call.

You need Portal access and API credentials first. Your Alviere program manager issues both for your Program.

### [Authentication](/guides/getting-started/authentication)

How to authenticate HIVE API requests with the credentials assigned to your Program.

Store credentials server-side. Never ship them in a client application.

### [Environments](/guides/getting-started/environments)

Alviere runs separate Sandbox and Production environments, each with its own Portal and API URLs.

Sandbox is for development and testing. It has no connection to backend systems, so KYC and KYB validation, real-money wallet transfers, and bank-account transfers do not run there.

Production connects to Alviere systems and partners. What is available depends on your Program configuration.

### [Webhooks](/guides/more/webhooks)

Webhooks push events from Alviere to you. When a transaction settles, Alviere posts the transaction details to your webhook consumer.

Events are grouped into Subscriptions. Each Subscription has a URL you provide when you create it.

Delivery is asynchronous and never blocks the operation that produced the event. Every event describes something that has already happened.

### [Error codes](/guides/getting-started/error-codes)

The error code reference lists the errors HIVE APIs return and what each error response contains.

Use the HTTP status, error code, and error description together to decide how to handle a failed request.

### [Mock services](/guides/sandbox-testing/mock-services)

Mock services give you documented test scenarios that run without touching live financial rails.

Mock behavior is limited to the scenarios in the guide. It does not reproduce every Production behavior or partner interaction.
