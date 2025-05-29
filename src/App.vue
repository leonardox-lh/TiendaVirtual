<script setup>
import Header from "./components/header.vue";
import Toast from "./components/toast.vue";
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="body-project">
    <Header v-if="route.path !== '/login'"/>
    <router-view></router-view>
    <Toast />
  </div>
</template>

<style scoped>
.body-project{
  min-height: 98vh;
}

router-link {
  color: white;
  margin: 0 1rem;
  text-decoration: none;
}
</style>
