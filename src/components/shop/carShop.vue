<!-- components/Cart.vue -->
<script setup>
import { useCartStore } from '../../stores/cartStore.js'
const cart = useCartStore()

const telefonoDestino = '51966010314' // Reemplazar con tu número real con código país

const cotizarPorWhatsapp = () => {
  if (cart.items.length === 0) return
  const baseURL = 'https://catalogo-virtual-three.vercel.app/product/'
  let mensaje = '¡Hola! Quiero cotizar los siguientes productos:%0A%0A'

  cart.items.forEach((item, i) => {
    const link = `${baseURL}${item.id}`
    mensaje += `*${item.nombre}*%0ACantidad: ${item.quantity}%0APrecio: S/. ${item.precio.toFixed(2)}%0ASubtotal: S/. ${(item.precio * item.quantity).toFixed(2)}%0AVer: ${link}%0A%0A`
  })

  mensaje += `🧾 *Total: S/. ${cart.totalPrice.toFixed(2)}*%0A`

  const url = `https://wa.me/${telefonoDestino}?text=${mensaje}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="cart">
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px">
      <h2 style="margin: 0; display: flex; align-items: center">Carrito de Compras</h2>
      <button v-if="cart.items.length > 0" class="btn-outline" @click="cotizarPorWhatsapp">Cotizar por WhatsApp</button>
    </div>
    <div v-if="cart.items.length === 0">Tu carrito está vacío</div>

    <div class="cont-delivery">
      <div v-for="(item, index) in cart.items" :key="item.id">
        <div class="cart-item">
          <div class="image-default" style="margin-right: 15px">
            <img :src="item.image" alt="Imagen del producto"/>
          </div>
          <div style="width: 250px">
            <h4 style="margin: 0">{{ item.nombre }}</h4>
            <div style="display: flex; align-items: center; margin-top: 5px">
              <div class="title_detail">
                Cantidad:
              </div>
              <button class="btn-outline mini-button" @click="cart.removeQuantity(item.id)" :disabled="item.quantity <= 1">
                <Icon icon="mdi:minus" />
              </button>
              <div style="min-width: 25px; text-align: center">{{  item.quantity }}</div>
              <button class="btn-outline mini-button" @click="cart.addQuantity(item.id)">
                <Icon icon="mdi:add" />
              </button>
            </div>
            <div style="display: flex; align-items: center">
              <div class="title_detail">
                Precio:
              </div>
              S/. {{ item.precio.toFixed(2) }} <br />
            </div>
            <div style="display: flex; align-items: center">
              <div class="title_detail">
                Subtotal:
              </div>
              S/. {{ (item.precio * item.quantity).toFixed(2) }}
            </div>
          </div>
          <div style="display: flex; align-items: center">
            <button class="btn-outline" @click="cart.removeItem(item.id)">
              <Icon icon="mdi:delete" />
            </button>
          </div>
        </div>
        <div class="line"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: end">
      <strong style="width: 50px;">{{ "Total: " }} </strong>
      <div style="min-width: 80px; text-align: end">
        S/. {{ cart.totalPrice.toFixed(2) }}
      </div>
    </div>
  </div>
  <div v-if="cart.items.length > 0" style="margin-top: 1rem; display: flex; justify-content: center;">

  </div>
</template>

<style scoped>
.cart {
  padding: 1rem;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}
.cart-item {
  display: flex;
  margin-bottom: 0.5rem;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
.mini-button {
  height: 25px !important;
  padding: 2px !important;
}
.btn-outline {
  height: 35px;
}
.title_detail{
  min-width: 75px;
  font-weight: 600;
  margin-right: 5px;
  padding: 3px 0;
}

.cont-delivery{
  max-height: 440px;
  overflow-y: auto;
}

@media (max-width: 1050px) {
  h2 {
    font-size: 1rem;
  }
}
</style>
