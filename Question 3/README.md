
# HTTP Server and Request Routing

## Description
- Built an HTTP server using Node.js's built-in `http` module.
- Implemented multiple GET routes with appropriate HTTP status codes.
- Returned JSON responses with the correct `Content-Type` header.
- Used a JSON file to store and serve user data.

## Routes
- `GET /` - Returns a welcome message.
- `GET /users` - Reads and returns user data from `sampleData.json`.
- `GET /health` - Checks whether the server is running.
- Unknown routes - Returns a `404 Not Found` response.
- Non-GET methods - Returns a `405 Method Not Allowed` response.
- File reading errors - Returns a `500 Internal Server Error` response.

## Project Files
- `server.js` - Creates the HTTP server and handles request routing.
- `sampleData.json` - Stores the user data returned by the `/users` route.
- `api-testing.http` - Contains HTTP requests for testing the API using the REST Client extension in VS Code.

## How to Run
1. Make sure Node.js is installed.
2. Open the project folder in your terminal.
3. Run the server:

   ```bash
   node server.js
   ```

4. The server will start on port `8080`.
5. Open `api-testing.http` in VS Code and click **Send Request** above each request to test the routes.

## Testing
- Test the `/` route to verify the welcome response.
- Test `/users` to retrieve the user data.
- Test `/health` to check the server's health.
- Test an invalid route to verify the `404` response.
- Test POST and DELETE requests to verify the `405` response.

## Key Takeaways
- Learned how to create an HTTP server using Node.js.
- Practiced handling requests based on HTTP methods and URL paths.
- Understood HTTP status codes such as `200`, `404`, `405`, and `500`.
- Learned how to return JSON responses and set response headers.
- Practiced reading JSON data asynchronously using `fs.readFile()`.
- Tested API endpoints using the VS Code REST Client extension.
