<template>
	<div class="min-h-screen md:h-screen w-screen bg-ay-darker">
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

		<!-- Global Success Message -->
		<transition name="fade">
			<div
				v-if="ui.globalSuccess"
				class="success-container fixed top-16 left-1/2 transform -translate-x-1/2 z-50"
			>
				{{ ui.globalSuccess }}
			</div>
		</transition>

		<!-- Delete Account Modal -->
		<ConfirmationModal
			:open="ui.confirmationModalVisible"
			message="Are you sure you want to delete your account?"
			@cancel="ui.hideConfirmationModal"
			@confirm="handleAccountDeletion"
		/>

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
	import ConfirmationModal from '@/components/ConfirmationModal.vue'

	import { useAuthStore } from '@/stores/authStore';
	import { useUIStore } from "@/stores/uiStore";
	
	const ui = useUIStore();
	const auth = useAuthStore();

	const headerHeight = ref(0)

	onMounted(() => {
		const header = document.querySelector('.header-container')
		if (header) {
			headerHeight.value = header.offsetHeight;
		}
	})

	async function handleAccountDeletion() {
		try {
			await auth.deleteAccount(); // Proceed with account deletion
			ui.hideConfirmationModal(); // Hide the modal after account deletion
		} catch (err) {
			console.warn('[Delete] Failed to delete account');
		}
	}
</script>