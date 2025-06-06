<script setup>
import {ref, watch} from "vue";
import {useCartStore} from "../../../stores/cartStore.js";
import {validateStock} from "../../../validators/validatorInput.js";
import {useToastStore} from "../../../stores/toast.js";

const props = defineProps({
  product: Object,
  visible: Boolean
})

const emit = defineEmits(['close'])

const handlePrecioInput = (e) => {
  const result = validateStock(e.target.value)
  if (result !== null) {
    quantity.value = result
  } else {
    e.target.value = quantity.value ?? ''
  }
}

const toast = useToastStore()
const quantity = ref(1)
const detail = ref(null)
const cart = useCartStore()

watch(() => props.visible, (val) => {
  if (val) quantity.value = 1
})

const addToCart = () => {
  if (quantity.value === "") {
    toast.error('Debe ingresar cantidad')

    return
  } else if (quantity.value <= 0) {
    toast.error('La cantidad debe ser mayor a 0')

    return
  }
  cart.addItem( props.product, quantity.value )

  toast.success('Producto agregado al carrito')
  emit('close')
}

</script>

<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal">
      <h2 style="margin: 10px 0">Agregar producto</h2>

      <span class="title_detail_product"> Título: </span>
      <span>{{ product.nombre }}</span>
      <div class="line"></div>
      <span class="title_detail_product"> Precio: </span>
      <span>S/. {{ product.precio.toFixed(2) }}</span>
      <div class="line"></div>
      <span class="title_detail_product"> Cantidad: </span>
      <input
        v-model="quantity"
        @input="handlePrecioInput"
        inputmode="numeric"
        class="input input_detail"
        maxlength="7"
      />
      <div class="line"></div>
      <span class="title_detail_product"> Detalle (Opcional) </span>
      <textarea
        v-model="detail"
        placeholder="Detalles adicionales para el pedido"
        class="input detail"
        />

      <div class="actions">
        <button class="btn-outline" @click="addToCart">Agregar</button>
        <button class="btn-outline btn-error" @click="$emit('close')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: var(--color-backgronund);
  padding: 1.5rem;
  border-radius: 10px;
  width: 400px;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.title_detail_product {
  min-width: 65px;
  font-weight: 600;
}

.detail{
  margin-top: 5px;
  height: 150px;
  resize: none;
}

@media (max-width: 1050px) {
  .modal {
    width: 80%;
  }
}
</style>