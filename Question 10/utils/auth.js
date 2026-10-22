const jwt = require("jsonwebtoken");
const { sendError } = require("./response");

function authenticateToken(req, res) {
    const header = req.headers.authorization; // Auth. part is extractred from the header

    // Check whether the Authorization header exists.
    if (!header) {
        sendError(res, 401, "Authorization token is required.");
        return null;
    }

    // Split the header into the scheme and token.
    const [scheme, token, ...extra] = header.split(" ");

    // Validate the Bearer scheme and token format.
    if (scheme !== "Bearer" || !token || extra.length > 0) {
        sendError(res, 401, "Invalid authorization header format.");
        return null;
    }

    // Verify the token's signature and expiration.
    try {
        const verifiedUserCredentials = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );
        return verifiedUserCredentials;
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            sendError(res, 401, "Token has expired.");
            return null;
        }

        sendError(res, 401, "Invalid token.");
        return null;
    }
}

function authorizeRole(req, res, decoded, allowedRoles) {
    if (!allowedRoles.includes(decoded.role)) {
        sendError(res, 403, "Role not allowed to access this route.");

        return false;
    }

    return true;
}

module.exports = { authenticateToken, authorizeRole };
