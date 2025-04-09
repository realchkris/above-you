<!-- PURPOSE: Shows the map and the user's real-time position. -->
<template>

	<div class="flex flex-col h-full w-full">

		<!-- Reverse Geocoded User Location -->
		<FetchStateWrapper
			:loading="ui.loading.location"
			:error="ui.errors.location"
		>

			<!-- Loading -->
			<template #loading>
				<div class="base-container bg-ay-dark text-white mb-4 w-full flex justify-center items-center">
					<SkeletonCard class="h-6 w-3/5" />
				</div>
			</template>

			<!-- Error -->
			<template #error>
				<div class="base-container bg-ay-dark text-white mb-4 w-full flex justify-center items-center">
					<span>❌</span>
				</div>
			</template>

			<!-- Data -->
			<template #default>
				<div class="base-container bg-ay-dark text-white mb-4 w-full flex justify-center items-center">
					<div class="flex flex-col items-center gap-1 text-center w-full break-words whitespace-pre-wrap px-4">
						<img :src="youIcon" class="image-sm" />
						<span>{{ userLocation }}</span>
					</div>
				</div>
			</template>

		</FetchStateWrapper>

		<!-- Live Coordinates -->
		<FetchStateWrapper
			:loading="ui.loading.coordinates"
			:error="ui.errors.coordinates"
		>

			<!-- Loading -->
			<template #loading>
				<div class="base-container bg-ay-dark text-white mb-4 p-2 flex justify-center gap-3">
					<SkeletonCard class="h-12 w-16" />
					<SkeletonCard class="h-12 w-16" />
				</div>
			</template>

			<!-- Error -->
			<template #error>
				<div class="base-container bg-ay-dark text-white mb-4 p-2 flex justify-center gap-3">
					<span>❌</span>
				</div>
			</template>

			<!-- Data -->
			<template #default>
				<div class="base-container bg-ay-dark text-white mb-4 p-2 flex justify-center gap-3">
					<div class="flex gap-3">
						<!-- Latitude -->
						<div class="base-container bg-ay-lavender flex flex-col items-center max-w-[100px] break-words">
							<span class="text-xs">Lat</span>
							<span class="text-sm text-center truncate">{{ userCoordinates.lat.toFixed(5) ?? "–" }}</span>
						</div>

						<!-- Longitude -->
						<div class="base-container bg-ay-lavender flex flex-col items-center max-w-[100px] break-words">
							<span class="text-xs">Lon</span>
							<span class="text-sm text-center truncate">{{ userCoordinates.lon.toFixed(5) ?? "–" }}</span>
						</div>
					</div>
				</div>
			</template>

		</FetchStateWrapper>

		<!-- Map -->
		<div class="flex flex-col h-full w-full">
		
			<transition name="fade" mode="out-in">
				<SkeletonCard
				v-if="ui.loading.map"
				class="absolute top-0 left-0 w-full h-full z-10 rounded"
				/>
			</transition>

			<div id="map" class="h-full w-full z-0"></div>

		</div>

	</div>

</template>

<script setup>

import { ref, onMounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getDistance } from "@/utils/geolocation.js";

import SkeletonCard from "@/components/SkeletonCard.vue";
import FetchStateWrapper from "@/components/FetchStateWrapper.vue";

import { storeToRefs } from "pinia";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";

import youIcon from '@/assets/you.png';

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

		const res = await fetch(`${API_BASE_URL}/api/geocode?lat=${lat}&lon=${lon}`);
		const data = await res.json();

		if (data.error) throw new Error(data.error);

		lastOSMCoords = { lat, lon };
		return data.display_name;

	} catch (error) {

		console.warn("[Reverse Geocode]", error);
		ui.setError("location", "❌ Unable to retrieve location.");
		lastReverseGeocodeFailed = true;
		return "❌";

	} finally {
		ui.setLoading("location", false);
	}

}

// Initialize Map
async function initializeMap() {

	console.log("[Map] Initializing...");

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
		{	enableHighAccuracy: true,
			// timeout: GEO_TIMEOUT,
			maximumAge: MAXIMUM_AGE	}
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
	height: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
}

#map {
	flex: 1;
	width: 100%;
	height: 100%;
	min-height: 300px;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

</style>