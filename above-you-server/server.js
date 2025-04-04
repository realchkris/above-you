const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { PORT, ALLOWED_ORIGIN } = require('./config/config');

const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const celestialRoutes = require('./routes/celestialRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');
const issRoutes = require('./routes/issRoutes');

const app = express();
app.use(express.json());

app.use(cors({
	origin: ALLOWED_ORIGIN,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: "Content-Type,Authorization",
}));

app.use((req, res, next) => {
	const time = new Date().toISOString();
	console.log(`[${time}] [REQ] ${req.method} ${req.originalUrl}`);
	if (Object.keys(req.body || {}).length) {
		console.log(`            BODY:`, req.body);
	}
	next();
});

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/celestial', celestialRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/iss', issRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});