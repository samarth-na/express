const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

async function cookieValidator(cookies) {
    try {
        await externallyValidateCookie(cookies.testCookie);
    } catch {
        throw new Error("Invalid cookies");
    }
}

async function validateCookies(req, _res, next) {
    await cookieValidator(req.cookies);
    next();
}

app.use(cookieParser());

app.use(validateCookies);

// error handler
app.use((err, _req, res, _next) => {
    res.status(400).send(err.message);
});

app.listen(3000);
