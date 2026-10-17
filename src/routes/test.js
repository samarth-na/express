var express = require("express");
var router = express.Router();

/*
 * Demo of the URL API.
 *
 *   curl http://localhost:4000/test
 *   curl 'http://localhost:4000/test?url=https://example.com:9000/a/b?x=1#top'
 *
 * A bare curl prints the parts of the boot.dev sample URL, so the output matches
 * the lesson exactly. Pass ?url= to parse some other URL instead.
 */

var SAMPLE_URL =
    "http://testuser:testpass@testdomain.com:8080/testpath?testsearch=testvalue#testhash";

// The URL object has no enumerable properties, so we cannot loop over it.
// Name each property and read it by index instead.
var PARTS = [
    "protocol",
    "username",
    "password",
    "hostname",
    "port",
    "pathname",
    "search",
    "hash",
];

router.get("/", (req, res) => {
    var target = typeof req.query.url === "string" ? req.query.url : SAMPLE_URL;

    var url;
    try {
        url = new URL(target);
    } catch (err) {
        // new URL() throws a TypeError when the string is not an absolute URL.
        return res
            .status(400)
            .type("text")
            .send(`invalid URL: ${err.message}\n`);
    }

    var lines = PARTS.map((name) => `${name}: ${url[name]}`);

    res.type("text").send(`${lines.join("\n")}\n`);
});

module.exports = router;
