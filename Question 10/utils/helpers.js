// Validate that the ID follows the UUID version 4 format.
function isValidId(id) {
    return (
        typeof id === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
        )
    );
}

// Check whether a user does not exist.
function isNotFoundError(err) {
    return err.code === "USER_NOT_FOUND";
}

// Check whether user data is invalid.
function isInvalidDataError(err) {
    return err.code === "INVALID_DATA";
}

// Remove the password before returning a user.
function publicUser(record) {
    const { password, ...safeRecord } = record;
    return safeRecord;
}

module.exports = {
    isValidId,
    isNotFoundError,
    isInvalidDataError,
    publicUser,
};
