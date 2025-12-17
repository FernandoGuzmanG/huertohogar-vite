import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrdersPage from '../pages/OrdersPage';
import { orderService } from '../services/orderService';
import type { PedidoResponse } from '../types/order'; 

// 1. Mocks de Componentes Hijos
vi.mock('../components/Header', () => ({ default: () => <div data-testid="mock-header">Header</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="mock-footer">Footer</div> }));

// 2. Mock de Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// 3. Spy del Servicio
vi.spyOn(orderService, 'obtenerPedidos');

describe('OrdersPage Component', () => {

    const mockOrders: PedidoResponse[] = [
        {
            id: 101,
            usuarioId: 1,
            fechaCreacion: '2023-10-25T14:30:00',
            estado: 'ENTREGADO',
            total: 15000,
            direccionEnvio: 'Calle Falsa 123',
            items: [
                { 
                    id: 10, 
                    skuProducto: 'FR-01', 
                    nombreProducto: 'Manzanas', 
                    cantidad: 5, 
                    precioUnitario: 1000, 
                    subtotal: 5000 
                },
                { 
                    id: 11, 
                    skuProducto: 'FR-02', 
                    nombreProducto: 'Peras', 
                    cantidad: 2, 
                    precioUnitario: 5000, 
                    subtotal: 10000 
                }
            ]
        },
        {
            id: 102,
            usuarioId: 1,
            fechaCreacion: '2023-10-26T10:00:00',
            estado: 'PENDIENTE',
            total: 8000,
            direccionEnvio: 'Av. Siempre Viva 742',
            items: [] 
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar el spinner de carga al inicio', () => {
        vi.spyOn(orderService, 'obtenerPedidos').mockReturnValue(new Promise(() => {}));
        
        render(<OrdersPage />);
        
        expect(screen.queryByText('Mis Pedidos')).not.toBeInTheDocument();
        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    });

    it('debe mostrar la lista de pedidos cuando cargan los datos', async () => {
        vi.spyOn(orderService, 'obtenerPedidos').mockResolvedValue(mockOrders);

        render(<OrdersPage />);

        await waitFor(() => {
            expect(screen.getByText('Mis Pedidos')).toBeInTheDocument();
        });

        expect(screen.getByText('Pedido #101')).toBeInTheDocument();
        expect(screen.getByText('Pedido #102')).toBeInTheDocument();
        expect(screen.getByText('ENTREGADO')).toBeInTheDocument();
        
        // --- CORRECCIÓN AQUÍ ---
        // Usamos getAllByText porque el precio puede aparecer múltiples veces (header, detalle, footer)
        // Tomamos el primero ([0]) o verificamos que el array tenga longitud > 0
        const precios = screen.getAllByText(/\$15.000/);
        expect(precios.length).toBeGreaterThan(0);
        expect(precios[0]).toBeInTheDocument();
    });

    it('debe desplegar el acordeón y mostrar el detalle de productos', async () => {
        vi.spyOn(orderService, 'obtenerPedidos').mockResolvedValue(mockOrders);

        render(<OrdersPage />);
        await waitFor(() => expect(screen.getByText('Pedido #101')).toBeInTheDocument());

        const accordionHeader = screen.getByText('Pedido #101');
        fireEvent.click(accordionHeader);

        await waitFor(() => {
            expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument();
            expect(screen.getByText('Manzanas')).toBeInTheDocument();
            expect(screen.getByText(/SKU: FR-01/)).toBeInTheDocument();
            expect(screen.getByText('Peras')).toBeInTheDocument();
        });
    });

    it('debe mostrar mensaje de "vacío" si no hay pedidos', async () => {
        vi.spyOn(orderService, 'obtenerPedidos').mockResolvedValue([]);

        render(<OrdersPage />);

        await waitFor(() => {
            expect(screen.getByText('Aún no has realizado pedidos')).toBeInTheDocument();
        });

        const shopBtn = screen.getByText('Ir a la Tienda');
        expect(shopBtn).toBeInTheDocument();
        
        fireEvent.click(shopBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/productos');
    });

    it('debe mostrar alerta de error si falla el servicio', async () => {
        vi.spyOn(orderService, 'obtenerPedidos').mockRejectedValue(new Error('Error de red'));

        render(<OrdersPage />);

        await waitFor(() => {
            expect(screen.getByText(/No pudimos cargar tu historial de pedidos/i)).toBeInTheDocument();
        });
    });

    it('debe ordenar los pedidos por fecha descendente (más reciente primero)', async () => {
        vi.spyOn(orderService, 'obtenerPedidos').mockResolvedValue(mockOrders);

        render(<OrdersPage />);
        await waitFor(() => expect(screen.getByText('Pedido #101')).toBeInTheDocument());

        const orderTitles = screen.getAllByText(/Pedido #/);
        
        expect(orderTitles[0]).toHaveTextContent('Pedido #102');
        expect(orderTitles[1]).toHaveTextContent('Pedido #101');
    });
});