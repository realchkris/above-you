<template>
	<div :class="['w-full', { 'flex-grow': !isOpen }]"> <!-- Apply flex-grow only when the card is closed -->

		<!-- Apply h-full only when the card is closed -->
		<div
			class="base-container text-white flex items-center justify-between cursor-pointer"
			:class="[bgColor, {'h-full': !isOpen}]"
			@click="isOpen = !isOpen"
		>

			<!-- Title -->
			<div class="flex items-center gap-4">
				<img v-if="icon" :src="icon" alt="Icon" class="image-sm" />
				<div class="font-bold">{{ title }}</div>
			</div>

			<!-- Button -->
			<div class="text-sm text-gray-400">
				<span v-if="isOpen">▲</span>
				<span v-else>▼</span>
			</div>

		</div>

		<transition name="fade">
			<div
				v-if="isOpen"
				class="mt-4 w-full">
				<slot />
			</div>
		</transition>

	</div> <!-- End of the collapsible card container -->

</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
	title: String,
	icon: String,
	bgColor: {
		type: String,
		default: "bg-ay-dark",
	},
	initiallyOpen: {
		type: Boolean,
		default: false,
	},
});

const isOpen = ref(props.initiallyOpen);
</script>
