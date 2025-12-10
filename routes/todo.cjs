var express = require("express");
var router = express.Router();

let todos = ["helo"];
/* GET home page. */
router.get("/", function (_req, res) {
    res.send(todos);
});

router.post("/", function (req, res) {
    const todo = req.body; // expects JSON body like { task: "do something" }

    if (!todo || !todo.task) {
        return res.status(400).send({ error: "Todo must have a task" });
    }
    console.log(todos);

    todos.push(todo);
    res.status(201).send(`recived request with data: ${todo}`); // return the added todo
});
module.exports = router;
