import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const message = ref('')
    const type = ref('success')
    const visible = ref(false)
    let timeoutId = null

    function show(msg, toastType = 'success', duration = 5000) {
        message.value = msg
        type.value = toastType
        visible.value = true

        // Limpiar timeout anterior si existe
        if (timeoutId) clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
            close()
        }, duration)
    }

    function close() {
        visible.value = false
        message.value = ''
        type.value = 'success'
    }

    return {
        message,
        type,
        visible,
        show,
        success: (msg) => show(msg, 'success'),
        warning: (msg) => show(msg, 'warning'),
        error: (msg) => show(msg, 'error'),
        close, // ahora expuesto
    }
})
