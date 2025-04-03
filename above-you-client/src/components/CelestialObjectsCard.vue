<!-- PURPOSE: Displays visible celestial bodies. -->
<template>

	<div class="flex flex-col items-center text-center">

		<transition name="fade" mode="out-in">

			<!-- Key changes based on state -->
			<div :key="isLoading ? 'loading' : error ? 'error' : 'data'" class="w-full flex items-center justify-center">

				<!-- Loading -->
				<div v-if="isLoading" class="space-y-3 w-3/5">
					<SkeletonCard />
				</div>

				<!-- Error -->
				<div v-else-if="error">❌</div>

				<!-- List -->
				<ul v-else class="space-y-2">

					<li
						v-for="(object, index) in celestialObjects"
						:key="index"
						class="base-container bg-ay-purple-light"
					>

						<!-- Celestial object name -->
						<div class="font-semibold mb-2">{{ object.name }}</div>
						
						<!-- Celestial object details -->
						<div class="flex gap-3 justify-center">

							<div class="base-container bg-ay-purple flex flex-col items-center">
								<span class="text-xs">Alt</span>
								<span>{{ object.altitude.toFixed(1) }}°</span>
							</div>
							<div class="base-container bg-ay-purple flex flex-col items-center">
								<span class="text-xs">Az</span>
								<span>{{ object.azimuth.toFixed(1) }}°</span>
							</div>
							<div class="base-container bg-ay-purple flex flex-col items-center">
								<span class="text-xs">Mag</span>
								<span>{{ object.magnitude }}</span>
							</div>

						</div>

					</li>

				</ul>

			</div>

		</transition>

		<p v-if="!isLoading && celestialObjects.length === 0 && !error" class="text-sm text-gray-400">
		  No visible celestial objects right now
		</p>
		
	</div>

</template>

<script setup>

import { ref, watch, onUnmounted } from "vue";
import { getDistance } from "../utils/geolocation";
import SkeletonCard from './SkeletonCard.vue';

import { useUserLocationStore } from "@/stores/userLocationStore";
import { storeToRefs } from "pinia";

const locationStore = useUserLocationStore();
const { userCoordinates } = storeToRefs(locationStore);

const emit = defineEmits(["errorOccurred"]);

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CELESTIAL_FETCH_INTERVAL = parseInt(import.meta.env.VITE_CELESTIAL_FETCH_INTERVAL || "60000", 10);
const GEOLOCATION_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);

// Reactive state
const celestialObjects = ref([]);
const isLoading = ref(true);
const error = ref("");

// Internal control
let intervalId = null;
let lastCoords = null;
let lastFetchTime = 0;

// Fetch function
async function fetchCelestialData() {

	const coords = userCoordinates.value;
	if (!coords.lat || !coords.lon) return;

	isLoading.value = true;
	error.value = "";

	try {
		const res = await fetch(`${API_BASE_URL}/api/celestial?lat=${coords.lat}&lon=${coords.lon}`);
		const data = await res.json();

		if (!Array.isArray(data.visible)) throw new Error("Invalid response");

		celestialObjects.value = data.visible;

	} catch (err) {
		console.error("[CelestialObjectsCard] Error:", err);
		error.value = "❌ Failed to fetch celestial data.";
		emit("errorOccurred", error.value);
	} finally {
		isLoading.value = false;
	}

}

// Watcher for user location changes
watch(

	() => userCoordinates.value,
	(coords) => {
		if (!coords || !coords.lat || !coords.lon) return;

		const now = Date.now();
		const shouldSkip =
			lastCoords &&
			getDistance(lastCoords.lat, lastCoords.lon, coords.lat, coords.lon) < GEOLOCATION_THRESHOLD &&
			(now - lastFetchTime) < CELESTIAL_FETCH_INTERVAL;

		if (shouldSkip) {
			console.log("Skipping celestial fetch: location & time thresholds not met");
			return;
		}

		lastCoords = { ...coords };
		lastFetchTime = now;

		fetchCelestialData();

		if (!intervalId) {
			intervalId = setInterval(fetchCelestialData, CELESTIAL_FETCH_INTERVAL);
		}
	},
	{ immediate: true }

);

// Cleanup
onUnmounted(() => {
	if (intervalId) clearInterval(intervalId);
});

</script>