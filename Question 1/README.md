
# JSON File-Based CRUD Application

A simple Node.js application that performs CRUD (Create, Read, Update, Delete) operations using a JSON file for persistent data storage.

## Features

- Create new records with automatically generated IDs.
- Read all stored records.
- Update existing records by ID.
- Delete records by ID.
- Handle missing files, invalid JSON, and file operation errors.
- Persist data in `records.json`.

## Tech Stack

- Node.js
- CommonJS (`require` and `module.exports`)
- File System Promises API (`fs/promises`)
- JSON

## Project Structure

```text
crud-app/
├── index.js          # Runs the application and tests CRUD operations
├── storage.js      # Implements CRUD and file operations
├── records.json    # Stores records (created as needed)
└── README.md       # Project documentation
```

## Prerequisites

- [Node.js](https://nodejs.org/) installed.
- No external npm packages required.

## Getting Started

1. Clone the repository:

   ```bash
   git clone "https://github.com/vasudev-tekmonks/Assignment.git"
   ```

2. Navigate to the project directory:

   ```bash
   cd "Question 1"
   ```

3. Run the application:

   ```bash
   node index.js
   ```

## Usage

Import the required functions from `storage.js`:

```js
const {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord
} = require("./storage.js");
```

### Create a record

```js
const record = await createRecord({
    name: "Vasudev",
    age: 21
});
```

### Read all records

```js
const records = await getRecords();
```

### Update a record

```js
const updated = await updateRecord(1, {
    name: "Updated Name",
    age: 25
});
```

### Delete a record

```js
const deleted = await deleteRecord(1);
```

**Note:** These examples use `await` inside an `async` function.

## Data Storage

- Records are stored in `records.json`.
- Each record has a unique numeric ID under normal valid-data conditions.
- Changes are saved to the file and persist after restarting the application.
- If the file does not exist, the application starts with an empty array.

## Error Handling

- Missing records produce an error during update or delete.
- Invalid JSON produces a descriptive error.
- File operation errors are propagated to the caller.

## Learning Objectives

- Understand CRUD operations.
- Practice asynchronous programming with `async/await`.
- Learn CommonJS module exports and imports.
- Work with JSON files in Node.js.
- Understand basic error handling and persistent storage.
