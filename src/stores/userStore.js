// src/stores/empresaStore.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useUserStore = defineStore('empresa', {
    state: () => ({
        empresa: null,
        tipos: [],
    }),
    actions: {
        async cargarEmpresa() {
            const { data, error } = await supabase
                .from('empresa')
                .select('*')
                .limit(1)
                .single()

            if (!error) this.empresa = data
        },

        async actualizarEmpresa(payload) {
            const { id } = this.empresa
            const { error } = await supabase
                .from('empresa')
                .update(payload)
                .eq('id', id)

            if (!error) this.empresa = { ...this.empresa, ...payload }
            return error
        },

        async cargarTipos() {
            const { data, error } = await supabase
                .from('tipos')
                .select('*')
                .order('nombre', { ascending: true })

            if (!error) this.tipos = data
        },

        async agregarTipo(nombre) {
            const { data, error } = await supabase
                .from('tipos')
                .insert([{ nombre }])
                .select()

            if (!error && data) {
                this.tipos.push(...data) // actualizar el store
            }

            return error
        },

        async eliminarTipo(id) {
            const { error } = await supabase
                .from('tipos')
                .delete()
                .eq('id', id)

            if (!error) {
                this.tipos = this.tipos.filter(tipo => tipo.id !== id)
            }

            return error
        },

        async actualizarTipo(id, nombre) {
            const { error } = await supabase
                .from('tipos')
                .update({ nombre })
                .eq('id', id)

            if (!error) {
                const tipoIndex = this.tipos.findIndex(tipo => tipo.id === id)
                if (tipoIndex !== -1) {
                    this.tipos[tipoIndex].nombre = nombre
                }
            }

            return error
        }
    }
})

