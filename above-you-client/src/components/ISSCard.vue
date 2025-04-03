<!-- PURPOSE: Shows the International Space Station (ISS) location and calculates the ISS - user distance in real time. -->
<template>

	<div class="flex flex-col items-center text-center">

		<!-- ISS Location -->
		<transition name="fade" mode="out-in">

			<div
				:key="isLoadingISS ? 'loading' : issError ? 'error' : 'data'"
				class="flex flex-col items-center space-y-2"
			>

				<!-- Loading -->
				<div v-if="isLoadingISS" class="flex flex-col items-center gap-3">
					<div class="flex gap-3">
						<SkeletonCard class="h-16 w-20" />
						<SkeletonCard class="h-16 w-20" />
					</div>
					<SkeletonCard class="h-16 w-20" />
				</div>

				<!-- Error -->
				<div v-else-if="issError">❌</div>

				<!-- Data -->
				<div v-else class="flex flex-col items-center space-y-2">

					<!-- ISS Coordinates -->
					<div class="flex gap-3 justify-center">

						<div class="base-container bg-ay-teal flex flex-col items-center">
							<span class="text-xs">Lat</span>
							<span>{{ issCoordinates.lat }}</span>
						</div>

						<div class="base-container bg-ay-teal flex flex-col items-center">
							<span class="text-xs">Lon</span>
							<span>{{ issCoordinates.lon }}</span>
						</div>

					</div>

					<!-- Distance -->
					<div class="base-container bg-ay-teal">
						<span class="text-xs">🛰️ — 👤</span>
						<div>
							<span v-if="isCalculatingDistance" class="loader"></span>
							<span v-else>{{ distanceToISS }}</span>
						</div>
					</div>

				</div>
			</div>

		</transition>

	</div>
</template>

<script setup>

import { ref, watch, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { getDistance } from "../utils/geolocation.js";
import SkeletonCard from "./SkeletonCard.vue";

// Emits
const emit = defineEmits(["errorOccurred"]);

// Global store
const { userCoordinates } = storeToRefs(useUserLocationStore());

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

// Distance calculation logic
watch(
	() => [
		userCoordinates.value.lat,
		userCoordinates.value.lon,
		issCoordinates.value.lat,
		issCoordinates.value.lon,
	],
	() => {
		const userLat = userCoordinates.value.lat;
		const userLon = userCoordinates.value.lon;
		const issLat = issCoordinates.value.lat;
		const issLon = issCoordinates.value.lon;

		const allValid = userLat && userLon && issLat && issLon;

		if (allValid) {
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
			setTimeout(() => {
				const stillInvalid = !(
					userLat && userLon && issLat && issLon
				);

				if (stillInvalid && !hasCalculatedDistance.value) {
					distanceError.value = true;
					isCalculatingDistance.value = false;
				}
			}, 1000);
		}
	},
	{ immediate: true }
);

// Fetch ISS location
async function fetchISSCoordinates() {
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
			lon: parseFloat(data.longitude),
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