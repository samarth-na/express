// Load core packages
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Load route files you created
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var todoRouter = require("./routes/todo");

var app = express();

app.use(logger("dev")); // Log every request in the console (method, path, time)

app.use(express.json()); // Allow the server to read JSON sent by clients

app.use(express.urlencoded({ extended: false })); // Allow the server to read form data (POST with urlencoded bodies)

app.use(cookieParser()); // Parse cookies in incoming requests

app.use("/files", express.static(path.join(__dirname, "public")));
// Serve static files (images, css, js, etc.) from /public folder
// Anyone visiting /files/... will get files from "./public"

// Attach main routes
app.use("/", indexRouter); // handles routes like GET /
app.use("/users", usersRouter); // handles routes like GET /users
app.use("/todo", todoRouter); // handles routes like GET /todo

module.exports = app;
