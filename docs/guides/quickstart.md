---
title: "Quickstart"
description: "Make your first authenticated API calls against the Alviere sandbox"
---

# Quickstart

Make your first authenticated API call against the Alviere sandbox in a few minutes. Once you can authenticate and read your accounts and their wallets, you've got everything you need to start building.

## API conventions

The HIVE Platform exposes RESTful APIs with predictable, resource-oriented endpoints.

- **JSON responses** — every response is JSON-encoded
- **Standard HTTP** — conventional response codes, authentication, and verbs

| Method | Purpose |
|--------|---------|
| `POST` | Create a new resource |
| `PATCH` | Update an existing resource |
| `GET` | Retrieve data or query resources |
| `DELETE` | Remove or cancel a resource |

## Get started

### 1. Get Portal access

Your Alviere program manager will hand you Portal access and API credentials.

### 2. Set your API key

```bash
export ALVIERE_API_KEY="your_api_key_here"
```

### 3. Make your first request

```bash
curl https://api.snd.alviere.com/accounts \
  -H "Authorization: Bearer $ALVIERE_API_KEY"
```

### 4. List an account's wallets

Take an `account_uuid` from the previous response and list its wallets:

```bash
curl https://api.snd.alviere.com/accounts/{account_uuid}/wallets \
  -H "Authorization: Bearer $ALVIERE_API_KEY"
```

If you get a `2xx` back with the account's wallets, you're set.

## Next steps

- [Authentication](/guides/getting-started/authentication) — OAuth 2.0 and API key management
- [Environments](/guides/getting-started/environments) — sandbox vs. production configuration
- [Error Codes](/guides/getting-started/error-codes) — how to handle the errors you'll see
