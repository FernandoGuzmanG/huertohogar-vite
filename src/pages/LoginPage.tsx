import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import type { LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
    isRegister?: boolean;
}

// Regex para Email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para Nombre: Solo letras (incluye tildes y ñ) y espacios
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

interface ValidationErrors {
    nombreCompleto?: string;
    correo?: string;
    clave?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ isRegister = false }) => {
    
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // --- Estados de Formulario ---
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    
    // --- Estados de Validación y Carga ---
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    
    // Eliminamos isSubmitted ya que usaremos 'touched' para forzar la validación al enviar
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const formTitle = isRegister ? 'Crear Cuenta (Registro)' : 'Iniciar Sesión';
    const buttonText = isRegister ? 'Registrarse' : 'Ingresar';

    // --- Función de Validación ---
    const validateField = useCallback((name: string, value: string): string | undefined => {
        const trimmedValue = value.trim();

        switch (name) {
            case 'nombreCompleto':
                if (isRegister) {
                    if (!trimmedValue) return 'El nombre es obligatorio.';
                    if (trimmedValue.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
                    if (!NAME_REGEX.test(trimmedValue)) return 'El nombre solo puede contener letras.';
                }
                break;

            case 'correo':
                if (!trimmedValue) return 'El correo electrónico es obligatorio.';
                if (trimmedValue.length > 50) return 'El correo no puede superar los 50 caracteres.';
                if (!EMAIL_REGEX.test(trimmedValue)) return 'Formato de correo inválido.';
                break;

            case 'clave':
                if (!value) return 'La contraseña es obligatoria.'; 
                if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
                if (value.length > 16) return 'La contraseña no puede superar los 16 caracteres.';
                break;

            default:
                return undefined;
        }
    }, [isRegister]);

    // Efecto para verificar validez global del formulario en tiempo real
    useEffect(() => {
        // Validamos todos los campos actuales para determinar si el formulario es válido globalmente
        const errorCorreo = validateField('correo', correo);
        const errorClave = validateField('clave', clave);
        const errorNombre = isRegister ? validateField('nombreCompleto', nombreCompleto) : undefined;

        // Verificamos si hay algún error
        const hasErrors = !!errorCorreo || !!errorClave || !!errorNombre;

        // Verificamos si los campos están llenos
        const correoFilled = correo.trim().length > 0;
        const claveFilled = clave.length > 0;
        const nombreFilled = isRegister ? nombreCompleto.trim().length > 0 : true;

        setIsFormValid(!hasErrors && correoFilled && claveFilled && nombreFilled);
        
        // Actualizamos los mensajes de error visibles SOLO si el campo ha sido "tocado"
        setValidationErrors(prev => ({
            ...prev,
            correo: touched.correo ? errorCorreo : prev.correo,
            clave: touched.clave ? errorClave : prev.clave,
            nombreCompleto: touched.nombreCompleto ? errorNombre : prev.nombreCompleto
        }));

    }, [nombreCompleto, correo, clave, isRegister, touched, validateField]);

    // Manejadores de eventos
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Al salir del campo, lo marcamos como tocado
        setTouched(prev => ({ ...prev, [name]: true }));
        // Y ejecutamos la validación inmediatamente
        const errorMsg = validateField(name, value);
        setValidationErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'nombreCompleto') setNombreCompleto(value);
        if (name === 'correo') setCorreo(value);
        if (name === 'clave') setClave(value);
        
        // Si ya fue tocado, validamos en tiempo real para quitar el error rojo mientras escribe
        if (touched[name]) {
            const errorMsg = validateField(name, value);
            setValidationErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Obtenemos errores actuales
        const errorNombre = isRegister ? validateField('nombreCompleto', nombreCompleto) : undefined;
        const errorCorreo = validateField('correo', correo);
        const errorClave = validateField('clave', clave);

        // Forzamos que todos los campos se marquen como "tocados"
        // Esto disparará el useEffect y mostrará los mensajes de error rojos si existen
        setTouched({ nombreCompleto: true, correo: true, clave: true });

        // Si hay errores, seteamos el estado manualmente y detenemos el envío
        if (errorNombre || errorCorreo || errorClave) {
            setValidationErrors({
                nombreCompleto: errorNombre,
                correo: errorCorreo,
                clave: errorClave,
            });
            setError('Por favor, corrige los errores antes de enviar.');
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            let tokenRecibido = '';

            if (isRegister) {
                const registerData: RegisterRequest = { nombreCompleto, correo, clave };
                const response = await authService.register(registerData);
                tokenRecibido = response.token;
                setSuccessMessage('¡Registro exitoso! Iniciando sesión...');
            } else {
                const loginData: LoginRequest = { correo, clave };
                const response = await authService.login(loginData);
                tokenRecibido = response.token;
                setSuccessMessage('¡Inicio de sesión exitoso!');
            }

            login(tokenRecibido);
            setTimeout(() => navigate('/'), 1500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
            setError(errorMessage);
        } finally {
            if (!successMessage) {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header/>
            
            <Container className="my-5 flex-grow-1 d-flex justify-content-center align-items-center">
                <Card style={{ width: '100%', maxWidth: '450px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Card.Header className="text-center card-header-custom">
                        <h4 className="my-1" style={{ color: 'white' }}>{formTitle}</h4>
                    </Card.Header>
                    <Card.Body className="p-4">
                        
                        {error && <Alert variant="danger">{error}</Alert>}
                        {successMessage && <Alert variant="success">{successMessage}</Alert>}

                        <Form onSubmit={handleSubmit} noValidate>
                            
                            {isRegister && (
                                <Form.Group className="mb-3" controlId="formNombre">
                                    <Form.Label>Nombre Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombreCompleto"
                                        placeholder="Ingrese su nombre completo"
                                        value={nombreCompleto}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        // isInvalid solo depende de si hay un error en el estado validationErrors
                                        // (el cual solo se llena si está 'touched')
                                        isInvalid={!!validationErrors.nombreCompleto}
                                        isValid={touched.nombreCompleto && !validationErrors.nombreCompleto && nombreCompleto !== ''}
                                        disabled={isLoading}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.nombreCompleto}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3" controlId="formCorreo">
                                <Form.Label>Correo Electrónico</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="correo"
                                    placeholder="ejemplo@correo.com"
                                    value={correo}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={!!validationErrors.correo}
                                    isValid={touched.correo && !validationErrors.correo && correo !== ''}
                                    disabled={isLoading}
                                    maxLength={50}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.correo}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formClave">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="clave"
                                    placeholder="Contraseña"
                                    value={clave}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={!!validationErrors.clave}
                                    isValid={touched.clave && !validationErrors.clave && clave !== ''}
                                    disabled={isLoading}
                                    maxLength={16}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.clave}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Entre 6 y 16 caracteres.
                                </Form.Text>
                            </Form.Group>

                            <div className="d-grid gap-2">
                                <Button 
                                    type="submit" 
                                    className="btn-submit-custom"
                                    disabled={isLoading || !isFormValid}
                                    style={{ 
                                        backgroundColor: !isFormValid ? '#ccc' : undefined, 
                                        borderColor: !isFormValid ? '#ccc' : undefined,
                                        cursor: !isFormValid ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isLoading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                                    {buttonText}
                                </Button>
                            </div>
                        </Form>
                        
                        <div className="mt-4 text-center">
                            {isRegister ? (
                                <p>
                                    ¿Ya tienes cuenta? <a href="/login" style={{color: '#2E8B57', fontWeight: 'bold'}}>Inicia Sesión</a>
                                </p>
                            ) : (
                                <p>
                                    ¿No tienes cuenta? <a href="/register" style={{color: '#2E8B57', fontWeight: 'bold'}}>Regístrate aquí</a>
                                </p>
                            )}
                        </div>

                    </Card.Body>
                </Card>
            </Container>

            <Footer />
        </div>
    );
};

export default LoginPage;