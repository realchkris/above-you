import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

export function getCountryCode(countryName) {
	if (!countryName) return null
	return countries.getAlpha2Code(countryName, 'en') || null
}

export function getCountryName(code) {
	if (!code) return null
	return countries.getName(code, 'en') || null
}