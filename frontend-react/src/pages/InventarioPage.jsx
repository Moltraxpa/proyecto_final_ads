import React, { useState, useEffect } from 'react';
import RegistrarProducto from '../components/inventario/RegistrarProducto';
import ActualizarProducto from '../components/inventario/ActualizarProducto';
import ListaProductos from '../components/inventario/ListaProductos';
import AlertasStock from '../components/inventario/AlertasStock';
import apiService from '../services/apiService';

const InventarioPage = () => {
  const [subPestana, setSubPestana] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const subPestanas = [
    { id: 'productos', nombre: 'Ver Productos', icono: '📋' },
    { id: 'registrar', nombre: 'Registrar Producto', icono: '➕' },
    { id: 'actualizar', nombre: 'Actualizar Producto', icono: '✏️' },
    { id: 'alertas', nombre: 'Alertas Stock', icono: '⚠️' }
  ];

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const resultado = await apiService.obtenerProductos();
      if (resultado.exito) {
        setProductos(resultado.data || []);
      } else {
        console.error('Error cargando productos:', resultado.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const renderizarSubContenido = () => {
    switch (subPestana) {
      case 'productos':
        return <ListaProductos productos={productos} cargando={cargando} onRecargar={cargarProductos} />;
      case 'registrar':
        return <RegistrarProducto onProductoRegistrado={cargarProductos} />;
      case 'actualizar':
        return <ActualizarProducto productos={productos} onProductoActualizado={cargarProductos} />;
      case 'alertas':
        return <AlertasStock />;
      default:
        return <ListaProductos productos={productos} cargando={cargando} onRecargar={cargarProductos} />;
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h2>📦 Gestión de Inventario</h2>
        <p>Administra productos, stock y alertas de la papelería</p>
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

export default InventarioPage;
