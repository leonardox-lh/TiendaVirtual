<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import { supabase } from '../../../supabase.js'
import {useRoute, useRouter} from 'vue-router'
import { useUserStore } from '../../../stores/userStore.js'
import {useToastStore} from "../../../stores/toast.js";
import LoadingPage from "../../loadingPage.vue";
import { validatePrecio, validateStock } from '../../../validators/validatorInput.js'
import ColorList from "../../colorList.vue";

const newColor = ref('#000000')
const router = useRouter()
const store = useUserStore()
const CLOUD_NAME = 'dthhndiit'
const UPLOAD_PRESET = 'tiendaVirtual'
const loading = ref(false)
const productDefault = ref({
  id: null,
  nombre: '',
  descripcion: '',
  precio: null,
  colores: [],
  tipo_id: null,
  imagenes_producto: [],
})

const product = ref({
  id: null,
  nombre: '',
  descripcion: '',
  precio: null,
  colores: [],
  tipo_id: null,
  imagenes_producto: [],
})

const props = defineProps({
  isEdit:{
    type: Boolean,
    default: false,
  },
  isView: {
    type: Boolean,
    default: false,
  },
  isAdd: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    required: false,
  },
})

const handlePrecioInput = (e) => {
  const result = validatePrecio(e.target.value)
  if (result !== null) {
    product.value.precio = result
  } else {
    e.target.value = product.value.precio ?? ''
  }
}

const addColor = () => {
  const color = newColor.value
  if (!product.value.colores.includes(color) && product.value.colores.length < 3) {
    product.value.colores.push(color)
  } else if (product.value.colores.includes(color)) {
    toast.warning('Este color ya fue agregado.')
  } else {
    toast.warning('Solo puedes agregar hasta 3 colores.')
  }
}

const removeColor = (index) => {
  product.value.colores.splice(index, 1)
}


const handleColorSelect = (items) => {
  product.value.colores = items
}

const emit = defineEmits(['update:Product'])

const currentIndex = ref(0)
const route = useRoute()
const selectedFiles = ref([])
const imageUrls = ref([])
const isEdit = ref(false)
const isView = ref(false)
const isAdd = ref(false)
const newImageUrls = ref([])
const toast = useToastStore()

const types = computed(() => store.tipos)

const previewUrls = ref([])

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (previewUrls.value.length + files.length > 6) {
    toast.error('No puedes subir más de 6 imágenes')
    return
  }

  selectedFiles.value.push(...files)
  previewUrls.value.push(...files.map(file => URL.createObjectURL(file)))
}

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % previewUrls.value.length
}

const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + previewUrls.value.length) % previewUrls.value.length
}

onMounted(async () => {
  if (store.tipos.length === 0) await store.cargarTipos()
})

const uploadImagesToCloudinary = async () => {
  const urls = []
  for (const file of selectedFiles.value) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    urls.push(data.secure_url)
  }

  return urls
}

const registrarProducto = async () => {
  if (!product.value.tipo_id) {
    toast.warning('Por favor selecciona un tipo.')
    return
  }
  if (!product.value.nombre || !product.value.descripcion || product.value.precio == null) {
    toast.warning('Por favor completa todos los campos.')
    return
  }
  if (product.value.precio < 0 || product.value.stock < 0) {
    toast.warning('El precio y el stock deben ser mayores o iguales a 0.')
    return
  }

  try {
    loading.value = true
    if (selectedFiles.value && selectedFiles.value.length > 0) {
      newImageUrls.value = await uploadImagesToCloudinary()
    }

    const productoId = route.params.id

    if (isEdit.value) {
      const { error } = await supabase
          .from('productos')
          .update({
            nombre: product.value.nombre,
            descripcion: product.value.descripcion,
            precio: product.value.precio,
            colores: product.value.colores,
            tipo_id: product.value.tipo_id,
          })
          .eq('id', productoId)

      if (error) {
        toast.error('Error al actualizar el producto')
        return
      }

      await postImages(productoId)

      toast.success('Producto actualizado')
      emit('update:Product')
    } else {
      // Insertar el producto
      const { data, error } = await supabase
          .from('productos')
          .insert([{
            nombre: product.value.nombre,
            descripcion: product.value.descripcion,
            precio: product.value.precio,
            colores: product.value.colores.length > 0 ? product.value.colores : [],
            tipo_id: product.value.tipo_id,
          }])
          .select()
          .single()

      if (error) {
        console.error('Error al registrar el producto:', error.message)
        toast.error('Error al registrar el producto')
        return
      }

      // Insertar imágenes relacionadas
      await postImages(data.id)

      toast.success('Producto registrado')
      await router.push({path: '/list'})
    }
  } catch (err) {
    toast.error('Error al registrar el producto')
    console.error('Error al registrar el producto:', err)
  } finally {
    loading.value = false
  }
}

