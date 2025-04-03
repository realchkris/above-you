/**
 * Label based on wind speed in km/h
 * @param {number} speed
 * @returns {string}
 */
export function getWindLabel(speed) {
	if (speed < 10) return "Calm";
	if (speed < 30) return "Moderate";
	return "Strong";
}

/**
 * Returns the matching wind icon filename
 * @param {number} speed
 * @returns {string}
 */
export function getWindIcon(speed) {
	if (speed < 10) return "wind-calm.png";
	if (speed < 30) return "wind-moderate.png";
	return "wind-strong.png";
}

// Preload icons as URLs
const icons = import.meta.glob("../assets/wind/*.png", {
	eager: true,
	as: "url",
});

/**
 * Get full URL for wind icon
 * @param {number} speed
 * @returns {string}
 */
export function getWindIconUrl(speed) {
	const filename = getWindIcon(speed);
	return icons[`../assets/wind/${filename}`] || icons["../assets/wind/wind-moderate.png"];
}
