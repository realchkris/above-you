// Base dependencies
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const corsOptions = {
    origin: "*", // Allows all domains (for testing)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
};

// Initializing app
const app = express();
const PORT = process.env.PORT || 5000;

// Initializing CORS
app.use(cors(corsOptions));

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware or route handler
});

// Proxy makes a Reverse Geocoding Request to OpenStreetMap (OSM)
// Reverse Geocoding: Converts latitude/longitude into a human-readable address (city, street, country).
// We already have latitude and longitude from the browser, but we call OSM to:
// - Get city/street information for user experience (UX)
// - Ensure we display a properly formatted location name
app.get("/api/reverse-geocode", async (req, res) => {

	try {

		const { lat, lon } = req.query;
		if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });

		const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
			params: {
				lat,
				lon,
				format: "json"
			}
		});

		res.json(response.data);

	} catch (error) {
		console.error("Error fetching geolocation data:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}

});

// Start the server
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));