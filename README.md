Under normal circumstances, when the app receives a `SIGTERM` signal, it initiates the `onModuleDestroy` lifecycle method. However, if the app is still processing requests at that time, those requests can end up in an inconsistent state. This repository demonstrates how to ensure all requests are completed before invoking `onModuleDestroy` on the server.

The key is to call `await httpTerminator.terminate();` in the first `onModuleDestroy` method triggered. Ideally, this would be `AppModule.onModuleDestroy`. However, due to a bug in the current version of NestJS, we implement a workaround by creating a helper module. In this example, it’s named `FirstModule`.

Expected Behavior:

1. Send a shutdown signal to the server.
2. The server waits for all ongoing requests to complete while rejecting new requests.
3. Once all requests are completed, the shutdown lifecycle begins.
4. The server exits gracefully.

Running the Example:
1. Start the server: `npm run start`
2. Send a request to the server (runs for 30 seconds): `curl localhost:3000`
3. Stop the server: Press Ctrl + C.
4. Verify new requests are rejected: `curl localhost:3000`
5. Check the server output and curl output—it should not display any errors. // wait 30 seconds
6. Wait until the ongoing request is completed and verify that the server exits gracefully.

Reproducing the Issue:
1. Comment out the following line in the code: `await httpTerminator.terminate();`
2. Start the server: `npm run start`
3. Send a request to the server (runs for 30 seconds): `curl localhost:3000`
4. Stop the server: Press Ctrl + C.
5. Check the server output and curl output—it should display an error.
