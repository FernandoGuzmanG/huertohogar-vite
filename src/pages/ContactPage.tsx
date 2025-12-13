import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Envelope, GeoAlt, Telephone, Send } from 'react-bootstrap-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { contactService } from '../services/contactService';
import type { ContactoRequestDTO } from '../types/contact';

const ContactPage: React.FC = () => {
    
    // Estados del formulario
    const [formData, setFormData] = useState<ContactoRequestDTO>({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        try {
            const respuesta = await contactService.enviarMensaje(formData);
            setSuccessMsg(respuesta); // "Mensaje de contacto registrado correctamente."
            // Limpiar formulario
            setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <Container className="my-5 flex-grow-1">
                <div className="text-center mb-5">
                    <h2 style={{ fontFamily: 'Playfair Display', color: '#8B4513', fontWeight: 'bold' }}>Contáctanos</h2>
                    <p className="text-muted">Estamos aquí para resolver tus dudas sobre nuestros productos.</p>
                </div>

                <Row className="justify-content-center">
                    {/* COLUMNA DE INFORMACIÓN */}
                    <Col md={5} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#2E8B57', color: 'white' }}>
                            <Card.Body className="p-5">
                                <h4 className="mb-4">Información de Contacto</h4>
                                
                                <div className="d-flex align-items-center mb-4">
                                    <GeoAlt className="me-3" size={24} />
                                    <div>
                                        <h6 className="mb-0 fw-bold">Ubicación</h6>
                                        <small>Valle Central, Chile</small>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center mb-4">
                                    <Envelope className="me-3" size={24} />
                                    <div>
                                        <h6 className="mb-0 fw-bold">Email</h6>
                                        <small>contacto@huertohogar.cl</small>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center mb-4">
                                    <Telephone className="me-3" size={24} />
                                    <div>
                                        <h6 className="mb-0 fw-bold">Teléfono</h6>
                                        <small>+56 9 1234 5678</small>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* COLUMNA DEL FORMULARIO */}
                    <Col md={7}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <h4 className="mb-4" style={{ color: '#8B4513' }}>Envíanos un mensaje</h4>
                                
                                {successMsg && <Alert variant="success">{successMsg}</Alert>}
                                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nombre Completo</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    name="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    required 
                                                    placeholder="Tu nombre"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control 
                                                    type="email" 
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required 
                                                    placeholder="tucorreo@ejemplo.com"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Asunto</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="asunto"
                                            value={formData.asunto}
                                            onChange={handleChange}
                                            required 
                                            placeholder="¿En qué podemos ayudarte?"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Mensaje</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={4} 
                                            name="mensaje"
                                            value={formData.mensaje}
                                            onChange={handleChange}
                                            required 
                                            placeholder="Escribe tu mensaje aquí..."
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button 
                                            type="submit" 
                                            disabled={loading}
                                            style={{ backgroundColor: '#2E8B57', border: 'none', padding: '10px' }}
                                        >
                                            {loading ? <Spinner animation="border" size="sm" /> : <><Send className="me-2"/> Enviar Mensaje</>}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <Footer />
        </div>
    );
};

export default ContactPage;