const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;      // Port needs to be defined to listen requests on
const filePath = path.join(__dirname, "sampleData.json");

const server = http.createServer((req, res) => {        // This method is used to create a http server
    const { method, url } = req;        // Method and url route is destructured from the request

    if (method !== "GET") {     // Route if the request method is not GET
        res.statusCode = 405;       //Code 405 for Method not allowed
        res.setHeader("Content-Type", "application/json");      // Setting header value for Content-Type
        res.end(        // Method used to send response to the client
            JSON.stringify({        // method used to convert js value to JSON string
                status: "Method Not Allowed!",
            }),
        );
        return;
    }

    if (url === "/") {      // '/' route
        res.statusCode = 200;       // Code 200 for OK
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "This is my application!",
            }),
        );
        return;
    }

    else if (url === "/users") {        // '/users' route
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
    }

    else if (url === "/health") {       // '/health' route
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "OK",
            }),
        );
    }

    else {      // Route to handle all other unknown routes
        res.statusCode = 404;       // Code 404 for not found
        res.setHeader("Content-Type", "application/json");
        res.end(
            JSON.stringify({
                status: "URL not found!",
            }),
        );
    }
});

server.listen(PORT, () => {     // Starts the server and listens for incoming requests on specified port
    console.log(`Server is listening on port ${PORT}`);
});