const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../services/db');
const validator = require('validator');

exports.register = async (req, res) => {

	const { email, password } = req.body;

	// Check if email and password are provided
	if (!email || !password) {
		console.error('Email or password missing in the request body.');
		return res.status(400).json({ error: 'Email and password required' });
	}

	// Validate email format
	if (!validator.isEmail(email)) {
		console.error('Invalid email format:', email);
		return res.status(400).json({ error: 'Invalid email address' });
	}

	try {

		// Check if email is already registered
		const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
		if (existing.rows.length > 0) {
			console.log('Email already registered:', email);
			return res.status(409).json({ error: 'Email already registered' });
		}

		// Hash the password
		const password_hash = await bcrypt.hash(password, 10);
		const result = await pool.query(
			'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
			[email, password_hash]
		);

		const user = result.rows[0];

		// Generate a JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		);

		console.log('User registered:', result.rows[0]);

		res.json({ token, user: { id: user.id, email: user.email } });

	} catch (err) {
		console.error('Error in /register:', err);
		res.status(500).json({ error: 'Server error during registration' });
	}

};

exports.login = async (req, res) => {

	const { email, password } = req.body;

	// Check if email and password are provided
	if (!email || !password) {
		console.error('Email or password missing in the request body.');
		return res.status(400).json({ error: 'Email and password required' });
	}

	// Validate email format
	if (!validator.isEmail(email)) {
		console.error('Invalid email format:', email);
		return res.status(400).json({ error: 'Invalid email address' });
	}

	try {
		console.log('Connecting to database...');
		// Check if the email exists in the database
		const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		// Log the query result
		console.log('Query result:', result.rows);

		if (result.rows.length === 0) {
			console.log('Invalid credentials for email:', email);
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		const user = result.rows[0];

		// Compare the password with the hashed password stored in the database
		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword) {
			console.log('Invalid credentials for email:', email);
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Generate a JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		);
		console.log('User logged in:', user.email);

		res.json({ token, user: { id: user.id, email: user.email } });

	} catch (err) {
		console.error('Error in /login:', err);
		res.status(500).json({ error: 'Server error during login' });
	}

};
