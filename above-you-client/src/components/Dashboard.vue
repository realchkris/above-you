<!-- PURPOSE: Main UI showing weather, celestial data, and ISS flyover times. -->
<template>
	<div class="grid gap-4 lg:grid-cols-[2fr_1.5fr] h-full">

		<!-- MAP COLUMN -->
		<div class="base-container no-padding bg-ay-lavender h-full flex">
		  <MapCard class="flex-1 h-full" />
		</div>

		<!-- DATA COLUMN -->
		<div class="flex flex-col gap-4">

			<!-- Weather + ISS (side by side) -->
			<div class="flex gap-4">

				<div class="flex-1">
					<CollapsibleCard title="Weather" :icon="weatherIcon">
						<div class="base-container bg-ay-dark text-white">
							<WeatherCard />
						</div>
					</CollapsibleCard>
				</div>

				<div class="flex-1">
					<CollapsibleCard title="International Space Station" bgColor="bg-ay-green" :icon="ISSIcon">
						<div class="base-container bg-ay-green text-white">
							<ISSCard />
						</div>
					</CollapsibleCard>
				</div>
			</div>

			<!-- Celestial Full Width -->
			<div>
				<CollapsibleCard title="Celestial Objects" bgColor="bg-ay-purple" :icon="celestialObjectsIcon">
					<div class="base-container bg-ay-purple text-white">
						<CelestialObjectsCard />
					</div>
				</CollapsibleCard>
			</div>

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