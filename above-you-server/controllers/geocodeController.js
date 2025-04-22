const axios = require('axios');

exports.reverseGeocode = async (req, res) => {
	const { lat, lon } = req.query;

	if (!lat || !lon) {
		return res.status(400).json({ error: "Missing coordinates" });
	}

	try {
		const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
			params: {
				lat,
				lon,
				format: "json",
				"accept-language": "en"
			},
		});

		res.json(response.data);
	} catch (err) {
		console.error("[Reverse Geocode Error]", err.message || err);
		res.status(500).json({ error: "Failed to fetch geolocation" });
	}
};