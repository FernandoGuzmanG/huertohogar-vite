import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// IMPORTANTE: Ajusta la ruta si cambiaste el nombre a AuthProvider.tsx
import { AuthProvider } from './context/AuthProvider'; 
import { CartProvider } from './context/CartProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>   
    </AuthProvider>
  </React.StrictMode>,
)