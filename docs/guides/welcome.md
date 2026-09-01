---
title: Welcome
description: "Platform definitions, integration guides, SDK documentation, webhook guidance, and the HIVE API reference"
---

# Welcome to Alviere HIVE

The Alviere Developer Portal contains documentation for integrating with the Alviere HIVE platform. It includes platform definitions, integration guides, SDK documentation, webhook guidance, and the HIVE API reference.

## The Alviere HIVE platform

HIVE supports the configuration and operation of financial services through Alviere technology and partner integrations.

Clients access HIVE through Programs. Each Program contains the modules, configuration, controls, and entities associated with a specific financial-services implementation.

## Core concepts

Core concepts explain the modules and entities used within HIVE, including Programs, Accounts, Wallets, Treasury Vault, and money movement flows. See [Platform Overview](/guides/overview/platform-overview) for the full module and entity map.

### Program

A Program is a configured instance of Alviere modules for a client. A client can operate multiple Programs, each with an independent entity namespace. Data does not cross Program boundaries, including between Programs operated by the same client.

Program configuration defines transaction limits, card settings, service fees, KYC and KYB requirements, fraud controls, and compliance rules.

Your Alviere program manager manages Program configuration. It cannot be changed through the API.

## Integration options

Client applications can interact with HIVE through REST APIs or supported SDKs. The available option depends on the application type and the functionality being implemented.

### [The HIVE APIs](/api-v2)

The HIVE API reference documents available API operations, request parameters, response objects, and operation-specific requirements. See [Which API version?](/guides/getting-started/api-versions) for V2 vs V3.

HIVE APIs follow REST conventions and use standard HTTP methods, status codes, and authentication mechanisms.

### [UI SDK](https://websdk.alviere.com/quick-start/overview)

`@alviere/ui` is a component library for onboarding and payment flows. It provides forms, multi-step flows, validated inputs, and interface elements.

The package includes framework-independent Web Components and typed Svelte components. Both formats expose the same properties and events.

UI SDK components use `@alviere/core` for authentication, validation, encryption, and communication with Alviere services.

### [Core SDK](https://websdk.alviere.com/core/overview)

`@alviere/core` is the headless logic and data layer used by the UI SDK. It provides typed services for account management, payments, wallets, authentication, request encryption, validation, logging, and error handling.

Core does not provide interface components. It can be used when an application supplies its own interface or integrates Alviere functionality into an existing component library or design system.

### [JavaScript SDK](/guides/sdks/overview)

The JavaScript SDK supports browser-based payment, fraud, and card functionality.

The client backend creates an authenticated web session. The frontend then loads the SDK using the session identifier and accesses the supported SDK functionality. See [SDKs](/guides/sdks/overview).

The documentation covers payment method collection, fraud device data, and card operations such as PIN management.

### [Mobile SDKs](/guides/sdks/overview)

The Mobile SDK documentation covers the integration of supported Alviere functionality into native mobile applications.

## Integration guides

The integration guides describe the common requirements for connecting an application to HIVE.

### [Integration overview](/guides/getting-started/quickstart)

The integration overview describes the REST conventions used by HIVE, including URLs, request and response formats, HTTP methods, and status codes.

Access to HIVE requires Portal access and authentication credentials. Your Alviere program manager provides the credentials associated with your Program.

### [Authentication](/guides/getting-started/authentication)

The authentication guide explains the requirements for authenticating HIVE API requests and using the credentials assigned to your Program.

Authentication credentials must be stored securely and must not be exposed in client-side applications.

### [Environments](/guides/getting-started/environments)

Alviere provides separate Sandbox and Production environments, each with its own Portal and API URLs.

Use Sandbox to develop and test your integration in an isolated environment. Sandbox does not connect to backend systems, so it does not support KYC or KYB validation, real-money wallet transfers, or bank-account transfers.

Production connects to Alviere systems and partners. The functionality available in Production depends on your Program configuration.

### [Webhooks](/guides/more/webhooks)

Use webhooks to receive events from Alviere. For example, when a transaction settles, Alviere sends an event to your webhook consumer with the transaction details.

Events are grouped into Subscriptions. When you create a Subscription, you provide the URL where its events should be sent.

Alviere sends events asynchronously, so their delivery does not block the operation that produced them. Each event represents an action that has already occurred.

### [Error codes](/guides/getting-started/error-codes)

The error code reference documents errors returned by HIVE APIs and the information included in error responses.

Applications should use the HTTP status, error code, and error description to determine how a failed request should be handled.

### [Mock services](/guides/sandbox-testing/mock-services)

Mock services provide documented test scenarios for validating an integration without initiating the corresponding live financial activity.

Mock behavior is limited to the scenarios described in the guide and does not reproduce every Production behavior or partner interaction.
