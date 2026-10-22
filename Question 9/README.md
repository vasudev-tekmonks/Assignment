
# Question 09: Nginx Configuration and Reverse Proxy

## 1. Objective

Configure Nginx to serve static files and act as a reverse proxy for a Node.js API server.

The objectives are:
- Serve static files from a designated directory using Nginx.
- Run a Node.js server on a separate port.
- Forward API requests from Nginx to the Node.js server.
- Forward relevant HTTP request headers to the backend.
- Verify static-file and API requests.
- Understand the difference between static-file serving and reverse proxying.

## 2. Project Architecture

The project uses two separate servers:

- Nginx listens on port `80`.
- Node.js listens on port `8080`.
- Static files are stored in the `public` directory.
- API requests are forwarded by Nginx to Node.js.

### Request flow

**Static-file request:**

Client → Nginx (port 80) → Static file → Client

**API request:**

Client → Nginx (port 80) → Node.js (port 8080) → Nginx → Client

Example URLs:

- Static page: `http://localhost/`
- Health API: `http://localhost/health`
- Users API: `http://localhost/users`

## 4. Directory Structure

The relevant project structure is:

```text
Question 9/
├── public/
│   └── index.html
├── server.js
├── storage.js
├── sampleData.json
├── test.http
└── utils/
    ├── checkContentType.js
    └── validateBody.js
```

The Nginx configuration is stored separately at:

```text
/etc/nginx/sites-available/question-09
```

The enabled configuration is linked from:

```text
/etc/nginx/sites-enabled/question-09
```

## 5. Node.js Server

The existing Node.js application runs on port `8080`.

Start the server from the project directory:

```bash
node server.js
```

The server provides these API endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Checks server health |
| GET | `/users` | Retrieves all users |
| GET | `/users/:id` | Retrieves a user by ID |
| POST | `/users` | Creates a user |
| PATCH | `/users/:id` | Updates a user |
| DELETE | `/users/:id` | Deletes a user |

The Node.js server handles API logic, while Nginx handles incoming client requests and static files.

## 6. Nginx Configuration

The configuration file is:

```bash
sudo nano /etc/nginx/sites-available/question-09
```

The configuration used is:

```nginx
server {
    listen 80;
    server_name localhost;

    root "/home/deep/Assignment/Question 9/public";
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /users {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Note:** The `root` directive uses the absolute path of the project's `public` directory. Update it if the project is stored elsewhere.

## 8. Enable the Nginx Configuration

Create a symbolic link to enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/question-09 /etc/nginx/sites-enabled/question-09
```

If the link already exists, do not create it again.

If the default Nginx site conflicts with this configuration, disable the default site:

```bash
sudo unlink /etc/nginx/sites-enabled/default
```

Test the configuration for syntax errors:

```bash
sudo nginx -t
```

If the test succeeds, reload Nginx:

```bash
sudo systemctl reload nginx
```

Check the service status:

```bash
sudo systemctl status nginx
```

## 9. Static-File Permission Configuration

Nginx needs permission to traverse parent directories and read the requested static files.

In this setup, the home directory initially prevented Nginx from accessing the static page. The following command was used:

```bash
sudo chmod o+x /home/deep
```

This grants other users execute/traverse permission on the home directory without granting directory-listing permission.

## 10. Testing

Keep the Node.js server running in one terminal. Run the following tests in another terminal.

### Test 1: Static file

Test through the test.http REST Client file or by running the following commands in the terminal.

```bash
curl -i http://localhost/index.html
```

Expected result:
- HTTP status `200 OK`.
- HTML content from `public/index.html`.

### Test 2: Default index page

```bash
curl -i http://localhost/
```

Expected result:
- HTTP status `200 OK`.
- Nginx serves `index.html` automatically.

### Test 3: Health API through Nginx

```bash
curl -i http://localhost/health
```

Expected result:
- HTTP status `200 OK`.
- JSON response from Node.js, such as `{"status":"OK"}`.

### Test 4: Users API through Nginx

```bash
curl -i http://localhost/users
```

Expected result:
- HTTP status `200 OK`.
- JSON containing the users returned by the Node.js application.

### Test 5: Missing static file

```bash
curl -i http://localhost/missing.html
```

Expected result:
- HTTP status `404 Not Found`.

### Test 6: Test Node.js directly

```bash
curl -i http://127.0.0.1:8080/health
```

Expected result:
- HTTP status `200 OK`.
- JSON response from Node.js.

This test confirms that the backend is accessible independently of Nginx.

## 11. Static-File Serving vs. Reverse Proxying

| Static-file serving | Reverse proxying |
|---|---|
| Nginx reads files directly from disk. | Nginx forwards requests to another server. |
| Used for HTML, CSS, JavaScript, and images. | Used for APIs and backend applications. |
| Does not require Node.js to process the file request. | Requires the backend to process the forwarded request. |
| `root` and `try_files` are relevant directives. | `proxy_pass` and `proxy_set_header` are relevant directives. |

## 12. Advantages of Using Nginx

- Serves static files efficiently.
- Separates frontend file serving from backend API processing.
- Provides a single public entry point for client requests.
- Keeps the Node.js application on a separate port.
- Can forward client and protocol information through HTTP headers.
- Supports additional capabilities such as TLS termination, caching, and load balancing.
