
# Node.js HTTP Server

A simple HTTP server built using Node.js's built-in `http` module. It handles GET and POST requests, validates JSON input, and returns appropriate HTTP status codes.

## Features

- Handles HTTP requests on port `8080`.
- `GET /` — Returns a welcome message.
- `GET /users` — Reads and returns user data from `sampleData.json`.
- `GET /health` — Checks server health.
- Returns `404 Not Found` for unknown routes.
- Handles `POST /users` with JSON content-type validation.
- Validates user input (`name` and `age`).
- Handles malformed JSON and invalid request data.
- Returns `405 Method Not Allowed` for unsupported HTTP methods.
- Returns appropriate error responses for failed requests.

## Project Structure

- `index.js` — HTTP server and request handling.
- `sampleData.json` — Stores the initial user data.
- `api-testing.http` — Contains API test requests for VS Code REST Client.

## How to Run

1. Clone the repository and navigate to the project directory.
2. Start the server:

   ```bash
   node index.js
   ```

3. The server will listen at `http://localhost:8080`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Welcome message |
| GET | `/users` | Retrieve users |
| GET | `/health` | Check server health |
| POST | `/users` | Validate and accept user data |

## Error Handling

- `400 Bad Request` — Invalid JSON or invalid user data.
- `404 Not Found` — Unknown route.
- `405 Method Not Allowed` — Unsupported HTTP method.
- `415 Unsupported Media Type` — Missing or unsupported content type.
- `500 Internal Server Error` — Failed file read.

## Testing

- Open `api-testing.http` in VS Code.
- Click **Send Request** above each request.
- Verify the HTTP status code and response body.

## Key Learnings

- Creating an HTTP server using Node.js.
- Handling routes and HTTP methods.
- Reading request headers and body streams.
- Parsing and validating JSON data.
- Using HTTP status codes and handling errors.
- Testing APIs with the REST Client extension.
