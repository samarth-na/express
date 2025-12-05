import express from "express";
const app = express();
const port = 3000;

function init() {
    app.get("/", (_req, res) => {
        res.send("Hello World!");
    });

    app.post("/", (req, res) => {
        res.send("Got a POST request");
    });

    app.put("/user", (_req, res) => {
        res.send("Got a PUT request at /user");
    });

    app.delete("/user", (_req, res) => {
        res.send("Got a DELETE request at /user");
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}
function serveStatic() {
    app.use(express.static("public"));
}

function main() {
    init();
    serveStatic();
}
main();
