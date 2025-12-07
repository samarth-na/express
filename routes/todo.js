const { log } = require("debug/src/browser");
var express = require("express");
var router = express.Router();

todo = {};
let todos = [todo, "helo"];
/* GET home page. */
router.get("/", function (req, res) {
    res.send(todos);
});

router.post("/", function (req, res) {
    res.send("recived request");
    const newTodo = req.body; // expects JSON body like { task: "do something" }

    if (!newTodo || !newTodo.task) {
        return res.status(400).send({ error: "Todo must have a task" });
    }

    todos.push(newTodo);
    res.status(201).send(newTodo); // return the added todo
});
module.exports = router;
