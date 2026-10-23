const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "sampleData.txt");

//Callback

fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log("Data read in callback: ", data);
});

//Promise

fs.promises
    .readFile(filePath, "utf-8")
    .then((data) => {
        console.log("Data read in promise:", data);
    })
    .then(() => {
        console.log("This is printed after the promise has resolved.");
    })
    .catch((err) => {
        console.log(err);
    });

//Async/Await

async function readDataFromFile() {
    try {
        const data = await fs.promises.readFile(filePath, "utf-8");
        console.log("Data using async/await:", data);
        console.log("This is printed after asynchronous file read");
    } catch(err) {
        console.log(err);
    }
}

readDataFromFile();
