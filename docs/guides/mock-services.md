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

## Test scenario guides

- [KYC Scenarios](/guides/sandbox-testing/test-kyc). Simulate fraud, address, identity, documents, and sanctions stages.
- [Card Issuance](/guides/sandbox-testing/test-cards). Activate cards, simulate swipes, test brands, and trigger returned-mail scenarios.
- [Payment Methods](/guides/sandbox-testing/test-payments). Test card numbers, unhappy paths, 3DS scenarios, and bank account failures.
- [International Transfers](/guides/sandbox-testing/test-transfers). Failure paths, refund flows, and cancellation testing for bank and cash payouts.
- [Cash Loading](/guides/sandbox-testing/test-cash-loading). Barcode-based cash load simulation with success and failure flows.
- [Fraud & Sanctions](/guides/sandbox-testing/test-fraud-sanctions). Transaction-level fraud and sanctions check simulation.
