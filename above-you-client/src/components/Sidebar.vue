<template>
	<div class="contents">

		<!-- Sidebar Slide-In Panel -->
		<transition name="slide-left">
			<aside
				v-if="open"
				class="fixed inset-y-0 left-0 w-64 ay-gradient-dark text-white z-50 shadow-lg flex flex-col p-4"
			>
				<!-- GitHub Link -->
				<a
					href="https://github.com/realchkris/above-you"
					target="_blank"
					class="base-container bg-ay-lavender font-bold hover:border-ay-purple flex items-center gap-2"
				>
					<img src="/github-mark.svg" alt="GitHub" class="image-sm" />
					GitHub Repo
				</a>

				<!-- Delete Account Button (Only if logged in) -->
				<div v-if="auth.isLoggedIn" class="mt-auto pt-4">
					<button
						class="primary-button-danger w-full"
						@click="ui.showConfirmationModal"
					>
						Delete Account
					</button>
				</div>

			</aside>
		</transition>

		<!-- Backdrop -->
		<div
			v-if="open"
			class="black-overlay"
			@click="$emit('close')"
		></div>

	</div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const ui = useUIStore();
const auth = useAuthStore();

defineProps({ open: Boolean });
defineEmits(['close']);
</script>