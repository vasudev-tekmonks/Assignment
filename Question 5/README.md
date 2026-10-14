
# Node.js REST API - User Management

A REST API built using Node.js's built-in HTTP module to perform CRUD (Create, Read, Update, Delete) operations on user records. The project uses a JSON file for persistent storage and includes request validation and HTTP error handling.

## Features

- Built-in Node.js HTTP server without Express.js.
- CRUD operations for user records.
- Asynchronous file operations using `fs/promises`.
- JSON file-based data persistence.
- UUID v4 generation for unique user IDs.
- Request body parsing and validation.
- Content-Type validation for JSON requests.
- Appropriate HTTP status codes and error responses.
- Health-check endpoint.
- Modular code structure using CommonJS modules.

## Project Files

- **server.js** — Creates the HTTP server, handles routes, and sends JSON responses.
- **storage.js** — Implements CRUD operations and manages user records in the JSON file.
- **sampleData.json** — Stores user records persistently.
- **api-testing.http** - Contains HTTP requests for testing the API using the REST Client extension in VS Code.
- **utils/checkContentType.js** — Validates the request's Content-Type header.
- **utils/validateBody.js** — Parses and validates user data received in POST requests.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <project-directory>
   ```

3. Start the server:

   ```bash
   node server.js
   ```

4. The server will start on port `8080`.

   ```text
   Server is listening on port 8080
   ```

No external npm packages are required by the files provided.

## API Endpoints

Base URL: `http://localhost:8080`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks server responsiveness |
| GET | `/users` | Retrieves all users |
| GET | `/users/:id` | Retrieves a user by ID |
| POST | `/users` | Creates a new user |
| PATCH | `/users/:id` | Partially updates a user |
| DELETE | `/users/:id` | Deletes a user by ID |


## Testing the API

### Using curl

Check the server health:

```bash
curl http://localhost:8080/health
```

Retrieve all users:

```bash
curl http://localhost:8080/users
```

Create a user:

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Vasudev","age":21}'
```

Retrieve a specific user:

```bash
curl http://localhost:8080/users/<user-id>
```

Update a user:

```bash
curl -X PATCH http://localhost:8080/users/<user-id> \
  -H "Content-Type: application/json" \
  -d '{"age":22}'
```

Delete a user:

```bash
curl -X DELETE http://localhost:8080/users/<user-id>
```

Replace `<user-id>` with a valid ID returned by the API.

## Data Storage

User records are stored in `sampleData.json`.

- Records are read asynchronously using `fs.readFile()`.
- Changes are persisted using `fs.writeFile()`.
- Each new user receives a unique UUID v4 ID.
- If the data file does not exist, the storage module treats the collection as empty.
- JSON parsing errors are detected and reported by the storage module.

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Invalid request or data |
| `404` | Resource or route not found |
| `405` | HTTP method not supported |
| `415` | Unsupported media type |
| `500` | Internal server error |

Unexpected server-side errors are logged to the console, while clients receive JSON error responses.

## Concepts Practiced

- Creating an HTTP server with Node.js.
- Routing requests using HTTP methods and URL paths.
- Parsing URL paths and extracting route parameters.
- Handling asynchronous request bodies and streams.
- Using Promises and `async/await`.
- Implementing CRUD operations.
- Reading and writing JSON files.
- Generating UUIDs using the Crypto module.
- Validating request headers and request bodies.
- Handling errors and returning appropriate HTTP status codes.
- Organizing an application into reusable modules.

