<!-- PURPOSE: Shows the International Space Station (ISS) location and calculates the ISS - user distance in real time. -->
<template>
	<div class="flex flex-col items-center text-center">

		<!-- ISS Location -->
		<FetchStateWrapper :loading="ui.loading.iss" :error="ui.errors.iss">

			<!-- Loading -->
			<template #loading>

				<div class="flex flex-col items-center w-full gap-3">

					<div class="w-full flex flex-col items-center gap-3">

						<div class="flex gap-3 justify-center w-full">
							<SkeletonCard class="h-16 w-12" />
							<SkeletonCard class="h-16 w-12" />
						</div>

						<div class="w-full flex justify-center">
							<SkeletonCard class="h-16 w-20" />
						</div>

					</div>

				</div>

			</template>

			<!-- Error -->
			<template #error>
				<div>❌</div>
			</template>

			<!-- Data -->
			<template #default>
				<div class="flex flex-col items-center space-y-2">

					<!-- ISS Coordinates -->
					<div class="flex gap-3 justify-center">
						<div class="base-container bg-ay-teal flex flex-col items-center">
							<span class="text-xs">Lat</span>
							<span>{{ issCoordinates.lat ?? "–" }}</span>
						</div>

						<div class="base-container bg-ay-teal flex flex-col items-center">
							<span class="text-xs">Lon</span>
							<span>{{ issCoordinates.lon ?? "–" }}</span>
						</div>
					</div>

					<!-- Distance -->
					<div class="base-container bg-ay-teal">
						<span class="text-xs">🛰️ — 👤</span>
						<div>
							<span v-if="ui.loading.issDistance">
								<SkeletonCard class="h-16 w-20" />
							</span>
							<span v-else>{{ distanceToISS ?? "–" }}</span>
						</div>
					</div>

				</div>
			</template>
			
		</FetchStateWrapper>

	</div>
</template>

<script setup>

import { ref, watch, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import SkeletonCard from "@/components/SkeletonCard.vue";
import FetchStateWrapper from "@/components/FetchStateWrapper.vue";

import { getDistance } from "@/utils/geolocation.js";

import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";
import { usePollingStore } from "@/stores/pollingStore";

// Stores
const { userCoordinates } = storeToRefs(useUserLocationStore());
const ui = useUIStore();
const polling = usePollingStore();
const POLL_KEY = "iss"; // Any unique ID works

ui.setLoading("iss", true);

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FETCH_INTERVAL = parseInt(import.meta.env.VITE_ISS_FETCH_INTERVAL || "15000", 10);

// State
const issCoordinates = ref({ lat: null, lon: null });
const distanceToISS = ref("–");

const hasFetchedOnce = ref(false);
const hasCalculatedDistance = ref(false);

// Fetch ISS location
async function fetchISSCoordinates() {

	if (!hasFetchedOnce.value) ui.setLoading("iss", true);
	ui.clearError("iss");

	try {

		const res = await fetch(`${API_BASE_URL}/api/iss`);
		const data = await res.json();

		if (!data.latitude || !data.longitude || isNaN(data.latitude)) {
			throw new Error("Invalid ISS coordinates");
		}

		issCoordinates.value = {
			lat: parseFloat(data.latitude),
			lon: parseFloat(data.longitude),
		};

		hasFetchedOnce.value = true;

	} catch (err) {
		console.error("[ISS API]", err);
		ui.setError("iss", "❌ Failed to fetch ISS coordinates.");
	} finally {
		ui.setLoading("iss", false);
	}

}

// Watch for distance calculation
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

		if (!allValid) {
			// Avoid setting distance error too early
			if (!hasCalculatedDistance.value && !ui.loading.iss && !ui.loading.coordinates) {
				ui.setError("issDistance", "❌ Distance unavailable.");
			}
			return;
		}
		
		ui.clearError("issDistance");

		// Delay for UX smoothness
		setTimeout(() => {
			distanceToISS.value =
				(getDistance(userLat, userLon, issLat, issLon) / 1000).toFixed(2) + " km";
			hasCalculatedDistance.value = true;
		}, 300);
	},
	{ immediate: true }
);

// Start polling
onMounted(() => {
	fetchISSCoordinates(); // Immediate first call
	polling.start(POLL_KEY, fetchISSCoordinates, FETCH_INTERVAL);
});

// Stop polling on unmount
onUnmounted(() => {
	polling.stop(POLL_KEY);
});

</script>