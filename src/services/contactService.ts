import apiClient from './api/apiClient';
import type { ContactoRequestDTO } from '../types/contact';
import axios from 'axios';

const CONTACTO_BASE_PATH = '/contacto';

export const contactService = {
    
    // POST: Enviar mensaje
    enviarMensaje: async (data: ContactoRequestDTO): Promise<string> => {
        try {
            // Tu backend devuelve un String plano (ej: "Mensaje de contacto registrado correctamente.")
            const response = await apiClient.post<string>(`${CONTACTO_BASE_PATH}/enviar`, data);
            return response.data;
        } catch (error) {
            // Manejo especial porque el error también viene como String plano en el body
            if (axios.isAxiosError(error) && error.response) {
                // error.response.data contiene el mensaje directo: "Error: Datos inválidos."
                throw new Error(error.response.data as string || 'Error al enviar el mensaje.');
            }
            throw new Error('Error de conexión. Intente más tarde.');
        }
    }
};