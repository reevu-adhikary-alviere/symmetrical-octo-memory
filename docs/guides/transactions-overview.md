---
title: "Transactions Overview"
description: "Transaction scopes, statuses, and types: how Alviere records money movement"
---

# Transactions Overview

A transaction represents a single financial operation or movement of funds on the HIVE Platform. Alviere captures every monetary action as a transaction, whether that's loading funds, a card purchase, a transfer, or a fee, so you have an auditable record of where money came from and where it went.

## Transaction scopes

Transactions exist in three scopes depending on where the funds move:

```mermaid
graph LR
    PM["Payment Method<small>Card / Bank</small>"]
    W["Wallet"]
    TV["Treasury Vault"]
    EXT["External Bank"]

    PM -->|"Load / Passthrough"| W
    W -->|"Withdraw"| PM
    W <-->|"Wallet Transfer"| W
    W <-->|"Vault Transfer"| TV
    TV <-->|"External"| EXT
```

| Scope | Description |
|-------|-------------|
| **Wallet** | Tracks money in and out on a wallet's ledger |
| **Passthrough** | Child transactions that fund a parent transaction directly from a payment method (e.g. card → international transfer), without touching the wallet ledger |
| **Vault** | Transfers between wallets and treasury vaults, or between vaults and external banks |

## Statuses

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> PROCESSING
    CREATED --> PENDING
    CREATED --> WAITING
    PROCESSING --> PROCESSING_PAYMENT
    PROCESSING --> COMPLETED
    PROCESSING --> FAILED
    PROCESSING --> ERROR
    PROCESSING --> MANUAL_REVIEW
    PROCESSING_PAYMENT --> COMPLETED
    PROCESSING_PAYMENT --> FAILED
    PENDING --> PROCESSING
    WAITING --> PROCESSING
    MANUAL_REVIEW --> COMPLETED
    MANUAL_REVIEW --> REJECTED
    CREATED --> CANCELED_USER
    CREATED --> CANCELED_SYSTEM
    PROCESSING --> VOIDED
```

| Status | Description |
|--------|-------------|
| `CREATED` | Transaction initialized |
| `PROCESSING` | In progress. A ledger transaction requiring a payment action |
| `PROCESSING_PAYMENT` | Funds being sourced from a payment method (e.g. card) |
| `COMPLETED` | Funds successfully transferred |
| `FAILED` | Could not process (e.g. declined card) |
| `ERROR` | A system anomaly prevented processing |
| `CANCELED_USER` | Halted by customer or agent via Portal |
| `CANCELED_SYSTEM` | Canceled by an automated system rule |
| `VOIDED` | Nullified before payment execution. No debit or credit occurred |
| `PENDING` | Awaiting customer action or fund settlement |
| `MANUAL_REVIEW` | Under review by Alviere's compliance and risk team |
| `WAITING` | On standby for wallet balance availability or prefunding vault input |
| `REJECTED` | Declined after manual review by risk/fraud |

## Transaction types

:::scalar-callout{type="info"}
The full reference of transaction types is being expanded here: load, withdraw, P2P, card purchase, international transfer, check deposit, and more. See the [V2 API Reference](/api-v2) or [V3 API Reference](/api-v3) for the current list and per-type fields.
:::
