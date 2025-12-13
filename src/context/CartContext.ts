import { createContext } from 'react';

// Definición de tipos
export interface CartContextType {
    count: number;
    refreshCart: () => Promise<void>;
}

// Creamos y exportamos el Contexto
export const CartContext = createContext<CartContextType | undefined>(undefined);