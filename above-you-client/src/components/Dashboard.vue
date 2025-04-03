<!-- PURPOSE: Main UI showing weather, celestial data, and ISS flyover times. -->
<template>

	<div class="grid grid-cols-1 gap-4">

		<section class="dashboard-container grid grid-cols-1 gap-4">

			<!-- Weather Card -->
			<CollapsibleCard
				title="Weather"
				:icon="weatherIcon"
			>
				<div class="base-container bg-ay-dark text-white">
					<WeatherCard
						@errorOccurred="handleError"
						:userCoordinates="userCoordinates"
					/>
				</div>
			</CollapsibleCard>

			<!-- Celestial Objects Card -->
			<CollapsibleCard
				title="Celestial Objects 🚧"
				bgColor="bg-ay-purple"
				:icon="celestialObjectsIcon"
			>
				<div class="base-container bg-ay-purple text-white">
					<CelestialObjectsCard
						@errorOccurred="handleError"
						:userCoordinates="userCoordinates"
					/>
				</div>
			</CollapsibleCard>

			<!-- ISS Tracker Card -->
			<CollapsibleCard
				title="ISS Tracker"
				bgColor="bg-ay-green"
				:icon="ISSIcon"
			>
				<div class="base-container bg-ay-green text-white">
					<ISSCard
						@errorOccurred="handleError"
						:userCoordinates="userCoordinates"
					/>
				</div>
			</CollapsibleCard>

		</section>

		<section class="base-container bg-ay-lavender w-full">
			<MapCard
				@errorOccurred="handleError"
				@userLocationUpdated="updateUserLocation"
			/>
		</section>
		
	</div>

</template>

<script setup>

import WeatherCard from './WeatherCard.vue'
import CelestialObjectsCard from './CelestialObjectsCard.vue'
import ISSCard from './ISSCard.vue'
import MapCard from './MapCard.vue'
import CollapsibleCard from './CollapsibleCard.vue';

import weatherIcon from '../assets/weather.png';
import celestialObjectsIcon from '../assets/comet.png';
import ISSIcon from '../assets/iss.png';

import { ref } from "vue";

const emit = defineEmits(["errorOccurred"]);
const userCoordinates = ref({ lat: null, lon: null });

// Pass errors up to parent component
const handleError = (message) => {
	emit("errorOccurred", message);
};

// Function to update user location from MapCard.vue
function updateUserLocation(coords) {
		userCoordinates.value = coords;
}

</script>