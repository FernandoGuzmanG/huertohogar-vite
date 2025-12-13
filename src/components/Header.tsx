import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Badge } from 'react-bootstrap';
import { Cart3, PersonCircle } from 'react-bootstrap-icons';
import { useAuth } from '../hooks/useAuth'; 
import { useCart } from '../hooks/useCart'; // <--- NUEVO IMPORT (desde hooks)

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Conectamos con el contexto del carrito para obtener el número real
  const { count } = useCart(); 

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand href="/" className="brand-custom">
          HuertoHogar
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/" className="nav-link-custom">Inicio</Nav.Link>
            <Nav.Link href="/productos" className="nav-link-custom">Productos</Nav.Link>
            <Nav.Link href="/nosotros" className="nav-link-custom">Nosotros</Nav.Link>
            <Nav.Link href="/contacto" className="nav-link-custom">Contacto</Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            
            {/* LÓGICA DE AUTENTICACIÓN */}
            {isAuthenticated && user ? (
                // --- USUARIO LOGUEADO ---
                <NavDropdown 
                    title={
                        <span className="text-white fw-bold d-flex align-items-center">
                            <PersonCircle className="me-2" size={20}/>
                            {/* Mostramos nombre o parte del correo */}
                            Hola, {user.sub.split('@')[0]} 
                        </span>
                    } 
                    id="user-nav-dropdown"
                    align="end"
                >
                    <NavDropdown.Item href="/perfil">Mi Perfil</NavDropdown.Item>
                    <NavDropdown.Item href="/mis-pedidos">Mis Pedidos</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logout} className="text-danger">
                        Cerrar Sesión
                    </NavDropdown.Item>
                </NavDropdown>
            ) : (
                // --- USUARIO NO LOGUEADO ---
                <>
                    <Button className="btn-auth" href="/login">
                    Iniciar Sesión
                    </Button>
                    <Button className="btn-auth" href="/register">
                    Registrarse
                    </Button>
                </>
            )}

            {/* CARRITO CONECTADO AL GLOBAL */}
            <Nav.Link href="/carrito" className="nav-link-custom d-flex align-items-center ms-3 position-relative">
              <Cart3 size={20} className="me-1" />
              Carrito
              
              {/* Badge (Burbuja) Condicional: Solo aparece si hay items */}
              {count >= 0 && (
                  <Badge 
                    bg="success" 
                    pill 
                    className="ms-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {count}
                  </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;