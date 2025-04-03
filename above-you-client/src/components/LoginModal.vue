<!-- PURPOSE: Modal for sign up/login -->

<template>

	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20" @click.self="closeOnOutside">

		<div class="base-container bg-ay-dark p-6 w-full max-w-sm relative">

			<button class="absolute top-2 right-2 round-button bg-ay-lavender" @click="emitClose">✖</button>

			<h2 class="text-xl font-semibold mb-4 text-center">Welcome</h2>

			<!-- Form toggle -->
			<div class="flex justify-center gap-4 mb-6">
				<button class="text-sm" @click="mode = 'login'" :class="{ 'bg-ay-purple font-bold': mode === 'login' }">Login</button>
				<button class="text-sm" @click="mode = 'register'" :class="{ 'bg-ay-teal font-bold text-black': mode === 'register' }">Register</button>
			</div>

			<form @submit.prevent="submit">

				<div class="mb-4">
					<label class="text-sm">Email</label>
					<input v-model="email" type="email" class="primary-input w-full" required />
				</div>

				<div class="mb-4">
					<label class="text-sm">Password</label>
					<input v-model="password" type="password" class="primary-input w-full" required />
				</div>

				<button type="submit" class="w-full primary-button p-4 font-bold">
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
