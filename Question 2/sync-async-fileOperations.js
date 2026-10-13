const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "sampleData.txt"); 

console.log("This is executed before reading any file");

const data = fs.readFileSync(filePath, "utf-8");

console.log("Synchronously read data: ", data);

console.log("This is executed after reading file synchronously");

console.log("This is executed before reading file asynchronously");

fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log("Asynchronously read data: ", data);
});


console.log("This is executed after reading file asynchronously");