import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="footer-custom">
      <Container>
        <Row>
          {/* Columna 1: Logo e información de derechos */}
          <Col md={4} className="mb-3">
            {/* Nota: h5 toma el color blanco definido en CSS .footer-custom h5 */}
            <h5>HuertoHogar</h5>
            <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
            <p>Hecho con amor.</p>
          </Col>

          {/* Columna 2: Enlaces rápidos */}
          <Col md={4} className="mb-3">
            <h5>Enlaces Rápidos</h5>
            <Nav className="flex-column">
              <Nav.Link href="/" className="footer-link">Inicio</Nav.Link>
              <Nav.Link href="/productos" className="footer-link">Productos</Nav.Link>
              <Nav.Link href="/nosotros" className="footer-link">Sobre Nosotros</Nav.Link>
            </Nav>
          </Col>

          {/* Columna 3: Contacto y Redes */}
          <Col md={4} className="mb-3">
            <h5>Contacto</h5>
            <p className="mb-1">Email: contacto@huertohogar.com</p>
            <p>Teléfono: +56 9 1234 5678</p>
            
            <Nav className="flex-row mt-3">
              {/* Iconos: Si tienes bootstrap-icons instalado, funcionarán las clases 'bi' */}
              <Nav.Link href="#" className="footer-link d-flex align-items-center me-3">
                <i className="bi bi-facebook me-2"></i> Facebook
              </Nav.Link>
              <Nav.Link href="#" className="footer-link d-flex align-items-center">
                <i className="bi bi-instagram me-2"></i> Instagram
              </Nav.Link>
            </Nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;