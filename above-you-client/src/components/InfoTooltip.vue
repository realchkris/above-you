<template>
	<div
		class="relative flex items-center select-none"
		@mouseenter="show = true"
		@mouseleave="show = false"
		@click="toggleOnMobile"
	>
		<Info class="w-4 h-4 text-white/50 hover:text-white transition cursor-pointer" />

		<!-- Tooltip -->
		<transition name="fade">
			<div
				v-if="show"
				class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
				       w-fit max-w-xs bg-ay-purple text-white text-xs px-2 py-1 rounded
				       text-center pointer-events-none"
			>
				{{ message }}
			</div>
		</transition>
	</div>
</template>

<script setup>
import { Info } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';

defineProps({ message: String });

const show = ref(false);
let isTouch = false;

function toggleOnMobile() {
	if (isTouch) {
		show.value = !show.value;
	}
}

onMounted(() => {
	isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
});
</script>