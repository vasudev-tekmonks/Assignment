# Question 10 – API Hardening, Debugging, and Error Handling

## Overview

A Node.js REST API hardened for reliability and security. All errors return a consistent JSON format, inputs are validated, sensitive data is never exposed, and every request is logged.

## Project Structure

```
├── server.js              # HTTP server and route handling
├── storage.js             # Data persistence (sampleData.json)
├── test.js                # Automated failure scenario tests
├── api-testing.http       # Manual test cases (REST Client)
├── logs.txt               # Structured request logs
├── sampleData.json        # User data store
└── utils/
    ├── auth.js            # Token authentication and role authorization
    ├── response.js        # sendJson, sendError, handleRouteError
    ├── validation.js      # Content-type, body parsing, field validation
    ├── logger.js          # Request logger and error logger
    └── helpers.js         # UUID check, publicUser, error type checks
```

## How Each Requirement Was Met

### 1. Centralized Error Handling

All errors go through `sendError()` and `handleRouteError()` in `utils/response.js`. Every error response follows the same JSON structure:

```json
{
    "status": "Bad Request",
    "message": "Description of the problem."
}
```

`handleRouteError()` maps error types (400, 413, 404, invalid data, auth failures) to the correct status code so route handlers don't repeat error logic.

**Issue found:** Validator functions (`checkContentType`, `validateBodyForSignup`, `validateBodyForLogin`) were writing directly to `res.end()` bypassing the centralized error format. Some returned `{"status": "Unsupported Media Type"}` without a `message` field.

**Resolution:** Refactored all validators to call `sendError()` so every error response has the same `{ status, message }` shape.

### 2. Input Validation

- **URL parameters:** User IDs are validated as UUID v4 format (`utils/helpers.js`). Invalid IDs return `400`.
- **Headers:** `Content-Type` must be `application/json` for body routes (`utils/validation.js`). `Authorization` header must follow `Bearer <token>` format (`utils/auth.js`).
- **Body data:** Request bodies are validated for required fields, correct types, and non-empty values. The PATCH route only allows `name` and `password` fields — attempts to inject `role`, `id`, or arbitrary fields are rejected with `400`.
- **URL parsing:** Malformed request URLs are caught with a try/catch around `new URL()` and return `400` instead of crashing.

**Issue found:** The PATCH endpoint had no body validation — it accepted empty objects `{}`, wrong types like `{"name": 12345}`, and injected fields like `{"role": "admin"}` directly into the database. The signup route spread all incoming fields via `...record`, allowing extra properties to persist.

**Resolution:** Created `validateBodyForUpdate()` with a whitelist of allowed fields. Fixed `createRecord()` in `storage.js` to only store `name`, `id`, `password`, and `role`.

### 3. Sensitive Information Protection

- Password hashes are stripped from all responses using `publicUser()` in `utils/helpers.js`.
- Error responses never expose stack traces, file paths, or internal details.
- Log entries redact user IDs from URL paths (shown as `/users/[redacted]`).
- Login failures return a generic `"Invalid user ID or password."` message regardless of whether the ID or password was wrong.

**Issue found:** The DELETE route handler had `console.error(err)` which leaked raw stack traces and file system paths to stderr.

**Resolution:** Replaced with `logError()` which logs only controlled metadata (timestamp, method, path, status code, category) as structured JSON.

### 4. Request Logging

Every request is logged to `logs.txt` via `requestLogger()` in `utils/logger.js`. Each log entry includes:

- `timestamp` – ISO 8601
- `requestId` – UUID generated per request (also sent as `X-Request-Id` response header)
- `method` – HTTP method
- `path` – URL path (with sensitive segments redacted)
- `statusCode` – response status code
- `responseTimeMs` – response time using `process.hrtime.bigint()`
- `outcome` – `completed` or `connection_closed`

### 5. Malformed Request and Server Error Handling

- Malformed JSON bodies return `400 Bad Request`.
- Oversized bodies (>1 MiB) return `413 Payload Too Large`.
- Malformed URLs return `400 Bad Request` (URL parsing is wrapped in try/catch).
- Any unhandled exception in the request lifecycle is caught by the outer try/catch, logged via `logError()`, and returns `500` with a generic message.
- Aborted or errored request streams are handled in `readRequestBody()`.

**Issue found:** Malformed URLs like `http://[` caused `new URL()` to throw an unhandled error, which fell into the outer catch and returned `500 Internal Server Error` instead of `400`.

**Resolution:** Wrapped URL parsing in its own try/catch to return `400 Bad Request` for invalid URLs.

### 6. Failure Scenario Testing

Tested in `api-testing.http` (manual) and `test.js` (automated via `npm test`):

| Scenario | Expected Status |
|---|---|
| Missing authorization token | 401 |
| Invalid/expired token | 401 |
| Wrong login password | 401 |
| User role accessing admin route | 403 |
| Invalid UUID format | 400 |
| Missing required body fields | 400 |
| Malformed JSON body | 400 |
| Empty PATCH body | 400 |
| Disallowed fields in PATCH | 400 |
| Wrong Content-Type header | 415 |
| Nonexistent user | 404 |
| Unknown route | 404 |
| Unsupported HTTP method | 405 |
| Oversized request body | 413 |

**Issue found:** `GET /users/login` and `GET /users/signup` returned `404 Not Found` instead of `405 Method Not Allowed`. The `Allow` header on `/users` listed `HEAD` but HEAD requests were not actually handled.

**Resolution:** Added 405 handling for signup and login routes with `Allow: POST`. Removed `HEAD` from Allow headers where it is not supported.

## Running

```bash
npm start        # Start the server on port 8080
npm test         # Run automated failure scenario tests
```
