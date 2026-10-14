const {
    getRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
} = require("./storage.js");

// Import helper functions
const validateContentType = require("./utils/checkContentType.js");
const validateUser = require("./utils/validateBody.js");

const http = require("http");
const PORT = 8080;

// Reusable helper function to send a JSON response.
function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

// Validate that the ID follows the UUID version 4 format.
function isValidId(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
    );
}

//Check whether a storage function reported that the requested user does not exist.
function isNotFoundError(err) {
    return err.code === "USER_NOT_FOUND";
}

// Check whether a storage function reported invalid user data.
function isInvalidDataError(err) {
    return err.code === "INVALID_DATA";
}

const server = http.createServer(async (req, res) => {
    const { method, url } = req;

    const parsedUrl = new URL(url, `http://localhost:${PORT}`); // Parse the URL so we can reliably access its pathname and query parameters.
    const segments = parsedUrl.pathname.split("/"); // Split the pathname into segments using "/", example: "/users/123" becomes ["", "users", "123"].

    const isUsersRoute = parsedUrl.pathname === "/users";  // Identify the collection route: /users.
    const isUserIdRoute =
        segments.length === 3 && segments[1] === "users" && segments[2] !== "";

    // GET /health
    if (method === "GET" && parsedUrl.pathname === "/health") {
        return sendJson(res, 200, { status: "OK" });
    }

    // GET /users
    if (method === "GET" && isUsersRoute) {
        try {
            const records = await getRecords();
            return sendJson(res, 200, records);
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
        const userId = segments[2];

        if (!isValidId(userId)) {
            return sendJson(res, 400, {
                status: "Bad Request",
                message: "Invalid user ID format.",
            });
        }

        try {
            const record = await getRecordById(userId);
            return sendJson(res, 200, record);
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

    // POST /users
    if (method === "POST" && isUsersRoute) {
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
            const body = validateUser(str, res);

            if (body === null) {
                return;
            }

            try {
                const record = await createRecord(body);

                return sendJson(res, 201, {
                    status: "User created successfully.",
                    record,
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

    // PATCH /users/:id
    if (method === "PATCH" && isUserIdRoute) {
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
                    record,
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
                record,
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
    if (isUsersRoute || isUserIdRoute || parsedUrl.pathname === "/health") {
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
