<template>

	<div class="base-container bg-ay-dark text-white mb-4 text-ellipsis overflow-hidden whitespace-pre-wrap min-h-[40px] max-w-80">📍 {{userLocation}}</div>

	<div class="map-container">
		<div id="map"></div>
	</div>

</template>

<script setup>

import { ref, onMounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const map = ref(null); // Variable used for the map

let userMarker = null; // Stores the current user position marker
let lastOSMCoords = null; // Stores last OSM API call position

// Environmental variables (+ fallback results)

// Server URL (or localhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Default to 15 sec if env is missing
const GEO_TIMEOUT = parseInt(import.meta.env.VITE_GEOLOCATION_TIMEOUT || "15000", 10);

// Default to 30 sec old data if env is missing
const MAXIMUM_AGE = parseInt(import.meta.env.VITE_GEOLOCATION_MAXIMUM_AGE || "30000", 10);

// Distance Threshold (meters)
const DISTANCE_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);

// Fix Leaflet missing icons issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41], // Default size
	iconAnchor: [12, 41], // Adjust anchor
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

// User address
const userLocation = ref("Locating..."); // Default text

const CENTER_THRESHOLD = 1000; // Meters before auto-centering the map again

// Haversine Formula to calculate real-world distance (in meters)
function getDistance(lat1, lon1, lat2, lon2) {

	const R = 6371e3; // Earth’s radius in meters
	const toRad = (x) => (x * Math.PI) / 180;

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c; // Returns distance in meters

}

// Check if an OSM API call is necessary (reduces API calls)
function shouldUpdateLocation(newLat, newLon) {

	// If it's the first time, always fetch OSM coordinates
	if (!lastOSMCoords) return true;

	// Destructuring latitude and longitude from lastOSMCoords
	const { lat, lon } = lastOSMCoords;

	// If the user has moved far enough, return true
	return getDistance(lat, lon, newLat, newLon) > DISTANCE_THRESHOLD;

}

// Fetch location details via Reverse Geocoding API
async function fetchReverseGeocode(lat, lon) {

	try {

		const response = await fetch(`${API_BASE_URL}/api/reverse-geocode?lat=${lat}&lon=${lon}`);
		const data = await response.json();

		if (data.error) {
			console.warn("[Reverse Geocoding] API Error:", data.error);
			return null;
		}

		console.log("[Updated Location]:", data.display_name);

		lastOSMCoords = { lat, lon };
		return data.display_name;

	} catch (error) {
		console.error("[Reverse Geocoding] Network Error:", error);
		return null;
	}
	
}

// Initialize the Leaflet map
function initializeMap() {

	map.value = L.map("map").setView([51.505, -0.09], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value);

	// Fix tile rendering issue
	setTimeout(() => map.value.invalidateSize(), 300);

}

// Handle Geolocation Success
async function handleGeolocationSuccess(position) {

	const lat = position.coords.latitude;
	const lon = position.coords.longitude;

	console.log("[GPS Coordinates]:", lat, lon);

	// Recenter map if necessary
	if (shouldRecenterMap(lat, lon)) {
		map.value.setView([lat, lon], 13);
  }

	// First-time setup: Center map & store initial position
	if (!lastOSMCoords) {

		lastOSMCoords = { lat, lon };
		map.value.setView([lat, lon], 13);
		userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map.value);

		userLocation.value = await fetchReverseGeocode(lat, lon); // Initial API call
		return;

	}

	// If user has moved significantly, update marker position
	if (shouldUpdateLocation(lat, lon)) {

		map.value.setView([lat, lon], 13); // Center map
		userLocation.value = await fetchReverseGeocode(lat, lon);

	}

	// Update user marker
	if (userMarker) {
		userMarker.setLatLng([lat, lon]);
	} else {
		userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map.value);
	}

}

// Handle Geolocation Errors through alerts
function handleGeolocationError(error) {

	console.error("[Geolocation Error]:", error);

	switch (error.code) {

		case error.PERMISSION_DENIED:
			alert("❌ Location access denied. Please enable location permissions in your browser settings.");
			break;
		case error.POSITION_UNAVAILABLE:
			alert("⚠️ Location unavailable. Try moving to an open area.");
			break;
		case error.TIMEOUT:
			alert("⏳ Location request timed out. Try again in a better signal area.");
			break;
		default:
			alert("❓ Unknown location error occurred.");

	}

}

onMounted(() => {

	// Wait for Vue to finish rendering
	nextTick(() => {
		if (!map.value) initializeMap();
	});

	// Actively track user location in real-time
	navigator.geolocation.watchPosition(

		handleGeolocationSuccess,
		handleGeolocationError,
		{ enableHighAccuracy: true, timeout: GEO_TIMEOUT, maximumAge: MAXIMUM_AGE }

	);

});

// Improve Map Responsiveness on Window Resize
window.addEventListener("resize", () => {
	if (map.value) setTimeout(() => map.value.invalidateSize(), 300);
});

function shouldRecenterMap(lat, lon) {

	if (!map.value) return false;

	const currentCenter = map.value.getCenter();
	const distance = getDistance(currentCenter.lat, currentCenter.lng, lat, lon);

	return distance > CENTER_THRESHOLD; // If user moved > 1km, recenter

}

</script>

<style scoped>

.map-container {
  width: 100%;
  max-width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
  min-width: 300px;
  min-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

</style>