import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null
    }),
    actions: {
        async login(email, password) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (!error) this.user = data.user
            return error
        },
        async logout() {
            await supabase.auth.signOut()
            this.user = null
        },
        async fetchUser() {
            const { data, error } = await supabase.auth.getUser()
            this.user = data.user
        }
    }
})
