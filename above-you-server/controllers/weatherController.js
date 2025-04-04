const axios = require('axios');

exports.getWeather = async (req, res) => {

  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
      },
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

};