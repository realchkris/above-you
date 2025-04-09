<template>

	<div class="w-screen h-screen bg-black">

		<!-- Header -->
		<Header />

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

	const headerHeight = ref(0)

	onMounted(() => {
		const header = document.querySelector('.header-container')
		if (header) {
			headerHeight.value = header.offsetHeight;
		}
	})

</script>