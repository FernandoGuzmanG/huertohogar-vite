import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const HeroSection: React.FC = () => {
  return (
    // Usa la clase .hero-section
    <div className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            {/* Usa la clase .hero-title */}
            <h1 className="hero-title">
              Directo de la Tierra a tu Hogar
            </h1>
            {/* Usa la clase .hero-subtitle */}
            <p className="hero-subtitle">
              Descubre nuestra selección de productos frescos, orgánicos y de la mejor calidad.
              ¡Sabor y salud garantizados!
            </p>
            {/* Usa la clase .btn-hero */}
            <Button className="btn-hero" href="/productos">
              Explorar Productos
            </Button>
          </Col>
          <Col md={6}>
            {/* Usa la clase .hero-image-container */}
            <div className="hero-image-container">
                <span style={{color: '#666', fontWeight: '500'}}>
                   Imagen Huerto (Placeholder)
                </span>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroSection;