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

const deleteTypes = async (id) => {
  const confirmar = confirm('¿Estás seguro de eliminar este tipo?')
  if (!confirmar) return
  try {
    loading.value = true
    const error = await store.eliminarTipo(id)
    if (error) {
      if (error.code === '23503') {
        toast.error('Hay productos registrados con este tipo')
      } else {
        toast.error('Error al eliminar tipo')
      }
    } else {
      toast.success('Tipo eliminado correctamente')
    }
  } catch (error) {
    console.error('Error al eliminar tipo:', error)
    toast.error('Error al eliminar tipo')
  } finally {
    loading.value = false
  }
}

const updateType = (id, nombre) => {
  const nuevoNombre = prompt('Ingrese el nuevo nombre del tipo:', nombre)
  if (nuevoNombre && nuevoNombre.trim() !== '') {
    store.actualizarTipo(id, nuevoNombre.trim())
      .then(() => {
        toast.success('Tipo actualizado correctamente')
      })
      .catch((error) => {
        console.error('Error al actualizar tipo:', error)
        toast.error('Error al actualizar tipo')
      })
  }
}
</script>


<template>
  <section>
    <div class="cont-detail">
      <div class="card">
        <h2 style="margin: 10px 0">Configuración</h2>

        <div style="display: flex; align-items: center; justify-content: center">

          <div v-if="items.logo_url || logoUrl" style="padding: 10px; box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);">
            <img :src="items.logo_url || logoUrl" alt="Logo" width="150" />
          </div>
          <div style="display: inline-block; margin: 25px" >
            <label class="btn btn-outline">
              <Icon icon="mdi:upload" />
              Subir logo
              <input type="file" @change="handleLogoChange" hidden />
            </label>
          </div>
        </div>
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

        <button class="btn_save" style="margin-bottom: 10px" @click="guardarEmpresa">Guardar</button>
      </div>
      <div class="card_types">
        <div class="table-scroll">
          <table style="width: 100%">
            <thead>
            <tr style="text-align: left; border-bottom: 1px solid #ccc;">
              <th colspan="3">Categoría registradas</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="tipo in store.tipos" :key="tipo.id" style="border-bottom: 1px solid #eee;">
              <td style="padding-left: 10px">{{ tipo.nombre }}</td>
              <td style="display: flex; align-items: center; justify-content: end; text-align: right; margin: 2px 0">
                <button @click="updateType(tipo.id, tipo.nombre)" class="btn-outline" style="padding: 6px !important;">
                  <Icon icon="mdi:pencil" />
                </button>
                <button @click="deleteTypes(tipo.id)" class="btn-outline" style="padding: 6px !important;">
                  <Icon icon="mdi:delete-outline" />
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div style=" margin-bottom: 1rem; display: flex; gap: 0.5rem;">
          <input
              type="text"
              v-model="nuevoTipo"
              placeholder="Nuevo tipo"
              class="input"
          />
          <button @click="agregarTipo">Agregar</button>
        </div>
        <button class="btn-error" v-if="auth.user" @click="logout">Cerrar sesión</button>

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
  margin-top: 20px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 30px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.card_types{
  margin-top: 20px;
  width: 400px;
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

.btn{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
}

.table-scroll thead th {
  position: sticky;
  width: 100%;
  top: 0;
  background-color: var(--color-header);
  z-index: 1;
  padding: 10px;
}

.table-scroll {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 5px;
  border: 1px solid #ccc;
}
@media (max-width: 1050px) {
  .cont-detail{
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 85%;
    padding: 15px;
  }

  .card_types{
    width: 94%;
  }
}
</style>
