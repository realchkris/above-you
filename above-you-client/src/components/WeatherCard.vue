<!-- PURPOSE: Shows temperature, wind, and general condition -->
<template>

	<div class="flex flex-col items-center text-center">

		<FetchStateWrapper :loading="ui.loading.weather" :error="ui.errors.weather">

			<!-- Loading -->
			<template #loading>
				<div class="flex flex-col gap-3 items-center w-full">
					<SkeletonCard class="h-16 w-48" />
					<SkeletonCard class="h-16 w-48" />
					<SkeletonCard class="h-16 w-48" />
				</div>
			</template>

			<!-- Error -->
			<template #error>
				<div>❌</div>
			</template>

			<!-- Data -->
			<template #default>

				<div class="base-container bg-ay-lavender space-y-2 text-sm">

					<!-- Condition -->
					<div class="base-container bg-ay-dark flex flex-col items-center text-white">
						<img class="image-sm mb-2" :src="getWeatherIconUrl(weather.weathercode)" alt="Weather icon" />
						<span class="text-xs">{{ weatherDescription }}</span>
					</div>

					<!-- Temperature -->
					<div class="base-container bg-ay-dark flex flex-col items-center text-white">
						<div class="flex mb-2">
							<img :src="termometerIcon" alt="Thermometer Icon" class="image-sm" />
							<img :src="getTemperatureIconUrl(weather.temperature)" alt="Temperature Icon" class="image-sm" />
						</div>
						<span class="text-xs">{{ weather.temperature }}°C</span>
					</div>

					<!-- Wind -->
					<div class="base-container bg-ay-dark flex flex-col items-center text-white">
						<img class="image-sm mb-2" :src="getWindIconUrl(weather.windspeed)" alt="Wind icon" />
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
