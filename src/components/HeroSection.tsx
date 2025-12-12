import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const HeroSection: React.FC = () => {
  return (
    <div className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <h1 className="hero-title">
              Directo de la Tierra a tu Hogar
            </h1>
            <p className="hero-subtitle">
              Descubre nuestra selección de productos frescos, orgánicos y de la mejor calidad.
              ¡Sabor y salud garantizados!
            </p>
            <Button className="btn-hero" href="/productos">
              Explorar Productos
            </Button>
          </Col>
          
          <Col md={6}>
            <div className="hero-image-container">
                {/* Imagen de alta resolución de productos frescos/campo.
                   Fuente: Unsplash (Foto de Scott Warman - Manos sosteniendo vegetales frescos)
                */}
                <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop" 
                    alt="Canasta de vegetales frescos recién cosechados" 
                />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroSection;