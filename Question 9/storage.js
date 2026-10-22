const fs = require("fs/promises"); // Import the file system module
const path = require("path"); // Import the path module
const { randomUUID } = require("crypto");       //Used for random and unique id generation
const filePath = path.join(__dirname, "sampleData.json"); // Build the path to records.json in the cd

async function getRecords() {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        const records = JSON.parse(content); // Convert the JSON string into a JavaScript value

        if (!Array.isArray(records)) {
            // Check if the parsed value is an array
            throw new Error("File does not contain array of records");
        }

        return records;
    } catch (err) {
        if (err.code === "ENOENT") {
            // Check whether the file does not exist
            return [];
        }

        if (err instanceof SyntaxError) {
            // Check whether JSON parsing failed due to invalid syntax
            throw new Error("records.json contains invalid JSON");
        }

        throw err;
    }
}

async function getRecordById(id) {
    const records = await getRecords();
    const idx = records.findIndex((record) => record.id === id);

    if (idx === -1) {
        // Check whether the record was not found
        const err = new Error("User does not exist");
        err.code = "USER_NOT_FOUND";
        throw err;
    }

    return records[idx];
}

async function createRecord(record) {
    const records = await getRecords();
    const id = randomUUID();

    const newRecord = { ...record, id };
    records.push(newRecord);

    await fs.writeFile(filePath, JSON.stringify(records, null, 4));
    return newRecord;
}

async function updateRecord(id, updatedData) {
    const records = await getRecords();
    const idx = records.findIndex((record) => record.id === id);

    if (idx === -1) {
        // Check whether the record was not found
        const err = new Error("User does not exist");
        err.code = "USER_NOT_FOUND";
        throw err;
    }

    const updatedRecord = { ...records[idx], ...updatedData, id };
    records[idx] = updatedRecord;

    await fs.writeFile(filePath, JSON.stringify(records, null, 4));
    return updatedRecord;
}

async function deleteRecord(id) {
    const records = await getRecords();
    const idx = records.findIndex((record) => record.id === id);

    if (idx === -1) {
        const err = new Error("User does not exist");
        err.code = "USER_NOT_FOUND";
        throw err;
    }

    const deletedRecord = records[idx];
    records.splice(idx, 1); // Remove one record from the array at the specified index

    await fs.writeFile(filePath, JSON.stringify(records, null, 4));

    return deletedRecord;
}

module.exports = {
    // Export functions so other files can import them
    getRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
};
