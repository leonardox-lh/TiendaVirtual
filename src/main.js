import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { Icon } from '@iconify/vue';
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.component('Icon', Icon)
app.mount('#app')

export { pinia }