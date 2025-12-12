import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Image, Button, Badge, Form, Spinner, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { CartPlus, StarFill, Star, ArrowLeft, GeoAlt, Truck } from 'react-bootstrap-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { productService } from '../services/productService';
import type { Producto } from '../types/product';
// Importamos useAuth por si queremos mostrar el formulario de reseña solo a logueados visualmente
import { useAuth } from '../hooks/useAuth';

const ProductDetailPage: React.FC = () => {
    const { sku } = useParams<{ sku: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);

    // --- ESTADO DUMMY PARA RESEÑAS (Para maquetación) ---
    // Cuando integres el microservicio, esto vendrá de resenaService.obtenerEstadisticasPorProducto(sku)
    const mockStats = {
        promedio: 4.5,
        totalResenas: 12
    };

    // Cuando integres, esto vendrá de resenaService.obtenerResenasPorProducto(sku)
    const mockReviews = [
        { id: 1, usuario: 'Juan Pérez', calificacion: 5, comentario: '¡Excelente calidad! Muy frescas.', fecha: '2023-10-01' },
        { id: 2, usuario: 'María G.', calificacion: 4, comentario: 'Buen producto, pero el envío demoró un poco.', fecha: '2023-10-05' }
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            if (!sku) return;
            setLoading(true);
            try {
                const data = await productService.obtenerPorSku(sku);
                setProduct(data);
            } catch (error) {
                console.error("Error cargando producto", error);
                // Si falla, podrías redirigir o mostrar error
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        // TODO: INTEGRACIÓN RESEÑAS -> Aquí llamarás a cargarResenas(sku) y cargarEstadisticas(sku)
    }, [sku]);

    const formatoPeso = (valor: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    // Función auxiliar para renderizar estrellas
    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            i < rating ? <StarFill key={i} className="text-warning small me-1" /> : <Star key={i} className="text-muted small me-1" />
        ));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-5">
                <h3>Producto no encontrado</h3>
                <Button variant="link" onClick={() => navigate('/productos')}>Volver al catálogo</Button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header cartItemCount={0} />

            <Container className="my-5 flex-grow-1">
                {/* Botón Volver */}
                <Button 
                    variant="link" 
                    className="mb-4 text-decoration-none" 
                    style={{ color: '#2E8B57' }}
                    onClick={() => navigate('/productos')}
                >
                    <ArrowLeft className="me-2" /> Volver al catálogo
                </Button>

                {/* --- SECCIÓN DETALLE DEL PRODUCTO --- */}
                <Row className="mb-5">
                    {/* Columna Imagen */}
                    <Col md={6} className="mb-4 mb-md-0">
                        <div style={{ 
                            borderRadius: '15px', 
                            overflow: 'hidden', 
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #eee',
                            height: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8f9fa'
                        }}>
                            {product.imagen ? (
                                <Image src={product.imagen} fluid style={{ maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span className="text-muted">Sin Imagen Disponible</span>
                            )}
                        </div>
                    </Col>

                    {/* Columna Información */}
                    <Col md={6}>
                        <div className="ps-md-4">
                            <Badge bg="warning" text="dark" className="mb-2 px-3 py-2 rounded-pill">
                                {product.categoriaNombre}
                            </Badge>
                            
                            <h1 style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>
                                {product.nombre}
                            </h1>

                            <div className="d-flex align-items-center mb-3">
                                <div className="me-2 d-flex">
                                    {renderStars(Math.round(mockStats.promedio))} {/* Mock Rating */}
                                </div>
                                <span className="text-muted small">({mockStats.totalResenas} opiniones)</span>
                            </div>

                            <h2 className="mb-3" style={{ color: '#2E8B57', fontWeight: 'bold' }}>
                                {formatoPeso(product.precio)} 
                                <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}> / {product.unidad}</span>
                            </h2>

                            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                                {product.descripcion}
                            </p>

                            <div className="mb-4 text-muted small">
                                <p className="mb-1"><GeoAlt className="me-2 text-success" /> Origen: <strong>{product.origen}</strong></p>
                                <p><Truck className="me-2 text-success" /> Despacho disponible en 24h</p>
                            </div>

                            {/* Selector de Cantidad y Agregar */}
                            <div className="d-flex align-items-center mb-4">
                                <Form.Control 
                                    type="number" 
                                    min="1" 
                                    max={product.stock}
                                    value={cantidad}
                                    onChange={(e) => setCantidad(parseInt(e.target.value))}
                                    style={{ width: '80px', marginRight: '15px', borderColor: '#2E8B57' }}
                                    disabled={product.stock <= 0}
                                />
                                <Button 
                                    size="lg"
                                    style={{ backgroundColor: '#2E8B57', borderColor: '#2E8B57' }}
                                    disabled={product.stock <= 0}
                                    className="flex-grow-1"
                                >
                                    {product.stock > 0 ? (
                                        <>
                                            <CartPlus className="me-2" /> Agregar al Carrito
                                        </>
                                    ) : (
                                        'Agotado'
                                    )}
                                </Button>
                            </div>
                            
                            <small className="text-muted">Stock disponible: {product.stock} {product.unidad}</small>
                        </div>
                    </Col>
                </Row>

                <hr className="my-5" />

                {/* --- SECCIÓN RESEÑAS (ESPACIO PARA DESARROLLO FUTURO) --- */}
                <Row>
                    <Col lg={4} className="mb-4">
                        <div className="p-4 rounded" style={{ backgroundColor: '#F7F7F7' }}>
                            <h4 style={{ fontFamily: 'Playfair Display', color: '#8B4513' }}>Opiniones de Clientes</h4>
                            
                            <div className="text-center my-4">
                                <h1 style={{ fontSize: '4rem', color: '#2E8B57', fontWeight: 'bold', marginBottom: 0 }}>
                                    {mockStats.promedio}
                                </h1>
                                <div className="mb-2">
                                    {renderStars(Math.round(mockStats.promedio))}
                                </div>
                                <p className="text-muted">Basado en {mockStats.totalResenas} reseñas</p>
                            </div>

                            {/* Barras de progreso simuladas */}
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="d-flex align-items-center mb-2">
                                    <span className="me-2 small text-muted">{star} <StarFill className="text-warning mb-1" style={{fontSize: '10px'}}/></span>
                                    <ProgressBar 
                                        now={star === 5 ? 70 : star === 4 ? 20 : 5} 
                                        variant="success" 
                                        style={{ height: '6px', flexGrow: 1 }} 
                                    />
                                </div>
                            ))}
                        </div>
                    </Col>

                    <Col lg={8}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 style={{ fontFamily: 'Playfair Display', color: '#333' }}>Reseñas ({mockStats.totalResenas})</h4>
                            
                            {isAuthenticated ? (
                                <Button style={{ backgroundColor: '#FFD700', border: 'none', color: '#000', fontWeight: 'bold' }}>
                                    Escribir una reseña
                                </Button>
                            ) : (
                                <small className="text-muted">Inicia sesión para opinar</small>
                            )}
                        </div>

                        {/* --- LISTA DE RESEÑAS (MOCKUP) --- */}
                        <div className="review-list">
                            {mockReviews.map((review) => (
                                <div key={review.id} className="mb-4 pb-4 border-bottom">
                                    <div className="d-flex justify-content-between mb-2">
                                        <h6 className="fw-bold mb-0">{review.usuario}</h6>
                                        <small className="text-muted">{review.fecha}</small>
                                    </div>
                                    <div className="mb-2">
                                        {renderStars(review.calificacion)}
                                    </div>
                                    <p className="text-muted mb-0">{review.comentario}</p>
                                </div>
                            ))}
                            
                            {/* Aquí iría la lógica de paginación o "Ver más" */}
                        </div>

                        {/* TODO: INTEGRACIÓN FUTURA CON MICROSERVICIO RESEÑAS
                            1. Crear componente ReviewForm que use POST /api/resenas/registrar
                            2. Reemplazar mockReviews con datos de GET /api/resenas/{sku}
                            3. Reemplazar mockStats con datos de GET /api/resenas/{sku}/estadisticas
                        */}
                    </Col>
                </Row>

            </Container>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;