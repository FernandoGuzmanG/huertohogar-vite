import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import type { UpdateProfileRequestDTO, ChangePasswordRequestDTO } from '../types/user';
import { useNavigate } from 'react-router-dom';

// Regex: Solo letras y espacios
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

const ProfilePage: React.FC = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    // --- Estados para Datos del Perfil ---
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [biografia, setBiografia] = useState('');
    const [direccionEntrega, setDireccionEntrega] = useState('');
    
    // --- Estados para Cambio de Clave ---
    const [claveActual, setClaveActual] = useState('');
    const [nuevaClave, setNuevaClave] = useState('');
    const [confirmacionNuevaClave, setConfirmacionNuevaClave] = useState('');
    
    // --- Estados de Errores ---
    // Perfil: Validamos nombre, bio y dirección
    const [profileErrors, setProfileErrors] = useState<{ nombre?: string, biografia?: string, direccion?: string }>({});
    const [isProfileValid, setIsProfileValid] = useState(false);

    // Seguridad: Mantenemos lógica anterior
    const [passwordErrors, setPasswordErrors] = useState<{ actual?: string, nueva?: string, confirmacion?: string }>({});

    // --- Estados de UI ---
    const [loadingData, setLoadingData] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [updatingPass, setUpdatingPass] = useState(false);
    
    const [msgProfile, setMsgProfile] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
    const [msgPass, setMsgPass] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // 1. Cargar datos al montar
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isAuthenticated) {
            const loadProfile = async () => {
                try {
                    setLoadingData(true);
                    const data = await userService.obtenerPerfil();
                    setNombreCompleto(data.nombreCompleto || '');
                    setBiografia(data.biografia || '');
                    setDireccionEntrega(data.direccionEntrega || '');
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Error al cargar perfil.';
                    setMsgProfile({ type: 'danger', text: message });
                } finally {
                    setLoadingData(false);
                }
            };
            loadProfile();
        }
    }, [isAuthenticated, authLoading, navigate]);

    // ---------------------------------------------------------
    // VALIDACIÓN EN TIEMPO REAL: INFORMACIÓN PERSONAL
    // ---------------------------------------------------------
    useEffect(() => {
        const errors: { nombre?: string, biografia?: string, direccion?: string } = {};
        const nombreTrimmed = nombreCompleto.trim();

        // 1. Validar Nombre (Obligatorio y Solo Letras)
        if (!nombreTrimmed) {
            errors.nombre = 'El nombre completo es obligatorio.';
        } else if (!NAME_REGEX.test(nombreTrimmed)) {
            errors.nombre = 'El nombre solo puede contener letras y espacios.';
        }

        // 2. Validar Biografía (Opcional, máx 300 caracteres)
        if (biografia.length > 300) {
            errors.biografia = `La biografía no puede superar los 300 caracteres (actual: ${biografia.length}).`;
        }

        // 3. Validar Dirección (Opcional, máx 50 caracteres)
        if (direccionEntrega.length > 50) {
            errors.direccion = `La dirección no puede superar los 50 caracteres (actual: ${direccionEntrega.length}).`;
        }

        setProfileErrors(errors);
        
        // El formulario es válido solo si no hay keys en el objeto errors
        setIsProfileValid(Object.keys(errors).length === 0);

    }, [nombreCompleto, biografia, direccionEntrega]);


    // --- Manejar Submit Perfil ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsgProfile(null);

        // Doble chequeo de seguridad antes de enviar
        if (!isProfileValid) return;

        setUpdatingProfile(true);

        try {
            const dto: UpdateProfileRequestDTO = { 
                nombreCompleto: nombreCompleto.trim(), 
                biografia, 
                direccionEntrega 
            };
            await userService.actualizarPerfil(dto);
            setMsgProfile({ type: 'success', text: 'Información actualizada correctamente.' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar perfil.';
            setMsgProfile({ type: 'danger', text: message });
        } finally {
            setUpdatingProfile(false);
        }
    };

    // --- Manejar Submit Clave (Lógica Intacta) ---
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsgPass(null);
        setPasswordErrors({});

        const errors: { actual?: string, nueva?: string, confirmacion?: string } = {};

        if (!claveActual) errors.actual = 'La contraseña actual es obligatoria.';
        if (!nuevaClave) errors.nueva = 'La nueva contraseña es obligatoria.';
        else if (nuevaClave.length < 6) errors.nueva = 'La nueva contraseña debe tener al menos 6 caracteres.';
        
        if (!confirmacionNuevaClave) errors.confirmacion = 'Debes confirmar la contraseña.';
        else if (nuevaClave !== confirmacionNuevaClave) errors.confirmacion = 'Las contraseñas no coinciden.';

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setUpdatingPass(true);

        try {
            const dto: ChangePasswordRequestDTO = { claveActual, nuevaClave, confirmacionNuevaClave };
            await userService.cambiarClave(dto);
            setMsgPass({ type: 'success', text: 'Contraseña modificada con éxito.' });
            setClaveActual('');
            setNuevaClave('');
            setConfirmacionNuevaClave('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al cambiar contraseña.';
            setMsgPass({ type: 'danger', text: message });
        } finally {
            setUpdatingPass(false);
        }
    };

    if (authLoading || loadingData) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            
            <Container className="my-5 flex-grow-1">
                <h2 className="mb-4 text-center" style={{fontFamily: 'Playfair Display', color: '#8B4513'}}>Mi Perfil</h2>
                
                <Row className="justify-content-center g-4">
                    
                    {/* TARJETA 1: INFORMACIÓN PERSONAL (Validación en tiempo real) */}
                    <Col md={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="card-header-custom text-center">
                                <h5 className="my-1" style={{ color: 'white' }}>Información Personal</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {msgProfile && <Alert variant={msgProfile.type}>{msgProfile.text}</Alert>}
                                
                                <Form onSubmit={handleUpdateProfile}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre Completo</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={nombreCompleto} 
                                            onChange={(e) => setNombreCompleto(e.target.value)} 
                                            placeholder="Solo letras"
                                            isInvalid={!!profileErrors.nombre} // Rojo inmediato si hay error
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {profileErrors.nombre}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="d-flex justify-content-between">
                                            <span>Biografía <span className="text-muted small">(Opcional)</span></span>
                                            <span style={{ fontSize: '0.8rem', color: (biografia.length > 300) ? 'red' : '#6c757d' }}>
                                                {biografia.length}/300
                                            </span>
                                        </Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={2} 
                                            value={biografia} 
                                            onChange={(e) => setBiografia(e.target.value)} 
                                            placeholder="Cuéntanos un poco sobre ti..."
                                            isInvalid={!!profileErrors.biografia} // Rojo si pasa de 300
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {profileErrors.biografia}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="d-flex justify-content-between">
                                            <span>Dirección de Entrega <span className="text-muted small">(Opcional)</span></span>
                                            <span style={{ fontSize: '0.8rem', color: (direccionEntrega.length > 50) ? 'red' : '#6c757d' }}>
                                                {direccionEntrega.length}/50
                                            </span>
                                        </Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={direccionEntrega} 
                                            onChange={(e) => setDireccionEntrega(e.target.value)} 
                                            placeholder="Calle, Número, Depto, Comuna"
                                            isInvalid={!!profileErrors.direccion} // Rojo si pasa de 50
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {profileErrors.direccion}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* Botón deshabilitado si NO es válido o si está cargando */}
                                    <Button 
                                        type="submit" 
                                        className="btn-submit-custom w-100" 
                                        disabled={!isProfileValid || updatingProfile}
                                        style={{ 
                                            backgroundColor: (!isProfileValid) ? '#ccc' : undefined, 
                                            borderColor: (!isProfileValid) ? '#ccc' : undefined,
                                            cursor: (!isProfileValid) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {updatingProfile ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* TARJETA 2: SEGURIDAD (Intacta, validación al hacer submit) */}
                    <Col md={5}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-secondary text-white text-center">
                                <h5 className="my-1" style={{ color: 'white' }}>Seguridad</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {msgPass && <Alert variant={msgPass.type}>{msgPass.text}</Alert>}

                                <Form onSubmit={handleChangePassword} noValidate>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Contraseña Actual</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={claveActual} 
                                            onChange={(e) => setClaveActual(e.target.value)} 
                                            isInvalid={!!passwordErrors.actual}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {passwordErrors.actual}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Nueva Contraseña</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={nuevaClave} 
                                            onChange={(e) => setNuevaClave(e.target.value)} 
                                            isInvalid={!!passwordErrors.nueva}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {passwordErrors.nueva}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={confirmacionNuevaClave} 
                                            onChange={(e) => setConfirmacionNuevaClave(e.target.value)} 
                                            isInvalid={!!passwordErrors.confirmacion}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {passwordErrors.confirmacion}
                                        </Form.Control.Feedback>
                                        {!passwordErrors.confirmacion && (
                                            <Form.Text className="text-muted">
                                                Mínimo 6 caracteres.
                                            </Form.Text>
                                        )}
                                    </Form.Group>

                                    <Button type="submit" variant="outline-dark" className="w-100" disabled={updatingPass}>
                                        {updatingPass ? <Spinner animation="border" size="sm" /> : 'Cambiar Contraseña'}
                                    </Button>
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

export default ProfilePage;