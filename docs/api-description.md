# API Overview

This section provides essential information for working with the HIVE APIs.

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of an API request. In general:

- **2xx** - Success codes indicate that your request worked as expected
- **4xx** - Client error codes indicate an error that failed given the information provided (e.g., a required parameter was omitted, authentication failed, etc.)
- **5xx** - Server error codes indicate an error with our servers (these are rare)

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is missing required parameters",
    "details": "The 'amount' field is required for this operation"
  }
}
```

## Pagination

List endpoints that return multiple items are paginated. You can control pagination using these query parameters:

- `limit` - Number of items to return (default: 20, max: 100)
- `offset` - Number of items to skip (default: 0)

### Pagination Response

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

## Authentication

All API requests require authentication using API keys. Include your API key in the `Authorization` header:

```
Authorization: Bearer your-api-key-here
```

## Rate Limiting

API requests are rate limited to ensure fair usage:

- **Production**: 1000 requests per minute
- **Sandbox**: 100 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```