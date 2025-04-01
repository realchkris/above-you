<!-- PURPOSE: Main UI showing weather, celestial data, and ISS flyover times. -->
<template>

	<div class="grid grid-cols-1 gap-4">

		<section class="dashboard-container grid grid-cols-1 gap-4">

			<!-- Weather Card -->
			<CollapsibleCard title="Weather">
        <div class="base-container bg-ay-dark text-white">
          <WeatherCard
            @errorOccurred="handleError"
            :userCoordinates="userCoordinates"
          />
        </div>
      </CollapsibleCard>

		  <!-- Celestial Objects Card -->
      <CollapsibleCard title="Celestial Objects 🚧">
        <div class="base-container bg-ay-purple text-white">
          <CelestialObjects
            @errorOccurred="handleError"
            :userCoordinates="userCoordinates"
          />
        </div>
      </CollapsibleCard>

		  <!-- ISS Tracker Card -->
      <CollapsibleCard title="ISS Tracker">
        <div class="base-container bg-ay-green text-white">
          <ISSFlyover
            @errorOccurred="handleError"
            :userCoordinates="userCoordinates"
          />
        </div>
      </CollapsibleCard>

		</section>

		<section class="base-container bg-ay-lavender w-full">
			<MapView
				@errorOccurred="handleError"
				@userLocationUpdated="updateUserLocation"
			/>
		</section>
		
	</div>

</template>

<script setup>

import WeatherCard from './WeatherCard.vue'
import CelestialObjects from './CelestialObjects.vue'
import ISSFlyover from './ISSFlyover.vue'
import MapView from './MapView.vue'
import CollapsibleCard from './CollapsibleCard.vue';

import { ref } from "vue";

const emit = defineEmits(["errorOccurred"]);
const userCoordinates = ref({ lat: null, lon: null });

// Pass errors up to parent component
const handleError = (message) => {
  emit("errorOccurred", message);
};

// Function to update user location from MapView.vue
function updateUserLocation(coords) {
    userCoordinates.value = coords;
}

</script>