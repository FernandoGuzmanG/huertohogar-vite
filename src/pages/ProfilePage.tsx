import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import type { UpdateProfileRequestDTO, ChangePasswordRequestDTO } from '../types/user';
import { useNavigate } from 'react-router-dom';

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
    const [confirmacionNuevaClave, setConfirmacionNuevaClave] = useState(''); // <-- Nuevo estado
    
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

    // 2. Manejar actualización de perfil
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // VALIDACIÓN: Campos vacíos en perfil
        if (!nombreCompleto.trim()) {
            setMsgProfile({ type: 'danger', text: 'El nombre completo es obligatorio.' });
            return;
        }
        if (!direccionEntrega.trim()) {
            setMsgProfile({ type: 'danger', text: 'La dirección de entrega es obligatoria.' });
            return;
        }

        setUpdatingProfile(true);
        setMsgProfile(null);

        try {
            const dto: UpdateProfileRequestDTO = { nombreCompleto, biografia, direccionEntrega };
            await userService.actualizarPerfil(dto);
            setMsgProfile({ type: 'success', text: 'Información actualizada correctamente.' });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar perfil.';
            setMsgProfile({ type: 'danger', text: message });
        } finally {
            setUpdatingProfile(false);
        }
    };

    // 3. Manejar cambio de clave
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsgPass(null);

        // VALIDACIÓN 1: Campos vacíos
        if (!claveActual.trim() || !nuevaClave.trim() || !confirmacionNuevaClave.trim()) {
            setMsgPass({ type: 'danger', text: 'Todos los campos de contraseña son obligatorios.' });
            return;
        }

        // VALIDACIÓN 2: Longitud mínima
        if (nuevaClave.length < 6) {
            setMsgPass({ type: 'danger', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        // VALIDACIÓN 3: Coincidencia de contraseñas
        if (nuevaClave !== confirmacionNuevaClave) {
            setMsgPass({ type: 'danger', text: 'Las nuevas contraseñas no coinciden.' });
            return;
        }

        setUpdatingPass(true);

        try {
            // Enviamos los 3 campos al backend
            const dto: ChangePasswordRequestDTO = { claveActual, nuevaClave, confirmacionNuevaClave };
            await userService.cambiarClave(dto);
            
            setMsgPass({ type: 'success', text: 'Contraseña modificada con éxito.' });
            
            // Limpiar formulario
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
            <Header cartItemCount={0} />
            
            <Container className="my-5 flex-grow-1">
                <h2 className="mb-4 text-center" style={{fontFamily: 'Playfair Display', color: '#8B4513'}}>Mi Perfil</h2>
                
                <Row className="justify-content-center g-4">
                    
                    {/* TARJETA 1: INFORMACIÓN PERSONAL */}
                    <Col md={6}>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Header className="card-header-custom text-center">
                                <h5 className="my-1">Información Personal</h5>
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
                                            // Quitamos 'required' nativo para usar nuestra validación manual y mostrar alerta
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Biografía</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={2} 
                                            value={biografia} 
                                            onChange={(e) => setBiografia(e.target.value)} 
                                            placeholder="Cuéntanos un poco sobre ti..."
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Dirección de Entrega</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={direccionEntrega} 
                                            onChange={(e) => setDireccionEntrega(e.target.value)} 
                                            placeholder="Calle, Número, Depto, Comuna"
                                        />
                                    </Form.Group>

                                    <Button type="submit" className="btn-submit-custom w-100" disabled={updatingProfile}>
                                        {updatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* TARJETA 2: SEGURIDAD */}
                    <Col md={5}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-secondary text-white text-center">
                                <h5 className="my-1">Seguridad</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {msgPass && <Alert variant={msgPass.type}>{msgPass.text}</Alert>}

                                <Form onSubmit={handleChangePassword}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Contraseña Actual</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={claveActual} 
                                            onChange={(e) => setClaveActual(e.target.value)} 
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Nueva Contraseña</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={nuevaClave} 
                                            onChange={(e) => setNuevaClave(e.target.value)} 
                                        />
                                    </Form.Group>

                                    {/* NUEVO CAMPO: CONFIRMACIÓN */}
                                    <Form.Group className="mb-4">
                                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            value={confirmacionNuevaClave} 
                                            onChange={(e) => setConfirmacionNuevaClave(e.target.value)} 
                                        />
                                        <Form.Text className="text-muted">
                                            Mínimo 6 caracteres.
                                        </Form.Text>
                                    </Form.Group>

                                    <Button type="submit" variant="outline-dark" className="w-100" disabled={updatingPass}>
                                        {updatingPass ? 'Actualizando...' : 'Cambiar Contraseña'}
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