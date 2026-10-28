function validateContentType(req, res) {
    const contentType = req.headers["content-type"];

    if (!contentType) {
        res.statusCode = 415;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Unsupported Media Type",
            }),
        );
        return false;
    }

    const header = contentType.split(";")[0].trim().toLowerCase();

    if (header !== "application/json") {
        res.statusCode = 415;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Unsupported Media Type",
            }),
        );
        return false;
    }

    return true;
}

function validateBodyForLogin(str, res) {
    let body;

    // Step 1: Parse JSON
    try {
        body = JSON.parse(str);
    } catch (err) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message: "Invalid JSON",
            }),
        );
        return null;
    }

    // Step 2: Validate body is an object
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message: "Request body must be a JSON object.",
            }),
        );
        return null;
    }

    // Step 3: Validate password field is provided
    if (typeof body.password !== "string" || body.password.trim() === "") {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message: "Password must be a non-empty string.",
            }),
        );
        return null;
    }

    return body;
}

function validateBodyForSignup(str, res) {
    let body;

    // Step 1: Parse JSON
    try {
        body = JSON.parse(str);
    } catch (err) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message: "Invalid JSON",
            }),
        );
        return null;
    }

    // Step 2: Validate name field
    if (
        body === null ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        typeof body.name !== "string" ||
        body.name.trim() === ""
    ) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message: "Name must be a non-empty string.",
            }),
        );
        return null;
    }

    // Step 3: Validate password field
    if (typeof body.password !== "string" || body.password.trim() === "") {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message: "Password must be a non-empty string.",
            }),
        );
        return null;
    }

    return body;
}

module.exports = {
    validateContentType,
    validateBodyForLogin,
    validateBodyForSignup,
};
