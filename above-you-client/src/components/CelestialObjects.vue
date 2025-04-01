<!-- PURPOSE: Displays visible celestial bodies. -->
<template>

	<div class="flex flex-col items-center text-center">

		<!-- Title -->
		<div class="flex items-center gap-2">
			<img class="image-sm" src="../assets/comet.png" alt="Comet Icon" />
			<div class="font-bold">Celestial Objects</div>
		</div>

		<div v-if="isLoading" class="flex justify-center">
			<span class="loader"></span>
		</div>

		<div v-else-if="error">{{ error }}</div>

		<ul v-else class="space-y-2">

			<li
				v-for="(object, index) in celestialObjects"
				:key="index"
				class="bg-ay-dark-lighter p-2 rounded"
			>

				<div class="font-semibold">{{ object.name }}</div>
				<div class="text-sm">
					Alt: {{ object.altitude.toFixed(1) }}°,
					Az: {{ object.azimuth.toFixed(1) }}°,
					Mag: {{ object.magnitude }}
			    </div>

		    </li>

		</ul>

		<p v-if="!isLoading && celestialObjects.length === 0" class="text-sm text-gray-400">
		  No visible celestial objects right now.
		</p>
		
	</div>

</template>

<script setup>

import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
	userCoordinates: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(["errorOccurred"]);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const CELESTIAL_FETCH_INTERVAL = parseInt(import.meta.env.VITE_CELESTIAL_FETCH_INTERVAL || "60000", 10);

const celestialObjects = ref([]);
const isLoading = ref(true);
const error = ref("");
let intervalId = null;

async function fetchCelestialData() {

	const coords = props.userCoordinates;
	if (!coords.lat || !coords.lon) return;

	isLoading.value = true;
	error.value = "";

	try {

		const res = await fetch(`${API_BASE_URL}/api/celestial?lat=${coords.lat}&lon=${coords.lon}`);
		const data = await res.json();

		if (!Array.isArray(data.visible)) throw new Error("Invalid response");

		celestialObjects.value = data.visible;

		if (data.visible.length === 0) {
			celestialObjects.value = [];
			return;
		}

	} catch (err) {

		console.error("[CelestialObjects] Error:", err);
		error.value = "❌";
		emit("errorOccurred", error.value);

	} finally {
		isLoading.value = false;
	}

}

watch(

	() => props.userCoordinates,
	(coords) => {

		console.log("[Watcher Triggered] Coords:", coords); // Debug

		if (!coords || !coords.lat || !coords.lon || intervalId) return;

		fetchCelestialData();
	    intervalId = setInterval(fetchCelestialData, CELESTIAL_FETCH_INTERVAL);

	},
	{ immediate: true }

);

onUnmounted(() => {
	if (intervalId) clearInterval(intervalId);
});

</script>