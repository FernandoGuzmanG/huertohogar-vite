import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// Iconos
import { TreeFill, Truck, HeartFill, ArrowRight } from 'react-bootstrap-icons';

import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';

// Importamos el servicio y el tipo para traer datos reales
import { productService } from '../services/productService';
import type { Producto } from '../types/product';

const HomePage: React.FC = () => {
  // Estado para los productos destacados
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const initialCartCount = 0; 

  // Efecto para cargar productos reales al montar la página
  useEffect(() => {
    const fetchFeatured = async () => {
        try {
            // Obtenemos todos los productos del backend
            const allProducts = await productService.obtenerTodos();
            
            // LÓGICA DE FAVORITOS:
            // Como no hay un campo "destacado" en la BD, tomamos los primeros 4.
            // Esto asegura que la sección siempre tenga contenido real.
            setFeaturedProducts(allProducts.slice(0, 4));
        } catch (error) {
            console.error("Error al cargar favoritos", error);
        }
    };
    fetchFeatured();
  }, []);

  // Función para formatear precio (CLP)
  const formatoPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header cartItemCount={initialCartCount} />
      
      <main style={{ flex: 1 }}>
        <HeroSection />
        
        {/* --- SECCIÓN: NUESTROS PILARES --- */}
        <div className="py-5" style={{ backgroundColor: '#F7F7F7' }}>
            <Container>
                <h2 className="section-title">Nuestros Pilares</h2>
                <p className="section-lead">
                    Frescura, sostenibilidad y calidad garantizada en cada producto que cultivamos para ti y tu familia.
                </p>
                
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="pillar-card h-100">
                            <div className="pillar-icon"><TreeFill /></div>
                            <Card.Body>
                                <h4 className="pillar-title">Orgánico Certificado</h4>
                                <Card.Text>Cultivamos sin químicos ni pesticidas, respetando los ciclos naturales de la tierra.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="pillar-card h-100">
                            <div className="pillar-icon"><Truck /></div>
                            <Card.Body>
                                <h4 className="pillar-title">Entrega Rápida</h4>
                                <Card.Text>Llevamos el sabor del huerto a tu mesa en menos de 24 horas, garantizando frescura.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="pillar-card h-100">
                            <div className="pillar-icon"><HeartFill /></div>
                            <Card.Body>
                                <h4 className="pillar-title">Apoyo Local</h4>
                                <Card.Text>Trabajamos directamente con pequeños agricultores de la región, fomentando el comercio justo.</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>

        {/* --- SECCIÓN: FAVORITOS DE LA TEMPORADA (DATOS REALES) --- */}
        <div className="py-5 bg-white">
            <Container>
                <Row className="align-items-center mb-4">
                    <Col>
                        {/* Título en Marrón según tu imagen */}
                        <h2 className="section-title text-start mb-0" style={{ color: '#8B4513' }}>
                            Favoritos de la Temporada
                        </h2>
                    </Col>
                    <Col className="text-end">
                         {/* Enlace estético para ver más */}
                        <a href="/productos" style={{ color: '#2E8B57', fontWeight: 'bold', textDecoration: 'none' }}>
                            Ver todo el catálogo <ArrowRight />
                        </a>
                    </Col>
                </Row>

                <Row className="g-4">
                    {featuredProducts.length > 0 ? (
                        featuredProducts.map((prod) => (
                            <Col key={prod.id} md={3} sm={6}>
                                <div className="product-preview-card h-100">
                                    <div className="product-preview-img">
                                        {/* Renderizado condicional de la imagen */}
                                        {prod.imagen ? (
                                            <img 
                                                src={prod.imagen} 
                                                alt={prod.nombre} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span className="text-muted">Sin Imagen</span>
                                        )}
                                    </div>
                                    <div className="product-preview-body">
                                        {/* Nombre en Marrón */}
                                        <h5 style={{ fontFamily: 'Playfair Display', fontWeight: 'bold', color: '#8B4513' }}>
                                            {prod.nombre}
                                        </h5>
                                        {/* Precio en Verde */}
                                        <p className="product-price" style={{ color: '#2E8B57', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {formatoPeso(prod.precio)} / {prod.unidad}
                                        </p>
                                        
                                        {/* Botón Ver Detalles (Outline Verde) */}
                                        <Button 
                                            variant="outline-success" 
                                            size="sm" 
                                            // AQUÍ TAMBIÉN
                                            href={`/producto/${prod.id}`} 
                                            style={{ borderColor: '#2E8B57', color: '#2E8B57', fontWeight: '500' }}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center">
                            <p className="text-muted">Cargando productos destacados...</p>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;