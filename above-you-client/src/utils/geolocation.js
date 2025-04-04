export const EARTH_RADIUS = 6371e3; // Earth's radius in meters

const toRad = (degrees) => (degrees * Math.PI) / 180;

export function getDistance(lat1, lon1, lat2, lon2) {

  // console.log(`[getDistance] Calculating distance between: (${lat1}, ${lon1}) and (${lat2}, ${lon2})`);

  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
    console.warn("[getDistance] Invalid coordinates:", lat1, lon1, lat2, lon2);
    return NaN; // Return NaN if input is invalid
  }

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return EARTH_RADIUS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); // Distance in meters

}
