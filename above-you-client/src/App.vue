<template>

	<div class="min-h-screen md:h-screen w-screen bg-ay-darker">
	<!-- <div class="w-screen h-screen bg-ay-darker"> -->

		<!-- Header -->
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

		<!-- Main Dashboard content (Adjusts dynamically to header height) -->
		<main
		class="w-full h-full"
		:style="{ paddingTop: headerHeight + 'px' }"
		>
			<div class="w-full h-full">
				<Dashboard />
			</div>
		</main>

	</div>

</template>

<script setup>

	import { ref, onMounted } from 'vue'
	import Dashboard from '@/components/Dashboard.vue'
	import Header from '@/components/Header.vue'

	import { useUIStore } from "@/stores/uiStore";
	const ui = useUIStore();

	const headerHeight = ref(0)

	onMounted(() => {
		const header = document.querySelector('.header-container')
		if (header) {
			headerHeight.value = header.offsetHeight;
		}
	})

</script>