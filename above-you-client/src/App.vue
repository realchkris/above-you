<template>

  <div class="flex flex-col items-center w-full">

    <Header />

    <!-- Error div -->
    <transition name="fade">
      <div
        v-if="errorMessage"
        class="error-container fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        {{ errorMessage }}
      </div>
    </transition>

    <main class="w-full flex justify-center pt-[58px]">

      <Dashboard
        @errorOccurred="handleError"
      />

    </main>

  </div>

</template>

<script setup>

import { ref } from "vue";
import Header from './components/Header.vue'
import Dashboard from './components/Dashboard.vue'

const errorMessage = ref("");
const showError = ref(false);

function handleError(message) {

  errorMessage.value = message;
  showError.value = true;

  // Hide error after 5 seconds
  setTimeout(() => {
    showError.value = false;
    setTimeout(() => {
      errorMessage.value = "";
    }, 500); // Allow fade-out animation
  }, 5000);
  
}

</script>