const postImages = async (productoId) => {
  if (newImageUrls.value.length > 0) {
    const imagenes = newImageUrls.value.map((url) => ({
      producto_id: productoId,
      url_imagen: url,
    }))

    const {error: errorImgs} = await supabase
        .from('imagenes_producto')
        .insert(imagenes)

    if (errorImgs) {
      toast.error('Error al insertar imágenes: ' + errorImgs.message)
      return
    }

    imageUrls.value.push(...newImageUrls.value)
    newImageUrls.value = []
    previewUrls.value = []
  }
}

const removePreviewImage = (index, url) => {

  if (url && url.startsWith('blob:')) {
    // Si es un blob, no necesitamos hacer nada más
    selectedFiles.value.splice(index-imageUrls.value.length, 1)
    previewUrls.value.splice(index, 1)
    return
  }
  else {
    removeUploadedImage(url, index)
  }
}

const removeUploadedImage = async (url, index) => {

  if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

  previewUrls.value.splice(index, 1)

  const { error } = await supabase
      .from('imagenes_producto')
      .delete()
      .eq('producto_id', route.params.id)
      .eq('url_imagen', url)

  if (error) {
    toast.error('Error al eliminar imagen: ' + error.message)
    return
  }

  imageUrls.value = imageUrls.value.filter((imgUrl) => imgUrl !== url)
}

const clearForm = () => {
  product.value = { ...productDefault.value }
  selectedFiles.value = []
  previewUrls.value = []
  newImageUrls.value = []
  imageUrls.value = []
}

const resolveType = () =>{
  if (!product.value || product.value.tipo_id == null) return 'Selecciona un tipo'

  const tipo = types.value.find(t => t.id === product.value.tipo_id)
  return tipo ? tipo.nombre : 'Selecciona un tipo'
}

watch(previewUrls, (newVal) => {
  if (currentIndex.value >= newVal.length) {
    currentIndex.value = 0
  }
})

watch(() => props.product, ( data ) => {
  if (data && data.items){
    product.value = { ...data.items }
    imageUrls.value = [ ...data.imageUrls ]
    previewUrls.value = [ ...data.imageUrls ]
  } else {
    clearForm()
  }
}, { immediate: true })

watch(() => props.isEdit, (newVal) => {
  isEdit.value = newVal
}, { immediate: true })

watch(() => props.isView, (newVal) => {
  isView.value = newVal
}, { immediate: true })

watch(() => props.isAdd, (newVal) => {
  isAdd.value = newVal
}, { immediate: true })
</script>

