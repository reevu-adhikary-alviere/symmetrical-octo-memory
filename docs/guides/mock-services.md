---
title: "Sandbox Testing"
description: "Mock services and test scenarios you can use to exercise the Alviere Sandbox"
---

# Sandbox Testing

The Alviere Sandbox runs independently of external third-party services: Plaid, card networks, KYC providers, ACH originators, and so on. To let you exercise integrations end-to-end before going live, mock services and scripted test scenarios replicate the production experience.

:::scalar-callout{type="warning"}
Not every scenario is relevant to your program. Check with your Alviere implementation team to see which ones apply. For example, if your program only uses the `IDENTITY` and `SANCTIONS` processing stages, you can only test those.
:::

## Mock endpoint

All sandbox simulation requests go to:

```
https://mock.snd.alviere.com
```

Two kinds of simulation live here, and it is worth knowing which you are using:

| Kind | How you trigger it | Examples |
|---|---|---|
| **Data-driven** | Submit a specific value on a normal API call | `last_name` = `Badguy` for a sanctions hit, `$33.34` for a fraud review, an invalid routing number for a failed bank account |
| **Endpoint-driven** | Call a mock endpoint directly | `POST /generateReturn` for an ACH return, `POST /generateNoc` for a Notification of Change, `POST /shipCard`, `POST /swipeCard`, `POST /cashloadWithBarcode` |

Data-driven triggers fire at creation time, so you pick the outcome before the entity exists. Endpoint-driven simulations act on something already created, which is what lets you drive a transaction that already settled into a return days-equivalent later without waiting.

None of the mock endpoints exist in production.

## Test scenario guides

- [KYC Scenarios](/guides/sandbox-testing/test-kyc). Simulate fraud, address, identity, documents, and sanctions stages.
- [Card Issuance](/guides/sandbox-testing/test-cards). Activate cards, simulate swipes, test brands, and trigger returned-mail scenarios.
- [Payment Methods](/guides/sandbox-testing/test-payments). Test card numbers, unhappy paths, 3DS scenarios, bank account failures, and on-demand ACH returns and NOCs.
- [International Transfers](/guides/sandbox-testing/test-transfers). Failure paths, refund flows, and cancellation testing for bank and cash payouts.
- [Cash Loading](/guides/sandbox-testing/test-cash-loading). Barcode-based cash load simulation with success and failure flows.
- [Fraud & Sanctions](/guides/sandbox-testing/test-fraud-sanctions). Transaction-level fraud and sanctions check simulation.
