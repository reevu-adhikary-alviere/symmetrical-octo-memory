---
title: "KYC Scenarios"
description: "Trigger specific KYC outcomes in Sandbox by submitting test data"
---

# KYC Scenarios

You can simulate every KYC processing stage in Sandbox by submitting specific data attributes on the `Create Account` request. The conditions below trigger particular outcomes. Pass anything else and the account clears all stages automatically and becomes `ACTIVE`.

:::scalar-callout{type="info"}
If you submit data that doesn't match any of the conditions below, all processing stages are automatically accepted. The account becomes `ACTIVE` as long as the required data is present.
:::

## Fraud

| Test conditions | Account status | Action required |
|-----------------|---------------|-----------------|
| `email_address` contains `deny_` (e.g. `john+deny_1@example.com`) | `REJECTED` | None |
| `email_address` contains `manual_` (e.g. `john+manual_1@example.com`) | `MANUAL_REVIEW` | Accept or reject the account in `MANUAL_REVIEW` |

## Address

| Test conditions | Account status | Action required |
|-----------------|---------------|-----------------|
| `postal_code` starts with `82007` + `state` = `WY`, or `postal_code` starts with `28748` + `state` = `NC` | `PENDING_USER` (INVALID_ADDRESS) | Update the address with a different `postal_code` and `state` combination |
| `line_1` or `line_2` matches the PO Box regex (e.g. `PO Box 123`, `P.O. Box 123`) | `PENDING_USER` (INVALID_ADDRESS) | Update with a different `line_1` or `line_2` |

PO Box regex:
```
^(((p[\s.]?[o\s][.]?)\s?)|(post\s?office\s?))((box|bin|b.?)?\s?(num|number|#)?\s?\d+)
```

## Identity / Identity Optional SSN

:::scalar-callout{type="info"}
The full reference of identity verification scenarios is being expanded here. See the [V2 API Reference](/api-v2) for the current list.
:::

## Identity Optional SSN: additional scenarios

These cover consumers providing a Mexican ID or passport without an SSN.

| Test conditions | Account status | Action required |
|-----------------|---------------|-----------------|
| `first_name` = `James`, `last_name` = `Smith` + all other info and documents (MC_DOCUMENT_FRONT, MC_DOCUMENT_BACK, SELFIE), system does **not** find SSN match | `ACTIVE` | None |
| `first_name` = `James`, `last_name` = `May` + all other info and documents, system **does** find SSN match | `PENDING_USER` (REQUIRES_LAST_4_SSN) | Update the account with any `ssn` value (4 or 9 digits) |

## Documents / Documents Optional Full SSN

:::scalar-callout{type="info"}
The full reference of document verification scenarios is being expanded here. See the [V2 API Reference](/api-v2) for the current list.
:::

### Documents Optional Full SSN: additional scenarios

| Test conditions | Account status | Action required |
|-----------------|---------------|-----------------|
| `ssn` only contains last 4 digits | `PENDING_USER` (REQUIRES_DOSSIER) | Submit a dossier with documents |
| `last_name` = `InvalidClassificationCountry` or `InvalidCountry` | `PENDING_USER` (COUNTRY_OF_ISSUANCE_MISMATCH) | Update with a different last name |
| `last_name` = `CountryNotSupported` | `PENDING_USER` (COUNTRY_OF_ISSUANCE_NOT_SUPPORTED) | Update with a different last name |

## Sanctions

| Test conditions | Account status | Action required |
|-----------------|---------------|-----------------|
| `last_name` = `Badguy` | `MANUAL_REVIEW` | Accept or reject the account in `MANUAL_REVIEW` |
