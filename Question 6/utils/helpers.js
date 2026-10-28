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

function publicUser(record) {
    const { password, ...safeRecord } = record;
    return safeRecord;
}

function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

module.exports = {
    isValidId,
    isNotFoundError,
    isInvalidDataError,
    publicUser,
    sendJson
};
