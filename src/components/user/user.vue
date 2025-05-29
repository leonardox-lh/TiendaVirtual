<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/userStore.js'
import {useToastStore} from "../../stores/toast.js";
import LoadingPage from "../loadingPage.vue";
import {useAuthStore} from "../../stores/authStore.js";
import {useRouter} from "vue-router";

const CLOUD_NAME = 'dthhndiit'
const UPLOAD_PRESET = 'tiendaVirtual'

const store = useUserStore()
const logoFile = ref(null)
const loading = ref(false)
const logoUrl = ref('')

const router = useRouter()
const auth = useAuthStore()
const tipos = ref([])
const nuevoTipo = ref('')
const items = ref({})
const toast = useToastStore()

onMounted(async () => {
  loading.value = true
  if (!store.empresa) await store.cargarEmpresa()

  if (store.tipos.length === 0) await store.cargarTipos()

  if (store.empresa) {
    items.value = store.empresa
  }
  loading.value = false
})

const handleStockInput = (e) => {
  const value = e.target.value

  if (/^\d*$/.test(value)) {
    items.value.telefono = value === '' ? null : parseInt(value)
  } else {
    e.target.value = items.value.telefono ?? ''
  }
}

const logout = async () => {
  try {
    loading.value = true
    await auth.logout()
    toast.success('Sesión cerrada')
    await router.push('/list')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    toast.error('Error al cerrar sesión')
  } finally {
    loading.value = false
  }

}

const agregarTipo = async () => {
  try {
    loading.value = true
    if (!nuevoTipo.value.trim()) return

    const error = await store.agregarTipo(nuevoTipo.value.trim())
    if (error) {
      if (error.code === '23505') {
        toast.error('El tipo ya existe')
      } else {
        toast.error('Error al agregar tipo')
      }
    } else {
      toast.success('Tipo agregado correctamente')
      nuevoTipo.value = ''
    }
  }catch (error){
    console.error('Error al agregar tipo:', error)
    toast.error('Error al agregar tipo')
  }finally {
    loading.value = false
  }


}

const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    items.value.logo_url = URL.createObjectURL(file)
  }
}

const uploadLogo = async () => {
  const formData = new FormData()
  formData.append('file', logoFile.value)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return data.secure_url
}

const guardarEmpresa = async () => {
  loading.value = true
  try {
    const logo_url = logoFile.value ? await uploadLogo() : store.empresa.logo_url

    const error = await store.actualizarEmpresa({
      nombre: items.value.nombre,
      descripcion: items.value.descripcion,
      telefono: items.value.telefono,
      logo_url
    })

    if (error) toast.error('Error al actualizar empresa')
    else toast.success('Empresa actualizada')

    await store.cargarEmpresa()
  } catch (error) {
    console.error('Error al guardar empresa:', error)
    toast.error('Error al guardar empresa')
  } finally {
    logoFile.value = null
    loading.value = false
  }
}
</script>


<template>
  <section>
    <div class="cont-detail">
      <div class="card">
        <h2>Configuración</h2>

        <div class="detail_product">
          <div class="title_detail_product"> Título: </div>
          <input
              type="text"
              v-model="items.nombre"
              placeholder="Nombre de la empresa"
              class="input"
          />
        </div>
        <div class="detail_product">
          <div class="title_detail_product"> Descripción: </div>
          <textarea
              v-model="items.descripcion"
              placeholder="Descripción"
              class="input"
          />
        </div>
        <div class="detail_product">
          <div class="title_detail_product"> Teléfono: </div>
          <input
              type="text"
              :value="items.telefono"
              placeholder="WhatsApp"
              class="input"
              inputmode="numeric"
              @input="handleStockInput"
              maxlength="9"
          />
        </div>
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
          <div style="display: inline-block; margin: 25px" >
            <label class="btn">
              <Icon style="font-size: 20px" icon="mdi:upload" />
              Subir logo
              <input type="file" @change="handleLogoChange" hidden />
            </label>
          </div>
          <div v-if="items.logo_url || logoUrl" style="margin: 20px">
            <img :src="items.logo_url || logoUrl" alt="Logo" width="150" />
          </div>
        </div>

        <button class="btn_save" @click="guardarEmpresa">Guardar</button>
      </div>
      <div class="card_types">
        <h2>Tipos registrados</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
          <tr style="text-align: left; border-bottom: 1px solid #ccc;">
            <th>Nombre</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="tipo in store.tipos" :key="tipo.id" style="border-bottom: 1px solid #eee;">
            <td>{{ tipo.nombre }}</td>
          </tr>
          </tbody>
        </table>

        <div style="margin-top: 0.2rem; margin-bottom: 5rem; display: flex; gap: 0.5rem;">
          <input
              type="text"
              v-model="nuevoTipo"
              placeholder="Nuevo tipo"
              class="input"
          />
          <button @click="agregarTipo">Agregar</button>
        </div>
        <button class="btn-logout" v-if="auth.user" @click="logout">Cerrar sesión</button>

      </div>

    </div>
    <LoadingPage v-model:visible="loading" />
  </section>
</template>

<style scoped>
.cont-detail {
  display: flex;
  align-items: start;
  justify-content: center;
}

.card {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 30px;
}

.card_types{
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 30px;
}

.title_detail_product {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.btn_save{
  width: 120px;
  margin: 0 auto;
}

.btn-logout{

}

@media (max-width: 1050px) {
  .cont-detail{
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 85%;
    padding: 0;
  }
}
</style>
