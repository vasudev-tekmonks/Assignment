
# Node.js Asynchronous Programming and Event Loop

## Overview
- Demonstrates synchronous and asynchronous execution in Node.js.
- Explores callbacks, Promises, async/await, and the event loop.
- Shows how Node.js handles asynchronous file operations and errors.

## Files
- `sync-async-fileOperations.js` – Demonstrates synchronous and asynchronous file reading.
- `callbacks-promises-async-await.js` – Demonstrates callbacks, promises, async/await.
- `eventLoop.js` – Demonstrates the order of task execution in eventloop.
- `sampleData.txt` – Contains the sample data used for file-reading experiments.

## Requirements
- Node.js installed on your system.
- `sampleData.txt` created with some sample text.

## How to Run
1. To test synchronous and asynchronous file operations:

   ```bash
   node sync-async-fileOperations.js
   ```

2. To test callbacks, promises and async/await:

   ```bash
   node callbacks-promises-async-await.js
   ```

3. To test event loop execution order:

   ```bash
   node eventLoop.js
   ```


## Conclusions
- Synchronous file operations block further execution until the operation completes.
- Asynchronous file operations allow the program to continue executing while waiting for the result.
- Callbacks execute when an asynchronous operation completes and use an error-first pattern to handle failures.
- Promises handle asynchronous results using `.then()` and errors using `.catch()`.
- `async/await` makes Promise-based asynchronous code easier to read, while `try/catch` handles errors.
- Synchronous statements execute before scheduled asynchronous callbacks.
- Promise `.then()` callbacks generally execute before timer and I/O callbacks that are waiting in later event-loop phases because they are pushed to micro-task queues
- `setTimeout()` and `setImmediate()` are executed later because their callbacks are pushed to macro-task queue.
- The relative execution order of `setTimeout()` and `setImmediate()` can vary depending on the execution context.
- Asynchronous file-reading callbacks execute when the file operation completes; their exact timing depends on I/O and event-loop scheduling.
- Proper error handling prevents file-reading failures from becoming unhandled errors.