<template>
  <div class="form-container">
    <div>
      <h2 style="margin: 0 0 10px 15px" v-if="isAdd">Registrar producto</h2>
    </div>
    <div class="cont-images">
      <div style="margin: 0 10px">
        <div class="card-image">
          <div class="card-title">{{ resolveType() }}</div>
          <div class="carousel-container">
            <img
                :src="previewUrls[currentIndex] ? previewUrls[currentIndex] : '/assets/articleDefault.png'"
                alt="Producto"
            />
            <button class="carousel-btn prev" @click="prevImage" v-if="previewUrls.length > 1">
              <Icon icon="mdi:chevron-left" />
            </button>
            <button class="carousel-btn next" @click="nextImage" v-if="previewUrls.length > 1">
              <Icon icon="mdi:chevron-right" />
            </button>
          </div>
        </div>
        <div v-if="!isView" style="display: inline-block; margin: 18px 5px" >
          <label class="btn btn-outline" >
            <Icon style="font-size: 20px" icon="mdi:upload" />
            Subir imágenes
            <input type="file" @change="handleFileChange" multiple hidden />
          </label>
        </div>
      </div>
      <div v-if="previewUrls.length">
        <div class="cont-mini-image">
          <div class="cont-mini-images">
            <div
                v-for="(url, index) in previewUrls"
                :key="index"
                style="position: relative"
            >
              <div class="mini-images">
                <img :src="url" alt="preview"/>
                <button v-if="!isView" @click="removePreviewImage(index, url)">
                  <Icon icon="mdi:trash"/>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

<!--  Detail  -->

    <h3 style="margin: 0 10px">Detalle</h3>
    <div class="cont-detail">
      <div class="const-detail-fist">
        <div class="detail_product">
          <span class="title_detail_product"> Título: </span>
          <input
              v-if="!isView"
              v-model="product.nombre"
              type="text"
              class="input input_detail"
              placeholder="Nombre del producto"
          />
          <span v-else>{{ product?.nombre }}</span>
        </div>
        <div v-if="isView" class="line"></div>
        <div class="detail_product">
          <span class="title_detail_product"> Precio: </span>
          <input
              v-if="!isView"
              :value="product.precio"
              @input="handlePrecioInput"
              inputmode="numeric"
              class="input input_detail"
              placeholder="Precio"
              maxlength="7"
          />
          <span v-else>{{ "S/" + Number(product?.precio).toFixed(2) }}</span>
        </div>
        <div v-if="isView" class="line"></div>
        <div class="detail_product" :style="{ alignItems: !isView ? 'start' : '' }">
          <span
              class="title_detail_product"
              :style="{ marginTop: !isView ? '21px' : '' }"
          >
            Colores:
          </span>
          <div v-if="!isView" class="color-picker-container">
            <div style="display: flex; align-items: center; justify-content: space-between">
              <div style="display: flex; align-items: center;">
                <span class="text-color">Color personalizado:</span>
                <input
                    type="color"
                    v-model="newColor"
                    :disabled="product.colores?.length >= 3"
                    class="color-input"
                    placeholder="Selecciona un color"
                />
              </div>
              <button @click="addColor" :disabled="product.colores?.length >= 3" class="btn-outline">Agregar</button>
            </div>

            <ColorList
                v-model:data="product.colores"
                @update:data="handleColorSelect"
            />

            <div class="color-chips">
              <div
                  v-for="(color, index) in product.colores"
                  :key="index"
                  class="color-chip"
                  :style="{ backgroundColor: color }"
              >


                <button @click="removeColor(index)">✕</button>
              </div>
            </div>
          </div>
          <div v-else>
            <span v-if="product.colores.length === 0">No se agregaron colores</span>
            <div v-else class="color-chips">
              <div
                  v-for="(color, index) in product.colores"
                  :key="index"
                  class="color-chip"
                  :style="{ backgroundColor: color }"
              >
              </div>
            </div>
          </div>
        </div>
        <div v-if="isView" class="line"></div>
        <div class="detail_product">
          <span class="title_detail_product"> Tipo: </span>
          <select
              v-if="!isView"
              v-model="product.tipo_id"
              class="input input_detail">
            <option disabled value="">Seleccione un tipo</option>
            <option v-for="tipo in types" :key="tipo.id" :value="tipo.id">
              {{ tipo.nombre }}
            </option>
          </select>
          <span v-else>{{ resolveType() }}</span>
        </div>
      </div>
      <div v-if="isView" class="line line-end"></div>
      <div class="const-detail-fist">
        <div class="description">
          <span class="title_detail_product"> Descripción: </span>
        </div>
        <textarea v-if="!isView" v-model="product.descripcion" class="input input_detail detail" placeholder="Descripción"></textarea>
        <div v-else class="detail">
          {{ product?.descripcion || 'No hay descripción disponible.' }}
        </div>
      </div>


    </div>
    <div v-if="!isView" style="margin: 0 auto 30px auto">
      <button @click="registrarProducto">
        {{ isEdit ? 'Guardar cambios' : 'Registrar producto' }}
      </button>
    </div>
    <LoadingPage v-model:visible="loading" />
  </div>
