<!-- PURPOSE: Shows the International Space Station (ISS) location and calculates the ISS - user distance in real time. -->
<template>

	<div class="flex flex-col items-center text-center">

		<!-- ISS Location -->
		<div class="mt-2">
			<span class="flex gap-5">
				<!-- Latitude -->
				<div class="flex flex-col items-center">
					<span class="font-bold">Lat</span>
					<span v-if="isLoadingISS" class="loader"></span>
					<span v-else-if="issError">❌</span>
					<span v-else>{{ issCoordinates.lat }}</span>
				</div>

				<!-- Longitude -->
				<div class="flex flex-col items-center">
					<span class="font-bold">Lon</span>
					<span v-if="isLoadingISS" class="loader"></span>
					<span v-else-if="issError">❌</span>
					<span v-else>{{ issCoordinates.lon }}</span>
				</div>
			</span>
		</div>

		<!-- Distance -->
		<div class="mt-2">
			<span>🛰️ -- 👤</span>
			<div>
				<span v-if="isCalculatingDistance" class="loader"></span>
				<span v-else-if="distanceError">❌</span>
				<span v-else>{{ distanceToISS }}</span>
			</div>
		</div>

	</div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { getDistance } from "../utils/geolocation.js";

// Props
const props = defineProps({
	userCoordinates: Object
});
const emit = defineEmits(["errorOccurred"]);

// Config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const ISS_FETCH_INTERVAL = parseInt(import.meta.env.VITE_ISS_FETCH_INTERVAL || "15000", 10);

// State
const issCoordinates = ref({ lat: null, lon: null });
const distanceToISS = ref("");

const isLoadingISS = ref(true);
const hasFetchedISS = ref(false);
const isCalculatingDistance = ref(true);

const issError = ref(false);
const distanceError = ref(false);

const hasCalculatedDistance = ref(false);

// Distance watcher (Auto calculate distance when values change)
watch(
	() => [
		props.userCoordinates.lat,
		props.userCoordinates.lon,
		issCoordinates.value.lat,
		issCoordinates.value.lon
	],
	() => {
		const userLat = props.userCoordinates.lat;
		const userLon = props.userCoordinates.lon;
		const issLat = issCoordinates.value.lat;
		const issLon = issCoordinates.value.lon;

		const allValid = userLat && userLon && issLat && issLon;

		if (allValid) {

			// Only show loader if this is the first time
			if (!hasCalculatedDistance.value) {
				isCalculatingDistance.value = true;
			}

			setTimeout(() => {
				distanceToISS.value =
					(getDistance(userLat, userLon, issLat, issLon) / 1000).toFixed(2) + " km";
				distanceError.value = false;
				isCalculatingDistance.value = false;
				hasCalculatedDistance.value = true;
			}, 300);

		} else {

			// Delay before showing error if values still missing
			setTimeout(() => {
				const stillInvalid =
					!(props.userCoordinates.lat && props.userCoordinates.lon &&
					  issCoordinates.value.lat && issCoordinates.value.lon);

				if (stillInvalid && !hasCalculatedDistance.value) {
					distanceError.value = true;
					isCalculatingDistance.value = false;
				}
			}, 1000); // Delay for smoother UX

		}
	},
	{ immediate: true }
);

// Fetch ISS Coordinates
async function fetchISSCoordinates() {

	// Show loader ONLY if this is the first fetch
	if (!hasFetchedISS.value) {
		isLoadingISS.value = true;
	}

	distanceError.value = false;

	try {
		const response = await fetch(`${API_BASE_URL}/api/iss-flyover`);
		const data = await response.json();

		if (!data.latitude || !data.longitude || isNaN(data.latitude) || isNaN(data.longitude)) {
			throw new Error("Invalid data");
		}

		issCoordinates.value = {
			lat: parseFloat(data.latitude),
			lon: parseFloat(data.longitude)
		};

		issError.value = false;
		hasFetchedISS.value = true;

	} catch (err) {
		console.error("[ISS API]", err);
		issError.value = true;
		emit("errorOccurred", "❌ Failed to fetch ISS coordinates.");
	} finally {
		isLoadingISS.value = false;
	}
	
}

// Polling
let intervalId = null;

onMounted(async () => {
	await fetchISSCoordinates();
	intervalId = setInterval(fetchISSCoordinates, ISS_FETCH_INTERVAL);
});

onUnmounted(() => {
	if (intervalId) clearInterval(intervalId);
});
</script>
