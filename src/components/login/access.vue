<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore.js'
import {useToastStore} from "../../stores/toast.js";
import {useRouter} from "vue-router";
const auth = useAuthStore()

const router = useRouter()
const toast = useToastStore()
const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  const err = await auth.login(email.value, password.value)
  if (err) {
    toast.error('Credenciales incorrectas')
    error.value = "Credenciales incorrectas"
  }
  else {
    toast.success('Logueado correctamente')
    await router.push({path: '/list'})
  }

}
</script>

<template>
  <div class="login-container">
    <div class="card">
      <h2>Iniciar sesión</h2>
      <input v-model="email" class="input" type="email" placeholder="Correo" />
      <input v-model="password" class="input" type="password" placeholder="Contraseña" />
      <button @click="handleLogin">Iniciar sesión</button>
      <p v-if="error" class="error-text">{{ error }}</p>
      <button @click="router.push({path: '/list'})">Continuar como invitado</button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--color-header);
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  margin-bottom: 1.5rem;
  color: var(--color-text);
}

.input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--color-text);
  outline: none;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-text);
  color: white;
  font-weight: bold;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #333; /* oscuro suave */
}

.error-text {
  margin-top: 1rem;
  color: red;
  font-weight: 500;
  font-size: 0.95rem;
}
</style>

