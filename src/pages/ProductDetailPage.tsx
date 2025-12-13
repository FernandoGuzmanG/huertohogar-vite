import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Image, Button, Badge, Form, Spinner, Modal, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { CartPlus, StarFill, Star, ArrowLeft, GeoAlt, Truck, PencilSquare, CheckCircle } from 'react-bootstrap-icons'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

// Servicios y Tipos
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { cartService } from '../services/cartService'; 
import type { Producto } from '../types/product';
import type { Resena, ResenaEstadisticasDTO } from '../types/review';
import { useAuth } from '../hooks/useAuth';
import LoginToast from '../components/LoginToast'; 

// --- IMPORTANTE: Importamos el hook del carrito para actualizar el Header ---
import { useCart } from '../hooks/useCart'; 

const ProductDetailPage: React.FC = () => {
    const { sku } = useParams<{ sku: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    // Obtenemos la función para refrescar el contador del Header
    const { refreshCart } = useCart(); 

    // Estado del Producto
    const [product, setProduct] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);

    // Estados de Reseñas
    const [reviews, setReviews] = useState<Resena[]>([]);
    const [stats, setStats] = useState<ResenaEstadisticasDTO>({ skuProducto: '', promedioCalificacion: 0, totalResenas: 0 });
    
    // Estados para el Formulario de Reseña
    const [showModal, setShowModal] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    // Estados para el Carrito
    const [addingToCart, setAddingToCart] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const [showLoginAlert, setShowLoginAlert] = useState(false);

    // --- CARGA DE DATOS ---
    const fetchAllData = useCallback(async () => {
        if (!sku) return;
        setLoading(true);
        try {
            const productData = await productService.obtenerPorSku(sku);
            setProduct(productData);

            const [reviewsData, statsData] = await Promise.all([
                reviewService.obtenerResenas(sku),
                reviewService.obtenerEstadisticas(sku)
            ]);

            setReviews(reviewsData);
            setStats(statsData);

        } catch (error) {
            console.error("Error cargando datos", error);
        } finally {
            setLoading(false);
        }
    }, [sku]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- LÓGICA AGREGAR AL CARRITO ---
    const handleAddToCart = async () => {
        if (!sku) return;
        
        // 1. Validar autenticación
        if (!isAuthenticated) {
            setShowLoginAlert(true); // Mostrar alerta personalizada
            return;
        }

        setAddingToCart(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            // 2. Agregar al Backend
            await cartService.agregarItem(sku, cantidad);
            
            // 3. ¡ACTUALIZAR EL HEADER GLOBAL!
            await refreshCart(); 

            setActionSuccess(`¡Agregaste ${cantidad} unidad(es) al carrito!`);
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setActionSuccess(null), 3000);

        } catch (error) {
            // Manejar error (incluyendo Stock insuficiente 409)
            const msg = error instanceof Error ? error.message : "Error al agregar al carrito";
            setActionError(msg);
        } finally {
            setAddingToCart(false);
        }
    };

    // --- MANEJO DE NUEVA RESEÑA ---
    const handleSubmitReview = async () => {
        if (!sku) return;
        setSubmittingReview(true);
        setReviewError(null);

        try {
            await reviewService.registrarResena({
                skuProducto: sku,
                calificacion: newRating,
                comentario: newComment
            });
            
            setShowModal(false);
            setNewComment('');
            setNewRating(5);
            
            const [reviewsData, statsData] = await Promise.all([
                reviewService.obtenerResenas(sku),
                reviewService.obtenerEstadisticas(sku)
            ]);
            setReviews(reviewsData);
            setStats(statsData);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al enviar reseña.';
            setReviewError(message);
        } finally {
            setSubmittingReview(false);
        }
    };

    // --- UTILIDADES ---
    const formatoPeso = (valor: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-CL');
    };

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
            {/* Header sin props, se conecta solo al contexto */}
            <Header />

            <Container className="my-5 flex-grow-1">
                {/* Alertas de Carrito */}
                {actionError && <Alert variant="danger" onClose={() => setActionError(null)} dismissible>{actionError}</Alert>}
                {actionSuccess && <Alert variant="success" onClose={() => setActionSuccess(null)} dismissible><CheckCircle className="me-2"/>{actionSuccess}</Alert>}

                <LoginToast 
                    show={showLoginAlert} 
                    onClose={() => setShowLoginAlert(false)} 
                    message="Inicia sesión para agregar este producto."
                />
                
                <Button 
                    variant="link" 
                    className="mb-4 text-decoration-none" 
                    style={{ color: '#2E8B57' }}
                    onClick={() => navigate('/productos')}
                >
                    <ArrowLeft className="me-2" /> Volver al catálogo
                </Button>

                {/* --- DETALLE DEL PRODUCTO --- */}
                <Row className="mb-5">
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
                                    {renderStars(Math.round(stats.promedioCalificacion || 0))}
                                </div>
                                <span className="text-muted small">({stats.totalResenas} opiniones)</span>
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
                                    // Deshabilitar si no hay stock o si se está agregando
                                    disabled={product.stock <= 0 || addingToCart}
                                    className="flex-grow-1"
                                    onClick={handleAddToCart} 
                                >
                                    {/* Lógica Visual del Botón */}
                                    {product.stock <= 0 ? (
                                        'Agotado'
                                    ) : addingToCart ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                            Agregando...
                                        </>
                                    ) : (
                                        <>
                                            <CartPlus className="me-2" /> Agregar al Carrito
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <hr className="my-5" />
                
                {/* --- SECCIÓN RESEÑAS --- */}
                <Row>
                    <Col lg={4} className="mb-4">
                        <div className="p-4 rounded" style={{ backgroundColor: '#F7F7F7' }}>
                            <h4 style={{ fontFamily: 'Playfair Display', color: '#8B4513' }}>Opiniones de Clientes</h4>
                            
                            <div className="text-center my-4">
                                <h1 style={{ fontSize: '4rem', color: '#2E8B57', fontWeight: 'bold', marginBottom: 0 }}>
                                    {stats.promedioCalificacion ? stats.promedioCalificacion.toFixed(1) : '0.0'}
                                </h1>
                                <div className="mb-2">
                                    {renderStars(Math.round(stats.promedioCalificacion || 0))}
                                </div>
                                <p className="text-muted">Basado en {stats.totalResenas} reseñas</p>
                            </div>
                        </div>
                    </Col>

                    <Col lg={8}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 style={{ fontFamily: 'Playfair Display', color: '#333' }}>Reseñas ({stats.totalResenas})</h4>
                            
                            {isAuthenticated ? (
                                <Button 
                                    style={{ backgroundColor: '#FFD700', border: 'none', color: '#000', fontWeight: 'bold' }}
                                    onClick={() => setShowModal(true)}
                                >
                                    <PencilSquare className="me-2"/> Escribir una reseña
                                </Button>
                            ) : (
                                <small className="text-muted border p-2 rounded">
                                    <a href="/login" style={{color: '#2E8B57', fontWeight: 'bold'}}>Inicia sesión</a> para opinar
                                </small>
                            )}
                        </div>

                        <div className="review-list">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="mb-4 pb-4 border-bottom">
                                        <div className="d-flex justify-content-between mb-2">
                                            <h6 className="fw-bold mb-0">{review.nombreUsuario}</h6>
                                            <small className="text-muted">{formatDate(review.fechaCreacion)}</small>
                                        </div>
                                        <div className="mb-2">
                                            {renderStars(review.calificacion)}
                                        </div>
                                        <p className="text-muted mb-0">{review.comentario}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center py-4">Aún no hay reseñas para este producto. ¡Sé el primero!</p>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* --- MODAL PARA ESCRIBIR RESEÑA --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="card-header-custom">
                    <Modal.Title style={{fontFamily: 'Playfair Display'}}>Escribir Reseña</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                    
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Calificación</Form.Label>
                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarFill 
                                        key={star} 
                                        size={24} 
                                        className={star <= newRating ? "text-warning" : "text-muted"} 
                                        style={{cursor: 'pointer'}}
                                        onClick={() => setNewRating(star)}
                                    />
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Tu Opinión</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="Cuéntanos qué te pareció el producto..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        style={{ backgroundColor: '#2E8B57', border: 'none' }}
                        onClick={handleSubmitReview}
                        disabled={submittingReview || !newComment.trim()}
                    >
                        {submittingReview ? 'Enviando...' : 'Publicar Reseña'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;