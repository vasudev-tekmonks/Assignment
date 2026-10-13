const {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord
} = require("./storage.js");

async function main() {
    try {
        // Read all records
        console.log(await getRecords());

        // Create a record
        const created = await createRecord({
            name: "Vasudev",
            age: 21
        });
        console.log("Created:", created);

        //Update the record
        const updated = await updateRecord(2, {
            name: "Vasudev Updated",
            age: 25
        });
        console.log("Updated:", updated);

        //Delete the record
        const deleted = await deleteRecord(2);
        console.log("Deleted:", deleted);

        //Update a nonexistent record
        try {
            await updateRecord(-1, { name: "Missing" });
        } catch (err) {
            console.log("Expected error:", err.message);
        }

        //Delete a nonexistent record
        try {
            await deleteRecord(-1);
        } catch (err) {
            console.log("Expected error:", err.message);
        }

    } catch (err) {
        console.error("Test failed:", err.message);
    }
}

main().catch(err => {
    console.error("Unexpected error:", err.message);
});