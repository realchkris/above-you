<!-- PURPOSE: Shows the map and the user's real-time position. -->
<template>

	<div class="flex flex-col w-full h-full">

		<!-- Reverse Geocoded User Location -->
		<FetchStateWrapper
			:loading="ui.loading.location"
			:error="ui.errors.location"
		>

			<!-- Loading -->
			<template #loading>
				<div class="base-container ay-gradient-lavender text-white mb-4 flex justify-center items-center w-full">
					<SkeletonCard class="skeleton-data" />
				</div>
			</template>

			<!-- Error -->
			<template #error>
				<div class="base-container ay-gradient-lavender text-white mb-4 flex justify-center items-center w-full">
					<span>❌</span>
				</div>
			</template>

			<!-- Data -->
			<template #default>
				<div class="base-container ay-gradient-lavender text-white mb-4 w-full flex justify-center items-center">
					<div class="flex flex-col text-center gap-4 w-full">

						<img :src="youIcon" class="image-sm self-center" />

						<!-- Address -->
						<template v-if="parsedAddress">
							<div class="base-container bg-ay-lavender text-2xl">
								{{ countryFlag }} {{ parsedAddress[0] }}
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div
								v-for="(line, idx) in parsedAddress.slice(1)"
								:key="idx"
								class="base-container bg-ay-lavender text-sm"
								:class="{
									'col-span-2': (parsedAddress.slice(1).length % 2 === 1) && (idx === parsedAddress.slice(1).length - 1)
								}"
								>
									{{ line }}
								</div>
							</div>
						</template>

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
				<div class="base-container ay-gradient-lavender text-white mb-4 p-2 flex justify-center gap-4">
					<SkeletonCard class="skeleton-data" />
					<SkeletonCard class="skeleton-data" />
				</div>
			</template>

			<!-- Error -->
			<template #error>
				<div class="base-container ay-gradient-lavender text-white mb-4 p-2 flex justify-center gap-4">
					<span>❌</span>
				</div>
			</template>

			<!-- Data -->
			<template #default>
				<div class="base-container ay-gradient-lavender text-white mb-4 p-2 flex justify-center gap-4 w-full">
					<div class="flex gap-4 w-full">
						<!-- Latitude -->
						<div class="bg-ay-lavender vertical-data-container items-center break-words w-full">
							<span class="text-xs">Lat</span>
							<span class="text-sm text-center truncate font-bold">{{ userCoordinates.lat.toFixed(5) ?? "–" }}</span>
						</div>

						<!-- Longitude -->
						<div class="bg-ay-lavender vertical-data-container items-center break-words w-full">
							<span class="text-xs">Lon</span>
							<span class="text-sm text-center truncate font-bold">{{ userCoordinates.lon.toFixed(5) ?? "–" }}</span>
						</div>
					</div>
				</div>
			</template>

		</FetchStateWrapper>

		<!-- Map -->
		<div class="relative grow w-full h-full rounded overflow-hidden">

			<transition name="fade" mode="out-in">
				<SkeletonCard
				v-if="ui.loading.map"
				class="absolute inset-0 z-10"
				/>
			</transition>

			<div id="map" class="z-0 w-full h-full"></div>
			
		</div>

	</div>

</template>

<script setup>

// Imports
import { ref, onMounted, nextTick, onBeforeUnmount, computed } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { storeToRefs } from "pinia";

import { countryCodeToEmoji } from '@/utils/flags'
import { getCountryCode } from '@/utils/countries'

import { getDistance } from "@/utils/geolocation.js";
import SkeletonCard from "@/components/SkeletonCard.vue";
import FetchStateWrapper from "@/components/FetchStateWrapper.vue";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUIStore } from "@/stores/uiStore";
import youIcon from '@/assets/you.png';

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GEO_TIMEOUT = parseInt(import.meta.env.VITE_GEOLOCATION_TIMEOUT || "15000", 10);
const MAXIMUM_AGE = parseInt(import.meta.env.VITE_GEOLOCATION_MAXIMUM_AGE || "30000", 10);
const DISTANCE_THRESHOLD = parseInt(import.meta.env.VITE_GEOLOCATION_THRESHOLD || "100", 10);
const RECENTER_THRESHOLD = 1000;

const defaultIcon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Store & State
const locationStore = useUserLocationStore();
const { userCoordinates, userLocation } = storeToRefs(locationStore);
const ui = useUIStore();

