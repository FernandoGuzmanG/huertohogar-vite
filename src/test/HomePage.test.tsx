import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../pages/HomePage'; // Asegúrate de que esta ruta sea correcta hacia tu página
import { productService } from '../services/productService'; // Importamos el servicio real

// 1. Mockeamos los componentes visuales para aislar la prueba
vi.mock('../components/Header', () => ({
    default: () => <div data-testid="mock-header">Header</div>
}));
vi.mock('../components/Footer', () => ({
    default: () => <div data-testid="mock-footer">Footer</div>
}));
vi.mock('../components/HeroSection', () => ({
    default: () => <div data-testid="mock-hero">HeroSection</div>
}));

describe('HomePage Component', () => {

    // Datos de prueba
    const mockProducts = [
        { id: '1', nombre: 'Manzanas', precio: 1000, unidad: 'kg', stock: 10, descripcion: '', categoria: '1', categoriaNombre: 'Frutas', origen: 'Chile', imagen: 'url1' },
        { id: '2', nombre: 'Peras', precio: 1500, unidad: 'kg', stock: 10, descripcion: '', categoria: '1', categoriaNombre: 'Frutas', origen: 'Chile', imagen: 'url2' },
        { id: '3', nombre: 'Uvas', precio: 2000, unidad: 'kg', stock: 10, descripcion: '', categoria: '1', categoriaNombre: 'Frutas', origen: 'Chile', imagen: 'url3' },
        { id: '4', nombre: 'Naranjas', precio: 1200, unidad: 'kg', stock: 10, descripcion: '', categoria: '1', categoriaNombre: 'Frutas', origen: 'Chile', imagen: 'url4' },
        { id: '5', nombre: 'Sandía', precio: 3000, unidad: 'un', stock: 10, descripcion: '', categoria: '1', categoriaNombre: 'Frutas', origen: 'Chile', imagen: 'url5' }
    ];

    // Limpiamos los espías antes de cada test para que no se mezclen los resultados
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('debe renderizar los componentes principales (Header, Hero, Footer)', () => {
        // Usamos spyOn: "Espía el método obtenerTodos del objeto productService y haz que devuelva []"
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue([]); 

        render(<HomePage />);

        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-hero')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });

    it('debe renderizar la sección de Pilares', () => {
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue([]);

        render(<HomePage />);

        expect(screen.getByText('Nuestros Pilares')).toBeInTheDocument();
        expect(screen.getByText('Orgánico Certificado')).toBeInTheDocument();
    });

    it('debe cargar y mostrar los primeros 4 productos destacados', async () => {
        // Configuramos el espía para devolver nuestros productos falsos
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue(mockProducts);

        render(<HomePage />);

        expect(screen.getByText('Favoritos de la Temporada')).toBeInTheDocument();

        // Esperamos a que el useEffect haga su trabajo
        await waitFor(() => {
            expect(screen.getByText('Manzanas')).toBeInTheDocument();
            expect(screen.getByText('Peras')).toBeInTheDocument();
            expect(screen.getByText('Uvas')).toBeInTheDocument();
            expect(screen.getByText('Naranjas')).toBeInTheDocument();
        });

        // Verificamos que el 5to producto NO aparezca (slice 0,4)
        expect(screen.queryByText('Sandía')).not.toBeInTheDocument();
    });

    it('debe mostrar mensaje de carga si no hay productos', async () => {
        // Simulamos una promesa que se queda pendiente o devuelve vacío
        vi.spyOn(productService, 'obtenerTodos').mockResolvedValue([]);

        render(<HomePage />);

        // Al inicio debe mostrar cargando
        await waitFor(() => {
             expect(screen.getByText('Cargando productos destacados...')).toBeInTheDocument();
        });
    });
});