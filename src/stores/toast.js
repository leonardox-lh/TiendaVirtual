import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const message = ref('')
    const type = ref('success')
    const visible = ref(false)

    function show(msg, toastType = 'success', duration = 5000) {
        message.value = msg
        type.value = toastType
        visible.value = true

        setTimeout(() => {
            visible.value = false
        }, duration)
    }

    return {
        message,
        type,
        visible,
        show,
        success: (msg) => show(msg, 'success'),
        warning: (msg) => show(msg, 'warning'),
        error: (msg) => show(msg, 'error')
    }
})
