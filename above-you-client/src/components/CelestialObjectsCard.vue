<!-- PURPOSE: Displays visible celestial bodies. -->
<template>

	<div class="flex flex-col items-center text-center">

		<transition name="fade" mode="out-in">

			<!-- Key changes based on state -->
			<div :key="ui.loading.celestial ? 'loading' : ui.errors.celestial ? 'error' : 'data'" class="w-full flex items-center justify-center">

				<!-- Loading -->
				<div v-if="ui.loading.celestial" class="space-y-3 w-3/5">
					<SkeletonCard />
				</div>

				<!-- Error -->
				<div v-else-if="ui.errors.celestial">❌</div>

				<!-- List -->
				<ul v-else class="space-y-2">

					<li
						v-for="(object, index) in celestialObjects"
						:key="object.name || index"
						class="base-container bg-ay-purple-light"
					>

						<div class="flex flex-wrap items-center gap-4 justify-between">

							<!-- Icon + Name -->
							<div class="flex items-center gap-2 min-w-[120px]">
								<img :src="getCelestialIconUrl(object.name)" :alt="`${object.name} Icon`" class="image-sm">
								<div class="font-semibold">{{ object.name ?? "–" }}</div>
							</div>

							<!-- Celestial object details -->
							<div class="flex flex-wrap justify-center gap-3 w-full">
								<div class="base-container bg-ay-purple flex-1 flex flex-col items-center min-w-[90px]">
									<span class="text-xs">Alt</span>
									<span>{{ object.altitude != null ? object.altitude.toFixed(1) : "–" }}°</span>
								</div>
								<div class="base-container bg-ay-purple flex-1 flex flex-col items-center min-w-[90px]">
									<span class="text-xs">Az</span>
									<span>{{ object.azimuth != null ? object.azimuth.toFixed(1) : "–" }}°</span>
								</div>
								<div class="base-container bg-ay-purple flex-1 flex flex-col items-center min-w-[90px]">
									<span class="text-xs">Mag</span>
									<span>{{ object.magnitude ?? "–" }}</span>
								</div>
							</div>

						</div>

					</li>

				</ul>

			</div>

		</transition>

		<p v-if="!ui.loading.celestial && celestialObjects.length === 0 && !ui.errors.celestial" class="text-sm text-gray-400">
			No visible celestial objects right now
		</p>
		
	</div>

</template>

<script setup>

import { ref, watch, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import { getDistance } from "../utils/geolocation";
import SkeletonCard from "./SkeletonCard.vue";

import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";
import { usePollingStore } from "@/stores/pollingStore";

import { getCelestialIconUrl } from "@/utils/celestial";

// Stores
const locationStore = useUserLocationStore();
const { userCoordinates } = storeToRefs(locationStore);
const ui = useUIStore();

ui.setLoading("celestial", true);

const polling = usePollingStore();
const POLL_KEY = "celestial"; // Any unique ID works

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CELESTIAL_FETCH_INTERVAL = parseInt(import.meta.env.VITE_CELESTIAL_FETCH_INTERVAL || "60000", 10);
const GEOLOCATION_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);

// Reactive state
const celestialObjects = ref([]);

// Internal state
let lastCoords = null;
let lastFetchTime = 0;

// Fetch celestial data
async function fetchCelestialData() {
	const coords = userCoordinates.value;
	if (!coords.lat || !coords.lon) return;

	ui.setLoading("celestial", true);
	ui.clearError("celestial");

	try {
		const res = await fetch(`${API_BASE_URL}/api/celestial?lat=${coords.lat}&lon=${coords.lon}`);
		const data = await res.json();

		if (!Array.isArray(data.visible)) throw new Error("Invalid response");

		celestialObjects.value = data.visible;
	} catch (err) {
		console.error("[CelestialObjectsCard] Error:", err);
		ui.setError("celestial", "❌ Failed to fetch celestial data.");
	} finally {
		ui.setLoading("celestial", false);
	}
}

// Watch location changes
watch(
	() => userCoordinates.value,
	(coords) => {
		if (!coords?.lat || !coords?.lon) return;

		const now = Date.now();
		const shouldSkip =
			lastCoords &&
			getDistance(lastCoords.lat, lastCoords.lon, coords.lat, coords.lon) < GEOLOCATION_THRESHOLD &&
			(now - lastFetchTime) < CELESTIAL_FETCH_INTERVAL;

		if (shouldSkip) return;

		lastCoords = { ...coords };
		lastFetchTime = now;

		fetchCelestialData();

		// Start polling after first valid fetch
		polling.start(POLL_KEY, fetchCelestialData, CELESTIAL_FETCH_INTERVAL);
	},
	{ immediate: true }
);

// Stop polling when unmounted
onUnmounted(() => {
	polling.stop(POLL_KEY);
});

</script>