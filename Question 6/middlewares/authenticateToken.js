const jwt = require("jsonwebtoken");
const sendJson = require("../utils/sendJson");

function authenticateToken(req, res) {
    const header = req.headers.authorization;       // Auth. part is extractred from the header

    // Check whether the Authorization header exists.
    if (!header) {
        sendJson(res, 401, {
            status: "Unauthorized",
            message: "Authorization token is required.",
        });
        return null;
    }

    // Split the header into the scheme and token.
    const [scheme, token, ...extra] = header.split(" ");

    // Validate the Bearer scheme and token format.
    if (
        scheme !== "Bearer" ||
        !token ||
        extra.length > 0
    ) {
        sendJson(res, 401, {
            status: "Unauthorized",
            message: "Invalid authorization header format.",
        });
        return null;
    }

    // Verify the token's signature and expiration.
    try {
        const verifiedUserCredentials = jwt.verify(token, process.env.JWT_SECRET);
        return verifiedUserCredentials;
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            sendJson(res, 401, {
                status: "Unauthorized",
                message: "Token has expired.",
            });
            return null;
        }

        sendJson(res, 401, {
            status: "Unauthorized",
            message: "Invalid token.",
        });
        return null;
    }
}

module.exports = authenticateToken;