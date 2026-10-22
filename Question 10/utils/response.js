const { isNotFoundError, isInvalidDataError } = require("./helpers");
const { errorLogger } = require("./logger");


function sendJson(res, statusCode, data) {
    if (res.headersSent || res.writableEnded || res.destroyed) {
        return false;
    }

    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(data));

    return true;
}

function sendError(res, statusCode, message) {
    if (res.headersSent || res.writableEnded || res.destroyed) {
        return false;
    }

    return sendJson(res, statusCode, {
        status: getStatusText(statusCode),
        message,
    });
}

function getStatusText(statusCode) {
    const statusTexts = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        408: "Request Timeout",
        413: "Payload Too Large",
        415: "Unsupported Media Type",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        503: "Service Unavailable",
    };

    return statusTexts[statusCode] || "Error";
}

function handleRouteError(req, res, err, operation) {
    if (res.headersSent || res.destroyed || res.writableEnded) {
        return;
    }

    // Request body is malformed or could not be read.
    if (err.statusCode === 400) {
        return sendError(res, 400, err.message);
    }

    // Request body exceeds the configured size limit.
    if (err.statusCode === 413) {
        return sendError(res, 413, err.message);
    }

    // Resource does not exist.
    if (isNotFoundError(err)) {
        return sendError(res, 404, "User does not exist.");
    }

    // Request data failed validation.
    if (isInvalidDataError(err)) {
        return sendError(res, 400, err.message);
    }

    // Authentication failure during login.
    if (err.code === "USER_NOT_FOUND" || err.code === "INCORRECT_PASSWORD") {
        return sendError(res, 401, "Invalid user ID or password.");
    }

    // Unexpected errors are logged without exposing details to clients.
    errorLogger(req, operation, 500);
    return sendError(res, 500, "An unexpected server error occurred.");
}

module.exports = {sendJson, sendError, handleRouteError};