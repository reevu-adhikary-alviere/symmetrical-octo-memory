---
title: "Changelog"
description: "API updates, new features, and release notes for the Alviere platform"
---

# Changelog

Released changes to the HIVE APIs, newest first. Versions refer to the version reported by each API reference: the V2 reference is currently **6.6.16**, the V3 reference is currently **1.1.5**.

Entries marked **Breaking** change an existing contract — check them before upgrading.

## V2

### 6.6.16 — August 29, 2026

- Card issuance reference simplified: clearer summaries across the card endpoints.
- Non-reloadable prepaid card creation is no longer part of the public reference. Reloadable card creation through a wallet is unchanged.

### 6.6.15 — August 21, 2026

- Added `GENERAL_PARTNERSHIP`, `NON_PROFIT_CORPORATION`, and `GOVERNMENT_ENTITY` to the accepted business types.

### 6.6.14 — July 17, 2026

- `dispute_details` on transaction responses is now structured consistently across every transaction surface that carries it.

### 6.6.13 — July 16, 2026

- **Breaking:** removed the `payment_request` aggregate from `instant_transfer_details` on transaction responses.

### 6.6.12 — July 15, 2026

- Instant payment transaction types and response fields finalized: the transaction types are `INSTANT_BANK_TRANSFER` and `INSTANT_PAYMENT_REQUEST`, response details live under `instant_transfer_details`, and the network enum value is `TCH_RTP`.
- Documented that check images are retained for 90 days.

### 6.6.11 — July 3, 2026

- Added instant payment transaction fields to transaction responses.

### 6.6.10 — June 29, 2026

- Load funds requests accept a `description` and, for ACH funding, an `ach_reference`.

### 6.6.9 — June 25, 2026

- Added `EIN` to the accepted stakeholder ID types.

### 6.6.8 — June 8, 2026

- **Breaking:** removed the saved-card endpoints from Card Payments. Saved cards remain available as payment methods.

### 6.6.7 — May 27, 2026

- **Breaking:** removed `ACH_type` from transaction response schemas. It remains accepted on requests.

### 6.6.5 — May 25, 2026

- Aligned the V3 card save schema with the transaction response.

### 6.6.4 — May 22, 2026

- Added `SAVINGS` to the wallet type enum.

### 6.6.3 — May 22, 2026

- Added `merchant_category_code` to denied authorization details and to the corresponding webhook payload.

### 6.6.2 — May 19, 2026

- `business_type` is now optional for US and EU businesses, and `ein` is optional for US businesses.

### 6.6.0 — May 19, 2026

- Added the Webhooks section: nine event types behind a shared envelope, so integrations can subscribe once and receive every event on a consistent shape.
- Wallet payment method enums corrected: `SAVINGS` accepted where `SAVING` previously failed validation.

### 6.5.0 — May 18, 2026

- Added V3 Card Payments and Transactions v3 endpoints, with card actions — push, reverse, capture — under `/v3/cards/*`.

## V3

The V3 API reference is currently at **1.1.5**. V3 endpoints are documented in their own [reference](/api-v3) and in the guides; card payment acceptance and instant payments are covered in [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction) and [Instant Payments](/guides/transactions/instant-payments).
