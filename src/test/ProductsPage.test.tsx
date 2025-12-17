import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ProductsPage from '../pages/ProductsPage';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

// 1. Mocks de Componentes Hijos Visuales
vi.mock('../components/Header', () => ({ default: () => <div data-testid="mock-header">Header</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="mock-footer">Footer</div> }));
vi.mock('../components/LoginToast', () => ({ default: () => <div data-testid="mock-login-toast">LoginToast</div> }));

// 2. Mocks de Hooks (SOLUCIÓN: AUTO-MOCK)
// Al no pasar el segundo argumento, Vitest convierte automáticamente
// todas las exportaciones ('useAuth', 'useCart') en vi.fn()
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useCart');

// 3. Spies de Servicios (Mejor que mockear el módulo entero)
// Esto evita problemas de rutas y mantiene el objeto original
vi.spyOn(productService, 'obtenerTodos');
vi.spyOn(productService, 'buscarProductos');
vi.spyOn(cartService, 'agregarItem');

describe('ProductsPage Component', () => {

    const mockProducts = [
        { 
            id: '1', 
            nombre: 'Manzana Fuji', 
            precio: 1000, 
            unidad: 'kg', 
            stock: 10, 
            descripcion: 'Dulce', 
            categoriaNombre: 'Frutas', 
            categoria: '1',
            origen: 'Chile', 
            imagen: 'url1' 
        },
        { 
            id: '2', 
            nombre: 'Lechuga', 
            precio: 800, 
            unidad: 'un', 
            stock: 5, 
            descripcion: 'Fresca', 
            categoriaNombre: 'Verduras', 
            categoria: '2',
            origen: 'Chile', 
            imagen: 'url2' 
        }
    ];

    const mockRefreshCart = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks(); // Limpia llamadas anteriores

        // CONFIGURACIÓN POR DEFECTO
        // Como usamos Auto-Mock, 'useAuth' ya es un vi.fn() y tiene .mockReturnValue
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false });
        (useCart as Mock).mockReturnValue({ refreshCart: mockRefreshCart });
    });

    it('debe cargar y mostrar los productos al inicio', async () => {
        // Configuramos el espía del servicio
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue(mockProducts);

        render(<ProductsPage />);

        expect(screen.getByText('Buscando...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Manzana Fuji')).toBeInTheDocument();
            expect(screen.getByText('Lechuga')).toBeInTheDocument();
        });
    });

    it('debe filtrar productos al escribir en el buscador', async () => {
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue(mockProducts);
        // Simulamos el filtrado
        vi.spyOn(productService, 'buscarProductos').mockResolvedValue([mockProducts[0]]);

        render(<ProductsPage />);

        await waitFor(() => expect(screen.getByText('Manzana Fuji')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText('Buscar productos...');
        fireEvent.change(searchInput, { target: { value: 'Manzana' } });

        await waitFor(() => {
            // Verificamos que se llamó al servicio de búsqueda
            expect(productService.buscarProductos).toHaveBeenCalledWith('Manzana', undefined);
        });
    });

    it('debe mostrar alerta de login si usuario NO autenticado intenta agregar al carrito', async () => {
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue(mockProducts);
        // Usuario NO autenticado (Default del beforeEach)
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false });

        render(<ProductsPage />);
        await waitFor(() => expect(screen.getByText('Manzana Fuji')).toBeInTheDocument());

        const addButtons = screen.getAllByText(/Agregar/i);
        fireEvent.click(addButtons[0]);

        // Debe mostrar el toast de login
        expect(screen.getByTestId('mock-login-toast')).toBeInTheDocument();
        // NO debe llamar al servicio de carrito
        expect(cartService.agregarItem).not.toHaveBeenCalled();
    });

    it('debe agregar producto al carrito si usuario ESTÁ autenticado', async () => {
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue(mockProducts);
        vi.spyOn(cartService, 'agregarItem').mockResolvedValue('Item agregado correctamente'); 
        
        // Simulamos usuario AUTENTICADO
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });

        render(<ProductsPage />);
        await waitFor(() => expect(screen.getByText('Manzana Fuji')).toBeInTheDocument());

        const addButtons = screen.getAllByText(/Agregar/i);
        fireEvent.click(addButtons[0]);

        // Debe llamar al servicio
        expect(cartService.agregarItem).toHaveBeenCalledWith('1', 1);
        
        // Debe refrescar el carrito global
        await waitFor(() => {
            expect(mockRefreshCart).toHaveBeenCalled();
        });

        // Debe mostrar mensaje de éxito
        expect(screen.getByText('¡Producto agregado al carrito!')).toBeInTheDocument();
    });

    it('debe mostrar mensaje si no se encuentran productos', async () => {
        // Simulamos respuesta vacía
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue([]);

        render(<ProductsPage />);

        await waitFor(() => {
            expect(screen.getByText('No encontramos productos con esos criterios :(')).toBeInTheDocument();
        });
    });
});