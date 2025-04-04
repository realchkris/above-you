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

const icons = import.meta.glob("../assets/celestial/*.png", {
	eager: true,
	import: 'default',
	query: '?url'
});

export function getCelestialIconUrl(name) {
	const filename = celestialIconMap[name] || "unknown.png";
	return icons[`../assets/celestial/${filename}`] || icons["../assets/celestial/unknown.png"];
}
