import React from 'react';

const Navbar = ({ pestanaActiva, cambiarPestana }) => {
  const pestanas = [
    { 
      id: 'inventario', 
      nombre: 'Inventario', 
      icono: '📦',
      descripcion: 'Gestión de productos y stock'
    },
    { 
      id: 'ventas', 
      nombre: 'Ventas', 
      icono: '💰',
      descripcion: 'Registro de transacciones'
    },
    { 
      id: 'proveedores', 
      nombre: 'Proveedores', 
      icono: '🏭',
      descripcion: 'Gestión de proveedores y órdenes'
    }
  ];

  return (
    <nav className="navbar">
      <div className="pestanas-container">
        {pestanas.map(pestana => (
          <button
            key={pestana.id}
            className={`pestana ${pestanaActiva === pestana.id ? 'activa' : ''}`}
            onClick={() => cambiarPestana(pestana.id)}
            title={pestana.descripcion}
          >
            <span className="pestana-icono">{pestana.icono}</span>
            <div className="pestana-info">
              <span className="pestana-nombre">{pestana.nombre}</span>
              <span className="pestana-descripcion">{pestana.descripcion}</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
