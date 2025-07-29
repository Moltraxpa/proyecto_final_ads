import React, { useState } from 'react';
import RegistrarVenta from '../components/ventas/RegistrarVenta';
import ListaVentas from '../components/ventas/ListaVentas';
import ReportesVentas from '../components/ventas/ReportesVentas';

const VentasPage = () => {
  const [subPestana, setSubPestana] = useState('registrar');

  const subPestanas = [
    { id: 'registrar', nombre: 'Nueva Venta', icono: '💰' },
    { id: 'historial', nombre: 'Historial', icono: '📋' },
    { id: 'reportes', nombre: 'Reportes', icono: '📊' }
  ];

  const renderizarSubContenido = () => {
    switch (subPestana) {
      case 'registrar':
        return <RegistrarVenta />;
      case 'historial':
        return <ListaVentas />;
      case 'reportes':
        return <ReportesVentas />;
      default:
        return <RegistrarVenta />;
    }
  };

  return (
    <div className="ventas-page">
      <div className="page-header">
        <h2>💰 Gestión de Ventas</h2>
        <p>Registra transacciones, gestiona pagos y genera reportes</p>
      </div>
      
      <div className="sub-pestanas">
        {subPestanas.map(sub => (
          <button
            key={sub.id}
            className={`sub-pestana ${subPestana === sub.id ? 'activa' : ''}`}
            onClick={() => setSubPestana(sub.id)}
          >
            <span className="sub-pestana-icono">{sub.icono}</span>
            <span className="sub-pestana-nombre">{sub.nombre}</span>
          </button>
        ))}
      </div>

      <div className="sub-contenido">
        {renderizarSubContenido()}
      </div>
    </div>
  );
};

export default VentasPage;
