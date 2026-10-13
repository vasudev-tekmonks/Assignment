const fs = require("fs/promises");      // Import the file system module
const path = require("path");       // Import the path module
const filePath = path.join(__dirname, "records.json");      // Build the path to records.json in the cd

async function getRecords() {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        const records = JSON.parse(content);        // Convert the JSON string into a JavaScript value

        if (!Array.isArray(records)) {      // Check if the parsed value is an array
            throw new Error("File does not contain array of records");
        }

        return records;

    } catch (err) {
        if (err.code === "ENOENT") {        // Check whether the file does not exist
            return [];
        }

        if (err instanceof SyntaxError) {       // Check whether JSON parsing failed due to invalid syntax
            throw new Error("records.json contains invalid JSON");
        }

        throw err; 
    }
}

async function createRecord(record) {
    const records = await getRecords();
    let id = 1;     // Start with ID 1 when generating a new record ID

    if (records.length > 0) {       // Check whether any records already exist
        const ids = records.map((item) => item.id);

        for (let x of ids) {
            id = Math.max(id, x);       //Find the maximin id
        } 

        id++;       // Increment the largest ID to generate the next ID
    }

    const newRecord = { ...record, id };
    records.push(newRecord);

    await fs.writeFile(filePath, JSON.stringify(records, null, 4));
    return newRecord; 
}

async function updateRecord(id, updatedData) {
    const records = await getRecords();
    const idx = records.findIndex((record) => record.id === id);

    if (idx === -1) {       // Check whether the record was not found
        throw new Error("Record does not exist");
    }

    const updatedRecord = { ...records[idx], ...updatedData, id };
    records[idx] = updatedRecord;

    await fs.writeFile(filePath, JSON.stringify(records, null, 4));
    return updatedRecord;
}

async function deleteRecord(id) {
    const records = await getRecords();
    const idx = records.findIndex(record => record.id === id);

    if (idx === -1) {
        throw new Error("Record does not exist");
    }

    const deletedRecord = records[idx];
    records.splice(idx, 1);     // Remove one record from the array at the specified index

    await fs.writeFile(
        filePath,
        JSON.stringify(records, null, 4)
    );

    return deletedRecord;
}

module.exports = {      // Export functions so other files can import them
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord 
};