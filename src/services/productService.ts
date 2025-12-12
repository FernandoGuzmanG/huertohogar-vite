import apiClient from './api/apiClient';
import type { Producto } from '../types/product';

const PRODUCTOS_BASE_PATH = '/productos';

export const productService = {
    // Obtener todo el catálogo
    obtenerTodos: async (): Promise<Producto[]> => {
        try {
            const response = await apiClient.get<Producto[]>(PRODUCTOS_BASE_PATH);
            return response.data || [];
        } catch (error) {
            console.error("Error al obtener productos", error);
            return [];
        }
    },

    // Buscar por nombre o categoría (Endpoint /filtrar)
    buscarProductos: async (nombre?: string, idCategoria?: number): Promise<Producto[]> => {
        try {
            const response = await apiClient.get<Producto[]>(`${PRODUCTOS_BASE_PATH}/filtrar`, {
                params: {
                    nombre,
                    idCategoria
                }
            });
            return response.data || [];
        } catch (error) {
            console.error("Error al filtrar productos", error);
            return [];
        }
    },

    // Obtener detalle por ID/SKU
    obtenerPorSku: async (sku: string): Promise<Producto> => {
        try {
            const response = await apiClient.get<Producto>(`${PRODUCTOS_BASE_PATH}/${sku}`);
            return response.data;
        } catch (error) {
            // CORRECCIÓN: Ahora usamos la variable 'error' imprimiéndola en consola
            console.error(`Error al obtener producto ${sku}:`, error);
            throw new Error('Producto no encontrado');
        }
    }
};