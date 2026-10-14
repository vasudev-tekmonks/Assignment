function validateUser(str, res) {
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

    // Step 2: Validate the body and fields
    if (
        body === null ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        typeof body.name !== "string" ||
        body.name.trim() === "" ||
        !Number.isInteger(body.age) ||
        body.age < 0
    ) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "Bad Request",
                message:
                    "Name must be a non-empty string and age must be a non-negative integer.",
            }),
        );
        return null;
    }

    // Step 3: Return the validated body
    return body;
}

module.exports = validateUser;