import apiClient from './api/apiClient';
import type { UsuarioProfileDTO, UpdateProfileRequestDTO, ChangePasswordRequestDTO } from '../types/user';
import axios from 'axios';

// Definimos la interfaz del error aquí o la importamos si la tienes en types/auth
interface ApiErrorResponse {
    status: number;
    message: string;
    error: string;
}

const USUARIOS_BASE_PATH = '/usuarios';

export const userService = {

    obtenerPerfil: async (): Promise<UsuarioProfileDTO> => {
        try {
            const response = await apiClient.get<UsuarioProfileDTO>(`${USUARIOS_BASE_PATH}/perfil`);
            return response.data;
        } catch (error) {
            // Si el backend devuelve un ErrorResponseDTO, intentamos leerlo
            if (axios.isAxiosError(error) && error.response?.data) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'No se pudo cargar el perfil.');
            }
            throw new Error('Error de conexión al cargar el perfil.');
        }
    },

    actualizarPerfil: async (data: UpdateProfileRequestDTO): Promise<UsuarioProfileDTO> => {
        try {
            const response = await apiClient.put<UsuarioProfileDTO>(`${USUARIOS_BASE_PATH}/perfil`, data);
            return response.data;
        } catch (error) {
             if (axios.isAxiosError(error) && error.response?.data) {
                const apiError = error.response.data as ApiErrorResponse;
                // Esto devolverá el mensaje exacto del backend (ej: "Nombre inválido")
                throw new Error(apiError.message || 'Error al actualizar el perfil.');
            }
            throw new Error('Error de conexión al actualizar.');
        }
    },

    cambiarClave: async (data: ChangePasswordRequestDTO): Promise<string> => {
        try {
            const response = await apiClient.patch(`${USUARIOS_BASE_PATH}/cambiar-clave`, data);
            // Ahora esperamos un objeto JSON { "message": "..." } o string, nos aseguramos:
            if (typeof response.data === 'object' && response.data.message) {
                return response.data.message;
            }
            return "Contraseña actualizada exitosamente.";
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data) {
                const apiError = error.response.data as ApiErrorResponse;
                // AQUÍ ES LA CLAVE: Esto devolverá "Clave actual incorrecta" si el backend lo mandó
                throw new Error(apiError.message || 'Error al cambiar la contraseña');
            }
            throw new Error('Error de conexión al cambiar clave.');
        }
    }
};