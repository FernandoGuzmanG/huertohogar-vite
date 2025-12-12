import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { UserPayload } from '../types/auth';
// Importamos el contexto desde el otro archivo
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  // Inicialización Perezosa
  const [user, setUser] = useState<UserPayload | null>(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('jwtToken');
          return null;
        }
        return decoded;
      } catch (error) {
        console.error("Token inválido al iniciar", error);
        localStorage.removeItem('jwtToken');
        return null;
      }
    }
    return null;
  });

  const [isLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setUser(null);
  }, []);

  const login = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logout();
        return;
      }
      localStorage.setItem('jwtToken', token);
      setUser(decoded);
    } catch (error) {
      console.error("Error al hacer login", error);
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};