require('dotenv').config();
const rateLimit = require('express-rate-limit');

// Auth limiter settings (e.g. for /api/auth)
const authLimiter = rateLimit({
	windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000'),
	max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'),
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: "Too many auth requests. Please slow down."
	}
});

// General limiter settings (e.g. for /api/weather, /api/iss, etc.)
const generalLimiter = rateLimit({
	windowMs: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '60000'),
	max: parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '100'),
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: "Too many requests. Please try again later."
	}
});

module.exports = {
	authLimiter,
	generalLimiter
};
