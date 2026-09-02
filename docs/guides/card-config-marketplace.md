---
title: "Marketplace"
description: "Charge buyers at your checkout, pay each seller what they earned, and keep your commission on every sale"
---

# Marketplace

You run a platform where sellers transact through you. A buyer pays at your checkout, the seller gets the sale, and you keep a commission. On Alviere the seller is an account, the buyer is a card, and the commission is a fee rule that fires on every charge.

A card charge settles into exactly one wallet, the `destination.wallet_uuid` you name on the request. Refunds come back out of that wallet, chargebacks land on that seller's charge, and fees are computed from it. Every design choice on this page comes back to which wallet you name.

## The parties

```
Your platform (the program)
├── Program fee revenue          where SERVICE_FEE commission lands
├── Seller A   BUSINESS account, KYB complete
│   └── wallet                   receives A's sales, pays A's refunds
├── Seller B   BUSINESS account, KYB complete
│   └── wallet
└── Buyers     guests at checkout, or CONSUMER accounts with saved cards
```

**Sellers** are `BUSINESS` accounts on your program. Each goes through KYB before it can receive funds. The officers of the business are attached as `STAKEHOLDER` accounts, which is where individual identity checks run. [Accounts](/guides/resources/accounts) covers the statuses and stages.

**Buyers** are either guests or account holders, and you should decide early which you support. A guest buyer's card is passed inline on the charge, so card data touches your servers and widens your PCI scope. An account holder is a `CONSUMER` account with a saved [payment method](/guides/resources/payment-methods) that the SDK tokenized, so you hold a reference and never the card number. Account holders mean one account per buyer to create and maintain. Guests mean PCI obligations on your side.

**You**, the platform, are the program. Commission revenue from `PROGRAM`-owned fee rules accrues to the program, and you see it as `SERVICE_FEE` child transactions on each sale.

## Onboard a seller

A seller has to be `ACTIVE` before a charge can land in their wallet. The path from signup to first sale:

1. **Create the `BUSINESS` account** with the business details, then attach each officer as a `STAKEHOLDER`. Upload the incorporation documents as [dossiers](/guides/resources/identity).
2. **Watch the `ACCOUNT` webhook.** The account moves through `PROCESSING`, and may stop at `PENDING_USER` when the business needs to supply something, or `MANUAL_REVIEW` when a stage needs a person. The `stage` field says which check is running: `SANCTIONS`, `PREVALIDATION`, `VERIFICATION`, `DOCUMENTS`, or `STAKEHOLDERS`. Build your seller dashboard around these so a stuck seller knows what to fix.
3. **Assign fee rules** once the account is `ACTIVE`, if you use per-seller commission tiers. One call attaches every rule the seller needs.
4. **Save the seller's bank account** as a payment method on their account. Payouts go there.

The fee rule association from step 3:

```bash
PUT /v3/fee-rules/account-associations
{
  "account_uuid": "<seller_account>",
  "add_fee_rule_uuids": ["<tier_2_commission>"],
  "remove_fee_rule_uuids": []
}
```

Sandbox does not run KYB, so accounts there activate without the review stages. Use it to build the flow and use production to see the stages fire. [Test KYC](/guides/sandbox-testing/test-kyc) covers what the sandbox can simulate.

## Charge the buyer

The charge names the seller's wallet as the destination. Commission is not on the request. It comes from the fee rules that apply to that seller.

```bash
POST /v3/cards/debit
{
  "external_id": "order_88213",
  "amount": "100.00",
  "currency": "USD",
  "source": { "payment_method_uuid": "<buyer_saved_card>" },
  "destination": { "wallet_uuid": "<seller_wallet>" },
  "auth_type": "AUTHCAP",
  "channel": "ECOM",
  "merchant_details": {
    "name": "Marisol Ceramics",
    "descriptor": "MKT*MARISOL CERAMICS",
    "descriptor_city": "PORTLAND",
    "mcc": "5947"
  },
  "metadata": { "order_id": "88213", "seller_id": "s_4471" }
}
```

**`destination.wallet_uuid`** picks the seller. Get this wrong and the money lands in the wrong seller's wallet, and the only way back is a refund and a new charge. Store the wallet UUID against your seller record at onboarding and never look it up by name.

