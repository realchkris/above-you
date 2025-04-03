export function getTemperatureLabel(temp) {
	if (temp <= 5) return "Cold";
	if (temp >= 25) return "Hot";
	return "Mild";
}

export function getTemperatureIcon(temp) {
	if (temp <= 5) return "temp-cold.png";
	if (temp >= 25) return "temp-hot.png";
	return "temp-mild.png";
}

const icons = import.meta.glob("../assets/temperature/*.png", {
	eager: true,
	as: "url",
});

export function getTemperatureIconUrl(temp) {
	const filename = getTemperatureIcon(temp);
	return icons[`../assets/temperature/${filename}`] || icons["../assets/temperature/temp-mild.png"];
}