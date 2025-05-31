<script setup>
import {ref, watch} from "vue";

const item = ref(
  {
    id: 0,
    nombre: "",
    tipos: {},
    precio: 0,
    stock: 0,
    imagenes_producto: [],
  }
)
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

watch(() => props.data, () => {
  item.value = props.data
  }, { immediate: true })

</script>

<template>
  <div class="product-card">

    <div class="card-image">
      <div class="card-title"> {{ item.tipos.nombre }}</div>
      <img
          :src="item.imagenes_producto[0]?.url_imagen ? item.imagenes_producto[0].url_imagen : '/assets/articleDefault.png'"
          alt="Producto"
      />
    </div>
    <div class="card-info">
      <div class="info-row-title">
        {{ item.nombre }}
      </div>
      <div class="line"></div>
      <div class="info-row">
        <div class="label"><Icon icon="mdi:cash" />Precio</div>
        <div class="value">{{ "S/" + Number(item.precio).toFixed(2) }} </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.product-card {
  width: 220px;
  padding-top: 30px;
  border-radius: 12px;
  background: var(--color-backgronund);
  overflow: hidden;
}

.card-image {
  position: relative;
  display: flex;
  width: 95%;
  height: 140px;
  margin: 0 auto;
  border: 2px solid rgba(44, 42, 42, 0.6);
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
}

.card-image img {
  width: 100%;
  display: block;
  object-fit: cover;
}

.card-title {
  position: absolute;
  top: -15px;
  left: 13%;
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

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-info {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  padding: 10px 12px;
}

.info-row-title {
  width: 200px;
  font-weight: 600;
  font-size: 18px;
  text-align: start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-overflow-ellipsis: ellipsis;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.label {
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: var(--color-text);
}

.value {
  color: #666;
  width: 100px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .product-card {
    width: 150px;
  }

  .card-title {
    padding: 3px 6px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 5px;
    width: 88px;
  }

  .info-row-title {
    width: 150px;
    font-weight: 500;
    font-size: 15px;
  }

  .label {
    font-weight: 500;
    font-size: 14px;
  }

  .value {
    width: 80px;
    font-size: 13px;
  }
  .card-image {
    height: 110px;
    margin: 0;
  }
  .card-info {
    padding: 10px 0;
  }
}

</style>