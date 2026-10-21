require("dotenv").config();

const http = require("http");
const {
    verifyCredentials,
    createSession,
    getSession,
    deleteSession,
} = require("./auth.js");
const PORT = 8080;

function sendJson(res, statusCode, data, headers = {}) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        ...headers,
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    // POST /login
    if (pathname === "/login") {
        if (req.method !== "POST") {
            return sendJson(
                res,
                405,
                { error: "Method Not Allowed" },
                { Allow: "POST" },
            );
        }

        const contentType = req.headers["content-type"] || "";

        if (!contentType.includes("application/json")) {
            return sendJson(res, 415, {
                error: "Content-Type must be application/json",
            });
        }

        let str = "";

        req.on("data", (chunk) => {
            str += chunk;
        });

        req.on("end", () => {
            let body;

            try {
                body = JSON.parse(str);
            } catch (err) {
                return sendJson(res, 400, {
                    error: "Invalid JSON body",
                });
            }

            if (
                !body ||
                typeof body !== "object" ||
                Array.isArray(body) ||
                typeof body.username !== "string" ||
                typeof body.password !== "string" ||
                !body.username.trim() ||
                !body.password
            ) {
                return sendJson(res, 400, {
                    error: "Username and password are required",
                });
            }

            const user = verifyCredentials(body.username, body.password);

            if (!user) {
                return sendJson(res, 401, {
                    error: "Invalid username or password",
                });
            }

            // Create a session for the authenticated user.
            const { sessionId, session } = createSession(user);

            const remainingSeconds = Math.max(
                0,
                Math.floor((session.expiresAt - Date.now()) / 1000),
            );

            // Send the session ID as an HttpOnly cookie.
            return sendJson(
                res,
                200,
                {
                    message: "Login successful",
                    user: session.user,
                    expiresIn: remainingSeconds,
                },
                {
                    "Set-Cookie": `sid=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${remainingSeconds}`,
                },
            );
        });

        req.on("error", (err) => {
            console.error("Request error:", err);

            if (!res.writableEnded) {
                sendJson(res, 400, {
                    error: "Error reading request body",
                });
            }
        });

        return;
    }

    // GET /profile - Protected route
    if (pathname === "/profile") {
        if (req.method !== "GET") {
            return sendJson(
                res,
                405,
                { error: "Method Not Allowed" },
                { Allow: "GET" },
            );
        }

        // Read the Cookie header.
        const cookieHeader = req.headers.cookie || "";

        // Find the sid cookie.
        const sessionCookie = cookieHeader
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("sid="));

        console.log("Incoming Cookie header:", req.headers.cookie);

        if (!sessionCookie) {
            return sendJson(res, 401, {
                error: "Authentication required",
            });
        }

        const sessionId = sessionCookie.slice(4);

        // Verify the session.
        const session = getSession(sessionId);

        if (!session) {
            return sendJson(res, 401, {
                error: "Invalid or expired session",
            });
        }

        // Return the authenticated user's profile.
        return sendJson(res, 200, {
            message: "Profile retrieved successfully",
            user: session.user,
        });
    }

    // POST /logout - Destroy the current session
    if (pathname === "/logout") {
        if (req.method !== "POST") {
            return sendJson(
                res,
                405,
                { error: "Method Not Allowed" },
                { Allow: "POST" },
            );
        }

        const cookieHeader = req.headers.cookie || "";

        const sessionCookie = cookieHeader
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("sid="));

        if (sessionCookie) {
            const sessionId = sessionCookie.slice(4);

            // Delete the session from server-side storage.
            deleteSession(sessionId);
        }

        // Expire the cookie in the client.
        return sendJson(
            res,
            200,
            { message: "Logout successful" },
            {
                "Set-Cookie":
                    "sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
            },
        );
    }

    // Unknown route.
    return sendJson(res, 404, {
        error: "Route Not Found",
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
