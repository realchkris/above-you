<!-- PURPOSE: Displays app title, navigation, and dark mode toggle. -->
<template>

	<header class="header-container">

		<!-- Navbar Button -->
		<button class="round-button bg-ay-lavender hover:bg-ay-purple" aria-label="Open navigation">
			<Menu class="icon-button icon-sm" aria-hidden="true" />
		</button>

		<!-- Above You Logo -->
		<img class="image-sm" :src="logo" alt="Above You Logo" />

		<!-- Login / Logout Section -->
		<transition name="fade" mode="out-in">
			<div :key="auth.isLoggedIn ? 'logout' : 'login'" class="flex items-center gap-2">

				<!-- Show if logged in -->
				<div v-if="auth.isLoggedIn" class="flex items-center gap-2">
					<button class="round-button bg-ay-lavender hover:bg-ay-purple" aria-label="Open navigation" @click="auth.logout">
						<LogOut class="icon-button icon-sm" aria-hidden="true" />
					</button>
				</div>

				<!-- Show if not logged in -->
				<button v-else class="round-button bg-ay-lavender hover:bg-ay-purple" aria-label="Open navigation" @click="toggleModal">
					<LogIn class="icon-button icon-sm" aria-hidden="true" />
				</button>

			</div>
		</transition>

		<!-- Login Modal -->
		<transition name="fade">
			<LoginModal v-if="showModal" @close="showModal = false" />
		</transition>

	</header>

</template>

<script setup>

	import { LogOut, LogIn, Menu } from 'lucide-vue-next';
	import logo from '@/assets/ay_logo.png';

	import { ref, computed } from 'vue';
	import LoginModal from '@/components/LoginModal.vue';
	import { useAuthStore } from '@/stores/authStore';

	const auth = useAuthStore();
	const showModal = ref(false);

	const toggleModal = () => {
		showModal.value = true;
	};

</script>