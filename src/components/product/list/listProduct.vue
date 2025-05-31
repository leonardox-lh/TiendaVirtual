<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '../../../supabase.js'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore.js'
import { useAuthStore } from '../../../stores/authStore.js'
import Card from "../detail/card.vue";
import LoadingPage from "../../loadingPage.vue";
import {useToastStore} from "../../../stores/toast.js";

const toast = useToastStore()
const auth = useAuthStore()
const store = useUserStore()
const router = useRouter()
const product = ref([])
const types = computed(() => store.tipos)
const typeSelect = ref('')
const search = ref('')
const loading = ref(true)

const getData = async () => {
  loading.value = true
  let query = supabase
      .from('productos')
      .select('*, tipos(nombre), imagenes_producto!fk_producto(id, url_imagen)\n')
      .order('created_at', { ascending: false })

  if (typeSelect.value) {
    query = query.eq('tipo_id', typeSelect.value)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error al cargar productos:', error)
  } else {
    product.value = data
  }

  loading.value = false
}

const productsFilter = computed(() => {
  return product.value.filter(p =>
      p.nombre.toLowerCase().includes(search.value.toLowerCase())
  )
})

const deleteProduct = async (id) => {
  const confirmar = confirm('¿Estás seguro de eliminar este producto?')
  if (!confirmar) return
  await supabase.from('imagenes_producto').delete().eq('producto_id', id)

  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) {
    toast.error('Error al eliminar: ' + error.message)
  } else {
    product.value = product.value.filter(p => p.id !== id)
  }
}

const editProduct = (id) => {
  router.push({ path: `/edit/${id}` })
}

const detailProduct = (id) => {
  router.push({path: `/product/${id}`})
}

onMounted(async () => {
  if (store.tipos.length === 0) await store.cargarTipos()
  await getData()
})

watch(typeSelect, async () => {
  await getData()
})
</script>

<template>
  <div>
    <div style="text-align: center">
      <h2>Lista de productos</h2>

      <div class="cont_search">
        <input
            v-model="search"
            placeholder="Buscar por nombre..."
            class="input-busqueda input"
        />
        <select
            v-model="typeSelect"
            class="input-busqueda input"
        >
          <option value="">Todos los tipos</option>
          <option v-for="tipo in types" :key="tipo.id" :value="tipo.id">{{ tipo.nombre }}</option>
        </select>
      </div>
    </div>


    <div style="display: flex; justify-content: center" v-if="loading">Cargando productos...</div>

    <div v-else>
      <div style="display: flex; justify-content: center" v-if="productsFilter.length === 0">No se encontraron productos.</div>

      <div style="margin: 10px">
        <div class="productos-container">
          <div
              v-for="product in productsFilter"
              :key="product.id"
              class="producto-card"
          >
            <Card
                @click="detailProduct(product.id)"
                :data="product"
            />

            <div class="btnProduct">
              <button v-if="auth.user" @click="deleteProduct(product.id)" class="btn-outline">
                <Icon icon="mdi:delete-outline" /> Eliminar
              </button>
              <button v-if="auth.user" @click="editProduct(product.id)" class="btn-outline">
                <Icon icon="mdi:pencil" /> Editar
              </button>
            </div>


          </div>
        </div>
      </div>

    </div>
    <LoadingPage v-model:visible="loading" />
  </div>
</template>

<style scoped>
.input-busqueda {
  margin-bottom: 1rem;
  padding: 0.5rem;
  width: 100%;
  max-width: 300px;
}

.productos-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.producto-card {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.producto-card:hover {
  transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(59, 59, 59, 0.2);
}
.imagenes-miniatura img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}
.imagenes-miniatura img:hover {
  transform: scale(1.1);
}
.btnProduct{
  width: 220px;
  display: flex;
  justify-content: space-around;
}
.cont_search{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.cont_search input, select{
  margin: 0!important;
}

@media (max-width: 600px) {
  .productos-container {
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .producto-card {
    padding: 10px;
  }
  .btnProduct{
    width: 150px;
    flex-direction: column;
    gap: 0.5rem;
  }
  .cont_search{
    flex-direction: column;
    align-items: center;
  }
}
</style>
