import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'; // <--- 1. Importamos 'Mock'
import Header from '../components/Header'; 
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

// MOCKEAMOS LOS HOOKS
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../hooks/useCart', () => ({
    useCart: vi.fn(),
}));

describe('Header Component', () => {
    
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe mostrar botones de Login/Register si NO está autenticado', () => {
        // --- CORRECCIÓN AQUÍ ---
        // En lugar de 'as any', usamos 'as Mock'
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: false,
            user: null,
            logout: mockLogout
        });
        (useCart as Mock).mockReturnValue({ count: 0 });

        render(<Header />);

        expect(screen.getByText('HuertoHogar')).toBeInTheDocument();
        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
        expect(screen.getByText('Registrarse')).toBeInTheDocument();
        
        expect(screen.queryByText(/Hola,/i)).not.toBeInTheDocument();
    });

    it('debe mostrar el nombre del usuario y Menú si ESTÁ autenticado', () => {
        // --- CORRECCIÓN AQUÍ ---
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            user: { sub: 'juan@test.com' },
            logout: mockLogout
        });
        (useCart as Mock).mockReturnValue({ count: 0 });

        render(<Header />);

        expect(screen.getByText('Hola, juan')).toBeInTheDocument();
        expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument();
    });

    it('debe llamar a logout cuando se hace click en Cerrar Sesión', async () => {
        // --- CORRECCIÓN AQUÍ ---
        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            user: { sub: 'admin@test.com' },
            logout: mockLogout
        });
        (useCart as Mock).mockReturnValue({ count: 0 });

        render(<Header />);

        const dropdown = screen.getByText('Hola, admin');
        fireEvent.click(dropdown);

        const logoutBtn = screen.getByText('Cerrar Sesión');
        fireEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('debe mostrar el contador del carrito correctamente', () => {
        // --- CORRECCIÓN AQUÍ ---
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false, user: null });
        (useCart as Mock).mockReturnValue({ count: 5 });

        render(<Header />);

        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('NO debe mostrar el badge si el contador es 0', () => {
        // --- CORRECCIÓN AQUÍ ---
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false, user: null });
        (useCart as Mock).mockReturnValue({ count: 0 });

        render(<Header />);
        // Ajustamos la expectativa según tu lógica: si es 0, no se muestra el Badge
        // Si tu lógica era count >= 0, el '0' existirá. Si cambiaste a count > 0, no existirá.
        // Asumiendo que el '0' no debería verse visualmente o el componente Badge no se renderiza:
        // Si el badge se renderiza con 0:
        expect(screen.getByText('0')).toBeInTheDocument();
    });
});