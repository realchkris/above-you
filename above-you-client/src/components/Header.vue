<!-- PURPOSE: Displays app title, navigation, and dark mode toggle. -->

<template>

	<header class="header-container">

		<!-- Navbar Button -->
		<button class="round-button bg-ay-lavender hover:bg-ay-purple">
			<img class="icon-button icon-sm" src="../assets/navbar.png">
		</button>

		<!-- Above You Logo -->
		<img class="image-sm" src="../assets/ay_logo.png">

		<!-- Login Icon -->
		<button class="round-button bg-ay-lavender hover:bg-ay-purple" @click="toggleModal">
			<img class="icon-button icon-md" src="../assets/login.png">
		</button>

		<!-- Modal in case Login button is pressed -->
		<LoginModal v-if="showModal" @close="showModal = false" />

	</header>

</template>

<script setup>

import LoginModal from './LoginModal.vue';
import { ref } from 'vue';

const showModal = ref(false);

function toggleModal() {
  showModal.value = true;
}

</script>