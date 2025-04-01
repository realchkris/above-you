<template>

  <div class="w-full">

    <div
      class="base-container bg-ay-dark text-white flex items-center justify-between cursor-pointer"
      @click="isOpen = !isOpen"
    >
      <div class="font-bold text-left">{{ title }}</div>
      <div class="text-sm text-gray-400">
        <span v-if="isOpen">▲</span>
        <span v-else>▼</span>
      </div>
    </div>

    <transition name="fade">
      <div v-if="isOpen" class="mt-2">
        <slot />
      </div>
    </transition>
    
  </div>

</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  title: String,
  initiallyOpen: {
    type: Boolean,
    default: false,
  },
});

const isOpen = ref(props.initiallyOpen);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
