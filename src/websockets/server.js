/*
 * Basic Express + WebSocket server boilerplate.
 *
 * This file sets up an HTTP server powered by Express and shares that
 * underlying server with a WebSocket endpoint (using the "ws" library).
 * Each major block is annotated to explain its role in the stack.
 */

const http = require("http");
const express = require("express");
const morgan = require("morgan");
const { WebSocketServer } = require("ws");

// Create a new Express application instance that will handle HTTP requests.
const app = express();

// Attach common middleware for logging and JSON payload parsing so HTTP clients
// behave like they would in most typical Express projects.
app.use(morgan("dev"));
app.use(express.json());

// Provide a minimal health endpoint to verify the HTTP server is running.
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "WebSocket server is up and running." });
});

// Create a raw Node HTTP server so the same TCP port can serve both HTTP and WS.
const server = http.createServer(app);

// Initialize a WebSocket server that leverages the HTTP server above.
// This allows WebSocket upgrades to happen on the same port and reuses the
// Express routing/middleware for initial HTTP handling.
const wss = new WebSocketServer({ server });

// Keep track of connected clients to enable fan-out style messaging.
const clients = new Set();

// Listen for new WebSocket connections from clients.
wss.on("connection", (socket, request) => {
    // Store this socket so we can broadcast messages to every client later.
    clients.add(socket);

    // Include some contextual information in the log about the connecting client.
    console.log(
        `WebSocket client connected from ${request.socket.remoteAddress}`
    );

    // Send an initial greeting so the client knows the connection succeeded.
    socket.send(
        JSON.stringify({
            type: "system",
            message: "Welcome! You are connected to the WebSocket server.",
        })
    );

    // Whenever a client sends a message, echo it to every connected client.
    socket.on("message", (rawMessage) => {
        const message = rawMessage.toString();
        console.log(`Inbound message: ${message}`);

        // Fan the message out to every active client.
        for (const client of clients) {
            if (client.readyState === client.OPEN) {
                client.send(
                    JSON.stringify({
                        type: "broadcast",
                        message,
                        echoedAt: new Date().toISOString(),
                    })
                );
            }
        }
    });

    // If the socket closes or errors, remove it from our active set.
    const removeClient = () => {
        console.log("WebSocket client disconnected.");
        clients.delete(socket);
    };

    socket.on("close", removeClient);
    socket.on("error", (err) => {
        console.error("WebSocket error:", err);
        removeClient();
    });
});

// Allow the caller to configure the port, but fall back to 3001 so it does not
// conflict with the default Express scaffolding (which often uses 3000).
const PORT = process.env.WS_PORT || 3001;

// Start listening for both HTTP and WebSocket traffic on the shared server.
server.listen(PORT, () => {
    console.log(`WebSocket server listening on http://localhost:${PORT}`);
});
