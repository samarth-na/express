var express = require("express");
var router = express.Router();

// his route path will match acd and abcd.

router.get("/ab?cd", (req, res) => {
    res.send("ab?cd");
});

// This route path will match abcd, abbcd, abbbcd, and so on.

router.get("/ab+cd", (req, res) => {
    res.send("ab+cd");
});

// This route path will match abcd, abxcd, abRANDOMcd, ab123cd, and so on.

router.get("/ab*cd", (req, res) => {
    res.send("ab*cd");
});

// This route path will match /abe and /abcde.

router.get("/ab(cd)?e", (req, res) => {
    res.send("ab(cd)?e");
});

// Route paths based on regular expressions

// This route path will match anything with an “a” in it.

router.get(/a/, (req, res) => {
    res.send("/a/");
});

// This route path will match butterfly and dragonfly, but not butterflyman, dragonflyman, and so on.

router.get(/.*fly$/, (req, res) => {
    res.send("/.*fly$/");
});
