<template>

  <div class="w-full">

    <div
      class="base-container text-white flex items-center justify-between cursor-pointer"
      :class="bgColor"
      @click="isOpen = !isOpen"
    >

      <!-- Title -->
      <div class="flex items-center gap-2">
        <img v-if="icon" :src="icon" alt="Icon" class="image-sm" />
        <div class="font-bold">{{ title }}</div>
      </div>

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
  icon: String,
  bgColor: {
    type: String,
    default: "bg-ay-dark",
  },
  initiallyOpen: {
    type: Boolean,
    default: false,
  },
});

const isOpen = ref(props.initiallyOpen);
</script>