// Load environment variables from .env file
require("dotenv").config();

// Base dependencies
const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Express app setup
const app = express();

// Load .env values or use fallback
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

// Configure CORS (who can access the API)
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));

// Log every request to the console
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// Reverse Geocoding (OpenStreetMap - Nominatim)
app.get("/api/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon, format: "json" }
    });
    res.json(response.data);
  } catch (err) {
    console.error("[Reverse Geocoding Error]", err.message || err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ISS Current Location (Open Notify API)
app.get("/api/iss-flyover", async (req, res) => {
  try {
    const response = await axios.get("http://api.open-notify.org/iss-now.json");
    const { latitude, longitude } = response.data.iss_position;
    res.json({ latitude, longitude });
  } catch (err) {
    console.error("[ISS API Error]", err.message || err);
    res.status(500).json({ error: "Failed to retrieve ISS location" });
  }
});

// Celestial Objects (AstronomyAPI.com)
/*
app.get("/api/celestial", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });

  const apiKey = process.env.ASTRONOMY_API_KEY;
  const appId = process.env.ASTRONOMY_APP_ID;

  if (!apiKey || !appId) {
    return res.status(500).json({ error: "Missing AstronomyAPI credentials." });
  }

  try {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const date = local.toISOString().split("T")[0];
    const time = local.toISOString().split("T")[1].split(".")[0];

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

    // Loop through all objects and separate visible vs filtered
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

    console.log("Filtered out objects:", filteredOut);

    res.json({
      visible: visibleObjects,
      filteredOut
    });

  } catch (err) {
    console.error("[Celestial API Error]", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch celestial data" });
  }
});
*/

// Current Weather (Open-Meteo)
app.get("/api/weather", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });

  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true
      }
    });

    const weather = response.data.current_weather;

    if (!weather) {
      return res.status(500).json({ error: "Weather data not available" });
    }

    res.json({
      temperature: weather.temperature,
      windspeed: weather.windspeed,
      winddirection: weather.winddirection,
      weathercode: weather.weathercode,
      time: weather.time
    });
  } catch (err) {
    console.error("[Weather API Error]", err.message || err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});
