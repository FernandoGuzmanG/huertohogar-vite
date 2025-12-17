import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Envelope, GeoAlt, Telephone, Send } from 'react-bootstrap-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { contactService } from '../services/contactService';
import type { ContactoRequestDTO } from '../types/contact';

const ContactPage: React.FC = () => {
    
    const [formData, setFormData] = useState<ContactoRequestDTO>({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    // Lógica de validación actualizada con los límites de caracteres
    const validateField = (name: string, value: string): string => {
        let error = "";
        const trimmedValue = value.trim();

        switch (name) {
            case 'nombre':
                if (!trimmedValue) error = "El nombre es obligatorio.";
                else if (trimmedValue.length < 3) error = "El nombre debe tener al menos 3 caracteres.";
                else if (trimmedValue.length > 100) error = "El nombre no puede superar los 100 caracteres.";
                break;

            case 'email': {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!trimmedValue) error = "El email es obligatorio.";
                else if (trimmedValue.length > 50) error = "El correo no puede superar los 50 caracteres.";
                else if (!emailRegex.test(trimmedValue)) error = "Ingresa un formato de correo válido.";
                break;
            }

            case 'asunto':
                if (!trimmedValue) error = "El asunto es obligatorio.";
                else if (trimmedValue.length < 5) error = "El asunto debe tener al menos más de 5 caracteres.";
                else if (trimmedValue.length > 100) error = "El asunto no puede superar los 100 caracteres.";
                break;

            case 'mensaje':
                if (!trimmedValue) error = "El mensaje es obligatorio.";
                else if (trimmedValue.length < 10) error = "El mensaje es muy corto (mínimo 10 caracteres).";
                else if (trimmedValue.length > 300) error = `El mensaje no puede superar los 300 caracteres (actual: ${trimmedValue.length}).`;
                break;
            
            default:
                break;
        }
        return error;
    };

    useEffect(() => {
        // Validamos que no haya errores Y que los campos no estén vacíos
        const noErrors = Object.values(errors).every(x => x === "");
        const allFieldsFilled = Object.values(formData).every(x => x.trim() !== "");
        
        // Verificación extra: Asegurarse que aunque no haya errores marcados, 
        // los datos actuales cumplan las longitudes máximas (por seguridad)
        const lengthsValid = 
            formData.nombre.length <= 100 &&
            formData.email.length <= 50 &&
            formData.asunto.length <= 100 &&
            formData.mensaje.length <= 300;

        setIsFormValid(noErrors && allFieldsFilled && lengthsValid);
    }, [formData, errors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors: { [key: string]: string } = {};

        (Object.keys(formData) as Array<keyof ContactoRequestDTO>).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) formErrors[key] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setTouched({ nombre: true, email: true, asunto: true, mensaje: true });
            return;
        }

        setLoading(true);
        setSuccessMsg(null);
        setErrorMsg(null);

        try {
            const respuesta = await contactService.enviarMensaje(formData);
            setSuccessMsg(respuesta);
            setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
            setTouched({});
            setErrors({});
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
                    <Col md={5} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#2E8B57', color: 'white' }}>
                            <Card.Body className="p-5">
                                <h4 className="mb-4" style={{ color: 'white' }}>Información de Contacto</h4>
                                <div className="d-flex align-items-center mb-4">
                                    <GeoAlt className="me-3" size={24} />
                                    <div>
                                        <h6 className="mb-0 fw-bold" style={{ color: 'white' }}>Ubicación</h6>
                                        <small>Valle Central, Chile</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <Envelope className="me-3" size={24} />
                                    <div>
                                        <h6 className="mb-0 fw-bold" style={{ color: 'white' }}>Email</h6>
                                        <small>contacto@huertohogar.cl</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-4">
                                    <Telephone className="me-3" size={24} />
                                    <div>
                                        <h6 className="mb-0 fw-bold" style={{ color: 'white' }}>Teléfono</h6>
                                        <small>+56 9 1234 5678</small>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={7}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <h4 className="mb-4" style={{ color: '#8B4513' }}>Envíanos un mensaje</h4>
                                
                                {successMsg && <Alert variant="success">{successMsg}</Alert>}
                                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

                                <Form onSubmit={handleSubmit} noValidate>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formNombre">
                                                <Form.Label>Nombre Completo</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    name="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.nombre && !!errors.nombre}
                                                    isValid={touched.nombre && !errors.nombre && formData.nombre !== ''}
                                                    placeholder="Tu nombre"
                                                    maxLength={100}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.nombre}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formEmail">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control 
                                                    type="email" 
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={touched.email && !!errors.email}
                                                    isValid={touched.email && !errors.email && formData.email !== ''}
                                                    placeholder="tucorreo@ejemplo.com"
                                                    maxLength={100}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="formAsunto">
                                        <Form.Label>Asunto</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="asunto"
                                            value={formData.asunto}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.asunto && !!errors.asunto}
                                            isValid={touched.asunto && !errors.asunto && formData.asunto !== ''}
                                            placeholder="¿En qué podemos ayudarte?"
                                            maxLength={100}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.asunto}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formMensaje">
                                        <Form.Label className="d-flex justify-content-between">
                                            <span>Mensaje</span>
                                            <span style={{ fontSize: '0.8rem', color: formData.mensaje.length > 300 ? 'red' : '#6c757d' }}>
                                                {formData.mensaje.length}/300
                                            </span>
                                        </Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={4} 
                                            name="mensaje"
                                            value={formData.mensaje}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.mensaje && !!errors.mensaje}
                                            isValid={touched.mensaje && !errors.mensaje && formData.mensaje !== ''}
                                            placeholder="Escribe tu mensaje aquí..."
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.mensaje}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button 
                                            type="submit" 
                                            disabled={loading || !isFormValid}
                                            style={{ 
                                                backgroundColor: !isFormValid ? '#ccc' : '#2E8B57', 
                                                border: 'none', 
                                                padding: '10px',
                                                cursor: !isFormValid ? 'not-allowed' : 'pointer'
                                            }}
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