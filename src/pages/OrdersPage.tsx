import React, { useEffect, useState } from 'react';
import { Container, Accordion, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { BoxSeam, CalendarDate, GeoAlt, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { orderService } from '../services/orderService';
import type { PedidoResponse } from '../types/order';

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        try {
            const data = await orderService.obtenerPedidos();
            const pedidosOrdenados = data.sort((a, b) => 
                new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
            );
            setPedidos(pedidosOrdenados);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar tu historial de pedidos. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Helper para formatear precio
    const formatoPeso = (valor: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);
    };

    // Helper para formatear fecha (Ej: 13/12/2025 21:11)
    const formatoFecha = (fechaIso: string) => {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString('es-CL', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    // Helper para color del Badge según estado
    const getBadgeVariant = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE': return 'warning';
            case 'CONFIRMADO': return 'info';
            case 'ENVIADO': return 'primary';
            case 'ENTREGADO': return 'success';
            case 'CANCELADO': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column min-vh-100">
                <Header />
                <Container className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Spinner animation="border" variant="success" />
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Header />

            <Container className="my-5 flex-grow-1">
                <div className="d-flex align-items-center mb-4">
                    <Button variant="link" className="text-decoration-none text-secondary p-0 me-3" onClick={() => navigate('/')}>
                        <ArrowLeft size={24} />
                    </Button>
                    <h2 style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold', margin: 0 }}>
                        Mis Pedidos
                    </h2>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && pedidos.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <BoxSeam size={50} className="text-muted mb-3" />
                        <h4>Aún no has realizado pedidos</h4>
                        <p className="text-muted">¡Llena tu despensa con nuestros productos frescos!</p>
                        <Button variant="success" onClick={() => navigate('/productos')}>
                            Ir a la Tienda
                        </Button>
                    </div>
                ) : (
                    <Accordion defaultActiveKey="0" className="shadow-sm">
                        {pedidos.map((pedido) => (
                            <Accordion.Item eventKey={pedido.id.toString()} key={pedido.id} className="mb-3 border rounded overflow-hidden">
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between w-100 align-items-center me-3 flex-wrap">
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-dark">Pedido #{pedido.id}</span>
                                            <small className="text-muted">
                                                <CalendarDate className="me-1"/> {formatoFecha(pedido.fechaCreacion)}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
                                            <Badge bg={getBadgeVariant(pedido.estado)} className="text-uppercase px-3 py-2">
                                                {pedido.estado}
                                            </Badge>
                                            <span className="fw-bold text-success fs-5">
                                                {formatoPeso(pedido.total)}
                                            </span>
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body className="bg-white">
                                    {/* Dirección de Envío */}
                                    <div className="mb-3 p-3 bg-light rounded border-start border-4 border-success">
                                        <h6 className="fw-bold mb-1" style={{ color: '#2E8B57' }}>
                                            <GeoAlt className="me-2" /> Dirección de Envío
                                        </h6>
                                        <p className="mb-0 ms-4 text-muted">{pedido.direccionEnvio}</p>
                                    </div>

                                    {/* Tabla de Productos */}
                                    <h6 className="fw-bold mb-3">Detalle de Productos</h6>
                                    <div className="table-responsive">
                                        <Table hover size="sm" className="align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Producto</th>
                                                    <th className="text-center">Cant.</th>
                                                    <th className="text-end">Precio U.</th>
                                                    <th className="text-end">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pedido.items && pedido.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <span className="fw-semibold">{item.nombreProducto}</span>
                                                            <br />
                                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>SKU: {item.skuProducto}</small>
                                                        </td>
                                                        <td className="text-center">{item.cantidad}</td>
                                                        <td className="text-end">{formatoPeso(item.precioUnitario)}</td>
                                                        <td className="text-end fw-bold">{formatoPeso(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="table-light border-top">
                                                <tr>
                                                    <td colSpan={3} className="text-end fw-bold text-muted">Total Pagado:</td>
                                                    <td className="text-end fw-bold fs-5 text-success">{formatoPeso(pedido.total)}</td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                )}
            </Container>

            <Footer />
        </div>
    );
};

export default OrdersPage;