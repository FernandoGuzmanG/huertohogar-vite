import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AboutPage from '../pages/AboutPage';

// Mockeamos Header y Footer para aislarlos y que el test se centre solo en AboutPage
// Esto evita errores si Header depende de AuthContext, por ejemplo.
vi.mock('../components/Header', () => ({
    default: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('../components/Footer', () => ({
    default: () => <div data-testid="mock-footer">Footer</div>
}));

describe('AboutPage Component', () => {

    it('debe renderizar el título principal y la descripción', () => {
        render(<AboutPage />);

        expect(screen.getByText('Del Campo al Hogar')).toBeInTheDocument();
        expect(screen.getByText(/Conectando a las familias chilenas/i)).toBeInTheDocument();
    });

    it('debe renderizar las secciones de Historia, Misión y Visión', () => {
        render(<AboutPage />);

        expect(screen.getByText('Nuestra Historia')).toBeInTheDocument();
        expect(screen.getByText('Nuestra Misión')).toBeInTheDocument();
        expect(screen.getByText('Nuestra Visión')).toBeInTheDocument();
    });

    it('debe renderizar correctamente el video de YouTube', () => {
        render(<AboutPage />);
        
        // Buscamos el iframe por su título
        const videoIframe = screen.getByTitle('Proceso de Cultivo HuertoHogar');
        
        expect(videoIframe).toBeInTheDocument();
        expect(videoIframe).toHaveAttribute('src', expect.stringContaining('youtube.com'));
    });

    it('debe renderizar la lista de ubicaciones correctamente', () => {
        render(<AboutPage />);

        // Verificamos el título de la sección
        expect(screen.getByText('Nuestras Tiendas')).toBeInTheDocument();

        // Lista de ciudades esperadas
        const ciudades = [
            "Santiago", "Viña del Mar", "Valparaíso", 
            "Concepción", "Nacimiento", "Villarrica", "Puerto Montt"
        ];

        // Verificamos que cada ciudad aparezca en el documento
        ciudades.forEach(ciudad => {
            expect(screen.getByText(ciudad)).toBeInTheDocument();
        });

        // Verificamos que haya 7 iframes de mapas (uno por cada ciudad)
        // Nota: Como ya hay 1 iframe de video, en total debería haber 8 iframes en la página
        // Pero podemos ser más específicos buscando por título de mapa
        const mapIframes = screen.getAllByTitle(/Mapa/i);
        expect(mapIframes).toHaveLength(7);
    });
});