<template>
	<div :class="['w-full', { 'flex-grow': !isOpen }]">
		
		<!-- Card Wrapper -->
		<div
			class="base-container relative text-white flex items-center justify-between cursor-pointer overflow-hidden"
			:class="[bgColor, { 'h-full': !isOpen }]"
			@click="isOpen = !isOpen"
		>
			<!-- Decorative Background Image -->
			<img
				v-if="icon"
				:src="icon"
				alt="Background Icon"
				class="absolute opacity-30 w-40 h-40 -right-4 pointer-events-none select-none z-0"
			/>

			<!-- Foreground Content -->
			<div class="relative z-10 flex items-center gap-4">
				<div :class="['font-semibold transition-all duration-300', isOpen ? 'text-sm md:text-base' : 'text-base md:text-2xl']">
					{{ title }}
				</div>
			</div>

			<!-- Chevron Toggle -->
			<transition name="chevron-fade" mode="out-in">
				<component
					:is="isOpen ? ChevronUp : ChevronDown"
					class="w-4 h-4 text-white/40 z-10"
					:key="isOpen"
				/>
			</transition>
		</div>

		<!-- Collapsible Slot Content -->
		<transition name="fade">
			<div v-if="isOpen" class="mt-4 w-full">
				<slot />
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { ChevronUp, ChevronDown } from "lucide-vue-next";

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