<template>
	<div :class="['w-full', { 'flex-grow': !isOpen }]">

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
			<transition name="chevron-fade" mode="out-in">
				<component
				:is="isOpen ? ChevronUp : ChevronDown"
				class="w-4 h-4 text-gray-400"
				:key="isOpen"
				/>
			</transition>

		</div>

		<transition name="fade">
			<div
			v-if="isOpen"
			class="mt-4 w-full">
				<slot />
			</div>
		</transition>

	</div>

</template>

<script setup>

import { ref } from "vue";
import { ChevronUp, ChevronDown } from "lucide-vue-next"

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
