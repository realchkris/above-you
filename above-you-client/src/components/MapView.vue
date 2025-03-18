<template>
	<div class="map-container">
		<div id="map"></div>
	</div>
</template>

<script setup>

import { onMounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Avoid Leaflet missing icons issue by manually stating where to find the icons
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

let map; // Variable used for the map

let lastOSMCoords = null; // Stores last OSM API call position
const distanceThreshold = 100; // Measured in meters (100m)
let userMarker = null; // Stores the current user position marker

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // Server URL (or localhost)

// Haversine Formula to check real-world distance (returned in meters)
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

// Function to check if to make an OSM API call is necessary (reduces API calls)
function shouldUpdateLocation(newLat, newLon) {

	// If it's the first time, always fetch OSM coordinates
	if (!lastOSMCoords) return true;

	// Destructuring latitude and longitude from lastOSMCoords
	const { lat, lon } = lastOSMCoords;

	// If the user has moved far enough, return true
	return getDistance(lat, lon, newLat, newLon) > distanceThreshold;

}

// Function to call the backend to get location details based on GPS coordinates.
async function fetchReverseGeocode(lat, lon) {

	try {

		const response = await fetch(`${API_BASE_URL}/api/reverse-geocode?lat=${lat}&lon=${lon}`);
		const data = await response.json();

		if (data.error) {
			console.warn("Reverse Geocoding API Error:", data.error);
			return null;
		}

		console.log("Updated Location:", data.display_name);

		lastOSMCoords = { lat, lon };
		return data.display_name;

	} catch (error) {
		console.error("Reverse Geocoding Error:", error);
		return null;
	}
	
}

// Initializes the Leaflet map
function initializeMap() {

	map = L.map("map").setView([51.505, -0.09], 13);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(map);

	// Fix tile display issues
	setTimeout(() => map.invalidateSize(), 300);

}

onMounted(() => {

	// Wait for Vue to finish rendering
	nextTick(() => {
		if (!map) initializeMap();
	});

	// Actively track user location in real-time
	navigator.geolocation.watchPosition(

		// Runs when the position updates
		async (position) => {

			// Getting new coordinates
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;

			console.log("Browser GPS Coordinates:", lat, lon);

			// First-time setup: Center map & store initial position
			if (!lastOSMCoords) {

				lastOSMCoords = { lat, lon };
				map.setView([lat, lon], 13);
				userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map);

				await fetchReverseGeocode(lat, lon); // First API call
				return;

			}

			// Avoiding excessive API calls by checking if the user has moved a significant distance
			if (shouldUpdateLocation(lat, lon)) {
				await fetchReverseGeocode(lat, lon);
				map.setView([lat, lon], 13); // Center map
			}

			// Update user marker
			if (userMarker) {
				userMarker.setLatLng([lat, lon]);
			} else {
				userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map);
			}

		},

		// Error occurring case
		(error) => { console.error("Geolocation error:", error); },

		// Configuration settings
		{ enableHighAccuracy: true } // More accurate tracking

	);

});

// Resize event listener to ensure the map adjusts when the window resizes
// Done to ensure Leaflet tiles don’t break when/if the user resizes the window
window.addEventListener("resize", () => {
	if (map) setTimeout(() => map.invalidateSize(), 300);
});

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