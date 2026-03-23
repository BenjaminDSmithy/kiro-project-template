# API Reference

| Field        | Value      |
| ------------ | ---------- |
| Type         | Reference  |
| Status       | Draft      |
| Last Updated | 2026-03-16 |

---

## Overview

<!-- TODO: Describe the API architecture, base URL, and authentication approach -->

Base URL: `<!-- TODO: e.g. https://api.example.com/v1 -->`

## Authentication

<!-- TODO: Describe auth mechanism -->

All requests require a valid bearer token in the `Authorization` header:

```text
Authorization: Bearer <token>
```

## Common Response Formats

### Success

```json
{
  "data": {},
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": []
  }
}
```

## Status Codes

| Code | Meaning               | When                     |
| ---- | --------------------- | ------------------------ |
| 200  | OK                    | Successful GET/PUT/PATCH |
| 201  | Created               | Successful POST          |
| 204  | No Content            | Successful DELETE        |
| 400  | Bad Request           | Validation error         |
| 401  | Unauthorised          | Missing or invalid token |
| 403  | Forbidden             | Insufficient permissions |
| 404  | Not Found             | Resource does not exist  |
| 409  | Conflict              | Duplicate or state issue |
| 429  | Too Many Requests     | Rate limit exceeded      |
| 500  | Internal Server Error | Unexpected server error  |

## Endpoints

### <!-- TODO: Resource Name -->

#### List <!-- TODO: resources -->

```text
GET /<!-- TODO: path -->
```

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `page`    | number | No       | Page number    |
| `limit`   | number | No       | Items per page |

Response: `200 OK`

```json
{
  "data": []
}
```

#### Get <!-- TODO: resource -->

```text
GET /<!-- TODO: path -->/:id
```

Response: `200 OK`

#### Create <!-- TODO: resource -->

```text
POST /<!-- TODO: path -->
```

| Field         | Type   | Required | Description   |
| ------------- | ------ | -------- | ------------- |
| `name`        | string | Yes      | <!-- TODO --> |
| `description` | string | No       | <!-- TODO --> |

Response: `201 Created`

#### Update <!-- TODO: resource -->

```text
PATCH /<!-- TODO: path -->/:id
```

Response: `200 OK`

#### Delete <!-- TODO: resource -->

```text
DELETE /<!-- TODO: path -->/:id
```

Response: `204 No Content`

## Rate Limiting

| Tier    | Requests/min | Burst |
| ------- | ------------ | ----- |
| Default | 60           | 10    |
| Authed  | 120          | 20    |

Rate limit headers are included in every response:

```text
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1710000000
```

---

```text
Copyright (C) {{YEAR}} {{COPYRIGHT_HOLDER}}. All rights reserved.
```
