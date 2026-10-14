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

module.exports = validateContentType;
