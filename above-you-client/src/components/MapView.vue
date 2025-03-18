<template>

	<div class="map-container">
		<div id="map"></div>
	</div>

</template>

<script setup>

import { onMounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map; // Variable used for the map

let lastOSMCoords = null; // Stores last OSM API call position
const distanceThreshold = 100; // Measured in meters (100m)
let userMarker = null; // Stores the current user position marker

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Server URL

// Function to check if to make an OSM API call is necessary (reduces API calls)
function shouldUpdateLocation(newLat, newLon) {

	if (!lastOSMCoords) return true; // If it's the first time, always fetch OSM coordinates

	// Destructuring latitude and longitude from lastOSMCoords
	const { lat, lon } = lastOSMCoords;

	// If the user has moved far enough, return true
	return getDistance(lat, lon, newLat, newLon) > distanceThreshold;

}

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

// Resize event listener to ensure the map adjusts when the window resizes
// Done in order to ensure Leaflet tiles don’t break when/if the user resizes the window
window.addEventListener("resize", () => {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }
});

onMounted(() => {

	// Wait for Vue to finish rendering
	nextTick(() => {

	    if (!map) {
	    	map = L.map("map").setView([51.505, -0.09], 13);

	    	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	    		attribution: '&copy; OpenStreetMap contributors'
	    	}).addTo(map);

	    	// Fixing map tiling issues (recalculates the map dimensions after 300ms)
	    	setTimeout(() => {
	    		map.invalidateSize();
	    	}, 300);

	    }

	});

	// Actively track user location
	navigator.geolocation.watchPosition(

		// Runs when the position updates
		(position) => {

			// Getting new coordinates
			const lat = position.coords.latitude;
			const lon = position.coords.longitude;

			// First-time setup: Center map & store initial position
			if (!lastOSMCoords) {
				lastOSMCoords = { lat, lon };
				map.setView([lat, lon], 13);
				userMarker = L.marker([lat, lon]).addTo(map);
			}

			console.log("Browser GPS Coordinates:", lat, lon);

			// Avoiding excessive API calls by checking if the user has moved a significant distance
			if(shouldUpdateLocation(lat, lon)){

				fetch(`${API_BASE_URL}/api/reverse-geocode?lat=${lat}&lon=${lon}`)
					.then(response => response.json())
					.then(data => {

						if(data.error) {
							console.warn("Reverse Geocoding API Error:", data.error);
						} else {
							console.log("Updated Location:", data.display_name);
							lastOSMCoords = {lat, lon}; // Save last position
						}

					})
					.catch(error => console.error("Reverse Geocoding Error:", error));

				// Update the map, IF initialized (there’s a slight chance watchPosition() might run before the map is initialized)
				if (map) map.setView([lat, lon], 13);

				// Remove the old marker if it exists
				if(userMarker){
					map.removeLayer(userMarker);
				}

				// Add a new marker for the current position
				userMarker = L.marker([lat, lon]).addTo(map);

			}

		},

		// Error occurring case
		(error) => {
			console.error("Geolocation error:", error);
		},

		// Configuration settings
		{ enableHighAccuracy: true } // More accurate tracking

	);

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