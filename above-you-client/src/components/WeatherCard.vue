<!-- PURPOSE: Shows temperature, wind, and general condition -->
<template>

	<!-- Root: allow full width, center text only -->
	<div class="w-full text-center">

		<FetchStateWrapper :loading="ui.loading.weather" :error="ui.errors.weather">

			<!-- Loading -->
			<template #loading>
				<div class="flex flex-col gap-4 w-full">
					<SkeletonCard class="skeleton-data" />
					<SkeletonCard class="skeleton-data" />
					<SkeletonCard class="skeleton-data" />
				</div>
			</template>

			<!-- Error -->
			<template #error>
				<div>❌</div>
			</template>

			<!-- Data -->
			<template #default>

				<div class="flex flex-col gap-4 w-full">

					<!-- Condition -->
					<div class="bg-ay-lavender vertical-data-container">
						<img class="image-sm" :src="getWeatherIconUrl(weather.weathercode)" alt="Weather Icon" />
						<span class="text-xs">{{ weatherDescription }}</span>
					</div>

					<!-- Temperature -->
					<div class="bg-ay-lavender vertical-data-container">
						<img :src="termometerIcon" alt="Thermometer Icon" class="image-sm" />
						<img :src="getTemperatureIconUrl(weather.temperature)" alt="Temperature Icon" class="image-sm" />
						<span class="text-xs">{{ weather.temperature }}°C</span>
					</div>

					<!-- Wind -->
					<div class="bg-ay-lavender vertical-data-container">
						<img class="image-sm" :src="getWindIconUrl(weather.windspeed)" alt="Wind Icon" />
						<span>{{ weather.windspeed }} km/h @ {{ weather.winddirection }}°</span>
					</div>

				</div>

			</template>

		</FetchStateWrapper>

	</div>

</template>

<script setup>

// Imports
import { ref, watch, computed, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import FetchStateWrapper from "@/components/FetchStateWrapper.vue";
import SkeletonCard from "@/components/SkeletonCard.vue";
import { getDistance } from "@/utils/geolocation";

import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";
import { usePollingStore } from "@/stores/pollingStore";

import { getWeatherDescription, getWeatherIconUrl } from "@/utils/weatherCodes";
import { getTemperatureIconUrl } from "@/utils/temperature";
import { getWindIconUrl } from "@/utils/wind";

import termometerIcon from "@/assets/temperature/thermometer.png";

// Stores
const locationStore = useUserLocationStore();
const ui = useUIStore();
const polling = usePollingStore();

const { userCoordinates } = storeToRefs(locationStore);
const POLL_KEY = "weather";

ui.setLoading("weather", true);

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const WEATHER_FETCH_INTERVAL = parseInt(import.meta.env.VITE_WEATHER_FETCH_INTERVAL || "300000", 10);
const GEOLOCATION_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);

// Reactive state
const weather = ref({});
let lastCoords = null;
let lastFetchTime = 0;

// Computed
const weatherDescription = computed(() =>
	getWeatherDescription(weather.value.weathercode)
);

// Functions
async function fetchWeatherData() {
	const coords = userCoordinates.value;
	if (!coords.lat || !coords.lon) return;

	ui.setLoading("weather", true);
	ui.clearError("weather");

	try {
		const res = await fetch(`${API_BASE_URL}/api/weather?lat=${coords.lat}&lon=${coords.lon}`);
		const data = await res.json();

		if (!data || typeof data.temperature !== "number") {
			throw new Error("Invalid weather response");
		}

		weather.value = data;

	} catch (err) {
		console.error("[WeatherCard] Error:", err);
		ui.setError("weather", "❌ Failed to fetch weather.");
	} finally {
		ui.setLoading("weather", false);
	}
}

// Watchers
watch(
	() => userCoordinates.value,
	(coords) => {
		if (!coords?.lat || !coords?.lon) return;

		const now = Date.now();
		const shouldSkip =
			lastCoords &&
			getDistance(lastCoords.lat, lastCoords.lon, coords.lat, coords.lon) < GEOLOCATION_THRESHOLD &&
			(now - lastFetchTime) < WEATHER_FETCH_INTERVAL;

		if (shouldSkip) {
			console.log("[WeatherCard] Skipping fetch — thresholds not met");
			return;
		}

		lastCoords = { ...coords };
		lastFetchTime = now;

		fetchWeatherData();
		polling.start(POLL_KEY, fetchWeatherData, WEATHER_FETCH_INTERVAL);
	},
	{ immediate: true }
);

// Lifecycle
onUnmounted(() => {
	polling.stop(POLL_KEY);
});

</script>
