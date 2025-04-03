export const weatherCodeMap = {
	0: "Clear sky",
	1: "Mainly clear",
	2: "Partly cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Rime fog",
	51: "Light drizzle",
	53: "Moderate drizzle",
	55: "Dense drizzle",
	61: "Slight rain",
	63: "Moderate rain",
	65: "Heavy rain",
	71: "Slight snow",
	73: "Moderate snow",
	75: "Heavy snow",
	80: "Light showers",
	81: "Moderate showers",
	82: "Violent showers",
	95: "Thunderstorm",
	96: "Thunderstorm + light hail",
	99: "Thunderstorm + heavy hail",
};

export function getWeatherDescription(code) {
	return weatherCodeMap[code] || "Unknown";
}

// Map simplified icon names — group multiple codes into categories
export function getWeatherIcon(code) {
	if ([0, 1].includes(code)) return "clear.png";
	if ([2, 3].includes(code)) return "cloudy.png";
	if ([45, 48].includes(code)) return "fog.png";
	if ([51, 53, 55].includes(code)) return "drizzle.png";
	if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain.png";
	if ([71, 73, 75].includes(code)) return "snow.png";
	if ([95, 96, 99].includes(code)) return "thunderstorm.png";
	return "unknown.png";
}

// Icon imports (only works in setup context)
const icons = import.meta.glob("../assets/weather/*.png", {
	eager: true,
	as: "url",
});

export function getWeatherIconUrl(code) {
	const filename = getWeatherIcon(code);
	return icons[`../assets/weather/${filename}`] || icons["../assets/weather/unknown.png"];
}
