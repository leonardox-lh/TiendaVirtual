import { createRouter, createWebHistory } from 'vue-router'
import UploadImage from './components/product/detail/uploadProduct.vue'
import ListarProductos from './components/product/list/listProduct.vue'
import DetailProduct from "./components/product/detail/detailProduct.vue";
import User from './components/user/user.vue'
import Access from "./components/login/access.vue"
import { useAuthStore } from './stores/authStore'
import { pinia } from './main.js'
import CarShop from "./components/shop/carShop.vue"; //

const routes = [
    { path: '/list', component: ListarProductos },
    { path: '/login', component: Access },
    { path: '/car-shop', component: CarShop},
    {
        path: '/add',
        component: DetailProduct,
        meta: { requiresAuth: true }
    },
    {
        path: '/product/:id',
        component: DetailProduct,
    },
    {
        path: '/edit/:id',
        component: DetailProduct,
        meta: { requiresAuth: true }
    },
    {
        path: '/user',
        component: User,
        meta: { requiresAuth: true }
    },
    { path: '/', redirect: '/list' }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})

// ✅ Ahora usar el store desde el contexto de pinia
router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore(pinia)

    if (!auth.user) {
        await auth.fetchUser()
    }

    if (to.meta.requiresAuth && !auth.user) {
        return next('/login')
    }

    next()
})
