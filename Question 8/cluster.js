const http = require("http");
const cluster = require("cluster");
const os = require("os");

const count = os.availableParallelism();    // Get the number of CPU cores available to the Node.js process.

const PORT = 8080;

// The primary process manages worker processes but does not handle HTTP requests.
if (cluster.isPrimary) {
    // Listen for a worker process that exits or crashes.
    cluster.on("exit", (worker, code, signal) => {
        console.log(
            `Worker ID: ${worker.id}, PID: ${worker.process.pid} exited.`,
        );
        console.log(`Exit code: ${code}, Signal: ${signal}`);

        // Create a replacement worker to maintain the worker pool.
        const replacement = cluster.fork();

        console.log(
            `Replacement worker started. ID: ${replacement.id}, PID: ${replacement.process.pid}`,
        );
    });

    // Create one worker process for each available CPU core.
    for (let i = 0; i < count; i++) {
        const worker = cluster.fork();

        // Display the process ID (PID) of the newly created worker.
        console.log(`Worker ${worker.process.pid}`);
    }

    console.log(`${count} workers created!`);
} else {
    // Each worker creates an HTTP server to handle incoming requests.
    const server = http.createServer((req, res) => {
        // Return the ID of the worker that handled the request.
        res.end(`Request is handled by process with id: ${cluster.worker.id}`);
    });

    // Workers share the same port.
    server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}