**`merchant_details`** controls what the buyer sees on their card statement. Put the seller's name in the descriptor. A buyer who recognizes the charge has no reason to dispute it. Card networks limit descriptor length and format, so keep it short and test it.

**`metadata`** is where your order and seller IDs go. It comes back on every transaction, every child fee, and every webhook, so put in whatever your reconciliation will need to join on.

### Authorize now, capture on fulfillment

For physical goods, authorize at checkout and capture when the seller ships. Send `auth_type: AUTH` at checkout, then `POST /v3/cards/capture` with the transaction UUID when the seller confirms shipment. Capture less than the authorized amount if an item was removed, and the difference is released to the buyer's card. If the seller never ships, `POST /v3/cards/reverse` voids the authorization. No refund transaction is created.

### Preview the split before the buyer confirms

Fee rules can add to what the buyer pays, so show the total before you charge. `POST /v3/transactions/preview` with the seller's account, the type `PAYMENT`, and the amount returns every fee that would apply, each marked `display: true` or `false`. Show the `true` ones to the buyer. The `false` ones are your commission, and the preview tells you the seller's net so your seller dashboard can show it too.

## How commission works

Commission is a fee rule with `fee_type: SERVICE_FEE` and `calc_type: DEDUCT`. When a charge settles into a seller's wallet, the rule fires and creates a `SERVICE_FEE` child transaction with a negative amount on that wallet. The seller sees the sale and the deduction as two linked records. You see the deduction as revenue.

```bash
POST /v3/fee-rules
{
  "external_id": "commission_standard",
  "description": "Platform commission 10%",
  "fee_scope": "PROGRAM",
  "fee_type": "SERVICE_FEE",
  "calc_type": "DEDUCT",
  "value": { "percent": 10, "cap": null },
  "fee_criteria": { "transaction_types": ["PAYMENT"], "currencies": ["USD"] },
  "display": false
}
```

| Decision | Options | Which to pick |
|---|---|---|
| `fee_scope` | `PROGRAM` applies to every seller with no wiring. `ACCOUNT` applies only to sellers you associate | One flat rate: `PROGRAM`. Tiers, negotiated rates, or a promotional period: `ACCOUNT` |
| `value` | A `percent` with an optional `cap`, or a fixed `amount` | Percent for commission. Fixed for a per-order platform fee. Set a cap if high-ticket sellers would otherwise leave |
| `display` | Whether the fee appears in the buyer-facing preview | `false` for commission the buyer should not see. `true` for a fee the buyer pays |
| `fee_criteria.currencies` | Restrict the rule to listed currencies | Leave it at `USD` unless your program has more |

A seller can have several `SERVICE_FEE` rules at once, and all of them fire. A `PROGRAM` rule plus an `ACCOUNT` rule on the same seller means two deductions. Moving a seller between tiers is one association call that removes the old rule and adds the new one.

`fee_scope` and `fee_type` are fixed once a rule exists. To change either, create a new rule and retire the old one by setting its status to `INACTIVE`. Everything else on a rule can be updated in place, and the change applies to the next charge, not to charges already settled.

Give every rule an `external_id`. A duplicate create with the same `external_id` returns the existing rule with a `409` instead of creating a second one, which is what you want when a deployment script runs twice.

### Letting the seller charge the buyer a fee

A `CONVENIENCE_FEE` with `calc_type: UPCHARGE` goes the other direction. It increases what the buyer's card is charged and credits the extra to the seller's wallet as a positive child transaction. Use it when sellers pass their processing cost to buyers. It must have `display: true`, because the buyer has to see it.

### Worked example

A $100 sale. The seller has a $3 convenience fee rule and your program has a 10% commission rule.

| Step | Amount | Record |
|---|---|---|
| Buyer's card is charged | $103.00 | `PAYMENT`, `amount: "100.00"`, on the seller's wallet |
| Seller's convenience fee credited | +$3.00 | `CONVENIENCE_FEE` child, positive |
| Your commission deducted | −$10.00 | `SERVICE_FEE` child, negative |
| Seller nets | $93.00 | |
| You net | $10.00 | |

The parent `PAYMENT` returned by `GET /v3/transactions/{transaction_uuid}` carries both children in `child_transactions`, each with its own UUID, type, status, and signed amount. Commission is computed on the base amount, not on the upcharged total.

## Refunds

