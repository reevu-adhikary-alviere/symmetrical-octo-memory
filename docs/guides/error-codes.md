---
title: "Error Codes"
description: "HTTP response codes, validation errors, and the Alviere API error code reference"
---

# Error Codes

Alviere uses standard HTTP response codes to tell you whether a request worked. Errors that need more detail also include a `validation` block in the response body with a specific Alviere error code.

## HTTP response codes

| Range | Category | Description |
|-------|----------|-------------|
| **2xx** | Success | The request was processed successfully |
| **3xx** | Redirection | Additional actions are needed to finalize the request |
| **4xx** | Client error | The request had problems, usually on the client side |
| **5xx** | Server error | Issues inside Alviere infrastructure (uncommon) |

:::scalar-callout{type="danger"}
If you hit a 5xx, contact ops@alviere.com right away.
:::

### Common HTTP codes

| Code | Text | Description |
|------|------|-------------|
| 201 | OK | The request executed successfully |
| 400 | Bad Request | The request was malformed, usually missing parameters |
| 401 | Not authorized | The request wasn't authorized, or had an invalid/missing API token |
| 403 | Forbidden | The API token doesn't have the required permissions |
| 404 | Not Found | The resource doesn't exist |
| 409 | Conflict | The request conflicts with another, often duplicate idempotency keys |
| 500–504 | Server Error | Unexpected issue on Alviere's side |

## Validation responses

Some response bodies include a `validation` section with the specific outcome:

- **Result**. `ACCEPTED` or `REJECTED`.
- **Error code**. A unique Alviere error code.
- **Description**. What went wrong.

```json
{
  "validation": {
    "result": "REJECTED",
    "error_code": "500012",
    "error_description": "Payment method is invalid"
  }
}
```

If the request has no issues, these fields are empty.

## API error codes

All Alviere error codes below are returned with HTTP 400 responses.

:::scalar-callout{type="info"}
The full reference of Alviere error codes is being expanded here. See the [V2 API Reference](/api-v2) or [V3 API Reference](/api-v3) for the current list, organized by endpoint.
:::

:::scalar-callout{type="info"}
Error codes marked as "Configuration error" usually mean your program's settings don't match the action you're trying to take. Contact your program manager to resolve.
:::
