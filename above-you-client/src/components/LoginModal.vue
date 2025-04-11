<template>

	<!-- Modal Overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
		@click.self="closeOnOutside"
	>
		<!-- Modal Container -->
		<div class="base-container ay-gradient-dark p-4 w-full max-w-xs relative">

			<!-- Close Button -->
			<button
				class="absolute top-2 right-2 round-button bg-ay-lavender"
				@click="emitClose"
				aria-label="Close modal"
			>
				✖
			</button>

			<!-- Title -->
			<h2 class="text-xl font-semibold mb-4 text-center">Welcome</h2>

			<!-- Info Box -->
			<div class="base-container text-xs bg-yellow-200 text-black text-center m-3">
				⚠️ This is a demo. <br> Your data is <strong>temporary</strong> and may be <strong>deleted</strong> periodically. <br> Feel free to use a mock email.
			</div>

			<!-- Toggle -->
			<div class="flex justify-center gap-2 mb-5">
				<button
					class="text-base px-3 py-1.5 rounded"
					@click="mode = 'login'"
					:class="{ 'bg-ay-purple font-bold': mode === 'login' }"
				>
					Login
				</button>
				<button
					class="text-base px-3 py-1.5 rounded"
					@click="mode = 'register'"
					:class="{ 'bg-ay-teal font-bold text-black': mode === 'register' }"
				>
					Sign Up
				</button>
			</div>

			<!-- Form -->
			<form @submit.prevent="submit" class="space-y-4 flex flex-col">

				<!-- Email -->
				<div>
					<label class="text-base block mb-1">Email</label>
					<input
						v-model="email"
						type="email"
						:class="[
							'primary-input w-full text-base py-3',
							mode === 'login' ? 'bg-ay-purple' : 'bg-ay-teal text-black'
						]"
						required
					/>
				</div>

				<!-- Password -->
				<div>
					<label class="text-base block mb-1">Password</label>
					<input
						v-model="password"
						type="password"
						:class="[
							'primary-input w-full text-base py-3',
							mode === 'login' ? 'bg-ay-purple' : 'bg-ay-teal text-black'
						]"
						required
					/>
				</div>

				<!-- Submit Button or Skeleton Loader -->
				<transition name="fade" mode="out-in">
				  <div v-if="ui.loading.auth" class="w-full flex justify-center">
					<SkeletonCard class="h-12 w-48" />
				  </div>

				  <button
					v-else
					type="submit"
					:class="[
						'primary-button py-3 font-semibold w-full mx-auto',
						mode === 'login' ? 'bg-ay-purple' : 'bg-ay-teal text-black'
					]"
				  >
					{{ mode === 'login' ? 'Login' : 'Sign Up' }}
				  </button>
				</transition>

			</form>

		</div>

	</div>

</template>

<script setup>

import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from "@/stores/uiStore";

import SkeletonCard from "@/components/SkeletonCard.vue";

const auth = useAuthStore();
const ui = useUIStore();

const emit = defineEmits(["close"]);

const email = ref("");
const password = ref("");
const mode = ref("login");

async function submit() {

	// Prevent multiple submits by checking ui loading state
	if (ui.loading.auth) return;

	ui.setLoading("auth", true); // Set loading state to true for auth

	try {

		if (mode.value === 'login') {
			await auth.login(email.value, password.value);
		} else {
			await auth.register(email.value, password.value);
		}

		// Wait until Vue updates DOM/reactivity
		await nextTick();
		setTimeout(() => emit("close"), 50);

	} catch (err) {
		console.error("Auth error:", err.response?.data || err.message);
	} finally {
		ui.setLoading("auth", false); // Set loading state to false after the request is finished
	}

}

function emitClose() {
	emit("close");
}

function closeOnOutside() {
	emit("close");
}

function handleEscape(e) {
	if (e.key === "Escape") emit("close");
}

onMounted(() => window.addEventListener("keydown", handleEscape));
onBeforeUnmount(() => window.removeEventListener("keydown", handleEscape));

</script>