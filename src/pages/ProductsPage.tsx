import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { Search, CartPlus, GeoAlt, XCircle } from 'react-bootstrap-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { productService } from '../services/productService';
import type { Producto } from '../types/product';

const ProductsPage: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

    const categorias = [
        { id: 1, nombre: 'Frutas Frescas' },
        { id: 2, nombre: 'Verduras Orgánicas' },
        { id: 3, nombre: 'Productos Orgánicos' },
        { id: 4, nombre: 'Productos Lácteos' }
    ];

    // --- FUNCIÓN DE CARGA CENTRALIZADA ---
    const fetchProducts = useCallback(async (searchParams: { nombre?: string, idCategoria?: number }) => {
        setLoading(true);
        try {
            // Si no hay filtros, trae todos. Si hay, busca dinámicamente.
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

    // --- EFECTO: BÚSQUEDA EN TIEMPO REAL (DEBOUNCE) ---
    useEffect(() => {
        // 1. Configuramos un temporizador (Timer)
        const timeoutId = setTimeout(() => {
            
            // Preparamos los parámetros
            const nombre = busqueda.trim() || undefined;
            const idCat = categoriaSeleccionada ? Number(categoriaSeleccionada) : undefined;

            // Llamamos a la API
            fetchProducts({ nombre, idCategoria: idCat });

        }, 500); // 2. Esperamos 500ms después de que el usuario deje de tocar nada

        // 3. Función de limpieza: Si el usuario escribe antes de los 500ms,
        // cancelamos el timer anterior y creamos uno nuevo.
        return () => clearTimeout(timeoutId);

    }, [busqueda, categoriaSeleccionada, fetchProducts]); // Se ejecuta cuando cambia texto o categoría


    // Función para limpiar filtros manualmente
    const clearFilters = () => {
        setBusqueda('');
        setCategoriaSeleccionada('');
        // No necesitamos llamar a fetchProducts aquí, porque al limpiar los estados,
        // el useEffect de arriba detectará el cambio y recargará todo automáticamente.
    };

    const formatoPeso = (valor: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header cartItemCount={0} />

            <Container className="my-5 flex-grow-1">
                <div className="mb-5 text-center">
                    <h2 style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>
                        Nuestros Productos
                    </h2>
                    <p className="text-muted">Lo mejor del campo, seleccionado para ti.</p>
                </div>

                <Row className="justify-content-center mb-5">
                    <Col lg={8} md={10}>
                        {/* Quitamos onSubmit porque ya es automático */}
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
                                    {/* Botón de limpiar solo si hay filtros activos */}
                                    {(busqueda || categoriaSeleccionada) ? (
                                        <Button 
                                            variant="outline-danger"
                                            onClick={clearFilters}
                                            className="w-100"
                                        >
                                            <XCircle className="me-2"/> Limpiar
                                        </Button>
                                    ) : (
                                        // Espaciador visual o botón desactivado si prefieres
                                        <div className="w-100"></div> 
                                    )}
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>

                {/* --- LISTADO --- */}
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

                                                {/* Contenedor de Botones: Flexbox para ponerlos uno al lado del otro */}
                                                <div className="d-flex gap-2">
                                                    
                                                    {/* BOTÓN 1: VER DETALLES */}
                                                    {/* Redirige a la página de detalle usando el ID */}
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

                                                    {/* BOTÓN 2: AGREGAR AL CARRITO (Tu botón original conservando estilos) */}
                                                    <Button 
                                                        variant="outline-success" 
                                                        className="flex-grow-1"
                                                        disabled={prod.stock <= 0}
                                                        style={{ 
                                                            fontWeight: 'bold', 
                                                            borderColor: '#2E8B57', 
                                                            color: prod.stock > 0 ? '#2E8B57' : 'grey' 
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if(prod.stock > 0) {
                                                                e.currentTarget.style.backgroundColor = '#2E8B57';
                                                                e.currentTarget.style.color = 'white';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if(prod.stock > 0) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.color = '#2E8B57';
                                                            }
                                                        }}
                                                    >
                                                        {prod.stock > 0 ? (
                                                            <>
                                                                <CartPlus className="me-1" /> Agregar
                                                            </>
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

            <Footer />
        </div>
    );
};

export default ProductsPage;