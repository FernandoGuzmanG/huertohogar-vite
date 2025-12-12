import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// Importamos iconos para darle vida visual a los pilares
import { TreeFill, Truck, HeartFill, ArrowRight } from 'react-bootstrap-icons';

import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  // Simulamos el carrito
  const initialCartCount = 0; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header cartItemCount={initialCartCount} />
      
      <main style={{ flex: 1 }}>
        <HeroSection />
        
        {/* --- SECCIÓN: NUESTROS PILARES --- */}
        <div className="py-5" style={{ backgroundColor: '#F7F7F7' }}> {/* Fondo del PDF */}
            <Container>
                <h2 className="section-title">Nuestros Pilares</h2>
                <p className="section-lead">
                    Frescura, sostenibilidad y calidad garantizada en cada producto que cultivamos para ti y tu familia.
                </p>
                
                <Row className="g-4"> {/* g-4 da espacio entre columnas */}
                    {/* Pilar 1 */}
                    <Col md={4}>
                        <Card className="pillar-card h-100">
                            <div className="pillar-icon">
                                <TreeFill />
                            </div>
                            <Card.Body>
                                <h4 className="pillar-title">Orgánico Certificado</h4>
                                <Card.Text>
                                    Cultivamos sin químicos ni pesticidas, respetando los ciclos naturales de la tierra para ofrecerte lo más puro.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Pilar 2 */}
                    <Col md={4}>
                        <Card className="pillar-card h-100">
                            <div className="pillar-icon">
                                <Truck />
                            </div>
                            <Card.Body>
                                <h4 className="pillar-title">Entrega Rápida</h4>
                                <Card.Text>
                                    Llevamos el sabor del huerto a tu mesa en menos de 24 horas, garantizando la máxima frescura en cada entrega.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Pilar 3 */}
                    <Col md={4}>
                        <Card className="pillar-card h-100">
                            <div className="pillar-icon">
                                <HeartFill />
                            </div>
                            <Card.Body>
                                <h4 className="pillar-title">Apoyo Local</h4>
                                <Card.Text>
                                    Trabajamos directamente con pequeños agricultores de la región, fomentando el comercio justo y el desarrollo local.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>

        {/* --- SECCIÓN: ADELANTO DE PRODUCTOS (Opcional pero recomendado) --- */}
        <div className="py-5 bg-white">
            <Container>
                <Row className="align-items-center mb-4">
                    <Col>
                        <h2 className="section-title text-start mb-0">Favoritos de la Temporada</h2>
                    </Col>
                    <Col className="text-end">
                         {/* Enlace estético para ver más */}
                        <a href="/productos" style={{ color: '#2E8B57', fontWeight: 'bold' }}>
                            Ver todo el catálogo <ArrowRight />
                        </a>
                    </Col>
                </Row>

                <Row className="g-4">
                    {[1, 2, 3, 4].map((item) => (
                        <Col key={item} md={3} sm={6}>
                            <div className="product-preview-card">
                                <div className="product-preview-img">
                                    {/* Aquí iría la imagen real del producto */}
                                    <span>Producto {item}</span>
                                </div>
                                <div className="product-preview-body">
                                    <h5 style={{ fontFamily: 'Playfair Display', fontWeight: 'bold' }}>Manzanas Fuji</h5>
                                    <p className="product-price">$1.200 / kg</p>
                                    <Button variant="outline-success" size="sm" style={{borderColor: '#2E8B57', color: '#2E8B57'}}>
                                        Ver Detalles
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;