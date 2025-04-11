<template>

	<transition name="slide">

		<aside
		v-if="open"
		class="fixed inset-y-0 left-0 w-64 ay-gradient-dark text-white z-50 shadow-lg flex flex-col p-4"
		>

			<!-- Nav Links -->
			<a href="https://github.com/realchkris/above-you" target="_blank" class="base-container bg-ay-lavender font-bold hover:border-ay-purple flex items-center gap-2">
				<img src="/github-mark.svg" alt="GitHub" class="image-sm" />
				GitHub Repo
			</a>

		</aside>

	</transition>

	<!-- Backdrop -->
	<div
	v-if="open"
	class="fixed inset-0 bg-black bg-opacity-50 z-40"
	@click="$emit('close')"
	></div>

</template>

<script setup>
	defineProps({ open: Boolean });
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
	transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateX(-100%);
}
</style>
