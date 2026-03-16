const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var router = express.Router();

// Configuration (Ideally, these should come from environment variables in a real app)
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-rhcsa-key";

// Middleware
router.use(cors());
router.use(json());

// --- Signup Handler ---
router.post("/signup", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password required" });
	}

	const existingUser = db
		.prepare("SELECT id FROM users WHERE email = ?")
		.get(email);

	if (existingUser) {
		return res.status(409).json({ error: "User already exists" });
	}

	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
	const info = stmt.run(email, hashedPassword);

	const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, {
		expiresIn: "1h",
	});

	res.status(201).json({
		message: "User created successfully",
		user: { id: info.lastInsertRowid, email },
		token,
	});
});

// --- Signin Handler ---
router.post("/signin", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password required" });
	}

	const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

	if (!user) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const isValid = await bcrypt.compare(password, user.password);

	if (!isValid) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
		expiresIn: "1h",
	});

	res.json({
		message: "Sign in successful",
		user: { id: user.id, email: user.email },
		token,
	});
});

// --- Middleware to verify JWT ---
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Access denied. No token provided." });
	}

	try {
		const verified = jwt.verify(token, JWT_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		return res.status(403).json({ error: "Invalid or expired token." });
	}
};

// --- Protected Routes ---

// GET Data (Note: mapped to root of this router)
router.get("/", authenticateToken, (req, res) => {
	res.json({
		message: "You accessed protected data!",
		userId: req.user.id,
		email: req.user.email,
		data: [
			{ id: 1, title: "System Config A", status: "active" },
			{ id: 2, title: "Network Settings", status: "pending" },
		],
	});
});

// PUT Data
router.put("/:id", authenticateToken, (req, res) => {
	const { id } = req.params;
	const { updateData } = req.body;

	res.json({
		message: `Data ID ${id} updated successfully by user ${req.user.email}`,
		updatedBy: req.user.email,
		payload: updateData,
	});
});

// Export the router instead of starting the server
module.exports = router;