const map = ref(null);
let userMarker = null;
let userMarkerCreated = false;
let lastOSMCoords = null;
let lastReverseGeocodeFailed = false;
let watchPositionId = null;
let isWatchingPosition = false;

const loadingKeys = ["coordinates", "location", "map"];
loadingKeys.forEach(key => ui.setLoading(key, true));

// Split address string by comma and trim
const parsedAddress = computed(() => {
	if (!userLocation.value || userLocation.value === '❌') return null;
	return userLocation.value.split(',').map(part => part.trim()).reverse();
});

// Country flag emoji
const countryFlag = computed(() => {

	if (!parsedAddress.value || parsedAddress.value.length === 0) return ''
	const countryName = parsedAddress.value[0]
	const code = getCountryCode(countryName)
	return code ? countryCodeToEmoji(code) : ''

})

// Map & Geolocation
async function initializeMap() {
	console.log("[Map] initializeMap called");
	if (map.value) {
		console.warn("[Map] Already initialized — skipping");
		return;
	}

	await nextTick();

	map.value = L.map("map").setView([51.505, -0.09], 13);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; OpenStreetMap contributors',
	}).addTo(map.value);

	map.value.whenReady(() => setTimeout(() => ui.setLoading("map", false), 300));
	setTimeout(() => map.value.invalidateSize(), 300);
}

async function handleGeolocationSuccess(pos) {
	const lat = pos.coords.latitude;
	const lon = pos.coords.longitude;

	console.log("[Geo] Success! Lat:", lat, "Lon:", lon);

	if (!lat || !lon || !map.value) {
		console.warn("[Geo] Invalid position or map not initialized.");
		return;
	}

	ui.setLoading("coordinates", false);
	userCoordinates.value = { lat, lon };

	// Recenter if needed
	if (shouldRecenterMap(lat, lon)) {
		console.log("[Geo] Recentering map.");
		map.value.setView([lat, lon], 13);
	}

	// Handle reverse geocoding on first load or after a failure
	if (!lastOSMCoords || lastReverseGeocodeFailed || shouldUpdateLocation(lat, lon)) {
		console.log("[Geo] Fetching reverse geocode...");
		const locationName = await fetchReverseGeocode(lat, lon);
		userLocation.value = locationName;
		lastReverseGeocodeFailed = locationName === "❌";
	}

	// Handle marker creation (only once)
	if (!userMarkerCreated) {
		console.log("[Geo] Creating user marker.");
		userMarker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map.value);
		userMarkerCreated = true;
	} else if (userMarker) {
		console.log("[Geo] Updating marker position.");
		userMarker.setLatLng([lat, lon]);
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

async function setupGeolocation() {
	console.log("[Geo] Setting up geolocation...");
	ui.setLoading("coordinates", true);

	const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
	locationStore.locationPermission = permissionStatus.state;

	if (["granted", "prompt"].includes(permissionStatus.state)) {
		startGeolocationWatch();
	} else {
		ui.setError("coordinates", "❌ Location permission denied.");
	}

	permissionStatus.onchange = () => {
		locationStore.locationPermission = permissionStatus.state;
	};
}

function startGeolocationWatch() {

	console.log("[Geo] startGeolocationWatch() called.");

	if (isWatchingPosition) {
		console.warn("[Geo] Already watching position — skipping.");
		return;
	}

	if (watchPositionId) {
		navigator.geolocation.clearWatch(watchPositionId);
		console.log("[Geo] Cleared old geolocation watch");
	}

	watchPositionId = navigator.geolocation.watchPosition(
		handleGeolocationSuccess,
		handleGeolocationError,
		{ enableHighAccuracy: true, maximumAge: MAXIMUM_AGE }
	);

	isWatchingPosition = true;
	console.log("[Geo] Watch started, ID:", watchPositionId);
}

// Utilities
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

onBeforeUnmount(() => {
	console.log("[Unmount] Cleaning up map and geolocation...");

	if (watchPositionId) {
		navigator.geolocation.clearWatch(watchPositionId);
		console.log("[Unmount] Cleared geolocation watch");
		watchPositionId = null;
		isWatchingPosition = false;
	}

	if (map.value) {
		map.value.remove();
		console.log("[Unmount] Removed map instance");
		map.value = null;
		userMarker = null;
	}
});

window.addEventListener("resize", () => {
	if (map.value) setTimeout(() => map.value.invalidateSize(), 300);
});

</script>

<style scoped>

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