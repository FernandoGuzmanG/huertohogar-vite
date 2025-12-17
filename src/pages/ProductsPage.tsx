import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Badge, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { Search, CartPlus, GeoAlt, XCircle, CheckCircle } from 'react-bootstrap-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService'; 
import { useAuth } from '../hooks/useAuth'; 
import type { Producto } from '../types/product';
import LoginToast from '../components/LoginToast';
import { useCart } from '../hooks/useCart'; 

const ProductsPage: React.FC = () => {
    const { refreshCart } = useCart(); 
    const { isAuthenticated } = useAuth(); 

    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

    const [showLoginAlert, setShowLoginAlert] = useState(false);

    // --- ESTADOS PARA CARRITO ---
    const [addingId, setAddingId] = useState<string | null>(null); 
    const [globalError, setGlobalError] = useState<string | null>(null);
    
    // --- NUEVO: ESTADOS PARA EL TOAST FLOTANTE ---
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

    const categorias = [
        { id: 1, nombre: 'Frutas Frescas' },
        { id: 2, nombre: 'Verduras Orgánicas' },
        { id: 3, nombre: 'Productos Orgánicos' },
        { id: 4, nombre: 'Productos Lácteos' }
    ];

    const fetchProducts = useCallback(async (searchParams: { nombre?: string, idCategoria?: number }) => {
        setLoading(true);
        try {
            if (!searchParams.nombre && !searchParams.idCategoria) {
                const data = await productService.obtenerTodos();
                setProductos(data);
            } else {
                const data = await productService.buscarProductos(searchParams.nombre, searchParams.idCategoria);
                setProductos(data);
            }
        } catch (error) {
            console.error("Error buscando productos:", error);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const nombre = busqueda.trim() || undefined;
            const idCat = categoriaSeleccionada ? Number(categoriaSeleccionada) : undefined;
            fetchProducts({ nombre, idCategoria: idCat });
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [busqueda, categoriaSeleccionada, fetchProducts]);

    const clearFilters = () => {
        setBusqueda('');
        setCategoriaSeleccionada('');
    };

    // --- LÓGICA DE AGREGAR RÁPIDO AL CARRITO ---
    const handleAddToCart = async (sku: string) => {
        // 1. Validar Auth
        if (!isAuthenticated) {
            setShowLoginAlert(true);
            return;
        }

        setAddingId(sku); 
        setGlobalError(null);

        try {
            await cartService.agregarItem(sku, 1);
            await refreshCart();
            
            // --- NUEVO: MOSTRAR TOAST FLOTANTE ---
            setToastMessage('¡Producto agregado al carrito!');
            setToastVariant('success');
            setShowToast(true);
            
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Error al agregar";
            // Si hay error, mostramos toast rojo
            setToastMessage(msg);
            setToastVariant('danger');
            setShowToast(true);
        } finally {
            setAddingId(null);
        }
    };

    const formatoPeso = (valor: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <Container className="my-5 flex-grow-1">
                {/* ALERTAS GLOBALES (Mantenemos solo error global si es crítico, éxito ahora es Toast) */}
                {globalError && <Alert variant="danger" onClose={() => setGlobalError(null)} dismissible>{globalError}</Alert>}
                
                <LoginToast 
                    show={showLoginAlert} 
                    onClose={() => setShowLoginAlert(false)} 
                />

                <div className="mb-5 text-center">
                    <h2 style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>
                        Nuestros Productos
                    </h2>
                    <p className="text-muted">Lo mejor del campo, seleccionado para ti.</p>
                </div>

                <Row className="justify-content-center mb-5">
                    <Col lg={8} md={10}>
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <Row className="g-2">
                                <Col md={5}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ backgroundColor: 'white', borderRight: 'none', borderColor: '#2E8B57' }}>
                                            <Search color="#2E8B57"/>
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Buscar productos..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            style={{ borderLeft: 'none', borderColor: '#2E8B57' }}
                                        />
                                    </InputGroup>
                                </Col>
                                
                                <Col md={4}>
                                    <Form.Select 
                                        value={categoriaSeleccionada}
                                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                                        style={{ border: '1px solid #2E8B57' }}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col md={3}>
                                    {(busqueda || categoriaSeleccionada) ? (
                                        <Button 
                                            variant="outline-danger"
                                            onClick={clearFilters}
                                            className="w-100"
                                        >
                                            <XCircle className="me-2"/> Limpiar
                                        </Button>
                                    ) : (
                                        <div className="w-100"></div> 
                                    )}
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="success" />
                        <p className="mt-2 text-muted">Buscando...</p>
                    </div>
                ) : (
                    <Row className="g-4">
                        {productos.length > 0 ? (
                            productos.map((prod) => (
                                <Col key={prod.id} md={4} lg={3}>
                                    <Card className="h-100 shadow-sm border-0 product-card">
                                        <div style={{ 
                                            height: '200px', 
                                            backgroundColor: '#f8f9fa', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            {prod.imagen ? (
                                                <img 
                                                    src={prod.imagen} 
                                                    alt={prod.nombre} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <span className="text-muted">Sin Imagen</span>
                                            )}
                                            
                                            <Badge bg="warning" text="dark" 
                                                style={{ position: 'absolute', top: '10px', right: '10px', fontWeight: 'bold' }}>
                                                {prod.categoriaNombre}
                                            </Badge>
                                        </div>

                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title style={{ fontFamily: 'Playfair Display', fontWeight: 'bold' }}>
                                                {prod.nombre}
                                            </Card.Title>
                                            
                                            <div className="mb-2 text-muted small">
                                                <GeoAlt className="me-1"/> {prod.origen}
                                            </div>

                                            <Card.Text className="text-truncate" title={prod.descripcion}>
                                                {prod.descripcion}
                                            </Card.Text>

                                            <div className="mt-auto">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span style={{ fontSize: '1.2rem', color: '#2E8B57', fontWeight: 'bold' }}>
                                                        {formatoPeso(prod.precio)}
                                                    </span>
                                                    <small className="text-muted">
                                                        Por {prod.unidad}
                                                    </small>
                                                </div>

                                                <div className="d-flex gap-2">
                                                    {/* BOTÓN VER DETALLES */}
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        className="flex-grow-1"
                                                        href={`/producto/${prod.id}`}
                                                        style={{ 
                                                            fontWeight: 'bold', 
                                                            border: '1px solid #ddd', 
                                                            color: '#666' 
                                                        }}
                                                    >
                                                        Ver
                                                    </Button>

                                                    {/* BOTÓN AGREGAR CON LÓGICA */}
                                                    <Button 
                                                        variant="outline-success" 
                                                        className="flex-grow-1"
                                                        disabled={prod.stock <= 0 || addingId === prod.id}
                                                        onClick={() => handleAddToCart(prod.id)}
                                                        style={{ 
                                                            fontWeight: 'bold', 
                                                            borderColor: '#2E8B57', 
                                                            color: prod.stock > 0 ? '#2E8B57' : 'grey' 
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if(prod.stock > 0 && addingId !== prod.id) {
                                                                e.currentTarget.style.backgroundColor = '#2E8B57';
                                                                e.currentTarget.style.color = 'white';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if(prod.stock > 0 && addingId !== prod.id) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.color = '#2E8B57';
                                                            }
                                                        }}
                                                    >
                                                        {prod.stock > 0 ? (
                                                            addingId === prod.id ? (
                                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                            ) : (
                                                                <>
                                                                    <CartPlus className="me-1" /> Agregar
                                                                </>
                                                            )
                                                        ) : (
                                                            'Agotado'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col className="text-center py-5">
                                <h4>No encontramos productos con esos criterios :(</h4>
                                <Button variant="link" onClick={clearFilters}>
                                    Limpiar filtros
                                </Button>
                            </Col>
                        )}
                    </Row>
                )}
            </Container>

            {/* --- NUEVO: TOAST FLOTANTE ABAJO A LA DERECHA --- */}
            <ToastContainer className="p-3" position="bottom-end" style={{ zIndex: 9999, position: 'fixed' }}>
                <Toast 
                    onClose={() => setShowToast(false)} 
                    show={showToast} 
                    delay={3000} 
                    autohide 
                    bg={toastVariant}
                >
                    <Toast.Header closeButton={true}>
                        {toastVariant === 'success' ? <CheckCircle className="me-2 text-success"/> : <XCircle className="me-2 text-danger"/>}
                        <strong className="me-auto">{toastVariant === 'success' ? '¡Éxito!' : 'Atención'}</strong>
                        <small>Ahora</small>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Footer />
        </div>
    );
};

export default ProductsPage;