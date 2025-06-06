import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: JSON.parse(localStorage.getItem('cart_items') || '[]')
    }),

    actions: {
        addItem(product, quantity ) {
            const existing = this.items.find(i => i.id === product.id)
            if (existing) {
                existing.quantity += quantity
            } else {
                this.items.push({ ...product, quantity: quantity })
            }
            this.saveToStorage()
        },

        removeItem(productId) {
            this.items = this.items.filter(i => i.id !== productId)
            this.saveToStorage()
        },

        clearCart() {
            this.items = []
            this.saveToStorage()
        },

        saveToStorage() {
            localStorage.setItem('cart_items', JSON.stringify(this.items))
        },

        addQuantity(productId) {
            const item = this.items.find(i => i.id === productId)
            if (item) {
                item.quantity += 1
                this.saveToStorage()
            }
        },

        removeQuantity(productId) {
            const item = this.items.find(i => i.id === productId)
            if (item && item.quantity > 1) {
                item.quantity -= 1
                this.saveToStorage()
            }
        }
    },

    getters: {
        totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
        totalPrice: (state) => state.items.reduce((acc, item) => acc + item.precio * item.quantity, 0)
    }
})
