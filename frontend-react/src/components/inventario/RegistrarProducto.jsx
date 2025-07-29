import React, { useState } from 'react';
import apiService from '../../services/apiService';

const RegistrarProducto = ({ onProductoRegistrado }) => {
  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock_actual: '',
    stock_minimo: '',
    proveedor_id: null
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');

    try {
      const productoData = {
        ...producto,
        precio: parseFloat(producto.precio),
        stock_actual: parseInt(producto.stock_actual),
        stock_minimo: parseInt(producto.stock_minimo)
      };

      const resultado = await apiService.registrarProducto(productoData);
      
      if (resultado.exito) {
        setMensaje('✅ Producto registrado exitosamente');
        setProducto({
          nombre: '',
          descripcion: '',
          precio: '',
          stock_actual: '',
          stock_minimo: '',
          proveedor_id: null
        });
        if (onProductoRegistrado) onProductoRegistrado();
      } else {
        setMensaje('❌ Error: ' + resultado.mensaje);
      }
    } catch (error) {
      setMensaje('❌ Error registrando producto: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="registrar-producto">
      <div className="form-header">
        <h3>➕ Registrar Nuevo Producto</h3>
        <p>Completa la información del producto para agregarlo al inventario</p>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="formulario-producto">
        <div className="form-group">
          <label htmlFor="nombre">
            <span className="label-icon">🏷️</span>
            Nombre del Producto
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={producto.nombre}
            onChange={manejarCambio}
            placeholder="Ej: Cuaderno Universitario"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">
            <span className="label-icon">📝</span>
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={producto.descripcion}
            onChange={manejarCambio}
            placeholder="Ej: Cuaderno de 100 hojas universitario"
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precio">
              <span className="label-icon">💲</span>
              Precio
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={producto.precio}
              onChange={manejarCambio}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock_actual">
              <span className="label-icon">📦</span>
              Stock Inicial
            </label>
            <input
              type="number"
              id="stock_actual"
              name="stock_actual"
              value={producto.stock_actual}
              onChange={manejarCambio}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock_minimo">
              <span className="label-icon">⚠️</span>
              Stock Mínimo
            </label>
            <input
              type="number"
              id="stock_minimo"
              name="stock_minimo"
              value={producto.stock_minimo}
              onChange={manejarCambio}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-registrar"
            disabled={enviando}
          >
            {enviando ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              <>
                <span className="btn-icon">➕</span>
                Registrar Producto
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-info">
        <h4>💡 Consejos:</h4>
        <ul>
          <li>• El stock mínimo ayudará a generar alertas automáticas</li>
          <li>• El precio puede incluir decimales (ej: 2.50)</li>
          <li>• La descripción debe ser clara y completa</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrarProducto;
