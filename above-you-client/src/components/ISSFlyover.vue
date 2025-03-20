<!-- PURPOSE: Shows ISS pass-over times. -->
<template>

	<div class="flex flex-col items-center text-center">

		<!-- Title -->
		<div class="flex items-center gap-2">
			<img class="image-sm" src="../assets/iss.png" alt="ISS Icon">
			<span class="font-bold">International Space Station</span>
		</div>

		<!-- ISS Location -->
		<div class="mt-2">

			<span class="flex gap-5">

				<div class="flex flex-col items-center">
					<span class="font-bold">Lat</span>

					<span v-if="isLoadingISS" class="loader"></span>
					<span v-else>{{ issCoordinates.lat }}</span>
					
				</div>

				<div class="flex flex-col items-center">

					<span class="font-bold">Lon</span>

					<span v-if="isLoadingISS" class="loader"></span>
					<span v-else>{{ issCoordinates.lon }}</span>

				</div>

			</span>

		</div>

		<!-- Distance between user and ISS -->
		<div class="mt-2">
			<span>🛰️ -- 👤</span>
			<div>
				<span v-if="isCalculatingDistance" class="loader"></span>
				<span v-else>
					{{ distanceToISS }}
				</span>
			</div>
		</div>
		
	</div>

</template>

<script setup>

import { ref, watch, onMounted, onUnmounted } from "vue";
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

// Reactive data
const issCoordinates = ref({ lat: null, lon: null }); // Stores ISS coordinates
const distanceToISS = ref("Calculating..."); // Stores user distance to ISS

// Loading states
const isLoadingISS = ref(true);
const isCalculatingDistance = ref(true);

// Immediate trigger for distance calculation
watch(
	() => [props.userCoordinates.lat, props.userCoordinates.lon, issCoordinates.value.lat, issCoordinates.value.lon],
	() => {
		// If user coordinates and ISS coordinates are all present, calculate distance
		if (props.userCoordinates.lat && props.userCoordinates.lon && issCoordinates.value.lat && issCoordinates.value.lon) {
			
			distanceToISS.value = (getDistance(
				props.userCoordinates.lat,
				props.userCoordinates.lon,
				issCoordinates.value.lat,
				issCoordinates.value.lon
			) / 1000).toFixed(2) + " km";

			isCalculatingDistance.value = false;

		}

	},
	{ immediate: true } // Runs once on component mount
);


// Fetch ISS coordinates
async function fetchISSCoordinates() {

	try {

		// Show loader only at the beginning
		if (issCoordinates.value.lat === null || issCoordinates.value.lon === null) isLoadingISS.value = true;

		const response = await fetch(`${API_BASE_URL}/api/iss-flyover`);
		const data = await response.json();

		if (!data.latitude || !data.longitude || isNaN(data.latitude) || isNaN(data.longitude)) {
            console.error("[ISS API] Invalid ISS data:", data);
            emit("errorOccurred", "🚀 ISS location data is invalid.");
            return;
        }

        // console.log("[ISS API] Received Data:", data);

		// Update ISS position
		issCoordinates.value = { lat: parseFloat(data.latitude), lon: parseFloat(data.longitude) };

	} catch (error) {
		console.error("[ISS Coordinates Fetching] Network Error:", error);
		emit("errorOccurred", "❌ Network error. Please check your connection.");
	} finally {
		isLoadingISS.value = false; // Hide loader when done
	}

}

// Fetch ISS data on component mount (wait until userCoordinates is valid before fetching ISS location)
let intervalId = null;

onMounted(() => {

	fetchISSCoordinates(); // Fetch immediately

	intervalId = setInterval(fetchISSCoordinates, ISS_FETCH_INTERVAL); // Set interval

});

// Clear interval if component is unmounted (prevent API call stacking)
onUnmounted(() => {
	if (intervalId) clearInterval(intervalId); // Cleanup interval when component unmounts
});

</script>