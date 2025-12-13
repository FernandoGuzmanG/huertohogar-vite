import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

interface LoginToastProps {
    show: boolean;
    onClose: () => void;
    message?: string;
}

const LoginToast: React.FC<LoginToastProps> = ({ show, onClose, message = "Debes iniciar sesión para realizar esta acción." }) => {
    
    // Efecto para auto-cerrar después de 3 segundos
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // 3 segundos
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',           // Abajo
            left: '50%',              // Centro horizontal
            transform: 'translateX(-50%)', // Ajuste fino para centrar exacto
            zIndex: 9999,             // Por encima de todo
            minWidth: '300px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-in-out' // Animación suave
        }}>
            <Alert 
                variant="dark" 
                onClose={onClose} 
                dismissible
                style={{ 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: 'none',
                    backgroundColor: '#333',
                    color: '#fff',
                    fontWeight: '500'
                }}
            >
                <ExclamationTriangleFill className="text-warning me-2"/>
                {message}
            </Alert>
            
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translate(-50%, 20px); }
                        to { opacity: 1; transform: translate(-50%, 0); }
                    }
                `}
            </style>
        </div>
    );
};

export default LoginToast;