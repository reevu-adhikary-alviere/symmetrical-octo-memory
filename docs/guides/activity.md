---
title: "Activity"
description: "Non-transactional account events: denied authorizations, card reissues, PIN changes, and more"
---

# Activity

Activity covers account-level events that aren't transactions: denied card authorizations, PIN changes, document verification, payroll deposit switches, ACH pre-notifications, ACH Notices of Change (NOCs), and so on. Use it to drive in-app notifications, support workflows, or audit trails.

## Activity types

### Denied authorizations

A denied authorization is an attempted financial action that wasn't approved: a card swipe declined, an ATM withdrawal blocked, or any similar attempt that didn't go through.

:::scalar-callout{type="info"}
The full reference of decline reasons is being expanded. See the [V2 API Reference](/api-v2) for the current list.
:::

### Card replacement and reissuing

| Action | New PAN? | When it happens |
|--------|----------|------|
| **Replacement** | Yes, new PAN issued | Loss, theft, or confirmed/suspected fraud. The new PAN prevents continued unauthorized use |
| **Reissuing** | No, same PAN, new expiry/CVV | Card nearing expiration, damaged, or the issuer is rolling out new security features. Recurring payments keep working uninterrupted |

### Payroll Deposit Switch

Tracks when an account holder uses the PDS (Payroll Deposit Switch) flow to instruct their payroll provider to deposit funds directly into their digital wallet.
