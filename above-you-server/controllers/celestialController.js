// Requirements
const axios = require('axios');

exports.getCelestialData = async (req, res) => {

	const { lat, lon } = req.query;
	if (!lat || !lon) {
		return res.status(400).json({ error: 'Missing coordinates' });
	}

	const apiKey = process.env.ASTRONOMY_API_KEY;
	const appId = process.env.ASTRONOMY_APP_ID;

	if (!apiKey || !appId) {
		return res.status(500).json({ error: 'Missing AstronomyAPI credentials' });
	}

	try {

		const now = new Date();
		const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
		const date = local.toISOString().split('T')[0];
		const time = local.toISOString().split('T')[1].split('.')[0];

		const response = await axios.get("https://api.astronomyapi.com/api/v2/bodies/positions", {
			params: {
				latitude: lat,
				longitude: lon,
				elevation: 0,
				from_date: date,
				to_date: date,
				time
			},
			headers: {
				Authorization: `Basic ${Buffer.from(`${appId}:${apiKey}`).toString("base64")}`
			}
		});

		const bodies = response.data.data.table.rows;

		const visibleObjects = [];
		const filteredOut = [];

		bodies.forEach(row => {
			const cell = row.cells?.[0];
			const position = cell?.position?.horizontal;

			if (position && parseFloat(position.altitude.degrees) > 0) {
				visibleObjects.push({
					name: row.entry.name,
					altitude: parseFloat(position.altitude.degrees),
					azimuth: parseFloat(position.azimuth.degrees),
					magnitude: cell.extraInfo?.magnitude ?? "N/A"
				});
			} else {
				filteredOut.push({
					name: row.entry.name,
					reason: !position
					? "No horizontal position"
					: `Below horizon (alt: ${position.altitude.degrees})`
				});
			}
		});

		res.json({
			visible: visibleObjects,
			filteredOut
		});

	} catch (err) {
		console.error("[Celestial API Error]", err.response?.data || err.message);
		res.status(500).json({ error: "Failed to fetch celestial data" });
	}

};
