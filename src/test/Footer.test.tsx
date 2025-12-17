import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../components/Footer'; // Ajusta la ruta si es necesario

describe('Footer Component', () => {
    
    it('debe renderizar la información de la marca y el año actual', () => {
        render(<Footer />);
        
        // Verificamos el nombre de la marca
        expect(screen.getByText('HuertoHogar')).toBeInTheDocument();
        
        // Verificamos el texto estático
        expect(screen.getByText('Hecho con amor.')).toBeInTheDocument();

        // Verificamos que el año sea dinámico y correcto
        const currentYear = new Date().getFullYear();
        // Usamos una expresión regular para buscar el año dentro del texto de copyright
        expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });

    it('debe renderizar los enlaces rápidos con las rutas correctas', () => {
        render(<Footer />);

        // Buscamos el link por su texto y verificamos su atributo 'href'
        const linkInicio = screen.getByRole('link', { name: /Inicio/i });
        expect(linkInicio).toHaveAttribute('href', '/');

        const linkProductos = screen.getByRole('link', { name: /Productos/i });
        expect(linkProductos).toHaveAttribute('href', '/productos');

        const linkNosotros = screen.getByRole('link', { name: /Sobre Nosotros/i });
        expect(linkNosotros).toHaveAttribute('href', '/nosotros');
    });

    it('debe renderizar la información de contacto correcta', () => {
        render(<Footer />);

        // Verificamos que el email y teléfono estén presentes
        expect(screen.getByText(/contacto@huertohogar.com/i)).toBeInTheDocument();
        expect(screen.getByText(/\+56 9 1234 5678/i)).toBeInTheDocument();
    });

    it('debe mostrar las redes sociales', () => {
        render(<Footer />);

        expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
        expect(screen.getByText(/Instagram/i)).toBeInTheDocument();
    });
});