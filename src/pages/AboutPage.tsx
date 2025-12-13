import React from 'react';
import { Container, Row, Col, Card, Ratio } from 'react-bootstrap';
import { GeoAltFill, HeartFill, Leaf } from 'react-bootstrap-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {

    // Lista de ubicaciones
    const locations = [
        "Santiago, Chile",
        "Viña del Mar, Chile",
        "Valparaíso, Chile", 
        "Concepción, Chile",
        "Nacimiento, Chile",
        "Villarrica, Chile", 
        "Puerto Montt, Chile"
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F7F7F7' }}>
            <Header />

            {/* --- HERO SECTION --- */}
            <div style={{ backgroundColor: '#2E8B57', color: 'white', padding: '60px 0', textAlign: 'center' }}>
                <Container>
                    <h1 style={{ fontFamily: 'Playfair Display', fontWeight: 'bold', fontSize: '3rem' }}>
                        Del Campo al Hogar
                    </h1>
                    <p style={{ fontSize: '1.2rem', fontFamily: 'Montserrat', maxWidth: '800px', margin: '0 auto' }}>
                        Conectando a las familias chilenas con la frescura del campo y promoviendo un estilo de vida sustentable.
                    </p>
                </Container>
            </div>

            <Container className="my-5 flex-grow-1">
                
                {/* --- INTRODUCCIÓN E HISTORIA --- */}
                <Row className="mb-5 align-items-center">
                    <Col lg={6}>
                        <div className="shadow rounded overflow-hidden">
                            <Ratio aspectRatio="16x9">
                                <iframe 
                                    src="https://www.youtube.com/embed/7Xoc9XtDg1w?rel=0" 
                                    title="Proceso de Cultivo HuertoHogar" 
                                    allowFullScreen
                                    style={{ border: 0 }}
                                ></iframe>
                            </Ratio>
                        </div>
                        <p className="text-center text-muted mt-2 small">
                            Nuestro proceso de cultivo responsable 🌿
                        </p>
                    </Col>
                    
                    <Col lg={6} className="mt-4 mt-lg-0">
                        <h2 style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>
                            Nuestra Historia
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            HuertoHogar es una tienda online dedicada a llevar la frescura y calidad de los productos del campo directamente a la puerta de nuestros clientes en Chile.
                            <br /><br />
                            Con más de <strong>6 años de experiencia</strong>, nuestra misión es fomentar una conexión más cercana entre los consumidores y los agricultores locales, apoyando prácticas agrícolas sostenibles.
                        </p>
                        <div className="d-flex gap-4 mt-3">
                            <div className="text-center">
                                <h3 style={{ color: '#2E8B57', fontWeight: 'bold' }}>+6</h3>
                                <small>Años de experiencia</small>
                            </div>
                            <div className="text-center">
                                <h3 style={{ color: '#2E8B57', fontWeight: 'bold' }}>+9</h3>
                                <small>Puntos de venta</small>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* --- MISIÓN Y VISIÓN --- */}
                <Row className="g-4 mb-5">
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4" style={{ borderTop: '5px solid #2E8B57' }}>
                            <Card.Body className="p-4 text-center">
                                <Leaf size={40} color="#2E8B57" className="mb-3" />
                                <h3 style={{ fontFamily: 'Playfair Display', color: '#8B4513' }}>Nuestra Misión</h3>
                                <p style={{ color: '#666' }}>
                                    Proporcionar productos frescos y de calidad directamente desde el campo hasta la puerta de nuestros clientes. Nos comprometemos a fomentar una conexión más cercana entre los consumidores y los agricultores locales.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4" style={{ borderTop: '5px solid #FFD700' }}>
                            <Card.Body className="p-4 text-center">
                                <HeartFill size={40} color="#FFD700" className="mb-3" />
                                <h3 style={{ fontFamily: 'Playfair Display', color: '#8B4513' }}>Nuestra Visión</h3>
                                <p style={{ color: '#666' }}>
                                    Ser la tienda online líder en la distribución de productos frescos y naturales en Chile. Aspiramos a expandir nuestra presencia a nivel nacional e internacional, estableciendo un nuevo estándar de calidad y sostenibilidad.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* --- UBICACIONES (ESTILO ACTUALIZADO) --- */}
                <div className="py-5">
                    <h2 className="text-center mb-5" style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>
                        Nuestras Tiendas
                    </h2>
                    
                    <Row className="g-4 justify-content-center">
                        {locations.map((city, index) => (
                            <Col key={index} md={6} lg={4} xl={3}>
                                {/* Agregamos 'rounded-4' para bordes muy redondos y 'overflow-hidden' para que el mapa respete el borde */}
                                <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-4">
                                    
                                    {/* Aumentamos padding (py-4) para dar más separación entre título y mapa */}
                                    <Card.Header className="bg-white border-bottom-0 py-4 text-center">
                                        {/* Cambiamos color a café (#8B4513) */}
                                        <h5 style={{ color: '#8B4513', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 0 }}>
                                            <GeoAltFill className="me-2" />
                                            {city.replace(', Chile', '')}
                                        </h5>
                                    </Card.Header>

                                    <Card.Body className="p-0">
                                        <div style={{ width: '100%', height: '200px' }}>
                                            <iframe
                                                title={`Mapa ${city}`}
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                marginHeight={0}
                                                marginWidth={0}
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                                style={{ border: 0 }}
                                                loading="lazy"
                                            ></iframe>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

            </Container>

            <Footer />
        </div>
    );
};

export default AboutPage;