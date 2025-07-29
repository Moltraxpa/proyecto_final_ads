import React, { useState } from 'react';
import RegistrarProveedor from '../components/proveedores/RegistrarProveedor';
import ListaProveedores from '../components/proveedores/ListaProveedores';
import CrearOrdenCompra from '../components/proveedores/CrearOrdenCompra';
import HistorialOrdenes from '../components/proveedores/HistorialOrdenes';

const ProveedoresPage = () => {
  const [subPestana, setSubPestana] = useState('proveedores');

  const subPestanas = [
    { id: 'proveedores', nombre: 'Ver Proveedores', icono: '🏭' },
    { id: 'registrar', nombre: 'Registrar Proveedor', icono: '➕' },
    { id: 'orden', nombre: 'Crear Orden', icono: '📝' },
    { id: 'historial', nombre: 'Historial Órdenes', icono: '📋' }
  ];

  const renderizarSubContenido = () => {
    switch (subPestana) {
      case 'proveedores':
        return <ListaProveedores />;
      case 'registrar':
        return <RegistrarProveedor />;
      case 'orden':
        return <CrearOrdenCompra />;
      case 'historial':
        return <HistorialOrdenes />;
      default:
        return <ListaProveedores />;
    }
  };

  return (
    <div className="proveedores-page">
      <div className="page-header">
        <h2>🏭 Gestión de Proveedores</h2>
        <p>Administra proveedores, órdenes de compra y facturas</p>
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

export default ProveedoresPage;
