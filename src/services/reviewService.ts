import apiClient from './api/apiClient';
import type { Resena, ResenaEstadisticasDTO, ResenaRequestDTO } from '../types/review';
import axios from 'axios';

const RESENAS_BASE_PATH = '/resenas';

interface ApiErrorResponse {
    status: number;
    message: string;
    error: string;
}

export const reviewService = {

    obtenerResenas: async (sku: string): Promise<Resena[]> => {
        try {
            const response = await apiClient.get<Resena[]>(`${RESENAS_BASE_PATH}/${sku}`);
            return response.data || [];
        } catch (error) {
            console.error("Error al obtener reseñas", error);
            return [];
        }
    },

    obtenerEstadisticas: async (sku: string): Promise<ResenaEstadisticasDTO> => {
        try {
            const response = await apiClient.get<ResenaEstadisticasDTO>(`${RESENAS_BASE_PATH}/${sku}/estadisticas`);
            return response.data;
        } catch (error) {
            console.error("No se encontraron estadísticas (posiblemente 0 reseñas):", error);
            
            return { skuProducto: sku, promedioCalificacion: 0, totalResenas: 0 };
        }
    },

    registrarResena: async (data: ResenaRequestDTO): Promise<Resena> => {
        try {
            const response = await apiClient.post<Resena>(`${RESENAS_BASE_PATH}/registrar`, data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'Error al registrar la reseña.');
            }
            throw new Error('Error de conexión al registrar reseña.');
        }
    }
};