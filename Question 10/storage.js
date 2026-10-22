const fs = require("fs/promises"); // Import the file system module
const path = require("path"); // Import the path module
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { randomUUID } = require("crypto"); //Used for random and unique id generation
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

    const hashedPassword = await bcrypt.hash(record.password, 10); //Password is hashed before storing

    const newRecord = {
        name: record.name.trim(),
        id,
        password: hashedPassword,
        role: "user",
    };
    records.push(newRecord);

    await fs.writeFile(filePath, JSON.stringify(records, null, 4));
    return newRecord;
}

async function generateToken(record) {
    const records = await getRecords();
    const idx = records.findIndex((user) => user.id === record.id); // During login find if the user with provided credentials exist or not

    if (idx === -1) {
        // Check whether the record was not found
        const err = new Error("User does not exist");
        err.code = "USER_NOT_FOUND";
        throw err;
    }

    const isMatch = await bcrypt.compare(
        // Password is compared and checked whether matches
        record.password,
        records[idx].password,
    );

    if (!isMatch) {
        // Check whether the password matches
        const err = new Error("Incorrect Password");
        err.code = "INCORRECT_PASSWORD";
        throw err;
    }

    const payload = {
        // Payload for token is created
        userId: records[idx].id,
        role: records[idx].role,
    };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, {
        // Token is created
        expiresIn: "24h",
    });

    return token;
}

async function updateRecord(id, updatedData) {
    const records = await getRecords();
    const idx = records.findIndex((record) => record.id === id);

    if (idx === -1) {
        const err = new Error("User does not exist");
        err.code = "USER_NOT_FOUND";
        throw err;
    }

    const dataToUpdate = { ...updatedData };

    // If password is being updated, hash it before storing
    if (
        typeof dataToUpdate.password === "string" &&
        dataToUpdate.password.trim() !== ""
    ) {
        dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    } else {
        delete dataToUpdate.password;
    }

    const updatedRecord = { ...records[idx], ...dataToUpdate, id };
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
    generateToken,
    updateRecord,
    deleteRecord,
};
