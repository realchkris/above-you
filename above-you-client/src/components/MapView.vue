<template>

	<div class="map-container">
		<div id="map"></div>
	</div>

</template>

<script setup>

import { onMounted, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map;

onMounted(() => {

	// Waiting for Vue to finish rendering
	nextTick(() => {

	    if (!map) {
	    	map = L.map("map").setView([51.505, -0.09], 13);

	    	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	    		attribution: '&copy; OpenStreetMap contributors'
	    	}).addTo(map);

	    	// Fixing map tiling issues (recalculates the map dimensions after 300ms)
	    	setTimeout(() => {
	    		map.invalidateSize();
	    	}, 300);

	    	// Asking for the user's geolocation, if the user refuses an error is thrown in the console
	    	if (navigator.geolocation) {
	    		navigator.geolocation.getCurrentPosition(
	    			(position) => {

	    				const lat = position.coords.latitude;
	    				const lon = position.coords.longitude;
	    				map.setView([lat, lon], 13);
	    				L.marker([lat, lon]).addTo(map);

	    			}, () => {
	    				console.warn("Geolocation permission denied.");
	    			}
	    		);
	      	}

	    }

	});

});

</script>

<style scoped>

/* Needs fixing */
.map-container {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

</style>