const fs = require("fs");
const path = require("path");

// Create a readable stream to read the input file in chunks.
const readable = fs.createReadStream(path.join(__dirname, "input.txt"));

// Create a writable stream to write the processed data to the output file.
const writable = fs.createWriteStream(path.join(__dirname, "output.txt"));

// Handle errors that occur while reading the input file.
readable.on("error", (err) => {
    writable.destroy(); // Stop writing because the input could not be read successfully.
    console.error("Error reading input file:", err.message);
});

// Handle errors that occur while writing to the output file.
writable.on("error", (err) => {
    readable.destroy();  // Stop reading because the output cannot be written successfully.
    console.error("Error writing output file:", err.message);
});

// Process each chunk of data as it is read from the input file.
readable.on("data", (chunk) => {
    let str = chunk.toString();

    // Convert the text to uppercase and write it to the output file.
    let canContinue = writable.write(str.toUpperCase());

    if (!canContinue) {
        // Pause reading to prevent the writable buffer from growing excessively.
        readable.pause();
    }
});

// The drain event fires when the writable stream's buffer has emptied enough to accept more data.
writable.on("drain", () => {
    // Resume reading now that the writable stream can accept more data.
    readable.resume();
});

// The end event fires when all data has been read from the input file.
readable.on("end", () => {
    writable.end();
});

// The finish event fires after end() has been called and all buffered data has been successfully written.
writable.on("finish", () => {
    console.log("File written successfully.");
});