<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/authStore'
import { Icon } from '@iconify/vue'

const auth = useAuthStore()
const empresa = ref(null)
const menuOpen = ref(false)

onMounted(async () => {
  const { data, error } = await supabase
      .from('empresa')
      .select('*')
      .limit(1)
      .single()

  if (!error) {
    empresa.value = data
  }
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <header v-if="empresa" class="empresa-header">
    <img
        v-if="empresa.logo_url"
        :src="empresa.logo_url"
        alt="Logo empresa"
        class="logo"
    />

    <!-- Menú normal para desktop -->
    <nav class="nav-desktop">
      <router-link class="item_nav" to="/list">Listar Productos</router-link> |
      <router-link class="item_nav" v-if="auth.user" to="/add">Agregar Producto</router-link> |
      <router-link class="item_nav" v-if="auth.user" to="/user">Mi Cuenta</router-link>
      <router-link class="item_nav" v-if="!auth.user" to="/login">Iniciar Sesión</router-link>
    </nav>

    <!-- Menú hamburguesa para móviles -->
    <div class="hamburger-menu" @click="toggleMenu">
      <Icon icon="mdi:menu" width="32" height="32" />
    </div>

    <div v-if="menuOpen" class="mobile-menu">
      <router-link to="/list" @click="toggleMenu">Listar Productos</router-link>
      <router-link v-if="auth.user" to="/add" @click="toggleMenu">Agregar Producto</router-link>
      <router-link v-if="auth.user" to="/user" @click="toggleMenu">Mi Cuenta</router-link>
    </div>

    <a
        v-if="empresa.telefono"
        class="whatsapp"
        :href="`https://wa.me/${empresa.telefono.replace(/\D/g, '')}`"
        target="_blank"
        rel="noopener"
    >
      <Icon icon="mdi:whatsapp" />
      <div style="margin: 0 5px">WhatsApp</div>
    </a>
  </header>
</template>


<style scoped>
.empresa-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-header) !important;
  color: var(--color-text) !important;
  margin: 10px;
  position: relative;
}

.logo {
  width: auto;
  height: 80px;
  object-fit: cover;
  padding-left: 20px;
}

nav,
.nav-desktop {
  font-size: 20px;
  display: flex;
}

.item_nav {
  margin: 0 30px !important;
}

.hamburger-menu {
  display: none;
  cursor: pointer;
}

.mobile-menu {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  background-color: var(--color-header);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  z-index: 10;
}

.mobile-menu a {
  margin-bottom: 10px;
  font-size: 18px;
}

.whatsapp {
  background-color: #25D366;
  color: var(--color-text) !important;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-weight: bold;
}

@media (max-width: 1000px) {
  .nav-desktop {
    display: none;
  }

  .hamburger-menu {
    display: block;
    margin-right: 10px;
  }

  .whatsapp {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
}
</style>