</template>

<style scoped>
.form-container {
  max-width: 1050px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

input,
textarea,
select,
button {
  padding: 0.5rem;
  font-size: 1rem;
}

.cont-images{
  display: flex;
  align-items: start;
  justify-content: start;
}

.card-image {
  position: relative;
  display: flex;
  max-width: 405px;
  min-width: 405px;
  height: 280px;
  margin: 0 5px;
  border: 2px solid rgba(44, 42, 42, 0.6);
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
}

.card-image img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.cont-mini-images {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  width: 90%;
}

.mini-images{
  position: relative;
  width: 172px;
  height: 150px;
  overflow: hidden;
}

.mini-images img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-images button {
  width: 35px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 5px ;
  cursor: pointer;
  padding: 0 !important;
  background: var(--color-error-background) !important;
  border: var(--color-error) 3px solid;
  margin: 3px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  font-weight: 500 !important;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  padding: 10px 2px !important;
  cursor: pointer;
  z-index: 2;
  border-radius: 4px;
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 10px;
}

/*DETALLE*/

.card-title {
  position: absolute;
  top: -16px;
  left: 30%;
  background-color: black;
  color: white;
  border: 1px solid rgba(44, 42, 42, 0.6);
  padding: 5px 10px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 7px;
  width: 130px;
  z-index: 1;
  text-align: center;
}

.cont-detail {
  display: flex;
  width: 1050px;
}

.const-detail-fist{
  width: 50%;
}

.detail_product {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-left: 10px;
}

.input_detail {
  margin: 10px;
}

.description{
  margin: 0 10px !important;
}

.title_detail_product{
  min-width: 65px;
  font-weight: 600;
}

.detail{
  margin: 10px;
  width: 87%;
  height: 197px;
  resize: none;
}

.line-end{
  display: none;
}

.color-picker-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 10px;
}

.text-color{
  font-size: 14px;
  margin-right: 5px
}

.color-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-chip {
  width: 60px;
  height: 25px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
  color: #fff;
  border: 1px solid rgba(21, 20, 20, 0.7) !important;
  font-size: 0.8rem;
  font-weight: bold;
  position: relative;
  margin: 5px 0;
}

.color-chip button {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.color-input {
  width: 45px;
  height: 45px;
  padding: 0;
  border: 2px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
}

.color-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1050px) {
  .form-container {
    width: 90%;
    max-width: 350px;
    margin-top: 5px;
  }
  .cont-images{
    flex-direction: column;
    align-items: center;
  }
  .cont-mini-images{
    width: 100%;
  }

  .card-image {
    max-width: 340px;
    min-width: 340px;
    height: 260px;
    margin: 0 5px;
  }

  .card-image img {
    width: 100%;
    display: block;
    object-fit: cover;
  }

  .cont-detail{
    width: 100%;
    flex-direction: column;
    margin: 0 auto;
  }
  .const-detail-fist{
    width: 100%;
  }
  .detail{
    width: 97.5%;
  }
  .cont-mini-image{
    width: 100%;
    margin: 30px auto;
  }
  .mini-images{
    width: 152px;
    height: 130px;
  }
  .line-end{
    display: block;
  }
  .text-color{
    width: 90px;
  }
}
</style>
