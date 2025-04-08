const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { PORT, ALLOWED_ORIGINS } = require('./config/config');

// Routes
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const celestialRoutes = require('./routes/celestialRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');
const issRoutes = require('./routes/issRoutes');

// Rate limiter
const { authLimiter, generalLimiter } = require('./middlewares/rateLimiter');

const app = express();
app.use(express.json());

// CORS (allow only inteded domains)
app.use(cors({

	// Allow non-browser requests (Postman, etc.)
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);

		if (ALLOWED_ORIGINS.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: "Content-Type,Authorization",
}));

// Logging
app.use((req, res, next) => {
	const time = new Date().toISOString();
	console.log(`[${time}] [REQ] ${req.method} ${req.originalUrl}`);
	if (Object.keys(req.body || {}).length) {
		console.log(`            BODY:`, req.body);
	}
	next();
});

// Apply rate limiter only to auth
app.use('/api/auth', authLimiter);

// Applies to everything
app.use('/api', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/celestial', celestialRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/iss', issRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});