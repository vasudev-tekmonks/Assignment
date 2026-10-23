const {
    getRecords,
    getRecordById,
    createRecord,
    generateToken,
    updateRecord,
    deleteRecord,
} = require("./storage.js");

require("dotenv").config();
const crypto = require("crypto");

// Import helper functions
const {
    validateContentType,
    readRequestBody,
    validateBodyForSignup,
    validateBodyForLogin,
    validateBodyForUpdate,
} = require("./utils/validation.js");
const { isValidId, publicUser } = require("./utils/helpers.js");
const {
    sendJson,
    sendError,
    handleRouteError,
} = require("./utils/response.js");
const { requestLogger, errorLogger } = require("./utils/logger.js");
const { authenticateToken, authorizeRole } = require("./utils/auth.js");

const http = require("http");
const PORT = 8080;

const server = http.createServer(async (req, res) => {
    req.requestId = crypto.randomUUID();
    res.setHeader("X-Request-Id", req.requestId);
    requestLogger(req, res);
    try {
        const { method, url } = req;

        let parsedUrl;
        // Parse the URL so we can reliably access its pathname and query parameters.
        try {
            parsedUrl = new URL(url, `http://localhost:${PORT}`);
        } catch {
            return sendError(res, 400, "Malformed request URL.");
        }
        const segments = parsedUrl.pathname.split("/"); // Split the pathname into segments using "/", example: "/users/123" becomes ["", "users", "123"].

        const isUsersRoute = parsedUrl.pathname === "/users"; // Identify the collection route: /users.
        const isUserIdRoute =
            segments.length === 3 &&
            segments[1] === "users" &&
            segments[2] !== "" &&
            segments[2] !== "login" &&
            segments[2] !== "signup";
        const isSignupRoute =
            segments.length === 3 &&
            segments[1] === "users" &&
            segments[2] === "signup";
        const isLoginRoute =
            segments.length === 3 &&
            segments[1] === "users" &&
            segments[2] === "login";

        // GET /health
        if (method === "GET" && parsedUrl.pathname === "/health") {
            return sendJson(res, 200, { status: "OK" });
        }

        // GET /users
        if (method === "GET" && isUsersRoute) {
            const verifiedUserCredentials = authenticateToken(req, res);

            if (!verifiedUserCredentials) return; // Check if the token is valid and credentials are verified
            if (
                !authorizeRole(req, res, verifiedUserCredentials, [
                    "admin",
                    "user",
                ]) // Check if this role is permitted to access this route or not, "[]" specifies the allowed roles
            ) {
                return;
            }

            try {
                const records = await getRecords();
                return sendJson(res, 200, records.map(publicUser));
            } catch (err) {
                return handleRouteError(req, res, err, "GET_USERS_FAILED");
            }
        }

        // GET /users/:id
        if (method === "GET" && isUserIdRoute) {
            const verifiedUserCredentials = authenticateToken(req, res);

            if (!verifiedUserCredentials) return;
            if (
                !authorizeRole(req, res, verifiedUserCredentials, [
                    "admin",
                    "user",
                ])
            ) {
                return;
            }

            const userId = segments[2];

            if (!isValidId(userId)) {
                return sendError(res, 400, "Invalid user ID format.");
            }

            try {
                const record = await getRecordById(userId);
                return sendJson(res, 200, publicUser(record));
            } catch (err) {
                return handleRouteError(req, res, err, "GET_USER_FAILED");
            }
        }

        // POST /users/signup
        if (method === "POST" && isSignupRoute) {
            const verifiedUserCredentials = authenticateToken(req, res);

            if (!verifiedUserCredentials) return;
            if (!authorizeRole(req, res, verifiedUserCredentials, ["admin"])) {
                return;
            }

            // Ensure that the client is sending JSON.
            if (!validateContentType(req, res)) {
                return;
            }

            try {
                const str = await readRequestBody(req);

                const body = validateBodyForSignup(str, res);

                if (body === null) {
                    return;
                }

                const record = await createRecord(body);

                return sendJson(res, 201, {
                    status: "User created successfully.",
                    record: publicUser(record),
                });
            } catch (err) {
                return handleRouteError(
                    req,
                    res,
                    err,
                    "SIGNUP_OPERATION_FAILED",
                );
            }
        }

        // POST /users/login
        if (method === "POST" && isLoginRoute) {
            // Ensure that the client is sending JSON.
            if (!validateContentType(req, res)) {
                return;
            }

            try {
                const str = await readRequestBody(req);

                const body = validateBodyForLogin(str, res);

                if (body === null) {
                    return;
                }

                const token = await generateToken(body);

                return sendJson(res, 200, {
                    status: "Token created successfully.",
                    token,
                });
            } catch (err) {
                return handleRouteError(
                    req,
                    res,
                    err,
                    "LOGIN_OPERATION_FAILED",
                );
            }
        }

        // PATCH /users/:id
        if (method === "PATCH" && isUserIdRoute) {
            const verifiedUserCredentials = authenticateToken(req, res);

            if (!verifiedUserCredentials) return;
            if (!authorizeRole(req, res, verifiedUserCredentials, ["admin"])) {
                return;
            }

            const userId = segments[2];

            if (!isValidId(userId)) {
                return sendError(res, 400, "Invalid user ID format.");
            }

            if (!validateContentType(req, res)) {
                return;
            }

            try {
                const str = await readRequestBody(req);

                const body = validateBodyForUpdate(str, res);

                if (body === null) {
                    return;
                }

                const record = await updateRecord(userId, body);

                return sendJson(res, 200, {
                    status: "User updated successfully.",
                    record: publicUser(record),
                });
            } catch (err) {
                return handleRouteError(
                    req,
                    res,
                    err,
                    "USER_UPDATE_OPERATION_FAILED",
                );
            }
        }

        // DELETE /users/:id
        if (method === "DELETE" && isUserIdRoute) {
            const verifiedUserCredentials = authenticateToken(req, res);

            if (!verifiedUserCredentials) return;
            if (!authorizeRole(req, res, verifiedUserCredentials, ["admin"])) {
                return;
            }

            const userId = segments[2];

            if (!isValidId(userId)) {
                return sendError(res, 400, "Invalid user ID format.");
            }

            try {
                const record = await deleteRecord(userId);

                return sendJson(res, 200, {
                    status: "User deleted successfully.",
                    record: publicUser(record),
                });
            } catch (err) {
                return handleRouteError(req, res, err, "USER_DELETE_FAILED");
            }
        }

        // Known route, wrong method
        if (parsedUrl.pathname === "/health") {
            res.setHeader("Allow", "GET");
            return sendError(
                res,
                405,
                "This HTTP method is not supported for this route.",
            );
        }

        // Signup and login support POST only.
        if (isSignupRoute || isLoginRoute) {
            res.setHeader("Allow", "POST");

            return sendError(
                res,
                405,
                "This HTTP method is not supported for this route.",
            );
        }

        if (isUsersRoute || isUserIdRoute) {
            res.setHeader("Allow", isUsersRoute ? "GET, POST" : "GET, PATCH, DELETE");

            return sendError(
                res,
                405,
                "This HTTP method is not supported for this route.",
            );
        }

        // Unknown route
        return sendError(res, 404, "URL not found.");
    } catch (err) {
        errorLogger(req, "UNHANDLED_REQUEST_ERROR", 500);

        if (!res.headersSent && !res.destroyed) {
            return sendError(res, 500, "An unexpected server error occurred.");
        }

        if (!res.destroyed) {
            res.destroy();
        }
    }
});

server.on("error", () => {
    console.error("HTTP server failed to start or encountered an error.");
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
