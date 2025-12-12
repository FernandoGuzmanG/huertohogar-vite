import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductsPage: React.FC = () => {
    return (
        <>
            <Header cartItemCount={0} />
            <div className="container p-5" style={{ minHeight: '60vh' }}>
                <h2>Catálogo de Productos</h2>
                <p>Aquí se listarán los productos obtenidos del microservicio `/api/productos`.</p>
            </div>
            <Footer />
        </>
    );
};

export default ProductsPage;