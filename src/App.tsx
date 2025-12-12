import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Mantiene tus estilos globales
import 'bootstrap/dist/css/bootstrap.min.css'; // IMPORTANTE: Carga el CSS de Bootstrap

// Importa las páginas (vistas) que hemos definido o definiremos
import HomePage from './pages/HomePage';
// Componentes temporales (los reemplazaremos con vistas completas luego)
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage'; 
import ProfilePage from './pages/ProfilePage'; 


function App() {
  // Nota: Ya no necesitamos 'useState' ni la lógica de contador de este archivo

  return (
    // <Router> permite definir las rutas en la aplicación
    <Router>
      {/* <Routes> contiene todas las rutas posibles */}
      <Routes>
        
        {/* Ruta principal: Muestra el HomePage (Header, Hero, Footer) */}
        <Route path="/" element={<HomePage />} />
        
        {/* Rutas de Navegación y Funcionalidad */}
        
        {/* Rutas de Autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage isRegister={true} />} />
        <Route path="/perfil" element={<ProfilePage />} />
        
        {/* Rutas de Tienda */}
        <Route path="/productos" element={<ProductsPage />} />
        
        
        {/* Ruta para manejar URLs no encontradas (Opcional, pero recomendado) */}
        <Route path="*" element={<h1 className="p-5 text-center">404 - Página no encontrada</h1>} />

      </Routes>
    </Router>
  );
}

export default App;