const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db'); // PostgreSQL pool

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {

	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password required' });
	}

	try {

		// Check if user already exists
		const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) {
			return res.status(409).json({ error: 'Email already registered' });
		}

		// Hash password
		const password_hash = await bcrypt.hash(password, 10);

		// Insert user
		const result = await pool.query(
			'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
			[email, password_hash]
			);

		res.status(201).json(result.rows[0]);

	} catch (err) {
		console.error('Error in /register:', err);
		res.status(500).json({ error: 'Server error during registration' });
	}

});

// Login Route
router.post('/login', async (req, res) => {

	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	try {

		// Check if user exists
		const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const user = result.rows[0];

		// Compare the hashed password with the user input
		const validPassword = await bcrypt.compare(password, user.password_hash);

		if (!validPassword) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Create JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }  // Token expires in 1 day
		);

		// Send the token back to the client
		res.json({ token, user: { id: user.id, email: user.email } });
	
	} catch (err) {
		console.error('Error in /login:', err);
		res.status(500).json({ error: 'Server error during login' });
	}

});


module.exports = router;