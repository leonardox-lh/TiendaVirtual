<script setup>
import { useToastStore } from '../stores/toast.js'
import { Icon } from '@iconify/vue'

const toast = useToastStore()


const iconByType = {
  success: 'mdi:check-circle-outline',
  warning: 'mdi:alert-outline',
  error: 'mdi:close-circle-outline'
}

const iconColorByType = {
  success: '#3cb73c',
  warning: '#ffc940',
  error: '#ee3f2e'
}
</script>

<template>
  <div
      v-if="toast.visible"
      :class="['toast', toast.type]"
      style="display: flex; align-items: center; justify-content: space-between"
  >
    <div style="display: flex; align-items: center;">
      <Icon
          :icon="iconByType[toast.type]"
          :style="{ fontSize: '20px', color: iconColorByType[toast.type], marginRight: '10px' }"
      />
      <div class="toast-message">{{ toast.message }}</div>
    </div>

    <button class="toast-close" @click="toast.close">
      <Icon
          icon="mdi:close"
          width="20"
          height="20"
          :style="{ color: iconColorByType[toast.type] }"
      />
    </button>
  </div>
</template>


<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  color: black;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  font-weight: 600;
  animation: slide-in 0.3s ease-out;
  min-width: 240px;
  max-width: 300px;
}

.toast.success {
  background-color: #e6f8e4;
  border-left: 10px solid #3cb73c;
}

.toast.warning {
  background-color: #fff2be;
  border-left: 10px solid #ffc940;
}

.toast.error {
  background-color: #ffbfb9;
  border-left: 10px solid #ee3f2e;
}

.toast-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  display: flex;
  align-items: center;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0%);
  }
}
</style>

