    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactPage from '../pages/ContactPage';
import { contactService } from '../services/contactService';

// 1. Mock de componentes visuales (Header/Footer)
vi.mock('../components/Header', () => ({ default: () => <div data-testid="mock-header">Header</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="mock-footer">Footer</div> }));

// 2. Spy del servicio
vi.spyOn(contactService, 'enviarMensaje');

describe('ContactPage Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe renderizar el formulario y la información de contacto', () => {
        render(<ContactPage />);

        // Verificar títulos
        expect(screen.getByText('Contáctanos')).toBeInTheDocument();
        expect(screen.getByText('Información de Contacto')).toBeInTheDocument();

        // Verificar campos del formulario
        expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('tucorreo@ejemplo.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('¿En qué podemos ayudarte?')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Escribe tu mensaje aquí...')).toBeInTheDocument();
    });

    it('debe mostrar errores de validación en tiempo real (blur)', () => {
        render(<ContactPage />);

        // 1. Validar Nombre vacío
        const inputNombre = screen.getByPlaceholderText('Tu nombre');
        fireEvent.focus(inputNombre);
        fireEvent.blur(inputNombre); // Al salir sin escribir, debe dar error
        expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();

        // 2. Validar Email inválido
        const inputEmail = screen.getByPlaceholderText('tucorreo@ejemplo.com');
        fireEvent.change(inputEmail, { target: { value: 'correo-malo' } });
        fireEvent.blur(inputEmail);
        expect(screen.getByText('Ingresa un formato de correo válido.')).toBeInTheDocument();

        // 3. Validar Mensaje muy corto
        const inputMensaje = screen.getByPlaceholderText('Escribe tu mensaje aquí...');
        fireEvent.change(inputMensaje, { target: { value: 'Hola' } }); // < 10 chars
        fireEvent.blur(inputMensaje);
        expect(screen.getByText('El mensaje es muy corto (mínimo 10 caracteres).')).toBeInTheDocument();
    });

    it('debe mantener el botón deshabilitado si el formulario es inválido', () => {
        render(<ContactPage />);

        const btnEnviar = screen.getByRole('button', { name: /Enviar Mensaje/i });

        // Inicialmente está deshabilitado porque los campos están vacíos
        expect(btnEnviar).toBeDisabled();

        // Llenamos solo el nombre
        fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Juan' } });
        
        // Sigue deshabilitado
        expect(btnEnviar).toBeDisabled();
    });

    it('debe enviar el formulario correctamente cuando todo es válido', async () => {
        // Simulamos respuesta exitosa del servicio
        vi.spyOn(contactService, 'enviarMensaje').mockResolvedValue('Mensaje enviado con éxito');

        render(<ContactPage />);

        // Llenamos TODOS los campos con datos válidos
        fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Juan Pérez' } });
        fireEvent.change(screen.getByPlaceholderText('tucorreo@ejemplo.com'), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('¿En qué podemos ayudarte?'), { target: { value: 'Consulta de Stock' } });
        fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje aquí...'), { target: { value: 'Hola, quisiera saber si tienen stock de paltas.' } });

        const btnEnviar = screen.getByRole('button', { name: /Enviar Mensaje/i });

        // Ahora el botón debería estar habilitado
        expect(btnEnviar).not.toBeDisabled();

        // Hacemos click
        fireEvent.click(btnEnviar);

        // Verificamos que se llamó al servicio con los datos correctos
        expect(contactService.enviarMensaje).toHaveBeenCalledWith({
            nombre: 'Juan Pérez',
            email: 'juan@test.com',
            asunto: 'Consulta de Stock',
            mensaje: 'Hola, quisiera saber si tienen stock de paltas.'
        });

        // Esperamos mensaje de éxito y limpieza del formulario
        await waitFor(() => {
            expect(screen.getByText('Mensaje enviado con éxito')).toBeInTheDocument();
            // El formulario debe limpiarse (valor vacío)
            expect(screen.getByPlaceholderText('Tu nombre')).toHaveValue('');
        });
    });

    it('debe mostrar alerta de error si el servicio falla', async () => {
        // Simulamos error del servicio
        vi.spyOn(contactService, 'enviarMensaje').mockRejectedValue(new Error('Error del servidor'));

        render(<ContactPage />);

        // Llenamos datos válidos para habilitar el botón
        fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByPlaceholderText('tucorreo@ejemplo.com'), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('¿En qué podemos ayudarte?'), { target: { value: 'Error' } });
        fireEvent.change(screen.getByPlaceholderText('Escribe tu mensaje aquí...'), { target: { value: 'Mensaje de prueba válido.' } });

        const btnEnviar = screen.getByRole('button', { name: /Enviar Mensaje/i });
        fireEvent.click(btnEnviar);

        // Esperamos ver la alerta de error
        await waitFor(() => {
            expect(screen.getByText('Error del servidor')).toBeInTheDocument();
        });
    });
});