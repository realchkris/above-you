<template>
  <transition name="fade" mode="out-in">
    <div
      :class="{'h-full': fullHeight, 'w-full': true}"
      :key="stateKey"
    >
      <!-- Loading -->
      <slot name="loading" v-if="loading" />

      <!-- Error -->
      <slot name="error" v-else-if="error" />

      <!-- Data -->
      <slot v-else />
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  loading: Boolean,
  error: [Boolean, String],
  fullHeight: { type: Boolean, default: false } // control h-full
});

const stateKey = computed(() => {
  if (props.loading) return 'loading';
  if (props.error) return 'error';
  return 'data';
});
</script>