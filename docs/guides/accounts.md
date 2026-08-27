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
| `STAKEHOLDER` | An officer or beneficial owner attached to a `BUSINESS` account, used for KYB |
| `CARDHOLDER` | An individual under a `CONSUMER` or `BUSINESS` account who owns an issued card |

## Consumer accounts

A consumer account represents an individual end customer. You create one, run it through verification, and graduate it through statuses as KYC progresses. Different statuses unlock different things the consumer can do.

### Statuses

| Status | Description |
|--------|-------------|
| `CREATED` | Initial status after a successful account creation request, prior to KYC |
| `ACTIVE` | Fully verified and operational. Profiles also become `ACTIVE` when their verification is complete |
| `INACTIVE` | All permissions revoked. The consumer cannot perform any actions until reactivated |
| `PROCESSING` | Profile application is in progress, no action required |
| `PENDING_USER` | Further action required from the consumer (missing or incorrect data) |
| `MANUAL_REVIEW` | Under manual review by an agent. The `stage` property indicates why |
| `REJECTED` | Rejected by the platform (manually or automatically). Reason returned in `status_reason` |
| `DELETED` | Permanently removed. Data persists but the account cannot be reinstated. Use `INACTIVE` for temporary removal |

### Processing stages

The `stage` property tells you where the consumer is in the verification pipeline:

| Stage | Description |
|-------|-------------|
| `FRAUD` | Fraud check in progress |
| `ADDRESS` | Address validation in progress |
| `IDENTITY` | Identity verification: DOB, address, and/or SSN matched against records |
| `IDENTITY_OPTIONAL_SSN` | Identity verification with SSN optional. If no SSN is provided, other profile data is used |
| `DOCUMENTS` | Photo ID provided by the consumer is being processed |
| `DOCUMENTS_OPTIONAL_FULL_SSN` | Photo ID not required if full SSN is already verified |
| `SANCTIONS` | Sanctions and Negative News screening in progress |
| *(empty)* | KYC not started, or onboarding complete with no remaining stages |

### Status reasons

`status_reason` tells you why an account is sitting where it is. It is the field you build your onboarding UI against: each value maps to one specific thing the customer has to do. `status_reason_description` carries additional free-text detail when there is any.

The same enum applies to consumer and business accounts.

**The customer has to fix something they submitted**

| Value | What to ask for |
|---|---|
| `INVALID_NAME` | Re-collect first and last name |
| `INVALID_DOB` | Re-collect date of birth |
| `INVALID_ADDRESS` | Re-collect the address. A PO Box will always fail |
| `INVALID_SSN` | Re-collect the full SSN |
| `INVALID_LAST_4_SSN` | Re-collect the last 4 of the SSN |

**The customer has to supply something they have not yet**

| Value | What to ask for |
|---|---|
| `REQUIRES_FULL_SSN` | The full 9-digit SSN |
| `REQUIRES_LAST_4_SSN` | The last 4 of the SSN |
| `REQUIRES_PHOTO_ID` | A photo ID |
| `REQUIRES_DOSSIER` | A dossier with documents. See [Identity](/guides/resources/identity) |

**A specific document has to be resubmitted**

These are the values that make it worth parsing `status_reason` instead of showing a generic error. Each one names exactly which document failed, so you can send the customer back to re-shoot one image rather than the whole set.

| Value | Document to recapture |
|---|---|
| `REQUIRES_PASSPORT_RESUBMISSION` | Passport |
| `REQUIRES_ID_DOCUMENT_FRONT_RESUBMISSION` | ID document, front |
| `REQUIRES_ID_DOCUMENT_BACK_RESUBMISSION` | ID document, back |
| `REQUIRES_DRIVERS_LICENSE_FRONT_RESUBMISSION` | Driver's license, front |
| `REQUIRES_DRIVERS_LICENSE_BACK_RESUBMISSION` | Driver's license, back |
| `REQUIRES_SELFIE_RESUBMISSION` | Selfie |
| `REQUIRES_PROOF_OF_ADDRESS_RESUBMISSION` | Proof of address |
| `REQUIRES_PROOF_OF_FUNDS_RESUBMISSION` | Proof of funds |
| `REQUIRES_MC_DOCUMENT_FRONT_RESUBMISSION` | Mexican consular ID, front |
| `REQUIRES_MC_DOCUMENT_BACK_RESUBMISSION` | Mexican consular ID, back |
| `REQUIRES_CERTIFICATE_OF_INCORPORATION_RESUBMISSION` | Certificate of incorporation |
| `EXPIRED_DOCUMENT` | Whichever document passed its expiry date |

**Nothing for the customer to do**

These are driven by platform activity rather than by onboarding, and there is no resubmission that clears them. Route them to your support or risk queue, not to the customer.

| Value | Meaning |
|---|---|
| `TRANSACTION_MANUAL_REVIEW` | A transaction on the account went to manual review |
| `TRANSACTION_RETURNED` | A transaction on the account was returned |
| `TRANSACTION_DENY` | A transaction on the account was denied |
| `CHECK_RETURNED` | A deposited check came back unpaid |
| `STAGE_VALIDATION` | Validation failed at one of the processing stages |
| `UNREJECT` | A previously rejected account was reinstated |

:::scalar-callout{type="warning"}
`status_reason` is only meaningful alongside `status`. The same value can appear under `PENDING_USER` (the customer can still fix it) or under `REJECTED` (they cannot). Always branch on `status` first.
:::

### Occupation

Consumer accounts carry an `occupation` object with two fields.

`employment_status` is required, and is one of:

| Value |
|---|
| `FULL_TIME` |
| `PART_TIME` |
| `SELF_EMPLOYED` |
| `FREELANCER` |
| `UNEMPLOYED` |
| `STUDENT` |
| `RETIRED` |

`profession` is a string describing the consumer's core professional identity. It is required unless `employment_status` is `STUDENT` or `UNEMPLOYED`.

:::scalar-callout{type="info"}
Valid `profession` values are set per program. Ask your Alviere program manager for the list configured on yours before you build the picker, since submitting a value outside it will fail validation.
:::

## Business accounts

A business account represents a business or organization. Like consumer accounts, you graduate them through statuses as KYB progresses.

### Statuses

| Status | Description |
|--------|-------------|
| `CREATED` | Initial status after successful creation, prior to KYB |
| `ACTIVE` | Fully active in the system |
| `PROCESSING` | Application in progress, no action required |
| `PENDING_USER` | Further action required from the business |
| `MANUAL_REVIEW` | Under manual review. The `stage` property indicates why |
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

Business accounts use the same `status_reason` enum as consumer accounts. See [Status reasons](#status-reasons) above. In practice the ones you will see on a `BUSINESS` account are `REQUIRES_CERTIFICATE_OF_INCORPORATION_RESUBMISSION`, `EXPIRED_DOCUMENT`, and `STAGE_VALIDATION`; the SSN and driver's-license values surface on the attached `STAKEHOLDER` accounts instead, since that is where individual identity is verified.

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
