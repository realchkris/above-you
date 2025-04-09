<!-- PURPOSE: Main UI showing weather, celestial data, and ISS flyover times. -->
<template>
	<div class="grid gap-4 lg:grid-cols-[2fr_1.5fr] p-4 w-full h-full">

		<!-- MAP COLUMN -->
		<MapCard class="w-full h-full" />

		<!-- DATA COLUMN -->
		<div class="flex flex-col gap-4 w-full h-full min-h-0 overflow-x-hidden">

			<!-- Weather -->
			<CollapsibleCard
				title="Weather"
				:icon="weatherIcon"
			>
				<WeatherCard class="bg-ay-dark text-white base-container w-full h-full" />
			</CollapsibleCard>

			<!-- ISS -->
			<CollapsibleCard
				title="International Space Station"
				:icon="ISSIcon"
				bgColor="bg-ay-green"
			>
				<ISSCard class="bg-ay-green text-white base-container w-full h-full" />
			</CollapsibleCard>

			<!-- Celestial Objects -->
			<CollapsibleCard
				title="Celestial Objects"
				:icon="celestialObjectsIcon"
				bgColor="bg-ay-purple"
			>
				<CelestialObjectsCard class="bg-ay-purple text-white base-container w-full h-full" />
			</CollapsibleCard>

		</div>
		
	</div>

</template>


<script setup>

	import WeatherCard from '@/components/WeatherCard.vue'
	import CelestialObjectsCard from '@/components/CelestialObjectsCard.vue'
	import ISSCard from '@/components/ISSCard.vue'
	import MapCard from '@/components/MapCard.vue'
	import CollapsibleCard from '@/components/CollapsibleCard.vue';

	import weatherIcon from '@/assets/weather.png';
	import celestialObjectsIcon from '@/assets/comet.png';
	import ISSIcon from '@/assets/iss.png';

	import { ref } from "vue";

</script>