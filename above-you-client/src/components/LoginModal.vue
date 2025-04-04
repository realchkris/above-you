<!-- PURPOSE: Modal for sign up/login -->

<template>

	<!-- Modal Overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
		@click.self="closeOnOutside"
	>

		<!-- Modal Container -->
		<div class="base-container bg-ay-dark p-4 w-full max-w-xs relative">

			<!-- Close Button -->
			<button
				class="absolute top-2 right-2 round-button bg-ay-lavender"
				@click="emitClose"
				aria-label="Close modal"
			>
				✖
			</button>

			<!-- Title -->
			<h2 class="text-lg font-semibold mb-3 text-center">Welcome</h2>

			<!-- Toggle -->
			<div class="flex justify-center gap-2 mb-4">
				<button
					class="text-sm px-2 py-1 rounded"
					@click="mode = 'login'"
					:class="{ 'bg-ay-purple font-bold': mode === 'login' }"
				>
					Login
				</button>
				<button
					class="text-sm px-2 py-1 rounded"
					@click="mode = 'register'"
					:class="{ 'bg-ay-teal font-bold text-black': mode === 'register' }"
				>
					Register
				</button>
			</div>

			<!-- Form -->
			<form @submit.prevent="submit" class="space-y-3 flex flex-col">

				<!-- Email -->
				<div>
					<label class="text-sm block mb-1">Email</label>
					<input
						v-model="email"
						type="email"
						class="primary-input w-full text-sm py-2"
						required
					/>
				</div>

				<!-- Password -->
				<div>
					<label class="text-sm block mb-1">Password</label>
					<input
						v-model="password"
						type="password"
						class="primary-input w-full text-sm py-2"
						required
					/>
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					class="primary-button py-2 text-sm font-semibold w-full mx-auto"
				>
					{{ mode === 'login' ? 'Login' : 'Register' }}
				</button>

			</form>

		</div>

	</div>

</template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["close"]);

const email = ref("");
const password = ref("");
const mode = ref("login");

function submit() {
	console.log(`${mode.value} →`, { email: email.value, password: password.value });
// Emit form data or call your auth composable/store here
	emit("close");
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

<style scoped>
.input-field {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 0.375rem;
}
</style>
