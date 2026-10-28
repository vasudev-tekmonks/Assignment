const {
    getRecords,
    getRecordById,
    createRecord,
    generateToken,
    updateRecord,
    deleteRecord,
} = require("./storage.js");

require("dotenv").config();

// Import helper functions
const {
    validateContentType,
    validateBodyForSignup,
    validateBodyForLogin,
} = require("./utils/validate.js");
const {
    isValidId,
    isNotFoundError,
    isInvalidDataError,
    publicUser,
    sendJson,
} = require("./utils/helpers.js");
const { validateToken, authorizeRole } = require("./utils/auth.js");

const http = require("http");
const PORT = 8080;

const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    const parsedUrl = new URL(url, `http://localhost:${PORT}`); // Parse the URL so we can reliably access its pathname and query parameters.
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
        const verifiedUserCredentials = validateToken(req, res);

        if (!verifiedUserCredentials) return; // Check if the token is valid and credentials are verified
        if (
            !authorizeRole(req, res, verifiedUserCredentials, ["admin", "user"]) // Check if this role is permitted to access this route or not, "[]" specifies the allowed roles
        ) {
            return;
        }

        try {
            const records = await getRecords();
            return sendJson(res, 200, records.map(publicUser));
        } catch (err) {
            console.error(err);
            return sendJson(res, 500, {
                status: "Internal Server Error",
                message: "Unable to retrieve users.",
            });
        }
    }

    // GET /users/:id
    if (method === "GET" && isUserIdRoute) {
        const verifiedUserCredentials = validateToken(req, res);

        if (!verifiedUserCredentials) return;
        if (
            !authorizeRole(req, res, verifiedUserCredentials, ["admin", "user"])
        ) {
            return;
        }

        const userId = segments[2];

        if (!isValidId(userId)) {
            return sendJson(res, 400, {
                status: "Bad Request",
                message: "Invalid user ID format.",
            });
        }

        try {
            const record = await getRecordById(userId);
            return sendJson(res, 200, publicUser(record));
        } catch (err) {
            if (isNotFoundError(err)) {
                return sendJson(res, 404, {
                    status: "Not Found",
                    message: "User does not exist.",
                });
            }

            console.error(err);
            return sendJson(res, 500, {
                status: "Internal Server Error",
                message: "Unable to retrieve user.",
            });
        }
    }

    // POST /users/signup
    if (method === "POST" && isSignupRoute) {
        const verifiedUserCredentials = validateToken(req, res);

        if (!verifiedUserCredentials) return;
        if (!authorizeRole(req, res, verifiedUserCredentials, ["admin"])) {
            return;
        }

        // Ensure that the client is sending JSON.
        if (!validateContentType(req, res)) {
            return;
        }

        // Request bodies arrive as a stream of chunks, Collect the chunks until the complete body has arrived.
        let str = "";

        req.on("data", (chunk) => {
            str += chunk;
        });

        // The end event fires after the complete request body is received.
        req.on("end", async () => {
            // Validate and parse the request body.
            const body = validateBodyForSignup(str, res);

            if (body === null) {
                return;
            }

            try {
                const record = await createRecord(body);

                return sendJson(res, 201, {
                    status: "User created successfully.",
                    record: publicUser(record),
                });
            } catch (err) {
                console.error(err);
                return sendJson(res, 500, {
                    status: "Internal Server Error",
                    message: "Unable to create user.",
                });
            }
        });

        req.on("error", (err) => {
            console.error(err);

            if (!res.writableEnded) {
                sendJson(res, 400, {
                    status: "Bad Request",
                    message: "Error reading request body.",
                });
            }
        });

        return;
    }

    // POST /users/login
    if (method === "POST" && isLoginRoute) {
        // Ensure that the client is sending JSON.
        if (!validateContentType(req, res)) {
            return;
        }

        // Request bodies arrive as a stream of chunks, Collect the chunks until the complete body has arrived.
        let str = "";

        req.on("data", (chunk) => {
            str += chunk;
        });

        // The end event fires after the complete request body is received.
        req.on("end", async () => {
            // Validate and parse the request body.
            const body = validateBodyForLogin(str, res);

            if (body === null) {
                return;
            }

            if (!isValidId(body.id)) {
                return sendJson(res, 400, {
                    status: "Bad Request",
                    message: "Invalid user ID format.",
                });
            }

            try {
                const token = await generateToken(body); //JWT Token is generated on first login

                return sendJson(res, 200, {
                    status: "Token created successfully.",
                    token,
                });
            } catch (err) {
                if (
                    err.code === "USER_NOT_FOUND" ||
                    err.code === "INCORRECT_PASSWORD"
                ) {
                    return sendJson(res, 401, {
                        status: "Unauthorized",
                        message: "Invalid user ID or password.",
                    });
                }

                console.error(err);

                return sendJson(res, 500, {
                    status: "Internal Server Error",
                    message: "Unable to create token.",
                });
            }
        });

        req.on("error", (err) => {
            console.error(err);

            if (!res.writableEnded) {
                sendJson(res, 400, {
                    status: "Bad Request",
                    message: "Error reading request body.",
                });
            }
        });

        return;
    }

    // PATCH /users/:id
    if (method === "PATCH" && isUserIdRoute) {
        const verifiedUserCredentials = validateToken(req, res);

        if (!verifiedUserCredentials) return;
        if (!authorizeRole(req, res, verifiedUserCredentials, ["admin"])) {
            return;
        }

        const userId = segments[2];

        if (!isValidId(userId)) {
            return sendJson(res, 400, {
                status: "Bad Request",
                message: "Invalid user ID format.",
            });
        }

        if (!validateContentType(req, res)) {
            return;
        }

        let str = "";

        req.on("data", (chunk) => {
            str += chunk;
        });

        req.on("end", async () => {
            let body;

            try {
                body = JSON.parse(str);
            } catch {
                return sendJson(res, 400, {
                    status: "Bad Request",
                    message: "Request body contains invalid JSON.",
                });
            }

            if (
                body === null ||
                typeof body !== "object" ||
                Array.isArray(body)
            ) {
                return sendJson(res, 400, {
                    status: "Bad Request",
                    message: "Request body must be a JSON object.",
                });
            }

            try {
                const record = await updateRecord(userId, body);

                return sendJson(res, 200, {
                    status: "User updated successfully.",
                    record: publicUser(record),
                });
            } catch (err) {
                if (isNotFoundError(err)) {
                    return sendJson(res, 404, {
                        status: "Not Found",
                        message: "User does not exist.",
                    });
                }

                if (isInvalidDataError(err)) {
                    return sendJson(res, 400, {
                        status: "Bad Request",
                        message: err.message,
                    });
                }

                console.error(err);
                return sendJson(res, 500, {
                    status: "Internal Server Error",
                    message: "Unable to update user.",
                });
            }
        });

        req.on("error", (err) => {
            console.error(err);

            if (!res.writableEnded) {
                sendJson(res, 400, {
                    status: "Bad Request",
                    message: "Error reading request body.",
                });
            }
        });

        return;
    }

    // DELETE /users/:id
    if (method === "DELETE" && isUserIdRoute) {
        const verifiedUserCredentials = validateToken(req, res);

        if (!verifiedUserCredentials) return;
        if (!authorizeRole(req, res, verifiedUserCredentials, ["admin"])) {
            return;
        }

        const userId = segments[2];

        if (!isValidId(userId)) {
            return sendJson(res, 400, {
                status: "Bad Request",
                message: "Invalid user ID format.",
            });
        }

        try {
            const record = await deleteRecord(userId);

            return sendJson(res, 200, {
                status: "User deleted successfully.",
                record: publicUser(record),
            });
        } catch (err) {
            if (isNotFoundError(err)) {
                return sendJson(res, 404, {
                    status: "Not Found",
                    message: "User does not exist.",
                });
            }

            console.error(err);
            return sendJson(res, 500, {
                status: "Internal Server Error",
                message: "Unable to delete user.",
            });
        }
    }

    // Known route, wrong method
    if (parsedUrl.pathname === "/health") {
        res.setHeader("Allow", "GET");
        return sendJson(res, 405, {
            status: "Method Not Allowed",
            message: "This HTTP method is not supported for this route.",
        });
    }

    if (isUsersRoute || isUserIdRoute) {
        res.setHeader("Allow", "GET, POST, PATCH, DELETE");
        return sendJson(res, 405, {
            status: "Method Not Allowed",
            message: "This HTTP method is not supported for this route.",
        });
    }

    // Unknown route
    return sendJson(res, 404, {
        status: "Not Found",
        message: "URL not found.",
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
