---
title: "Accounts"
description: "Onboard consumers and businesses, manage verification, and assign profiles"
---

# Accounts

An account represents each consumer or business in your program. You create accounts when onboarding a customer, and they hold the wallets, cards, and payment methods that person or company can use.

You create accounts through the API or SDK as part of your own onboarding flow.

## Account types

| Type | What it represents |
|------|-------------|
| `CONSUMER` | An individual consumer in your program |
| `BUSINESS` | A business or company in your program |
| `STAKEHOLDER` | An officer or beneficial owner attached to a `BUSINESS` account — used for KYB |
| `CARDHOLDER` | An individual under a `CONSUMER` or `BUSINESS` account who owns an issued card |

## Consumer accounts

A consumer account represents an individual end customer. You create one, run it through verification, and graduate it through statuses as KYC progresses — different statuses unlock different things the consumer can do.

### Statuses

| Status | Description |
|--------|-------------|
| `CREATED` | Initial status after a successful account creation request, prior to KYC |
| `ACTIVE` | Fully verified and operational. Profiles also become `ACTIVE` when their verification is complete |
| `INACTIVE` | All permissions revoked — the consumer cannot perform any actions until reactivated |
| `PROCESSING` | Profile application is in progress — no action required |
| `PENDING_USER` | Further action required from the consumer (missing or incorrect data) |
| `MANUAL_REVIEW` | Under manual review by an agent — the `stage` property indicates why |
| `REJECTED` | Rejected by the platform (manually or automatically). Reason returned in `status_reason` |
| `DELETED` | Permanently removed. Data persists but the account cannot be reinstated. Use `INACTIVE` for temporary removal |

### Processing stages

The `stage` property tells you where the consumer is in the verification pipeline:

| Stage | Description |
|-------|-------------|
| `FRAUD` | Fraud check in progress |
| `ADDRESS` | Address validation in progress |
| `IDENTITY` | Identity verification — DOB, address, and/or SSN matched against records |
| `IDENTITY_OPTIONAL_SSN` | Identity verification with SSN optional. If no SSN is provided, other profile data is used |
| `DOCUMENTS` | Photo ID provided by the consumer is being processed |
| `DOCUMENTS_OPTIONAL_FULL_SSN` | Photo ID not required if full SSN is already verified |
| `SANCTIONS` | Sanctions and Negative News screening in progress |
| *(empty)* | KYC not started, or onboarding complete with no remaining stages |

### Status reasons

The `status_reason` field gives you a descriptive reason for the current account status — useful for showing the customer why their verification is held up.

:::scalar-callout{type="info"}
A full reference of `status_reason` values is being expanded — see the [V2 API Reference](/api-v2) for the current list.
:::

### Occupations

:::scalar-callout{type="info"}
Supported occupation values are being expanded here — see the [V2 API Reference](/api-v2) for the current list.
:::

## Business accounts

A business account represents a business or organization. Like consumer accounts, you graduate them through statuses as KYB progresses.

### Statuses

| Status | Description |
|--------|-------------|
| `CREATED` | Initial status after successful creation, prior to KYB |
| `ACTIVE` | Fully active in the system |
| `PROCESSING` | Application in progress — no action required |
| `PENDING_USER` | Further action required from the business |
| `MANUAL_REVIEW` | Under manual review — `stage` property indicates why |
| `REJECTED` | Rejected by the platform. Reason in `status_reason` |
| `DELETED` | Permanently removed. Use `INACTIVE` for temporary removal |

### Processing stages

| Stage | Description |
|-------|-------------|
| `SANCTIONS` | Sanctions compliance check in progress |
| `PREVALIDATION` | Validating submitted information before contacting external providers |
| `VERIFICATION` | Checking all business information for accuracy and authenticity |
| `DOCUMENTS` | Validating essential business documents |
| `STAKEHOLDERS` | Identifying and validating key stakeholders (may include photo ID) |
| *(empty)* | KYB not started, or onboarding complete |

### Status reasons

:::scalar-callout{type="info"}
The reference of business `status_reason` values is being expanded — see the [V2 API Reference](/api-v2) for the current list.
:::

## Account profiles

Profiles are predefined tiers within a program. Each profile sets its own KYC/KYB requirements and unlocks a specific set of platform modules. Roughly: the more data the customer provides, the more they can do.

A basic profile might only require name, phone, and email. An advanced profile might require SSN, address, and a photo ID.

### Profile fields

The `profiles` object on the account contains:

| Field | Description |
|-------|-------------|
| `profile_name` | Name of the profile (unique per program, set at enablement) |
| `status` | Status of the profile application (see account statuses above) |
| `stage` | Processing stage of the profile verification |
| `status_reason` | Descriptive reason for the current profile status |

### Setting a profile

Specify the profile at account creation. If you don't, the account is created under the program's default profile.

### Updating a profile

You can change a profile by updating the account with a new one. Updates are allowed when the account is in `ACTIVE`, `PENDING_USER`, or `CREATED` status.

:::scalar-callout{type="info"}
The profile application process kicks off once all required information and documents are uploaded. Incomplete applications don't affect the current status or profile. If the new profile uses a different default wallet type, a new wallet is created automatically.
:::
