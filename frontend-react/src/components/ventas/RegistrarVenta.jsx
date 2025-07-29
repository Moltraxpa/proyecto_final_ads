import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const RegistrarVenta = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    tipoPago: 'efectivo',
    observaciones: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await apiService.get('/inventario/productos');
      if (data.exito) {
        setProductos(data.data.filter(p => p.stock_actual > 0));
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  // Filtrar productos basado en la búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    producto.descripcion?.toLowerCase().includes(busquedaProducto.toLowerCase())
  ).slice(0, 5); // Mostrar máximo 5 resultados

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
    setCantidad(1);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) {
      setMensaje({
        tipo: 'error',
        texto: 'Debe seleccionar un producto'
      });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }

    const existeEnCarrito = carrito.find(item => item.id === productoSeleccionado.id);
    
    if (existeEnCarrito) {
      const nuevaCantidad = existeEnCarrito.cantidad + cantidad;
      if (nuevaCantidad > productoSeleccionado.stock_actual) {
        setMensaje({
          tipo: 'error',
          texto: `Stock insuficiente. Disponible: ${productoSeleccionado.stock_actual}, en carrito: ${existeEnCarrito.cantidad}`
        });
        setTimeout(() => setMensaje(null), 3000);
        return;
      }
      
      setCarrito(carrito.map(item =>
        item.id === productoSeleccionado.id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    } else {
      if (cantidad > productoSeleccionado.stock_actual) {
        setMensaje({
          tipo: 'error',
          texto: `Stock insuficiente. Disponible: ${productoSeleccionado.stock_actual}`
        });
        setTimeout(() => setMensaje(null), 3000);
        return;
      }
      
      setCarrito([...carrito, { 
        ...productoSeleccionado, 
        cantidad: cantidad,
        precio: productoSeleccionado.precio 
      }]);
    }

    // Limpiar selección
    setBusquedaProducto('');
    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    const producto = productos.find(p => p.id === id);
    if (nuevaCantidad > producto.stock_actual) {
      setMensaje({
        tipo: 'error',
        texto: `Stock insuficiente. Disponible: ${producto.stock_actual}`
      });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }

    setCarrito(carrito.map(item =>
      item.id === id
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const procesarVenta = async (e) => {
    e.preventDefault();
    
    if (carrito.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Debe agregar al menos un producto al carrito' });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const ventaData = {
        cliente_nombre: formData.clienteNombre,
        cliente_email: formData.clienteEmail,
        cliente_telefono: formData.clienteTelefono,
        productos: carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        })),
        tipo_pago: formData.tipoPago,
        observaciones: formData.observaciones
      };

      const resultado = await apiService.post('/ventas', ventaData);

      if (resultado.exito) {
        setMensaje({ tipo: 'exito', texto: 'Venta registrada exitosamente' });
        setCarrito([]);
        setFormData({
          clienteNombre: '',
          clienteEmail: '',
          clienteTelefono: '',
          tipoPago: 'efectivo',
          observaciones: ''
        });
        cargarProductos(); // Actualizar stock
      } else {
        setMensaje({ tipo: 'error', texto: resultado.mensaje });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al procesar la venta' });
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  return (
    <div>
      <div className="form-header">
        <h3>🛒 Registrar Nueva Venta</h3>
        <p>Selecciona productos y procesa la venta</p>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="venta-container">
        {/* Buscador y Selector de Productos Mejorado */}
        <div className="buscador-productos">
          <h4>🔍 Buscar y Agregar Productos</h4>
          
          <div className="buscador-container">
            <div className="busqueda-input">
              <input
                type="text"
                placeholder="Buscar productos por nombre..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="input-busqueda"
              />
              {busquedaProducto && (
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaProducto('');
                    setProductoSeleccionado(null);
                  }}
                  className="btn-limpiar-busqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {busquedaProducto && !productoSeleccionado && (
              <div className="resultados-busqueda">
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map(producto => (
                    <div 
                      key={producto.id} 
                      className="resultado-item"
                      onClick={() => seleccionarProducto(producto)}
                    >
                      <div className="resultado-info">
                        <span className="resultado-nombre">{producto.nombre}</span>
                        <span className="resultado-precio">${producto.precio.toFixed(2)}</span>
                      </div>
                      <div className="resultado-stock">
                        Stock: {producto.stock_actual}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sin-resultados">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}

            {/* Producto seleccionado */}
            {productoSeleccionado && (
              <div className="producto-seleccionado">
                <div className="producto-sel-info">
                  <h5>{productoSeleccionado.nombre}</h5>
                  <p className="producto-sel-precio">${productoSeleccionado.precio.toFixed(2)} c/u</p>
                  <p className="producto-sel-stock">Stock disponible: {productoSeleccionado.stock_actual}</p>
                </div>
                
                <div className="cantidad-container">
                  <label htmlFor="cantidad">Cantidad:</label>
                  <div className="cantidad-input">
                    <button
                      type="button"
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="btn-cantidad"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="cantidad"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={productoSeleccionado.stock_actual}
                      className="input-cantidad"
                    />
                    <button
                      type="button"
                      onClick={() => setCantidad(Math.min(productoSeleccionado.stock_actual, cantidad + 1))}
                      className="btn-cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="subtotal-preview">
                  Subtotal: ${(productoSeleccionado.precio * cantidad).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={agregarAlCarrito}
                  className="btn-agregar-carrito"
                >
                  <span>🛒</span> Agregar al Carrito
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carrito de Compras */}
        <div className="carrito-venta">
          <div className="carrito-header">
            <h4>🛍️ Carrito de Venta</h4>
            {carrito.length > 0 && (
              <button type="button" onClick={limpiarCarrito} className="btn-limpiar">
                🗑️ Limpiar
              </button>
            )}
          </div>

          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <span className="carrito-vacio-icono">🛒</span>
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            <div className="carrito-contenido">
              <div className="carrito-items">
                {carrito.map(item => (
                  <div key={item.id} className="carrito-item">
                    <div className="item-info">
                      <h6>{item.nombre}</h6>
                      <p>${item.precio.toFixed(2)} c/u</p>
                    </div>
                    <div className="item-controles">
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="btn-cantidad"
                      >
                        -
                      </button>
                      <span className="cantidad">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        className="btn-cantidad"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="btn-eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="item-subtotal">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="carrito-total">
                <h4>Total: ${calcularTotal().toFixed(2)}</h4>
              </div>
            </div>
          )}
        </div>

        {/* Formulario de Cliente y Pago */}
        {carrito.length > 0 && (
          <form onSubmit={procesarVenta} className="formulario-venta">
            <h4>👤 Información del Cliente</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">👤</span>
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clienteNombre}
                  onChange={(e) => setFormData({...formData, clienteNombre: e.target.value})}
                  required
                  placeholder="Nombre completo del cliente"
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📧</span>
                  Email (Opcional)
                </label>
                <input
                  type="email"
                  value={formData.clienteEmail}
                  onChange={(e) => setFormData({...formData, clienteEmail: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">📞</span>
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  value={formData.clienteTelefono}
                  onChange={(e) => setFormData({...formData, clienteTelefono: e.target.value})}
                  placeholder="0999999999"
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">💳</span>
                  Tipo de Pago *
                </label>
                <select
                  value={formData.tipoPago}
                  onChange={(e) => setFormData({...formData, tipoPago: e.target.value})}
                  required
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="transferencia">🏦 Transferencia</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">📝</span>
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                rows="3"
                placeholder="Observaciones adicionales sobre la venta..."
              />
            </div>

            <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-procesar-venta"
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <span className="spinner"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <span>💰</span>
                        Procesar Venta (${calcularTotal().toFixed(2)})
                      </>
                    )}
                  </button>
            </div>
          </form>
        )}
      </div>

      <div className="form-info">
        <h4>ℹ️ Información Importante</h4>
        <ul>
          <li>✅ El stock se actualiza automáticamente después de cada venta</li>
          <li>📝 Los campos marcados con * son obligatorios</li>
          <li>🔍 Solo se muestran productos con stock disponible</li>
          <li>💾 La venta se registra inmediatamente al procesar</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrarVenta;
