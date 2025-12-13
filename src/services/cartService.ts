import apiClient from './api/apiClient';
import type { Carrito } from '../types/cart';
import axios from 'axios';

const CARRITO_BASE_PATH = '/carrito';

// Definimos la forma del error que devuelve tu Backend (GlobalExceptionHandler)
interface BackendErrorResponse {
    status: number;
    error: string;
    message: string;
    detalles?: Record<string, unknown>; // Para el mapa de detalles del stock
}

export const cartService = {
    
    // Obtener carrito completo
    obtenerCarrito: async (): Promise<Carrito | null> => {
        try {
            const response = await apiClient.get<Carrito>(CARRITO_BASE_PATH);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo carrito", error);
            return null;
        }
    },

    // Agregar Item (POST)
    agregarItem: async (sku: string, cantidad: number): Promise<string> => {
        try {
            const response = await apiClient.post<string>(CARRITO_BASE_PATH, null, {
                params: { sku, cantidad }
            });
            return response.data;
        } catch (error) {
            handleCartError(error);
            return ""; 
        }
    },

    // Modificar Cantidad (PUT)
    modificarCantidad: async (sku: string, cantidad: number): Promise<string> => {
        try {
            const response = await apiClient.put<string>(`${CARRITO_BASE_PATH}/${sku}`, null, {
                params: { cantidad }
            });
            return response.data;
        } catch (error) {
            handleCartError(error);
            return "";
        }
    },

    // Eliminar Item (DELETE)
    eliminarItem: async (sku: string): Promise<string> => {
        try {
            const response = await apiClient.delete<string>(`${CARRITO_BASE_PATH}/${sku}`);
            return response.data;
        } catch (error) {
            // CORRECCIÓN 1: Usamos 'error' en el console para que el linter no se queje
            console.error("Error eliminando ítem:", error);
            throw new Error("Error al eliminar el producto.");
        }
    },

    // Vaciar Carrito (DELETE)
    vaciarCarrito: async (): Promise<string> => {
        try {
            const response = await apiClient.delete<string>(CARRITO_BASE_PATH);
            return response.data;
        } catch (error) {
            // CORRECCIÓN 1: Usamos 'error' aquí también
            console.error("Error vaciando carrito:", error);
            throw new Error("Error al vaciar el carrito.");
        }
    },

    // Obtener contador
    obtenerContador: async (): Promise<number> => {
        try {
            const response = await apiClient.get<number>(`${CARRITO_BASE_PATH}/contador`);
            return response.data;
        } catch {
            return 0;
        }
    }
};

// CORRECCIÓN 2: Cambiamos 'any' por 'unknown' y tipamos la respuesta
const handleCartError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
        // Casteamos la data al tipo de error que definimos arriba
        const data = error.response.data as BackendErrorResponse;
        
        // Si es error de Stock (409)
        if (error.response.status === 409) {
            // Usamos el mensaje que viene del backend ("Stock insuficiente para SKU...")
            throw new Error(data.message || "Stock insuficiente.");
        }
        
        throw new Error(data.message || "Error al actualizar el carrito.");
    }
    throw new Error("Error de conexión con el carrito.");
};