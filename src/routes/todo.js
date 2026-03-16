var express = require("express");
var router = express.Router();

const todos = ["helo"];
/* GET home page. */
router.get("/", (_req, res) => {
	res.send(todos);
});

router.post("/", (req, res) => {
	const todo = req.body; // expects JSON body like { task: "do something" }

	if (!todo || !todo.task) {
		return res.status(400).send({ error: "Todo must have a task" });
	}
	console.log(todos);

	todos.push(todo);
	res.status(201).send(`recived request with data: ${todo.task} `);
});
module.exports = router;
