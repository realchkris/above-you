<template>

	<div class="flex flex-col items-center w-full">

		<Header />

		<!-- Global Error Message -->
		<transition name="fade">
			<div
				v-if="ui.globalError"
				class="error-container fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
			>
				{{ ui.globalError }}
			</div>
		</transition>

		<main class="w-full flex justify-center pt-[58px]">
			<Dashboard />
		</main>

	</div>

</template>

<script setup>

import Header from './components/Header.vue'
import Dashboard from './components/Dashboard.vue'

import { useUIStore } from "@/stores/uiStore";
const ui = useUIStore();

</script>