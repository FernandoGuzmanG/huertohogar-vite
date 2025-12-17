import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroSection from '../components/HeroSection'; // Ajusta la ruta si es necesario

describe('HeroSection Component', () => {

    it('debe renderizar el título principal y el subtítulo', () => {
        render(<HeroSection />);

        // Verificamos que el H1 esté presente
        // Usamos una expresión regular (/.../i) para que no importe mayúsculas/minúsculas
        expect(screen.getByText(/Directo de la Tierra a tu Hogar/i)).toBeInTheDocument();

        // Verificamos parte del subtítulo
        expect(screen.getByText(/Descubre nuestra selección de productos frescos/i)).toBeInTheDocument();
    });

    it('debe renderizar el botón de acción (CTA) con el enlace correcto', () => {
        render(<HeroSection />);

        // React-Bootstrap renderiza un <Button href="..."> como una etiqueta <a> (link)
        const botonExplorar = screen.getByRole('button', { name: /Explorar Productos/i });
        
        expect(botonExplorar).toBeInTheDocument();
        expect(botonExplorar).toHaveAttribute('href', '/productos');
    });
});