<script setup>

import {useRoute} from "vue-router"
import {onMounted, ref, watch} from "vue";
import UploadProduct from "./uploadProduct.vue";
import {supabase} from "../../../supabase.js";
import LoadingPage from "../../loadingPage.vue";

const route = useRoute()
const isEdit = ref(false)
const isView = ref(false)
const isAdd = ref(false)
const loading = ref(false)
const data = ref({
  items: null,
  imageUrls: [],
    }
)

const getData = async () => {
  try {
    loading.value = true
    const { data: producto, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', route.params.id)
        .single()

    if (error) {
      console.error('Error al obtener el producto:', error.message)
      return
    }

    const { data: imagenes, errorImages } = await supabase
        .from('imagenes_producto')
        .select('url_imagen')
        .eq('producto_id', route.params.id)

    if (errorImages) {
      console.error('Error al obtener imágenes:', error.message)

      return
    }

    data.value = {
      items: producto,
      imageUrls: imagenes.map(img => img.url_imagen)
    }

  } catch (error) {
    console.error("Error fetching product data:", error);
  } finally {
    loading.value = false
  }
}

watch(() => route.path, () => {
  const pathSegments = route.path.split('/')
  const section = pathSegments[1]
  isEdit.value = section === 'edit';
  isView.value = section === 'product';
  isAdd.value = section === 'add';

  if (section !== "add"){
    getData()
  } else {

    data.value = {
      items: null,
      imageUrls: []
    }
    console.log("Adding new product, resetting data.")
  }
}, { immediate: true })

</script>

<template>
  <UploadProduct
    :isEdit="isEdit"
    :isView="isView"
    :isAdd="isAdd"
    :product="data"
    @update:Product="getData"
  />
  <LoadingPage v-model:visible="loading" />
</template>

<style scoped>

</style>