import apiClient from './api/apiClient';
// CORRECCIÓN 1: Usamos 'type' para importar solo interfaces
import type { LoginRequest, LoginResponse, RegisterRequest, ErrorResponse } from '../types/auth'; 
import axios from 'axios';

const USUARIOS_BASE_PATH = '/usuarios';

export const authService = {

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        `${USUARIOS_BASE_PATH}/login`, 
        data
      );
      
      const token = response.data.token;
      localStorage.setItem('jwtToken', token);
      
      return response.data;
      
    } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Error desconocido del servidor.');
    }
    throw new Error('Error de conexión con el servidor.');
    }
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        `${USUARIOS_BASE_PATH}/register`, 
        data
      );
      
      const token = response.data.token;
      localStorage.setItem('jwtToken', token);
      
      return response.data;
      
    } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.message || 'Error desconocido del servidor.');
    }
        throw new Error('Error de conexión con el servidor.');
    }
  },
  
  logout: () => {
    localStorage.removeItem('jwtToken');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwtToken');
  }
};