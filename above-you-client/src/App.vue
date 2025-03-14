<template>

  <div class="flex flex-col items-center w-full">

    <Header />

    <main class="w-full flex justify-center pt-[58px]">
      <Dashboard />
    </main>

  </div>

</template>

<script setup>
  
import Header from './components/Header.vue'
import Dashboard from './components/Dashboard.vue'

</script>