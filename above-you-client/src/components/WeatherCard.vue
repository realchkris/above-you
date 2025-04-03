<!-- PURPOSE: Shows temperature, wind, and general condition -->
<template>

	<div class="flex flex-col items-center text-center">

		<transition name="fade" mode="out-in">

			<!-- Key changes based on state -->
			<div :key="isLoading ? 'loading' : error ? 'error' : 'data'" class="w-full">

				<!-- Loading -->
				<div v-if="isLoading" class="w-full flex items-center justify-center">
					<div class="space-y-3 w-3/5">
						<SkeletonCard />
						<SkeletonCard />
						<SkeletonCard />
					</div>
				</div>

			    <!-- Error -->
				<div v-else-if="error">❌</div>

				<!-- Weather Details -->
				<div v-else class="base-container bg-ay-lavender space-y-2 text-sm">

					<!-- Condition -->
					<div class="base-container bg-ay-dark flex flex-col items-center text-white">
						<span class="text-xs">Condition</span>
						<span>{{ weatherDescription }}</span>
					</div>

					<!-- Temperature -->
					<div class="base-container bg-ay-dark flex flex-col items-center text-white">
						<span class="text-xs">Temperature</span>
						<span>{{ weather.temperature }}°C</span>
					</div>

					<!-- Wind -->
					<div class="base-container bg-ay-dark flex flex-col items-center text-white">
						<span class="text-xs">Wind</span>
						<span>{{ weather.windspeed }} km/h @ {{ weather.winddirection }}°</span>
					</div>

				</div>

			</div>

		</transition>

	</div>

</template>

<script setup>

import { ref, watch, computed, onUnmounted } from "vue";
import { getDistance } from "../utils/geolocation";
import SkeletonCard from './SkeletonCard.vue';

import { storeToRefs } from "pinia";
import { useUserLocationStore } from "@/stores/userLocationStore";

const locationStore = useUserLocationStore();
const { userCoordinates } = storeToRefs(locationStore);

const emit = defineEmits(["errorOccurred"]);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const WEATHER_FETCH_INTERVAL = parseInt(import.meta.env.VITE_WEATHER_FETCH_INTERVAL || "300000", 10); // default 5 mins
const GEOLOCATION_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);

const isLoading = ref(true);
const error = ref("");
const weather = ref({});

let lastCoords = null;
let lastFetchTime = 0;
let intervalId = null;

const weatherCodeMap = {
	0: "Clear sky",
	1: "Mainly clear",
	2: "Partly cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Rime fog",
	51: "Light drizzle",
	53: "Moderate drizzle",
	55: "Dense drizzle",
	61: "Slight rain",
	63: "Moderate rain",
	65: "Heavy rain",
	71: "Slight snow",
	73: "Moderate snow",
	75: "Heavy snow",
	80: "Light showers",
	81: "Moderate showers",
	82: "Violent showers",
	95: "Thunderstorm",
	96: "Thunderstorm + light hail",
	99: "Thunderstorm + heavy hail",
};

const weatherDescription = computed(() =>
	weatherCodeMap[weather.value.weathercode] || "Unknown"
);

function formatTime(timestamp) {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function fetchWeatherData() {

	const coords = userCoordinates.value;
	if (!coords.lat || !coords.lon) return;

	isLoading.value = true;
	error.value = "";

	try {

		const res = await fetch(`${API_BASE_URL}/api/weather?lat=${coords.lat}&lon=${coords.lon}`);
		const data = await res.json();

		if (!data || typeof data.temperature !== "number") throw new Error("Invalid weather response");
		weather.value = data;

	} catch (err) {

		console.error("[WeatherCard] Error:", err);
		error.value = "❌ Failed to fetch weather.";
		emit("errorOccurred", error.value);

	} finally {
		isLoading.value = false;
	}

}

watch(

	() => userCoordinates.value,
	(coords) => {

		if (!coords || !coords.lat || !coords.lon) return;

		const now = Date.now();
		const shouldSkip =
			lastCoords &&
			getDistance(lastCoords.lat, lastCoords.lon, coords.lat, coords.lon) < GEOLOCATION_THRESHOLD &&
			(now - lastFetchTime) < WEATHER_FETCH_INTERVAL;

		if (shouldSkip) {
			console.log("Skipping weather fetch: location & time thresholds not met");
			return;
		}

		lastCoords = { ...coords };
		lastFetchTime = now;

		fetchWeatherData();

		if (!intervalId) {
			intervalId = setInterval(fetchWeatherData, WEATHER_FETCH_INTERVAL);
		}

	},
	{ immediate: true }

);

onUnmounted(() => {
	if (intervalId) clearInterval(intervalId);
});

</script>