<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore.js'
import {useToastStore} from "../../stores/toast.js";
const auth = useAuthStore()

const toast = useToastStore()
const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  const err = await auth.login(email.value, password.value)
  if (err) error.value = err.message
  else toast.success('Logueado correctamente')
}
</script>

<template>
  <div class="card">
    <h2>Iniciar sesión</h2>
    <input v-model="email" type="email" placeholder="Correo" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button @click="handleLogin">Iniciar sesión</button>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>
