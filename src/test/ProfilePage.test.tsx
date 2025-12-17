import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import ProfilePage from '../pages/ProfilePage';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

// Mocks
vi.mock('../components/Header', () => ({ default: () => <div data-testid="mock-header">Header</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="mock-footer">Footer</div> }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

vi.mock('../hooks/useAuth');

vi.spyOn(userService, 'obtenerPerfil');
vi.spyOn(userService, 'actualizarPerfil');
vi.spyOn(userService, 'cambiarClave');

describe('ProfilePage Component', () => {

    const mockProfileData = {
        nombreCompleto: 'Juan Pérez',
        biografia: 'Amante de la naturaleza',
        direccionEntrega: 'Calle 123'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
        vi.spyOn(userService, 'obtenerPerfil').mockResolvedValue(mockProfileData);
    });

    it('debe redirigir al login si el usuario NO está autenticado', () => {
        (useAuth as Mock).mockReturnValue({ isAuthenticated: false, isLoading: false });
        render(<ProfilePage />);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('debe cargar y mostrar los datos del perfil del usuario', async () => {
        render(<ProfilePage />);
        await waitFor(() => {
            expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
        });
        expect(screen.getByDisplayValue('Amante de la naturaleza')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Calle 123')).toBeInTheDocument();
    });

    it('debe mostrar error de validación para un nombre inválido', async () => {
        render(<ProfilePage />);
        await waitFor(() => screen.getByDisplayValue('Juan Pérez'));

        // CORRECCIÓN: Usamos placeholder para encontrar el input más fácilmente
        const inputName = screen.getByPlaceholderText('Solo letras');
        
        fireEvent.change(inputName, { target: { value: 'Juan 123' } });
        
        expect(screen.getByText('El nombre solo puede contener letras y espacios.')).toBeInTheDocument();
        
        const btnSave = screen.getByText('Guardar Cambios').closest('button');
        expect(btnSave).toBeDisabled();
    });

    it('debe actualizar el perfil exitosamente cuando el formulario es válido', async () => {
        // Mock de respuesta correcta (Objeto completo)
        const mockUpdatedProfile = {
            nombreCompleto: 'Juan Pérez',
            biografia: 'Nueva bio actualizada',
            direccionEntrega: 'Calle 123'
        };
        vi.spyOn(userService, 'actualizarPerfil').mockResolvedValue(mockUpdatedProfile);

        render(<ProfilePage />);
        await waitFor(() => screen.getByDisplayValue('Juan Pérez'));

        const inputBio = screen.getByPlaceholderText('Cuéntanos un poco sobre ti...');
        fireEvent.change(inputBio, { target: { value: 'Nueva bio actualizada' } });

        const btnSave = screen.getByText('Guardar Cambios');
        expect(btnSave).not.toBeDisabled();
        fireEvent.click(btnSave);

        await waitFor(() => {
            expect(userService.actualizarPerfil).toHaveBeenCalledWith({
                nombreCompleto: 'Juan Pérez',
                biografia: 'Nueva bio actualizada',
                direccionEntrega: 'Calle 123'
            });
        });

        expect(screen.getByText('Información actualizada correctamente.')).toBeInTheDocument();
    });

    it('debe validar el formulario de cambio de contraseña', async () => {
        render(<ProfilePage />);
        await waitFor(() => screen.getByDisplayValue('Juan Pérez'));

        const btnChangePass = screen.getByText('Cambiar Contraseña');
        fireEvent.click(btnChangePass);
        
        expect(screen.getByText('La contraseña actual es obligatoria.')).toBeInTheDocument();
        expect(screen.getByText('La nueva contraseña es obligatoria.')).toBeInTheDocument();
    });
});