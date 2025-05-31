<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import { colorNames } from '../utils/colors.js'
import {useToastStore} from "../stores/toast.js";

const props = defineProps({
  data: {
    type: Array,
    default: false,
  },
})

const toast = useToastStore()
const emit = defineEmits(['update:data'])
const open = ref(false)
const max = ref(3)
const items = ref([])
const dropdownRef = ref(null)

const toggleColor = (hex) => {
  if (items.value.includes(hex)) {
    items.value = items.value.filter(c => c !== hex)
  } else {
    if (items.value.length >= max.value) {
      toast.error('No puedes seleccionar más de ' + max.value + ' colores.')
      return
    }
    items.value.push(hex)
  }

  emit('update:data', items.value)
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})


watch(() => props.data, () => {
  items.value = props.data
}, { immediate: true })
</script>

<template>
  <div class="dropdown" ref="dropdownRef">
    <div class="dropdown-toggle" @click="open = !open">
      <span>Seleccionar colores</span>

      <span class="arrow">
        <Icon icon="mdi:chevron-down" width="20" height="20" />
      </span>
    </div>

    <div class="dropdown-menu" v-if="open">
      <label
          v-for="(name, hex) in colorNames"
          :key="hex"
          class="dropdown-item"
      >
        <input
            type="checkbox"
            :value="hex"
            :checked="items.includes(hex)"
            @change="toggleColor(hex)"
            :disabled="items.length >= max && !items.includes(hex)"
        />
        <span class="circle" :style="{ backgroundColor: hex }"></span>
        {{ name }}
      </label>
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  width: 100%;
}

.dropdown-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  align-items: center;
}

.arrow {
  margin-left: auto;
}

.circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #999;
}

.dropdown-menu {
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 6px;
  margin-top: 4px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  cursor: pointer;
}
</style>
