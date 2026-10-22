const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const PORT = 8080;
const BASE = `http://localhost:${PORT}`;
const SECRET =
    process.env.JWT_SECRET ||
    "1fedca63d8874f09f2aeb78cf134bc29e5303695fa734d3e4e8ed9dd29ba8d60";

const adminToken = jwt.sign(
    { userId: "57e8a943-cd4a-476e-ad09-644cdbb37612", role: "admin" },
    SECRET,
);
const userToken = jwt.sign(
    { userId: "865c54aa-f02b-4ea8-a7b9-07d31e65f792", role: "user" },
    SECRET,
);

function makeRequest({ method = "GET", path, headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
        const req = http.request(BASE + path, { method, headers }, (res) => {
            let data = "";
            res.on("data", (c) => (data += c));
            res.on("end", () =>
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data,
                }),
            );
        });
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
}

async function runTests() {
    console.log("=== Running Failure Scenario Tests ===");
    let passed = 0;
    let failed = 0;

    const tests = [
        {
            name: "1. Health check (200 OK)",
            fn: () => makeRequest({ path: "/health" }),
            expectStatus: 200,
        },
        {
            name: "2. Missing token (401 Unauthorized)",
            fn: () => makeRequest({ path: "/users" }),
            expectStatus: 401,
        },
        {
            name: "3. Invalid token (401 Unauthorized)",
            fn: () =>
                makeRequest({
                    path: "/users",
                    headers: { Authorization: "Bearer bad.token" },
                }),
            expectStatus: 401,
        },
        {
            name: "4. Forbidden role - user attempting admin PATCH (403 Forbidden)",
            fn: () =>
                makeRequest({
                    method: "PATCH",
                    path: "/users/57e8a943-cd4a-476e-ad09-644cdbb37612",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: "Hacked" }),
                }),
            expectStatus: 403,
        },
        {
            name: "5. Invalid UUID parameter format (400 Bad Request)",
            fn: () =>
                makeRequest({
                    path: "/users/not-a-uuid",
                    headers: { Authorization: `Bearer ${adminToken}` },
                }),
            expectStatus: 400,
        },
        {
            name: "6. Missing resource - nonexistent UUID (404 Not Found)",
            fn: () =>
                makeRequest({
                    path: "/users/00000000-0000-4000-8000-000000000000",
                    headers: { Authorization: `Bearer ${adminToken}` },
                }),
            expectStatus: 404,
        },
        {
            name: "7. Missing resource - unknown URL route (404 Not Found)",
            fn: () => makeRequest({ path: "/unknown-endpoint" }),
            expectStatus: 404,
        },
        {
            name: "8. Unsupported HTTP method on /users/login (405 Method Not Allowed)",
            fn: () => makeRequest({ path: "/users/login" }),
            expectStatus: 405,
        },
        {
            name: "9. Unsupported HTTP method on /users (405 Method Not Allowed)",
            fn: () =>
                makeRequest({
                    method: "PUT",
                    path: "/users",
                    headers: { Authorization: `Bearer ${adminToken}` },
                }),
            expectStatus: 405,
        },
        {
            name: "10. Unsupported media type (415 Unsupported Media Type)",
            fn: () =>
                makeRequest({
                    method: "POST",
                    path: "/users/login",
                    headers: { "Content-Type": "text/plain" },
                    body: "hello",
                }),
            expectStatus: 415,
        },
        {
            name: "11. Malformed JSON body (400 Bad Request)",
            fn: () =>
                makeRequest({
                    method: "POST",
                    path: "/users/login",
                    headers: { "Content-Type": "application/json" },
                    body: '{"id": ',
                }),
            expectStatus: 400,
        },
        {
            name: "12. PATCH with empty body (400 Bad Request)",
            fn: () =>
                makeRequest({
                    method: "PATCH",
                    path: "/users/57e8a943-cd4a-476e-ad09-644cdbb37612",
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        "Content-Type": "application/json",
                    },
                    body: "{}",
                }),
            expectStatus: 400,
        },
        {
            name: "13. PATCH with disallowed field (400 Bad Request)",
            fn: () =>
                makeRequest({
                    method: "PATCH",
                    path: "/users/57e8a943-cd4a-476e-ad09-644cdbb37612",
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ role: "superadmin" }),
                }),
            expectStatus: 400,
        },
        {
            name: "14. Oversized body > 1 MiB (413 Payload Too Large)",
            fn: () =>
                makeRequest({
                    method: "POST",
                    path: "/users/login",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "A".repeat(1024 * 1024 + 50),
                        password: "123",
                    }),
                }),
            expectStatus: 413,
        },
    ];

    for (const t of tests) {
        try {
            const res = await t.fn();
            if (res.status === t.expectStatus) {
                console.log(`[PASS] ${t.name} -> got ${res.status}`);
                passed++;
            } else {
                console.error(
                    `[FAIL] ${t.name} -> expected ${t.expectStatus}, got ${res.status}`,
                );
                failed++;
            }
        } catch (err) {
            console.error(`[ERROR] ${t.name} -> ${err.message}`);
            failed++;
        }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

// Start server if not running, then test
require("./server.js");
setTimeout(runTests, 300);
