export function getWindLabel(speed) {
	if (speed < 10) return "Calm";
	if (speed < 30) return "Moderate";
	return "Strong";
}

export function getWindIcon(speed) {
	if (speed < 10) return "wind-calm.png";
	if (speed < 30) return "wind-moderate.png";
	return "wind-strong.png";
}

const icons = import.meta.glob("../assets/wind/*.png", {
	eager: true,
	import: 'default',
	query: '?url'
});

export function getWindIconUrl(speed) {
	const filename = getWindIcon(speed);
	return icons[`../assets/wind/${filename}`] || icons["../assets/wind/wind-moderate.png"];
}
