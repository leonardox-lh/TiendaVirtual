<template>
  <div v-if="visible" class="loading-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import {watch} from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

watch(() => props.visible, (val) => {
  console.log("Loading state changed:", val);
}, { immediate: true });
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #fff;
  border-top-color: #4e4037;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
