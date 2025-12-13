import React, { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
// IMPORTAMOS EL CONTEXTO DEL OTRO ARCHIVO
import { CartContext } from './CartContext'; 

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [count, setCount] = useState(0);
    const { isAuthenticated } = useAuth();

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCount(0);
            return;
        }
        try {
            const numero = await cartService.obtenerContador();
            setCount(prev => (prev !== numero ? numero : prev));
        } catch (error) {
            console.error("Error al actualizar carrito:", error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        let isMounted = true;
        
        const syncData = async () => {
            if (isAuthenticated) {
                try {
                    const numero = await cartService.obtenerContador();
                    if (isMounted) setCount(numero);
                } catch (error) {
                    console.error(error);
                }
            } else {
                if (isMounted) setCount(0);
            }
        };

        syncData();

        return () => { isMounted = false; };
    }, [isAuthenticated]);

    return (
        <CartContext.Provider value={{ count, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};