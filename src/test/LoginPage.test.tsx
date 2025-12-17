import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'; // <--- 1. Importamos 'Mock'
import LoginPage from '../pages/LoginPage';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

// 1. Mocks de Componentes Hijos
vi.mock('../components/Header', () => ({ default: () => <div data-testid="mock-header">Header</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="mock-footer">Footer</div> }));

// 2. Mock de Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// 3. Mock del Hook de Auth
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

// 4. Spies del Servicio
vi.spyOn(authService, 'login');
vi.spyOn(authService, 'register');

describe('LoginPage Component', () => {

    const mockLoginContext = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // --- CORRECCIÓN AQUÍ: Usamos 'as Mock' en lugar de 'as any' ---
        (useAuth as Mock).mockReturnValue({ login: mockLoginContext });
    });

    it('debe renderizar el formulario de INICIO DE SESIÓN por defecto', () => {
        render(<LoginPage />);

        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
        
        expect(screen.queryByPlaceholderText('Ingrese su nombre completo')).not.toBeInTheDocument();
        
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
    });

    it('debe renderizar el formulario de REGISTRO si isRegister es true', () => {
        render(<LoginPage isRegister={true} />);

        expect(screen.getByText('Crear Cuenta (Registro)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ingrese su nombre completo')).toBeInTheDocument();
        
        expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument();
    });

    it('debe validar errores en tiempo real (Email inválido / Clave corta)', () => {
        render(<LoginPage />);

        const inputEmail = screen.getByPlaceholderText('ejemplo@correo.com');
        const inputClave = screen.getByPlaceholderText('Contraseña');
        const btnIngresar = screen.getByRole('button', { name: /Ingresar/i });

        fireEvent.change(inputEmail, { target: { value: 'correo-malo' } });
        fireEvent.blur(inputEmail);
        expect(screen.getByText('Formato de correo inválido.')).toBeInTheDocument();

        fireEvent.change(inputClave, { target: { value: '123' } });
        fireEvent.blur(inputClave);
        expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();

        expect(btnIngresar).toBeDisabled();
    });

    it('debe realizar un LOGIN exitoso', async () => {
        vi.spyOn(authService, 'login').mockResolvedValue({ token: 'fake-jwt-token' });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });

        const btnIngresar = screen.getByRole('button', { name: /Ingresar/i });

        expect(btnIngresar).not.toBeDisabled();

        fireEvent.click(btnIngresar);

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                correo: 'juan@test.com',
                clave: 'password123'
            });
        });

        expect(screen.getByText('¡Inicio de sesión exitoso!')).toBeInTheDocument();

        expect(mockLoginContext).toHaveBeenCalledWith('fake-jwt-token');
    });

    it('debe realizar un REGISTRO exitoso', async () => {
        vi.spyOn(authService, 'register').mockResolvedValue({ token: 'fake-jwt-token-new' });

        render(<LoginPage isRegister={true} />);

        fireEvent.change(screen.getByPlaceholderText('Ingrese su nombre completo'), { target: { value: 'Juan Pérez' } });
        fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });

        const btnRegistro = screen.getByRole('button', { name: /Registrarse/i });
        expect(btnRegistro).not.toBeDisabled();

        fireEvent.click(btnRegistro);

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalledWith({
                nombreCompleto: 'Juan Pérez',
                correo: 'juan@test.com',
                clave: 'password123'
            });
        });

        expect(screen.getByText('¡Registro exitoso! Iniciando sesión...')).toBeInTheDocument();
        expect(mockLoginContext).toHaveBeenCalledWith('fake-jwt-token-new');
    });

    it('debe mostrar error si la API falla', async () => {
        vi.spyOn(authService, 'login').mockRejectedValue(new Error('Credenciales inválidas'));

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });

        const btnIngresar = screen.getByRole('button', { name: /Ingresar/i });
        fireEvent.click(btnIngresar);

        await waitFor(() => {
            expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
        });

        expect(mockLoginContext).not.toHaveBeenCalled();
    });
});