<script setup>
import Header from "./components/header.vue";
import Toast from "./components/toast.vue";
</script>

<template>
  <div class="body-project">
    <Header />
    <router-view></router-view>
    <Toast />
  </div>
</template>

<style scoped>
.body-project{
  height: 100vh;
}

router-link {
  color: white;
  margin: 0 1rem;
  text-decoration: none;
}
</style>
