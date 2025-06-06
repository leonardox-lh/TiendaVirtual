import { supabase } from '../supabase.js'

export const productService = {
    async fetchProducts({ tipoId = null } = {}) {
        let query = supabase
            .from('productos')
            .select('*, tipos(nombre), imagenes_producto!fk_producto(id, url_imagen)')
            .order('created_at', { ascending: false })

        if (tipoId) {
            query = query.eq('tipo_id', tipoId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error al cargar productos:', error)
            throw error
        }

        return data
    },


    async deleteProductoById(id) {
        try {
            const { error: imgError } = await supabase
                .from('imagenes_producto')
                .delete()
                .eq('producto_id', id)

            if (imgError) {
                throw new Error('Error al eliminar imágenes: ' + imgError.message)
            }

            const { error: prodError } = await supabase
                .from('productos')
                .delete()
                .eq('id', id)

            if (prodError) {
                throw new Error('Error al eliminar producto: ' + prodError.message)
            }

            return true
        } catch (err) {
            throw err
        }
    },

    async createProducto(producto) {
        const { data, error } = await supabase
            .from('productos')
            .insert([{
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                colores: producto.colores.length > 0 ? producto.colores : [],
                tipo_id: producto.tipo_id,
            }])
            .select()
            .single()

        if (error) {
            throw new Error('Error al registrar el producto: ' + error.message)
        }

        return data.id
    },

    async updateProducto(id, producto) {
        const { error } = await supabase
            .from('productos')
            .update({
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                colores: producto.colores,
                tipo_id: producto.tipo_id,
            })
            .eq('id', id)

        if (error) {
            throw new Error('Error al actualizar el producto: ' + error.message)
        }

        return true
    },
}