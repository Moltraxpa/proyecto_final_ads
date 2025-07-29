import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const ActualizarProducto = ({ productos, onProductoActualizado }) => {
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [datosProducto, setDatosProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock_actual: '',
    stock_minimo: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const seleccionarProducto = (productoId) => {
    const producto = productos.find(p => p.id === parseInt(productoId));
    if (producto) {
      setProductoSeleccionado(productoId);
      setDatosProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio.toString(),
        stock_actual: producto.stock_actual.toString(),
        stock_minimo: producto.stock_minimo.toString()
      });
      setMensaje('');
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatosProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');

    try {
      const productoData = {
        nombre: datosProducto.nombre,
        descripcion: datosProducto.descripcion,
        precio: parseFloat(datosProducto.precio),
        stock_actual: parseInt(datosProducto.stock_actual),
        stock_minimo: parseInt(datosProducto.stock_minimo)
      };

      const resultado = await apiService.actualizarProducto(productoSeleccionado, productoData);
      
      if (resultado.exito) {
        setMensaje('✅ Producto actualizado exitosamente');
        if (onProductoActualizado) onProductoActualizado();
        // Limpiar formulario
        setProductoSeleccionado('');
        setDatosProducto({
          nombre: '',
          descripcion: '',
          precio: '',
          stock_actual: '',
          stock_minimo: ''
        });
      } else {
        setMensaje('❌ Error: ' + resultado.mensaje);
      }
    } catch (error) {
      setMensaje('❌ Error actualizando producto: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  const limpiarFormulario = () => {
    setProductoSeleccionado('');
    setDatosProducto({
      nombre: '',
      descripcion: '',
      precio: '',
      stock_actual: '',
      stock_minimo: ''
    });
    setMensaje('');
  };

  return (
    <div className="actualizar-producto">
      <div className="form-header">
        <h3>✏️ Actualizar Producto Existente</h3>
        <p>Selecciona un producto y modifica sus datos</p>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
          {mensaje}
        </div>
      )}

      <div className="selector-producto">
        <label htmlFor="selector">
          <span className="label-icon">🔍</span>
          Seleccionar Producto:
        </label>
        <select 
          id="selector"
          value={productoSeleccionado}
          onChange={(e) => seleccionarProducto(e.target.value)}
          className="select-producto"
        >
          <option value="">-- Seleccionar producto para actualizar --</option>
          {productos.map(producto => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} (Stock: {producto.stock_actual}) - ${producto.precio}
            </option>
          ))}
        </select>
      </div>

      {productoSeleccionado && (
        <form onSubmit={actualizarProducto} className="formulario-actualizar">
          <div className="form-group">
            <label htmlFor="nombre-update">
              <span className="label-icon">🏷️</span>
              Nombre del Producto
            </label>
            <input
              type="text"
              id="nombre-update"
              name="nombre"
              value={datosProducto.nombre}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion-update">
              <span className="label-icon">📝</span>
              Descripción
            </label>
            <textarea
              id="descripcion-update"
              name="descripcion"
              value={datosProducto.descripcion}
              onChange={manejarCambio}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio-update">
                <span className="label-icon">💲</span>
                Precio
              </label>
              <input
                type="number"
                id="precio-update"
                name="precio"
                value={datosProducto.precio}
                onChange={manejarCambio}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock-actual-update">
                <span className="label-icon">📦</span>
                Stock Actual
              </label>
              <input
                type="number"
                id="stock-actual-update"
                name="stock_actual"
                value={datosProducto.stock_actual}
                onChange={manejarCambio}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock-minimo-update">
                <span className="label-icon">⚠️</span>
                Stock Mínimo
              </label>
              <input
                type="number"
                id="stock-minimo-update"
                name="stock_minimo"
                value={datosProducto.stock_minimo}
                onChange={manejarCambio}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-actualizar"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner"></span>
                  Actualizando...
                </>
              ) : (
                <>
                  <span className="btn-icon">✏️</span>
                  Actualizar Producto
                </>
              )}
            </button>

            <button 
              type="button" 
              className="btn-cancelar"
              onClick={limpiarFormulario}
            >
              <span className="btn-icon">❌</span>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!productoSeleccionado && productos.length === 0 && (
        <div className="mensaje-info">
          <p>📋 No hay productos disponibles para actualizar.</p>
          <p>Primero registra algunos productos en la sección "Registrar Producto".</p>
        </div>
      )}
    </div>
  );
};

export default ActualizarProducto;
