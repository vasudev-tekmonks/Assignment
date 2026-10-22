const {sendError} = require("./response");
const { isValidId } = require("./helpers");

function validateContentType(req, res) {
    const contentType = req.headers["content-type"];

    if (!contentType) {
        sendError(res, 415, "Content-Type header is required.");
        return false;
    }

    const header = contentType.split(";")[0].trim().toLowerCase();

    if (header !== "application/json") {
        sendError(res, 415, "Content-Type must be application/json.");
        return false;
    }

    return true;
}

const MAX_BODY_SIZE = 1024 * 1024; // 1 MiB

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let bodySize = 0;
        let settled = false;

        function fail(statusCode, message) {
            if (settled) return;

            settled = true;

            const error = new Error(message);
            error.statusCode = statusCode;
            reject(error);
        }

        req.on("data", (chunk) => {
            if (settled) return;

            bodySize += chunk.length;

            if (bodySize > MAX_BODY_SIZE) {
                fail(413, "Request body is too large.");
                req.resume();
                return;
            }

            chunks.push(chunk);
        });

        req.on("end", () => {
            if (settled) return;

            settled = true;
            resolve(Buffer.concat(chunks).toString("utf8"));
        });

        req.on("error", () => {
            fail(400, "Unable to read request body.");
        });

        req.on("aborted", () => {
            fail(400, "Request was aborted.");
        });
    });
}

function validateBodyForSignup(str, res) {
    let body;

    try {
        body = JSON.parse(str);
    } catch {
        sendError(res, 400, "Invalid JSON.");
        return null;
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        sendError(res, 400, "Request body must be a JSON object.");
        return null;
    }

    if (typeof body.name !== "string" || body.name.trim() === "") {
        sendError(res, 400, "Name must be a non-empty string.");
        return null;
    }

    if (typeof body.password !== "string" || body.password.trim() === "") {
        sendError(res, 400, "Password must be a non-empty string.");
        return null;
    }

    return body;
}

function validateBodyForLogin(str, res) {
    let body;

    try {
        body = JSON.parse(str);
    } catch {
        sendError(res, 400, "Invalid JSON.");
        return null;
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        sendError(res, 400, "Request body must be a JSON object.");
        return null;
    }

    if (!body.id) {
        sendError(res, 400, "User ID is required.");
        return null;
    }

    if (!isValidId(body.id)) {
        sendError(res, 400, "Invalid user ID format.");
        return null;
    }

    if (typeof body.password !== "string" || body.password.trim() === "") {
        sendError(res, 400, "Password must be a non-empty string.");
        return null;
    }

    return body;
}

function validateBodyForUpdate(str, res) {
    let body;
    try {
        body = JSON.parse(str);
    } catch {
        sendError(res, 400, "Invalid JSON.");
        return null;
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        sendError(res, 400, "Request body must be a JSON object.");
        return null;
    }

    const allowedFields = ["name", "password"];
    const keys = Object.keys(body);

    // Reject empty body
    if (keys.length === 0) {
        sendError(res, 400, "At least one field to update must be provided.");
        return null;
    }

    // Reject unknown or forbidden fields (e.g. role, id)
    const hasDisallowedFields = keys.some((k) => !allowedFields.includes(k));
    if (hasDisallowedFields) {
        sendError(res, 400, "Only 'name' and 'password' may be updated.");
        return null;
    }

    if (body.name !== undefined) {
        if (typeof body.name !== "string" || body.name.trim() === "") {
            sendError(res, 400, "Name must be a non-empty string.");
            return null;
        }
    }

    if (body.password !== undefined) {
        if (typeof body.password !== "string" || body.password.trim() === "") {
            sendError(res, 400, "Password must be a non-empty string.");
            return null;
        }
    }

    return body;
}

module.exports = {
    validateContentType,
    readRequestBody,
    validateBodyForSignup,
    validateBodyForLogin,
    validateBodyForUpdate,
};
