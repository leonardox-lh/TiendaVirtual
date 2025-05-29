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
  <div v-if="toast.visible" :class="['toast', toast.type]" style="display: flex; align-items: center; justify-content: center">
    <Icon
        :icon="iconByType[toast.type]"
        :style="{ fontSize: '20px', color: iconColorByType[toast.type], marginRight: '10px' }"
    />
    <div class="toast-message">{{ toast.message }}</div>
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
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  color: black;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  font-weight: 600;
  animation: slide-in 0.3s ease-out;
  min-width: 220px;
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
