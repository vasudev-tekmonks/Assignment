# Authentication and Role-Based Authorization API

A lightweight RESTful API built with native Node.js HTTP module implementing JWT authentication and Role-Based Access Control (RBAC).

---

## What This Project Does

- **User Authentication**: Authenticates users using UUID and password; issues signed JSON Web Tokens (JWT).
- **Role-Based Access Control (RBAC)**: Enforces access permissions across two user roles: `user` and `admin`.
- **Protected Endpoints**: Guards resources from unauthenticated or unauthorized access.
- **Password Security**: Stores passwords securely using salted `bcryptjs` hashes.
- **Credential Sanitization**: Strips sensitive password hashes before returning user data.
- **Token Validation**: Detects and handles missing, invalid, malformed, or expired JWTs.
- **Environment Isolation**: Stores secrets like JWT signing key in `.env` to keep credentials out of source code.

---

## How It Works

- **Native HTTP Routing**: Custom URL parsing and method dispatching without third-party frameworks.
- **Password Hashing**: Hashes passwords with `bcryptjs` (salt rounds: 10) during signup and updates.
- **Token Generation**: Signs JWTs with `jsonwebtoken` containing `{ userId, role }` and a 24-hour expiration upon successful login.
- **Authentication Middleware (`authenticateToken`)**:
  - Extracts Bearer token from `Authorization` header.
  - Returns `401 Unauthorized` if token is missing, malformed, invalid, or expired.
- **Authorization Middleware (`authorizeRole`)**:
  - Checks user's role against allowed roles for the route.
  - Returns `403 Forbidden` if role is unauthorized.
- **Persistence**: Reads and writes user records asynchronously to `sampleData.json`.

---

## File Structure

```text
Question 6/
├── .env                          # Environment variables (JWT_SECRET) - excluded from git
├── .gitignore                    # Git ignore file (node_modules, .env)
├── package.json                  # Dependencies and run scripts
├── package-lock.json             # Locked dependency versions
├── index.js                      # HTTP server, routing, and endpoint handlers
├── storage.js                    # File storage CRUD logic, password hashing, token generation
├── sampleData.json               # JSON database file storing user records
├── api-testing.http              # HTTP request suite for manual and edge-case testing
├── middlewares/
│   ├── authenticateToken.js      # Verifies Bearer JWT signature and expiration
│   └── authorizeRole.js          # Validates user role against allowed route roles
└── utils/
    ├── checkContentType.js       # Enforces application/json Content-Type header
    ├── helpers.js                # UUID validator, error checkers, data sanitizers
    ├── sendJson.js               # Helper to format and send JSON responses
    ├── validateBodyForLogin.js   # Validates payload structure for login requests
    └── validateBodyForSignup.js  # Validates payload structure for signup requests
```

---

## Setup Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   JWT_SECRET=your_jwt_secret_key_here
   ```
3. **Start the Server**:
   ```bash
   npm start
   ```
   Server starts listening at `http://localhost:8080`.

---

## API Endpoints & Role Permissions

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check |
| `POST` | `/users/login` | Public | Authenticate credentials and obtain JWT |
| `GET` | `/users` | `admin`, `user` | List all users (passwords omitted) |
| `GET` | `/users/:id` | `admin`, `user` | Get a specific user by UUID |
| `POST` | `/users/signup` | `admin` | Create a new user (default role: `user`) |
| `PATCH` | `/users/:id` | `admin` | Update user details by UUID |
| `DELETE` | `/users/:id` | `admin` | Delete a user by UUID |

---

## How to Test and Use

### Using REST Client (`api-testing.http`)
- Open `api-testing.http` in VS Code with the **REST Client** extension.
- Update `@userId` and login credentials with an ID from `sampleData.json`.
- Execute `POST /users/login` to obtain the token.
- Paste the token into `@userToken` or `@adminToken`.
- Run requests sequentially to test authorized access, 403 forbidden checks, and validation errors.

---

## Conclusion & Results

- **JWT Authentication Verified**: Successfully generates 24-hour signed tokens on valid login and blocks unauthenticated requests with `401 Unauthorized`.
- **Role-Based Access Control (RBAC) Enforced**: Restricted routes (`POST /users/signup`, `PATCH`, `DELETE`) are accessible exclusively to `admin`; unauthorized attempts by `user` return `403 Forbidden`.
- **Token Resilience**: Missing, malformed, expired, and altered tokens are intercepted and rejected.
- **Data Security Achieved**: Passwords are encrypted via `bcryptjs`, credentials are excluded from source code via `.env`, and password hashes are stripped from API outputs.
- **Robust Error Handling**: Handles malformed JSON (`400`), unsupported media types (`415`), invalid IDs (`400`), missing users (`404`), and invalid HTTP verbs (`405`).
- **Final Outcome**: Satisfies all requirements for a secure, framework-free Node.js API with token-based authentication and role-based authorization.

