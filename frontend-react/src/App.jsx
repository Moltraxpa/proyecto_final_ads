import React, { useState } from 'react';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import InventarioPage from './pages/InventarioPage';
import VentasPage from './pages/VentasPage';
import ProveedoresPage from './pages/ProveedoresPage';
import './App.css';

function App() {
  const [pestanaActiva, setPestanaActiva] = useState('inventario');

  const renderizarContenido = () => {
    switch (pestanaActiva) {
      case 'inventario':
        return <InventarioPage />;
      case 'ventas':
        return <VentasPage />;
      case 'proveedores':
        return <ProveedoresPage />;
      default:
        return <InventarioPage />;
    }
  };

  return (
    <div className="app">
      <Header />
      <Navbar 
        pestanaActiva={pestanaActiva}
        cambiarPestana={setPestanaActiva}
      />
      <main className="contenido-principal">
        {renderizarContenido()}
      </main>
    </div>
  );
}

export default App;
