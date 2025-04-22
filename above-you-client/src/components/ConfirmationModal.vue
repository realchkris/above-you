<template>
	<transition name="fade">

		<div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div class="base-container bg-ay-purple text-white w-full max-w-sm p-6 space-y-4 text-center">

				<!-- Message -->
				<p class="font-semibold text-lg">{{ message }}</p>

				<!-- Choice -->

				<transition name="fade" mode="out-in">
					<div v-if="ui.loading.auth" class="w-full flex justify-center">
						<SkeletonCard class="h-12 w-48" />
					</div>

					<div v-else class="flex justify-center gap-4 mt-4">
						<button @click="$emit('cancel')" class="primary-button-base">
							Cancel
						</button>
						<button @click="$emit('confirm')" class="primary-button-danger">
							Confirm
						</button>
					</div>
				</transition>

			</div>
		</div>

	</transition>
</template>

<script setup>

	import { useUIStore } from "@/stores/uiStore";
	import SkeletonCard from "@/components/SkeletonCard.vue";

	const ui = useUIStore();

	defineProps({
		open: Boolean,
		message: {
			type: String,
			default: "Are you sure?",
		},
	});

</script>