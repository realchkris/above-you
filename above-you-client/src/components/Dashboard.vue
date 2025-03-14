<!-- PURPOSE: Main UI showing weather, celestial data, and ISS flyover times. -->

<template>

	<div class="grid grid-cols-1 gap-4">

		<section class="dashboard-container grid grid-cols-1 gap-4">

			<!-- Weather Card -->
		    <div class="base-container bg-ay-dark text-white">
		    	<WeatherCard />
		    </div>

		    <!-- Celestial Objects Card -->
		    <div class="base-container bg-ay-purple text-white">
		    	<CelestialObjects />
		    </div>

		    <!-- ISS Tracker Card -->
		    <div class="base-container bg-ay-green text-white">
		    	<ISSFlyover />
		    </div>

		</section>

		<section class="base-container bg-ay-lavender w-full">
			<MapView />
		</section>
		
	</div>

</template>

<script setup>

import WeatherCard from './WeatherCard.vue'
import CelestialObjects from './CelestialObjects.vue'
import ISSFlyover from './ISSFlyover.vue'
import MapView from './MapView.vue'

</script>