<!-- PURPOSE: Shows ISS pass-over times. -->
<template>

	<div>ISS</div>
	<div>Location: {{ issCoordinates.lat }}, {{ issCoordinates.lon }}</div>
	<div>🛰️ -- 👤: {{ distanceToISS }}</div>

</template>

<script setup>

import { ref, computed, onMounted } from "vue";
import { getDistance } from "../utils/geolocation.js";

// User coordinates (to be received from MapView.vue)
const props = defineProps({
    userCoordinates: Object
});

// Emits to notify parent component of errors
const emit = defineEmits(["errorOccurred"]);
	
// Server URL (or localhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Fetch interval (default 15 sec)
const ISS_FETCH_INTERVAL = parseInt(import.meta.env.VITE_ISS_FETCH_INTERVAL || "15000", 10);

const issCoordinates = ref({ lat: null, lon: null }); // Stores ISS coordinates

// Stores the ISS distance from the user
const distanceToISS = computed(() => {

	// Default when data is missing
	if (!props.userCoordinates?.lat || !props.userCoordinates?.lon || 
        !issCoordinates.value.lat || !issCoordinates.value.lon) {
        return "Calculating...";
    }

    // Ensure coordinates are numbers
    const userLat = parseFloat(props.userCoordinates.lat);
    const userLon = parseFloat(props.userCoordinates.lon);
    const issLat = parseFloat(issCoordinates.value.lat);
    const issLon = parseFloat(issCoordinates.value.lon);

    console.log("[getDistance] Parsed Coordinates:", userLat, userLon, issLat, issLon);

    return (getDistance(
        props.userCoordinates.lat,
        props.userCoordinates.lon,
        issCoordinates.value.lat,
        issCoordinates.value.lon
    ) / 1000).toFixed(2) + " km"; // Convert to km & round to 2 decimals

});

// Fetch ISS coordinates
async function fetchISSCoordinates() {

	try {

		const response = await fetch(`${API_BASE_URL}/api/iss-flyover`);
		const data = await response.json();

		if (!data.latitude || !data.longitude || isNaN(data.latitude) || isNaN(data.longitude)) {
            console.error("[ISS API] Invalid ISS data:", data);
            emit("errorOccurred", "🚀 ISS location data is invalid.");
            return;
        }

        console.log("[ISS API] Received Data:", data);

		// Update ISS position
		issCoordinates.value = { lat: parseFloat(data.latitude), lon: parseFloat(data.longitude) };

	} catch (error) {
		console.error("[ISS Coordinates Fetching] Network Error:", error);
		emit("errorOccurred", "❌ Network error. Please check your connection.");
	}

}

// Fetch ISS data on component mount
onMounted(() => {

	fetchISSCoordinates();

	// Fetch ISS location every N seconds
	setInterval(fetchISSCoordinates, ISS_FETCH_INTERVAL);

});

</script>