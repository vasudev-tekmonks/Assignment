const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs.txt");

function getSafePathForRequest(url) {
    try {
        const pathname = new URL(url, "http://localhost").pathname;

        if (pathname === "/health") {
            return "/health";
        }

        if (pathname === "/users") {
            return "/users";
        }

        if (pathname === "/users/signup") {
            return "/users/signup";
        }

        if (pathname === "/users/login") {
            return "/users/login";
        }

        if (/^\/users\/[^/]+\/?$/.test(pathname)) {
            return "/users/[redacted]";
        }

        return "/[redacted]";
    } catch {
        return "/invalid-url";
    }
}

function getSafePathForError(url) {
    try {
        const pathname = new URL(
            url,
            "http://localhost"
        ).pathname;

        // Avoid recording potentially sensitive path segments.
        return pathname
            .split("/")
            .map((segment, index) => {
                if (index === 0 || segment === "") {
                    return segment;
                }

                if (segment === "users") {
                    return segment;
                }

                if (
                    segment === "signup" ||
                    segment === "login" ||
                    segment === "health"
                ) {
                    return segment;
                }

                return "[redacted]";
            })
            .join("/");
    } catch {
        return "[invalid-path]";
    }
}

function requestLogger(req, res) {
    const start = process.hrtime.bigint();
    const pathname = getSafePathForRequest(req.url);

    let logged = false;

    function writeLog(outcome) {
        if (logged) return;
        logged = true;

        const elapsed = Number(process.hrtime.bigint() - start) / 1e6;

        const logEntry = {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
            method: req.method,
            path: pathname,
            statusCode: res.statusCode,
            responseTimeMs: Number(elapsed.toFixed(2)),
            outcome,
        };

        fs.appendFile(logFile, JSON.stringify(logEntry) + "\n", (err) => {
            if (err) {
                console.error("Failed to write request log.");
            }
        });
    }

    res.on("finish", () => {
        writeLog("completed");
    });

    res.on("close", () => {
        if (!res.writableFinished) {
            writeLog("connection_closed");
        }
    });
}

function errorLogger(req, category, statusCode = 500) {
    const entry = {
        level: "error",
        timestamp: new Date().toISOString(),
        requestId: req.requestId || "unknown",
        method: req.method,
        path: getSafePathForError(req.url),
        statusCode,
        category,
    };

    // Log only controlled metadata, never the raw exception.
    console.error(JSON.stringify(entry));
}

module.exports = {requestLogger, errorLogger};
