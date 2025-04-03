<!-- PURPOSE: Shows the map and the user's real-time position. -->
<template>

	<!-- Reverse Geocoded User Location -->
	<transition name="fade" mode="out-in">
		<div
		:key="ui.loading.location ? 'loading' : ui.errors.location ? 'error' : 'data'"
		class="base-container bg-ay-dark text-white mb-4 w-full max-w-xs flex justify-center items-center"
		>

		<!-- Skeleton Loader -->
		<template v-if="ui.loading.location">
			<SkeletonCard class="h-6 w-3/5" />
		</template>

		<!-- Error -->
		<template v-else-if="ui.errors.location">
			<span class="text-xl">❌</span>
		</template>

		<!-- Data -->
		<template v-else>
			<div class="flex flex-col items-center gap-1 text-center w-full break-words whitespace-pre-wrap px-4">
				<img :src="youIcon" class="image-sm" />
				<span>{{ userLocation }}</span>
			</div>
		</template>

		</div>
	</transition>

	<!-- Live Coordinates -->
	<transition name="fade" mode="out-in">
		<div
			:key="ui.loading.coordinates ? 'loading' : ui.errors.coordinates ? 'error' : 'data'"
			class="base-container bg-ay-dark text-white mb-4 p-2 flex justify-center gap-4"
		>

			<!-- Skeleton Loader -->
			<template v-if="ui.loading.coordinates">
				<SkeletonCard class="h-12 w-16" />
				<SkeletonCard class="h-12 w-16" />
			</template>

			<!-- Error -->
			<template v-else-if="ui.errors.coordinates">
				<span>❌</span>
			</template>

			<!-- Data -->
			<template v-else>
				<div class="flex gap-4">

					<!-- Latitude -->
					<div class="base-container bg-ay-lavender flex flex-col items-center max-w-[100px] overflow-hidden">
						<span class="text-xs">Lat</span>
						<span class="truncate">{{ userCoordinates.lat ?? "–" }}</span>
					</div>

					<!-- Longitude -->
					<div class="base-container bg-ay-lavender flex flex-col items-center max-w-[100px] overflow-hidden">
						<span class="text-xs">Lon</span>
						<span class="whitespace-normal">{{ userCoordinates.lon ?? "–" }}</span>
					</div>

				</div>
			</template>

		</div>
	</transition>

	<!-- Map -->
	<div class="map-container relative">
		<transition name="fade" mode="out-in">
			<SkeletonCard
				v-if="ui.loading.map"
				class="absolute top-0 left-0 w-full h-full z-10 rounded"
			/>
		</transition>

		<!-- Always rendered to prevent init issues -->
		<div id="map" class="z-0"></div>

	</div>

</template>

<script setup>

import { ref, onMounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getDistance } from "../utils/geolocation.js";
import SkeletonCard from './SkeletonCard.vue';

import { storeToRefs } from "pinia";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";

import youIcon from '../assets/you.png';

// Stores
const locationStore = useUserLocationStore();
const { userCoordinates, userLocation } = storeToRefs(locationStore);

const ui = useUIStore();

// Loading everything prematurely to avoid data divs showing up before skeleton loaders
const loadingKeys = ["coordinates", "location", "map"];
loadingKeys.forEach(key => ui.setLoading(key, true));

// Internal refs
const map = ref(null);

// Static state
let userMarker = null;
let lastOSMCoords = null;
let lastReverseGeocodeFailed = false;

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GEO_TIMEOUT = parseInt(import.meta.env.VITE_GEOLOCATION_TIMEOUT || "15000", 10);
const MAXIMUM_AGE = parseInt(import.meta.env.VITE_GEOLOCATION_MAXIMUM_AGE || "30000", 10);
const DISTANCE_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);
const RECENTER_THRESHOLD = 1000;

// Fix Leaflet icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Reverse Geocoding
async function fetchReverseGeocode(lat, lon) {

	ui.setLoading("location", true);

	try {

		const res = await fetch(`${API_BASE_URL}/api/reverse-geocode?lat=${lat}&lon=${lon}`);
		const data = await res.json();

		if (data.error) throw new Error(data.error);

		lastOSMCoords = { lat, lon };
		return data.display_name;

	} catch (error) {

		console.warn("[Reverse Geocode]", error);
		ui.setError("location", "❌ Unable to retrieve location");
		lastReverseGeocodeFailed = true;
		return "❌";

	} finally {
		ui.setLoading("location", false);
	}

}

// Initialize Map
async function initializeMap() {

	await nextTick();

	map.value = L.map("map").setView([51.505, -0.09], 13);

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; OpenStreetMap contributors',
	}).addTo(map.value);

	map.value.whenReady(() => {
		setTimeout(() => ui.setLoading("map", false), 300);
	});

	setTimeout(() => map.value.invalidateSize(), 300);

}

// Handle Geolocation
async function handleGeolocationSuccess(pos) {

	const lat = pos.coords.latitude;
	const lon = pos.coords.longitude;

	if (!lat || !lon || !map.value) return;

	ui.setLoading("coordinates", false);
	userCoordinates.value = { lat, lon };

	const shouldRecenter = shouldRecenterMap(lat, lon);
	if (shouldRecenter) map.value.setView([lat, lon], 13);

	const isFirstLoad = !lastOSMCoords || lastReverseGeocodeFailed;
	if (isFirstLoad) {
		map.value.setView([lat, lon], 13);
		userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map.value);
	}

	if (!lastOSMCoords || shouldUpdateLocation(lat, lon)) {
		const locationName = await fetchReverseGeocode(lat, lon);
		userLocation.value = locationName;
		lastReverseGeocodeFailed = locationName === "❌";
	}

	if (userMarker) {
		userMarker.setLatLng([lat, lon]);
	} else {
		userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map.value);
	}

}

function handleGeolocationError(err) {

	console.error("[Geolocation Error]:", err);

	const messages = {
		1: "❌ Location access denied.",
		2: "⚠️ Location unavailable.",
		3: "⏳ Request timed out.",
	};

	ui.setError("coordinates", messages[err.code] || "❓ Unknown location error.");

}

function setupGeolocation() {

	ui.setLoading("coordinates", true);

	navigator.geolocation.watchPosition(
		handleGeolocationSuccess,
		handleGeolocationError,
		{ enableHighAccuracy: true, timeout: GEO_TIMEOUT, maximumAge: MAXIMUM_AGE }
	);

}

// Utilities
function shouldRecenterMap(lat, lon) {
	if (!map.value) return false;
	const center = map.value.getCenter();
	return getDistance(center.lat, center.lng, lat, lon) > RECENTER_THRESHOLD;
}

function shouldUpdateLocation(newLat, newLon) {
	if (!lastOSMCoords) return true;
	const { lat, lon } = lastOSMCoords;
	return getDistance(lat, lon, newLat, newLon) > DISTANCE_THRESHOLD;
}

// Lifecycle
onMounted(async () => {
	ui.setLoading("map", true);
	await initializeMap();
	setupGeolocation();
});

window.addEventListener("resize", () => {
	if (map.value) setTimeout(() => map.value.invalidateSize(), 300);
});

</script>

<style scoped>

.skeleton-loader {
	z-index: 10; /* Used to make sure it's above the map */
}

.map-container {
	width: 100%;
	max-width: 100%;
	height: 300px;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	position: relative;
}

#map {
	width: 100%;
	height: 100%;
	min-width: 300px;
	min-height: 300px;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

</style>