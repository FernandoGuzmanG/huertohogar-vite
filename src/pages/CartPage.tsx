import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner, Form, InputGroup, Modal } from 'react-bootstrap';
import { Trash, Plus, Dash, ArrowLeft, BagCheck, PencilSquare, Check, X, BoxSeam, GeoAlt } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService'; // <--- IMPORTAMOS userService
import type { Carrito, ItemCarrito } from '../types/cart';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth'; // <--- IMPORTAMOS useAuth

// --- SUB-COMPONENTE: CART ITEM ---
interface CartItemProps {
    item: ItemCarrito;
    updatingSku: string | null;
    onUpdateQuantity: (sku: string, cantidad: number) => void;
    onRemove: (sku: string) => void;
    formatoPeso: (val: number) => string;
}

const CartItem: React.FC<CartItemProps> = ({ item, updatingSku, onUpdateQuantity, onRemove, formatoPeso }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempQuantity, setTempQuantity] = useState<string>("");
    const isUpdating = updatingSku === item.sku;

    const handleStartEdit = () => {
        setTempQuantity(String(item.cantidad));
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setTempQuantity("");
    };

    const handleConfirmEdit = () => {
        const nuevaCantidad = parseInt(tempQuantity, 10);
        if (!isNaN(nuevaCantidad) && nuevaCantidad > 0 && nuevaCantidad !== item.cantidad) {
            onUpdateQuantity(item.sku, nuevaCantidad);
            setIsEditing(false);
        } else {
            handleCancelEdit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) setTempQuantity(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleConfirmEdit();
        else if (e.key === 'Escape') handleCancelEdit();
    };

    return (
        <Card className="mb-3 border-0 shadow-sm">
            <Card.Body>
                <Row className="align-items-center">
                    <Col md={2} xs={3}>
                        <div style={{ height: '80px', width: '80px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                            {item.imagen ? (
                                <Image src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span className="small text-muted d-flex align-items-center justify-content-center h-100">Sin img</span>
                            )}
                        </div>
                    </Col>
                    <Col md={4} xs={9}>
                        <h5 style={{ fontWeight: 'bold', color: '#333' }}>{item.nombreProducto}</h5>
                        <p className="text-muted small mb-0">
                            {formatoPeso(item.precioUnitarioActual)} / {item.unidad}
                        </p>
                    </Col>
                    <Col md={3} xs={12} className="mt-3 mt-md-0">
                        {isEditing ? (
                            <InputGroup size="sm" style={{ width: '150px' }}>
                                <Form.Control
                                    autoFocus
                                    type="text"
                                    value={tempQuantity}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    style={{ textAlign: 'center', position: 'relative', zIndex: 5 }}
                                />
                                <Button variant="success" onClick={handleConfirmEdit} title="Guardar"><Check /></Button>
                                <Button variant="outline-secondary" onClick={handleCancelEdit} title="Cancelar"><X /></Button>
                            </InputGroup>
                        ) : (
                            <div className="d-flex align-items-center">
                                <div className="d-flex align-items-center border rounded px-2 py-1 me-2">
                                    <Button variant="link" className="p-0 text-success" disabled={item.cantidad <= 1 || isUpdating} onClick={() => onUpdateQuantity(item.sku, item.cantidad - 1)}>
                                        <Dash size={20}/>
                                    </Button>
                                    <span className="mx-3 fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                                    <Button variant="link" className="p-0 text-success" disabled={isUpdating} onClick={() => onUpdateQuantity(item.sku, item.cantidad + 1)}>
                                        <Plus size={20}/>
                                    </Button>
                                </div>
                                <Button variant="light" size="sm" className="text-muted" onClick={handleStartEdit} disabled={isUpdating} title="Editar cantidad manualmente">
                                    <PencilSquare />
                                </Button>
                                {isUpdating && <Spinner animation="border" size="sm" className="ms-2 text-success" />}
                            </div>
                        )}
                    </Col>
                    <Col md={3} xs={12} className="text-end mt-3 mt-md-0">
                        <h5 style={{ color: '#2E8B57', fontWeight: 'bold' }}>{formatoPeso(item.montoTotal)}</h5>
                        <Button variant="link" className="text-danger p-0 text-decoration-none small" onClick={() => onRemove(item.sku)} disabled={isUpdating || isEditing}>
                            <Trash className="me-1"/> Eliminar
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

// --- COMPONENTE PRINCIPAL: PÁGINA DEL CARRITO ---
const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const { isAuthenticated } = useAuth(); // <--- Obtenemos estado de autenticación
    
    const [carrito, setCarrito] = useState<Carrito | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [updatingSku, setUpdatingSku] = useState<string | null>(null);

    // --- ESTADOS DE CHECKOUT ---
    const [direccion, setDireccion] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);

    // 1. Cargar Carrito
    const cargarCarrito = async () => {
        setLoading(true);
        try {
            const data = await cartService.obtenerCarrito();
            setCarrito(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCarrito();
    }, []);

    // 2. Pre-cargar Dirección del Usuario
    useEffect(() => {
        if (isAuthenticated) {
            const fetchAddress = async () => {
                try {
                    const profile = await userService.obtenerPerfil();
                    if (profile.direccionEntrega) {
                        setDireccion(profile.direccionEntrega);
                    }
                } catch (error) {
                    console.error("No se pudo cargar la dirección predeterminada", error);
                    // No bloqueamos la UI ni mostramos error al usuario, 
                    // simplemente el campo quedará vacío para que lo llenen manualmente.
                }
            };
            fetchAddress();
        }
    }, [isAuthenticated]); // Se ejecuta cuando el usuario se loguea/entra

    const handleUpdateQuantity = async (sku: string, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return;
        setUpdatingSku(sku);
        setErrorMsg(null);
        try {
            await cartService.modificarCantidad(sku, nuevaCantidad);
            await refreshCart(); 
            const data = await cartService.obtenerCarrito();
            setCarrito(data);
        } catch (error) {
            setErrorMsg(error instanceof Error ? error.message : "Error al actualizar");
            cargarCarrito();
        } finally {
            setUpdatingSku(null);
        }
    };

    const handleRemoveItem = async (sku: string) => {
        if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
        setUpdatingSku(sku);
        try {
            await cartService.eliminarItem(sku);
            await refreshCart();
            const data = await cartService.obtenerCarrito();
            setCarrito(data);
        } catch (error) {
            console.log(error)
            setErrorMsg("No se pudo eliminar el producto.");
        } finally {
            setUpdatingSku(null);
        }
    };

    // --- CHECKOUT ---
    const handleCheckout = async () => {
        if (!carrito) return;

        if (!direccion.trim()) {
            setErrorMsg("Por favor, ingresa una dirección de envío.");
            return;
        }

        setIsProcessing(true);
        setErrorMsg(null);

        try {
            const pedidoCreado = await orderService.crearPedido(direccion);

            setOrderId(pedidoCreado.id);
            setShowModal(true);
            
            await refreshCart();
            setCarrito(null);
            setDireccion("");
            
        } catch (error) {
            console.error("Error checkout:", error);
            const err = error as { response?: { data?: { message?: string } } };
            const backendMsg = err.response?.data?.message || "Hubo un error al procesar tu pedido. Intenta nuevamente.";
            setErrorMsg(backendMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/'); 
    };

    const formatoPeso = (valor: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    if (loading && !carrito) {
        return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <Container className="my-5 flex-grow-1">
                <h2 className="mb-4" style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>
                    Tu Carrito de Compras
                </h2>

                {errorMsg && (
                    <Alert variant="danger" onClose={() => setErrorMsg(null)} dismissible>
                        {errorMsg}
                    </Alert>
                )}

                {(!carrito || carrito.items.length === 0) && !orderId ? (
                    <div className="text-center py-5">
                        <h4>Tu carrito está vacío 😔</h4>
                        <Button variant="link" onClick={() => navigate('/productos')} className="mt-3">
                            Ir a comprar productos frescos
                        </Button>
                    </div>
                ) : (
                    <Row>
                        <Col lg={8}>
                            {carrito && carrito.items.map((item) => (
                                <CartItem 
                                    key={item.sku}
                                    item={item}
                                    updatingSku={updatingSku}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                    formatoPeso={formatoPeso}
                                />
                            ))}
                            <Button variant="outline-secondary" onClick={() => navigate('/productos')}>
                                <ArrowLeft className="me-2"/> Seguir Comprando
                            </Button>
                        </Col>

                        <Col lg={4} className="mt-4 mt-lg-0">
                            <Card className="border-0 shadow p-3" style={{ backgroundColor: '#F9F9F9' }}>
                                <Card.Body>
                                    <h4 className="mb-4" style={{ fontFamily: 'Playfair Display' }}>Resumen</h4>
                                    
                                    {/* INPUT DIRECCIÓN */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted small"><GeoAlt className="me-1"/> Dirección de Envío</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Ej: Av. Siempreviva 742" 
                                            value={direccion}
                                            onChange={(e) => setDireccion(e.target.value)}
                                            disabled={isProcessing}
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span>{carrito ? formatoPeso(carrito.subtotalGlobal) : '$0'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span>Despacho</span>
                                        <span className="text-success fw-bold">Gratis</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <h3 style={{ fontWeight: 'bold' }}>Total</h3>
                                        <h3 style={{ color: '#2E8B57', fontWeight: 'bold' }}>
                                            {carrito ? formatoPeso(carrito.subtotalGlobal) : '$0'}
                                        </h3>
                                    </div>

                                    <div className="d-grid">
                                        <Button 
                                            size="lg" 
                                            style={{ backgroundColor: '#2E8B57', borderColor: '#2E8B57' }}
                                            onClick={handleCheckout}
                                            disabled={isProcessing || !carrito || carrito.items.length === 0}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <BagCheck className="me-2" /> Ir a Pagar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>

            <Footer />

            {/* --- MODAL DE ÉXITO --- */}
            <Modal show={showModal} onHide={() => {}} centered backdrop="static" keyboard={false}>
                <Modal.Body className="text-center p-5">
                    <div className="mb-4">
                        <BoxSeam size={60} color="#2E8B57" />
                    </div>
                    <h3 style={{ fontFamily: 'Playfair Display', color: '#2E8B57', fontWeight: 'bold' }}>
                        ¡Pedido Exitoso!
                    </h3>
                    <p className="lead mt-3">
                        Tu compra ha sido procesada correctamente.
                    </p>
                    {orderId && (
                        <Alert variant="success" className="d-inline-block px-4 py-2 mt-2">
                            <strong>N° de Pedido: {orderId}</strong>
                        </Alert>
                    )}
                    <p className="text-muted small mt-3">
                        Pronto podrás ver el detalle en tu historial de pedidos.
                    </p>
                    <div className="d-grid gap-2 mt-4">
                        <Button variant="success" size="lg" onClick={handleCloseModal}>
                            Volver al Inicio
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CartPage;