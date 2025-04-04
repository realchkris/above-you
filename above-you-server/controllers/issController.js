const axios = require('axios');

exports.getISSLocation = async (req, res) => {
  try {
    const response = await axios.get("http://api.open-notify.org/iss-now.json");
    const { latitude, longitude } = response.data.iss_position;
    res.json({ latitude, longitude });
  } catch (err) {
    console.error("[ISS API Error]", err.message || err);
    res.status(500).json({ error: "Failed to retrieve ISS location" });
  }
};