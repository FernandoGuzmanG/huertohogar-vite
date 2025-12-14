import apiClient from './api/apiClient'; // Asegúrate que esta instancia tenga el interceptor del Token
import type { PedidoResponse } from '../types/order';

export const orderService = {
    
    // POST: /api/pedidos?direccion=XD
    crearPedido: async (direccionEnvio: string): Promise<PedidoResponse> => {
        // Codificamos la dirección para evitar errores con espacios o tildes en la URL
        const direccionCodificada = encodeURIComponent(direccionEnvio);
        const response = await apiClient.post<PedidoResponse>(`/pedidos?direccion=${direccionCodificada}`);
        return response.data;
    },

    // GET: /api/pedidos (El backend filtra por el usuario del token)
    obtenerPedidos: async (): Promise<PedidoResponse[]> => {
        const response = await apiClient.get<PedidoResponse[]>('/pedidos');
        return response.data;
    }
};