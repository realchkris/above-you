module.exports = {
	PORT: process.env.PORT || 5000,
	ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()),
	AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000'),
	AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'),
	GENERAL_RATE_LIMIT_WINDOW_MS: parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '60000'),
	GENERAL_RATE_LIMIT_MAX: parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '100'),
};