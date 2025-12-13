import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import type { LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth'; // Importación correcta del hook

interface LoginPageProps {
    isRegister?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationErrors {
    nombreCompleto?: string;
    correo?: string;
    clave?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ isRegister = false }) => {
    
    const { login } = useAuth(); // Usamos el hook para actualizar el contexto
    const navigate = useNavigate();
    
    // --- Estados de Formulario ---
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    
    // --- Estados de Validación y Carga ---
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<ValidationErrors>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const formTitle = isRegister ? 'Crear Cuenta (Registro)' : 'Iniciar Sesión';
    const buttonText = isRegister ? 'Registrarse' : 'Ingresar';

    // --- Función de Validación ---
    const validateField = useCallback((name: keyof ValidationErrors, value: string): string | undefined => {
        switch (name) {
            case 'nombreCompleto':
                if (isRegister && value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
                break;
            case 'correo':
                if (!value.trim()) return 'El correo electrónico es obligatorio.';
                if (!EMAIL_REGEX.test(value)) return 'Formato de correo inválido.';
                break;
            case 'clave':
                if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
                break;
            default:
                return undefined;
        }
    }, [isRegister]);

    // Efecto para verificar validez del formulario
    useEffect(() => {
        const allErrors: ValidationErrors = {};
        allErrors.correo = validateField('correo', correo);
        allErrors.clave = validateField('clave', clave);
        if (isRegister) {
            allErrors.nombreCompleto = validateField('nombreCompleto', nombreCompleto);
        }

        const currentErrors = Object.fromEntries(
            Object.entries(allErrors).filter(([, value]) => value !== undefined)
        );

        const hasErrors = Object.keys(currentErrors).length > 0;
        let allFieldsFilled = correo.trim() !== '' && clave.trim() !== '';
        if (isRegister) {
            allFieldsFilled = allFieldsFilled && nombreCompleto.trim() !== '';
        }

        setIsFormValid(!hasErrors && allFieldsFilled);
        
    }, [nombreCompleto, correo, clave, isRegister, validateField]);

    // Manejadores de eventos
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: name }));
        const errorMsg = validateField(name as keyof ValidationErrors, value);
        setValidationErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'nombreCompleto') setNombreCompleto(value);
        if (name === 'correo') setCorreo(value);
        if (name === 'clave') setClave(value);
        
        if (touched[name as keyof ValidationErrors] || isSubmitted) {
            const errorMsg = validateField(name as keyof ValidationErrors, value);
            setValidationErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        setValidationErrors({
            nombreCompleto: isRegister ? validateField('nombreCompleto', nombreCompleto) : undefined,
            correo: validateField('correo', correo),
            clave: validateField('clave', clave),
        });

        if (!isFormValid) {
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

            // ACTUALIZAMOS EL CONTEXTO GLOBAL
            login(tokenRecibido);

            // Redirigir al home
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
                    {/* USAMOS LA CLASE CSS DEL INDEX.CSS */}
                    <Card.Header className="text-center card-header-custom">
                        <h4 className="my-1">{formTitle}</h4>
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
                                        isInvalid={(isSubmitted || !!touched.nombreCompleto) && !!validationErrors.nombreCompleto}
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
                                    isInvalid={(isSubmitted || !!touched.correo) && !!validationErrors.correo}
                                    disabled={isLoading}
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
                                    isInvalid={(isSubmitted || !!touched.clave) && !!validationErrors.clave}
                                    disabled={isLoading}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.clave}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <div className="d-grid gap-2">
                                {/* USAMOS LA CLASE CSS DEL INDEX.CSS */}
                                <Button 
                                    type="submit" 
                                    className="btn-submit-custom"
                                    disabled={isLoading || !isFormValid}
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