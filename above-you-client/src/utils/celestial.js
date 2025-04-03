/**
 * Maps celestial object names to local icon filenames
 */
const celestialIconMap = {
	Moon: "moon.png",
	Sun: "sun.png",
	Mercury: "mercury.png",
	Venus: "venus.png",
	Mars: "mars.png",
	Jupiter: "jupiter.png",
	Saturn: "saturn.png",
	Uranus: "uranus.png",
	Neptune: "neptune.png",
	Pluto: "pluto.png",
	ISS: "iss.png", // Just in case
};

/**
 * Preload all celestial icons
 */
const icons = import.meta.glob("../assets/celestial/*.png", {
	eager: true,
	as: "url",
});

/**
 * Return full image URL for a given celestial body name.
 * Defaults to 'unknown.png' if not matched.
 *
 * @param {string} name - The celestial object name (e.g., "Mars")
 * @returns {string} - Full asset URL for the icon
 */
export function getCelestialIconUrl(name) {
	const filename = celestialIconMap[name] || "unknown.png";
	return icons[`../assets/celestial/${filename}`] || icons["../assets/celestial/unknown.png"];
}
