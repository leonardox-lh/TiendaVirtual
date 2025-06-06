import { supabase } from '../supabase.js'

export const typeService = {
    async fetchTypes() {
        const { data, error } = await supabase
            .from('tipos')
            .select('*')
            .order('nombre', { ascending: true })

        if (error) {
            console.error('Error al cargar tipos:', error)
            throw error
        }

        return data
    },

    async createType(type) {
        const { data, error } = await supabase
            .from('tipos')
            .insert([type])
            .single()

        if (error) {
            console.error('Error al crear tipo:', error)
            throw error
        }

        return data
    },

    async updateType(id, type) {
        const { data, error } = await supabase
            .from('tipos')
            .update(type)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error al actualizar tipo:', error)
            throw error
        }

        return data
    },

    async deleteType(id) {
        const { error } = await supabase
            .from('tipos')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error al eliminar tipo:', error)
            throw error
        }
    }
}