A refund is `POST /v3/cards/reverse` against the original transaction UUID with an amount up to what remains refundable and a `refund_reason`. It creates a `REFUND` transaction with a negative amount on the seller's wallet, linked back through `parent_transaction_uuid`. Partial refunds work, and you can refund the same charge more than once until it is exhausted.

The refund debits the seller's wallet because the sale credited it. If the wallet cannot cover the amount, the refund fails. A seller whose balance is swept to zero every night cannot refund until the next sale lands, which is why the payout section below recommends holding a reserve.

Your commission is a separate transaction and the refund leaves it alone. Whether you return it to the seller is your policy. When you do, reverse the specific fee with `POST /wallets/{wallet_uuid}/service-fees/{transaction_uuid}/reverse` on the seller's wallet, which creates a `SERVICE_FEE_REVERSAL`.

An authorization that was never captured is voided rather than refunded. The reverse call returns `204` with no body, and the parent flips to `VOIDED`.

## Chargebacks

The buyer's bank raises a chargeback against one charge, and that charge belongs to a seller. Decide before launch who eats the loss. Some platforms pass it to the seller. Others absorb it and recover it from the next commission. Your program manager will walk you through how your program handles chargebacks and what evidence to keep.

A recognizable `merchant_details.descriptor`, a refund policy the seller can act on quickly, and capturing on shipment rather than at checkout prevent most of them.

## Pay sellers

Funds from a sale settle into the seller's wallet on the card settlement schedule. Paying the seller is a withdrawal from that wallet to the bank payment method you saved at onboarding. With many sellers, a standing instruction per seller beats a payout job of your own. `POST /v3/schedule/withdraws` with `amount.type: RULE` and `rule_name: SETTLED_BALANCE` sweeps whatever has settled since the last run, daily or weekly, and skips silently when there is nothing to move. Sellers who want their money now can trigger `POST /wallets/{wallet_uuid}/withdraw` from your dashboard, or you can offer `POST /v3/instant/transfer` for a fee and settle in seconds. [Getting paid](/guides/payment-acceptance/use-cases/card-config-direct-merchant#getting-paid) in the direct merchant guide describes all three in full.

### Holding a reserve

Alviere does not hold seller funds back automatically. If you want a buffer for refunds and chargebacks, build it into the payout timing. Sweep weekly rather than daily, or withdraw on demand only the portion of the balance older than your chargeback window. The wallet's `balance` and `available` buckets tell you what has settled, and your own record of charge dates tells you what has aged past the window.

## Splitting one cart across sellers

A charge has one destination, so a cart with items from three sellers is three charges, one per seller, each with its own `external_id`. The buyer sees three lines on their statement, each with that seller's descriptor. Authorize all three, then capture each as its seller ships.

If you would rather the buyer see one charge, land it in a wallet you control and move the seller shares afterward with `POST /wallets/{wallet_uuid}/send`. That is an [internal transfer](/guides/transactions/internal-transfers) and needs the P2P module on your program. In this model the refund and chargeback liability sit in your wallet rather than the seller's, and your commission is whatever you keep back rather than a fee rule. Take on that exposure only when a single statement line is a hard requirement.

## What the seller sees

Give sellers a view of their own money. Everything you need is on `GET /v3/transactions` filtered by their account: each `PAYMENT` with its child fees, each `REFUND` linked to its parent, and each withdrawal with its status. The `metadata` you set at charge time ties every row back to an order. If sellers want a month-end statement rather than a live view, [Periodic Reports](/guides/reporting/periodic-reports) carry the same transactions, with the same UUIDs, as CSV files on SFTP.

## Related

- [Card Payments](/guides/payment-acceptance/online-payments/card-payments/introduction). The charge endpoint in full.
- [Accounts](/guides/resources/accounts). Business account statuses and KYB stages.
- [Payment Methods](/guides/resources/payment-methods). Saving buyer cards and seller bank accounts.
- [Transactions Overview](/guides/transactions/transactions-overview). Statuses, child transactions, and reversals.
- [Webhooks](/guides/more/webhooks). `ACCOUNT` for seller onboarding, `WALLET_TRANSACTION` for sales and refunds.
- [Pay by Bank](/guides/payment-acceptance/online-payments/pay-by-bank/introduction). The same marketplace model over ACH.
