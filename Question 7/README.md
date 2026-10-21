
# Question 07: Session-Based Authentication vs. JWT

## Overview
- Demonstrates session-based authentication using Node.js's built-in `http` module.
- Explains the differences between session-based authentication and JWT-based authentication.
- Implements login, a protected profile route, and logout.

## Features
- **Login (`POST /login`):** Verifies user credentials and creates a server-side session.
- **Protected Route (`GET /profile`):** Allows access only when a valid, unexpired session exists.
- **Logout (`POST /logout`):** Deletes the server-side session and expires the session cookie.
- **Session Expiration:** Sessions expire after the configured duration.
- **Error Handling:** Handles invalid credentials, malformed JSON, missing sessions, and invalid or expired sessions.
- **Cookie Security:** Uses `HttpOnly` and `SameSite=Strict` cookie attributes.

## Session-Based Authentication vs. JWT

- **Identity Verification:** Sessions use a session ID linked to server-side session data, while JWTs use a digitally signed token whose signature and claims are verified.
- **Storage:** Sessions require server-side session storage. JWT authentication can verify tokens without storing each token on the server.
- **Logout:** Sessions can be invalidated by deleting the stored session. A JWT generally remains valid until expiration unless a revocation mechanism is implemented.
- **Expiration:** Sessions use a server-side expiration time, while JWTs commonly use the `exp` claim.
- **Scalability:** Sessions require shared storage when multiple server instances need access to the same sessions. JWTs can simplify distributed token verification.
- **Security:** Session IDs and JWTs must be protected against theft. JWT implementations must also securely manage signing keys and validate tokens correctly.

## Security Considerations
- The demo uses hardcoded credentials for learning purposes; production applications should store password hashes rather than plaintext passwords.
- The session store uses an in-memory `Map`, so sessions are lost when the server restarts.
- The `.env` file stores configuration and must not be committed to version control.
- `HttpOnly` prevents client-side JavaScript from directly reading the session cookie.
- `SameSite=Strict` helps mitigate certain cross-site request forgery (CSRF) attacks.
- Production applications should use HTTPS, secure cookie settings, and an appropriate persistent session store.

## Testing
- Start the server using `node server.js`.
- Use `test.http` with the VS Code REST Client extension.
- Test login with valid and invalid credentials.
- Access `/profile` without a session and with a valid session.
- Log out and verify that the old session ID can no longer access `/profile`.
- Test malformed JSON and unsupported HTTP methods.

## Conclusion
- Implemented a working session-based login, protected route, and logout flow.
- Demonstrated server-side session creation, validation, expiration, and deletion.
- Compared session-based authentication with JWT authentication, including storage, logout behavior, expiration, scalability, and security.
