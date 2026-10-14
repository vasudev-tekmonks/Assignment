const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080; // Port needs to be defined to listen requests on
const filePath = path.join(__dirname, "sampleData.json");

const server = http.createServer((req, res) => {
    // This method is used to create a http server
    const { method, url } = req; // Method and url route is destructured from the request

    if (method === "GET") {
        if (url === "/") {
            // '/' route
            res.statusCode = 200; // Code 200 for OK
            res.setHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    status: "This is my application!",
                }),
            );
            return;
        } else if (url === "/users") {
            // '/users' route
            fs.readFile(filePath, "utf-8", (err, data) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            status: "Internal Server Error",
                        }),
                    );
                    return;
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(data);
            });
        } else if (url === "/health") {
            // '/health' route
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    status: "OK",
                }),
            );
        } else {
            // Route to handle all other unknown routes
            res.statusCode = 404; // Code 404 for not found
            res.setHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    status: "URL not found!",
                }),
            );
        }
    } else if (method === "POST") {
        // POST method route
        if (url === "/users") {
            const contentType = req.headers["content-type"]; //Extracting "content-type" from headers

            if (!contentType) {
                // If content-type doesn't exist
                res.statusCode = 415;
                res.setHeader("Content-Type", "application/json");
                res.end(
                    JSON.stringify({
                        status: "Unsupported Media Type",
                    }),
                );
                return;
            }

            const header = contentType.split(";")[0].trim().toLowerCase(); // Extracting media-type

            if (header !== "application/json") {
                // If data recieved is not json
                res.statusCode = 415;
                res.setHeader("Content-Type", "application/json");
                res.end(
                    JSON.stringify({
                        status: "Unsupported Media Type",
                    }),
                );
                return;
            }

            let str = "";

            req.on("data", (chunk) => {
                // Collecting incoming data stream
                str += chunk;
            });

            req.on("end", () => {
                // After data has completely collected
                let body;

                try {
                    body = JSON.parse(str); // Parsing into json format
                } catch (err) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            status: "Bad Request",
                            message: "Invalid JSON",
                        }),
                    );
                    return;
                }

                if (
                    body === null || // If body is empty
                    typeof body !== "object" || // If body is not a json object
                    Array.isArray(body) || // If body is an array
                    typeof body.name !== "string" || // Field validation
                    body.name.trim() === "" || // Field validation
                    !Number.isInteger(body.age) || // Field validation
                    body.age < 0 // Field validation
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
                    return;
                }

                // Success response: reached only if parsing and validation succeed
                res.statusCode = 201;
                res.setHeader("Content-Type", "application/json");
                res.end(
                    JSON.stringify({
                        status: "User Added Successfully!",
                        user: {
                            name: body.name.trim(),
                            age: body.age,
                        },
                    }),
                );
            });
        } else {
            // Route to handle all other unknown routes
            res.statusCode = 404; // Code 404 for not found
            res.setHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    status: "URL not found!",
                }),
            );
            return;
        }
    } else {
        // Route for other request method handling
        res.statusCode = 405; //Code 405 for Method not allowed
        res.setHeader("Content-Type", "application/json"); // Setting header value for Content-Type
        res.end(
            // Method used to send response to the client
            JSON.stringify({
                // method used to convert js value to JSON string
                status: "Method Not Allowed!",
            }),
        );
        return;
    }
});

server.listen(PORT, () => {
    // Starts the server and listens for incoming requests on specified port
    console.log(`Server is listening on port ${PORT}`);
});
