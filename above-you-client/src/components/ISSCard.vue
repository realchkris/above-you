<!-- PURPOSE: Shows the International Space Station (ISS) location and calculates the ISS - user distance in real time. -->
<template>

	<div class="flex flex-col items-center text-center">

		<!-- ISS Location -->
		<transition name="fade" mode="out-in">

			<div
				:key="ui.loading.iss ? 'loading' : ui.errors.iss ? 'error' : 'data'"
				class="flex flex-col items-center space-y-2"
			>

				<!-- Loading -->
				<div v-if="ui.loading.iss" class="flex flex-col items-center gap-3">
					<div class="flex gap-3">
						<SkeletonCard class="h-16 w-20" />
						<SkeletonCard class="h-16 w-20" />
					</div>
					<SkeletonCard class="h-16 w-20" />
				</div>

				<!-- Error -->
				<div v-else-if="ui.errors.iss">❌</div>

				<!-- Data -->
				<div v-else class="flex flex-col items-center space-y-2">

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
			</div>

		</transition>

	</div>
</template>

<script setup>

import { ref, watch, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import SkeletonCard from "./SkeletonCard.vue";
import { getDistance } from "../utils/geolocation.js";

import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";

// Stores
const { userCoordinates } = storeToRefs(useUserLocationStore());
const ui = useUIStore();

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const FETCH_INTERVAL = parseInt(import.meta.env.VITE_ISS_FETCH_INTERVAL || "15000", 10);

// State
const issCoordinates = ref({ lat: null, lon: null });
const distanceToISS = ref("–");

const hasCalculatedDistance = ref(false);

// Fetch ISS location
async function fetchISSCoordinates() {

	ui.setLoading("iss", true);
	ui.clearError("iss");

	try {

		const res = await fetch(`${API_BASE_URL}/api/iss-flyover`);
		const data = await res.json();

		if (!data.latitude || !data.longitude || isNaN(data.latitude)) {
			throw new Error("Invalid ISS coordinates");
		}

		issCoordinates.value = {
			lat: parseFloat(data.latitude),
			lon: parseFloat(data.longitude),
		};

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
			if (!hasCalculatedDistance.value) {
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

// Start polling on mount
let intervalId = null;

onMounted(() => {
	fetchISSCoordinates();
	intervalId = setInterval(fetchISSCoordinates, FETCH_INTERVAL);
});

onUnmounted(() => {
	clearInterval(intervalId);
});

</script>