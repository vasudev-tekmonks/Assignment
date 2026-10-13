console.log("1. Synchronous start");

setTimeout(() => {
    console.log("2. setTimeout() callback");
}, 0);

setImmediate(() => {
    console.log("3. setImmediate() callback");
});

Promise.resolve().then(() => {
    console.log("4. Promise .then() callback");
});

const fs = require("fs");

fs.readFile("sampleData.txt", "utf-8", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    console.log("5. Asynchronous file read callback");
});

console.log("6. Synchronous end");