---
title: "Environments"
description: "Develop and test in Sandbox, run live in Production"
---

# Environments

Alviere gives you two environments: sandbox for testing, production for live operations. Each has its own Portal and API base URL.

| Environment | Portal | API |
|-------------|--------|-----|
| **Sandbox** | `https://portal.snd.alviere.com` | `https://api.snd.alviere.com` |
| **Production** | `https://portal.alviere.com` | `https://api.alviere.com` |

## Sandbox

- Built for development and testing
- An isolated environment for integrating against the sandbox API
- **No backend integration**. KYC/KYB validations and real-money transfers don't run in sandbox.

## Production

- The full Alviere platform with all live partner integrations
- What you can do is determined by your program's configuration

:::scalar-callout{type="warning"}
Sandbox and production use different API credentials. Make sure you're using the right `client_id` and `client_secret` for each.
:::
