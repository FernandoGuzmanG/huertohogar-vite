import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { Trash, Plus, Dash, ArrowLeft, BagCheck, PencilSquare, Check, X } from 'react-bootstrap-icons'; // Nuevos iconos
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { cartService } from '../services/cartService';
import type { Carrito, ItemCarrito } from '../types/cart';
import { useCart } from '../hooks/useCart';

// --- SUB-COMPONENTE: CART ITEM ---
interface CartItemProps {
    item: ItemCarrito;
    updatingSku: string | null;
    onUpdateQuantity: (sku: string, cantidad: number) => void;
    onRemove: (sku: string) => void;
    formatoPeso: (val: number) => string;
}

const CartItem: React.FC<CartItemProps> = ({ item, updatingSku, onUpdateQuantity, onRemove, formatoPeso }) => {
    // Estado para saber si estamos en modo edición manual
    const [isEditing, setIsEditing] = useState(false);
    // Estado para el valor del input mientras se escribe
    const [tempQuantity, setTempQuantity] = useState<string>("");

    const isUpdating = updatingSku === item.sku;

    // Al hacer clic en el lápiz
    const handleStartEdit = () => {
        setTempQuantity(String(item.cantidad)); // Cargamos el valor actual
        setIsEditing(true);
    };

    // Al cancelar la edición
    const handleCancelEdit = () => {
        setIsEditing(false);
        setTempQuantity("");
    };

    // Al confirmar (Botón Check o Enter)
    const handleConfirmEdit = () => {
        const nuevaCantidad = parseInt(tempQuantity, 10);
        
        // Validamos que sea número y mayor a 0
        if (!isNaN(nuevaCantidad) && nuevaCantidad > 0 && nuevaCantidad !== item.cantidad) {
            onUpdateQuantity(item.sku, nuevaCantidad);
            setIsEditing(false);
        } else {
            // Si es inválido o igual, solo cerramos la edición
            handleCancelEdit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Permitir solo números
        if (/^\d*$/.test(val)) {
            setTempQuantity(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleConfirmEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <Card className="mb-3 border-0 shadow-sm">
            <Card.Body>
                <Row className="align-items-center">
                    {/* Imagen */}
                    <Col md={2} xs={3}>
                        <div style={{ height: '80px', width: '80px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                            {item.urlImagen ? (
                                <Image src={item.urlImagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span className="small text-muted d-flex align-items-center justify-content-center h-100">Sin img</span>
                            )}
                        </div>
                    </Col>

                    {/* Info Producto */}
                    <Col md={4} xs={9}>
                        <h5 style={{ fontWeight: 'bold', color: '#333' }}>{item.nombreProducto}</h5>
                        <p className="text-muted small mb-0">
                            {formatoPeso(item.precioUnitarioActual)} / {item.unidadMedida}
                        </p>
                    </Col>

                    {/* LÓGICA DE CANTIDAD (VISUALIZACIÓN vs EDICIÓN) */}
                    <Col md={3} xs={12} className="mt-3 mt-md-0">
                        {isEditing ? (
                            // --- VISTA DE EDICIÓN ---
                            <InputGroup size="sm" style={{ width: '150px' }}>
                                <Form.Control
                                    autoFocus
                                    type="text"
                                    value={tempQuantity}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    style={{ 
                                        textAlign: 'center',
                                        position: 'relative',
                                        zIndex: 5
                                    }}
                                />
                                <Button variant="success" onClick={handleConfirmEdit} title="Guardar">
                                    <Check />
                                </Button>
                                <Button variant="outline-secondary" onClick={handleCancelEdit} title="Cancelar">
                                    <X />
                                </Button>
                            </InputGroup>
                        ) : (
                            // --- VISTA NORMAL (+ y -) ---
                            <div className="d-flex align-items-center">
                                <div className="d-flex align-items-center border rounded px-2 py-1 me-2">
                                    <Button 
                                        variant="link" 
                                        className="p-0 text-success"
                                        disabled={item.cantidad <= 1 || isUpdating}
                                        onClick={() => onUpdateQuantity(item.sku, item.cantidad - 1)}
                                    >
                                        <Dash size={20}/>
                                    </Button>
                                    
                                    <span className="mx-3 fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>
                                        {item.cantidad}
                                    </span>
                                    
                                    <Button 
                                        variant="link" 
                                        className="p-0 text-success"
                                        disabled={isUpdating}
                                        onClick={() => onUpdateQuantity(item.sku, item.cantidad + 1)}
                                    >
                                        <Plus size={20}/>
                                    </Button>
                                </div>

                                {/* Botón para activar edición manual */}
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    className="text-muted"
                                    onClick={handleStartEdit}
                                    disabled={isUpdating}
                                    title="Editar cantidad manualmente"
                                >
                                    <PencilSquare />
                                </Button>
                                {isUpdating && <Spinner animation="border" size="sm" className="ms-2 text-success" />}
                            </div>
                        )}
                    </Col>

                    {/* Subtotal Item y Borrar */}
                    <Col md={3} xs={12} className="text-end mt-3 mt-md-0">
                        <h5 style={{ color: '#2E8B57', fontWeight: 'bold' }}>
                            {formatoPeso(item.montoTotal)}
                        </h5>
                        <Button 
                            variant="link" 
                            className="text-danger p-0 text-decoration-none small"
                            onClick={() => onRemove(item.sku)}
                            disabled={isUpdating || isEditing}
                        >
                            <Trash className="me-1"/> Eliminar
                        </Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};


// --- COMPONENTE PRINCIPAL: PÁGINA DEL CARRITO (Igual que antes) ---
const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    
    const [carrito, setCarrito] = useState<Carrito | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [updatingSku, setUpdatingSku] = useState<string | null>(null);

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
            const msg = error instanceof Error ? error.message : "Error al actualizar";
            setErrorMsg(msg);
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
            console.error(error);
            setErrorMsg("No se pudo eliminar el producto.");
        } finally {
            setUpdatingSku(null);
        }
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

                {!carrito || carrito.items.length === 0 ? (
                    <div className="text-center py-5">
                        <h4>Tu carrito está vacío 😔</h4>
                        <Button variant="link" onClick={() => navigate('/productos')} className="mt-3">
                            Ir a comprar productos frescos
                        </Button>
                    </div>
                ) : (
                    <Row>
                        <Col lg={8}>
                            {carrito.items.map((item) => (
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
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Subtotal</span>
                                        <span>{formatoPeso(carrito.subtotalGlobal)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span>Despacho</span>
                                        <span className="text-success fw-bold">Gratis</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <h3 style={{ fontWeight: 'bold' }}>Total</h3>
                                        <h3 style={{ color: '#2E8B57', fontWeight: 'bold' }}>{formatoPeso(carrito.subtotalGlobal)}</h3>
                                    </div>

                                    <div className="d-grid">
                                        <Button 
                                            size="lg" 
                                            style={{ backgroundColor: '#2E8B57', borderColor: '#2E8B57' }}
                                        >
                                            <BagCheck className="me-2" /> Ir a Pagar
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>

            <Footer />
        </div>
    );
};

export default CartPage;