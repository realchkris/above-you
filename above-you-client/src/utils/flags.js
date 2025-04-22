// Converts a country code to a flag emoji
export function countryCodeToEmoji(code) {
	if (!code || code.length !== 2) return '';
	const OFFSET = 0x1F1E6 - 'A'.charCodeAt(0);
	return code
		.toUpperCase()
		.split('')
		.map(char => String.fromCodePoint(char.charCodeAt(0) + OFFSET))
		.join('');
}
