---
title: "Marketplace"
description: "Run a platform where many sellers transact, with automatic commission via fee rules"
---

# Marketplace

You run a platform where many sellers transact through you. When a buyer pays a seller, part of the money goes to the seller and part to you as commission.

You don't need anything marketplace-specific on the API call. Each seller gets their own account, the buyer's card is charged at your checkout, and the fee-rules engine routes commission to your platform and the rest to the seller.

:::scalar-callout{type="info"}
Commission rules are fee rules. Create them with `POST /v3/fee-rules`, or have your program manager configure them for you. A `PROGRAM`-scoped rule applies to every account without further wiring; an `ACCOUNT`-scoped rule applies only to the accounts you associate with it.
:::

## How sellers are modeled

```
Your platform (the program)
└── Seller accounts            one per seller, with KYB
    └── Seller account balance     where their card payments land
```

Each seller is a `BUSINESS` account on your program. The buyer is usually a guest at checkout (no Alviere account needed), though programs that also run BAAS may have `CONSUMER` accounts for buyers.

## Charge a card

```json
POST /v3/cards/debit
{
  "amount": "100.00",
  "destination": {
    "wallet_uuid": "<seller_account>"
  }
}
```

There are no marketplace-specific fields. Commission and convenience fees happen underneath.

## Fee splits (B2B2C)

Two fees can apply to the same charge:

| Who charges who | Fee type | Where the money lands |
|---|---|---|
| **You** (the platform) charge the **seller** (commission) | `SERVICE_FEE`, DEDUCT | Your platform |
| The **seller** charges the **buyer** (upcharge) | `CONVENIENCE_FEE`, UPCHARGE | Seller's account |

### Example: $100 sale, $3 seller convenience fee, 10% platform commission

1. Buyer's card is charged: **$103** ($100 sale + $3 seller convenience fee).
2. Seller's account receives **$100** plus the `$3` `CONVENIENCE_FEE` as a child transaction.
3. Platform commission: **$10** `SERVICE_FEE` deducted from the seller's account and routed to your platform.

Net to seller: **$93**. Net to platform: **$10**.

## Seller payouts

Sellers withdraw to their external bank through the standard payout flow once funds have matured past the chargeback window. See [Beneficiaries & Payouts](/guides/resources/beneficiaries).

## Related

- [Accept card payments](/guides/payment-acceptance/online-payments/card-payments/introduction)
- [Payment Acceptance overview](/guides/payment-acceptance/payment-acceptance)
- [Beneficiaries & Payouts](/guides/resources/beneficiaries). Seller bank account setup.
