var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (_req, res, _next) => {
    res.send("hello from 4000");
});

/* All methods */
router.all("/secret", (_req, _res, next) => {
    console.log("Accessing the secret section ...");
    next(); // pass control to the next handler
});

module.exports = router;
