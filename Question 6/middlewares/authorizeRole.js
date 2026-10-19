const sendJson = require("../utils/sendJson");

function authorizeRole(req, res, decoded, allowedRoles) {
    if (!allowedRoles.includes(decoded.role)) {
        sendJson(res, 403, {
            status: "Forbidden",
            message: "Role not allowed to access this route.",
        });

        return false;
    }

    return true;
}

module.exports = authorizeRole;