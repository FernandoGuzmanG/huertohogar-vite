import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ProductDetailPage from '../pages/ProductDetailPage';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

// 1. Mocks de Componentes Hijos
vi.mock('../components/Header', () => ({ default: () => <div data-testid="mock-header">Header</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="mock-footer">Footer</div> }));
vi.mock('../components/LoginToast', () => ({ default: () => <div data-testid="mock-login-toast">LoginToast</div> }));

// 2. Mocks de Hooks y Router
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useCart');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useParams: () => ({ sku: 'PROD-123' }), // Simulamos que estamos en /producto/PROD-123
    useNavigate: () => vi.fn()
}));

// 3. Spies de Servicios
vi.spyOn(productService, 'obtenerPorSku');
vi.spyOn(reviewService, 'obtenerResenas');
vi.spyOn(reviewService, 'obtenerEstadisticas');
vi.spyOn(reviewService, 'registrarResena');
vi.spyOn(cartService, 'agregarItem');

describe('ProductDetailPage Component', () => {

    const mockProduct = {
        id: 'PROD-123',
        nombre: 'Palta Hass',
        precio: 4500,
        unidad: 'kg',
        stock: 20,
        descripcion: 'Cremosa',
        categoria: 'Frutas',
        categoriaNombre: 'Frutas',
        origen: 'Quillota',
        imagen: 'url_palta'
    };

    const mockStats = { skuProducto: 'PROD-123', promedioCalificacion: 4.5, totalResenas: 10 };
    const mockReviews = [
        { id: 1, skuProducto: "FR001", idUsuario: 1, nombreUsuario: 'Juan', calificacion: 5, comentario: 'Excelente', fechaCreacion: '2023-01-01' }
    ];

    const mockRefreshCart = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Configuración por defecto de hooks
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false });
        (useCart as Mock).mockReturnValue({ refreshCart: mockRefreshCart });

        // Configuración por defecto de servicios (Happy Path)
        vi.spyOn(productService, 'obtenerPorSku').mockResolvedValue(mockProduct);
        vi.spyOn(reviewService, 'obtenerResenas').mockResolvedValue(mockReviews);
        vi.spyOn(reviewService, 'obtenerEstadisticas').mockResolvedValue(mockStats);
    });

    it('debe cargar y mostrar los detalles del producto', async () => {
        render(<ProductDetailPage />);

        // Verificar loading inicial (el spinner)
        // Nota: Como es muy rápido, a veces no se alcanza a ver, pero waitFor asegura que llegue el producto
        await waitFor(() => {
            expect(screen.getByText('Palta Hass')).toBeInTheDocument();
            expect(screen.getByText('Cremosa')).toBeInTheDocument();
            // Precio formateado (aprox)
            expect(screen.getByText(/\$4.500/)).toBeInTheDocument();
        });

        // Verificar que se cargaron las estadísticas
        expect(screen.getByText('4.5')).toBeInTheDocument(); // Promedio
    });

    it('debe mostrar las reseñas cargadas', async () => {
        render(<ProductDetailPage />);

        await waitFor(() => expect(screen.getByText('Palta Hass')).toBeInTheDocument());

        expect(screen.getByText('Juan')).toBeInTheDocument();
        expect(screen.getByText('Excelente')).toBeInTheDocument();
    });

    it('debe pedir login al intentar agregar al carrito si no está autenticado', async () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false });
        render(<ProductDetailPage />);
        await waitFor(() => expect(screen.getByText('Palta Hass')).toBeInTheDocument());

        const addBtn = screen.getByText(/Agregar al Carrito/i);
        fireEvent.click(addBtn);

        expect(screen.getByTestId('mock-login-toast')).toBeInTheDocument();
        expect(cartService.agregarItem).not.toHaveBeenCalled();
    });

    it('debe agregar al carrito si está autenticado', async () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        vi.spyOn(cartService, 'agregarItem').mockResolvedValue('OK');

        render(<ProductDetailPage />);
        await waitFor(() => expect(screen.getByText('Palta Hass')).toBeInTheDocument());

        // Cambiar cantidad (opcional, para probar el input)
        const inputCantidad = screen.getByRole('spinbutton'); // Input type number
        fireEvent.change(inputCantidad, { target: { value: '2' } });

        const addBtn = screen.getByText(/Agregar al Carrito/i);
        fireEvent.click(addBtn);

        // Verificar llamada con cantidad correcta
        expect(cartService.agregarItem).toHaveBeenCalledWith('PROD-123', 2);
        
        await waitFor(() => {
            expect(mockRefreshCart).toHaveBeenCalled();
        });

        expect(screen.getByText(/¡Agregaste 2 unidad\(es\) al carrito!/i)).toBeInTheDocument();
    });

    it('debe permitir escribir una reseña si está logueado', async () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true });
        
        // --- CORRECCIÓN: Creamos un objeto completo que cumpla con la interfaz 'Resena' ---
        const mockResenaCreada = {
            id: 99,
            skuProducto: 'PROD-123',
            idUsuario: 1,
            nombreUsuario: 'Usuario Test',
            calificacion: 5,
            comentario: 'Muy rica palta',
            fechaCreacion: new Date().toISOString()
        };

        // Ahora el mock devuelve el objeto completo
        vi.spyOn(reviewService, 'registrarResena').mockResolvedValue(mockResenaCreada);

        render(<ProductDetailPage />);
        await waitFor(() => expect(screen.getByText('Palta Hass')).toBeInTheDocument());

        // 1. Abrir Modal
        const btnEscribir = screen.getByText('Escribir una reseña');
        fireEvent.click(btnEscribir);

        // 2. Llenar formulario
        const inputComentario = screen.getByPlaceholderText(/Cuéntanos qué te pareció/i);
        fireEvent.change(inputComentario, { target: { value: 'Muy rica palta' } });

        // 3. Enviar
        const btnPublicar = screen.getByText('Publicar Reseña');
        fireEvent.click(btnPublicar);

        // 4. Verificar envío
        await waitFor(() => {
            expect(reviewService.registrarResena).toHaveBeenCalledWith({
                skuProducto: 'PROD-123',
                calificacion: 5, // Default
                comentario: 'Muy rica palta'
            });
        });
    });
});