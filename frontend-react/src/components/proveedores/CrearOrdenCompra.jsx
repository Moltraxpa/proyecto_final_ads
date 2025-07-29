import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const CrearOrdenCompra = () => {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [orden, setOrden] = useState({
    proveedor_id: '',
    productos: []
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // Estados para el buscador de productos
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [nombreProductoNuevo, setNombreProductoNuevo] = useState('');
  const [esProductoNuevo, setEsProductoNuevo] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resultadoProveedores, resultadoProductos] = await Promise.all([
        apiService.obtenerProveedores(),
        apiService.obtenerProductos()
      ]);

      if (resultadoProveedores.exito) {
        setProveedores(resultadoProveedores.data || []);
      }
      
      if (resultadoProductos.exito) {
        setProductos(resultadoProductos.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Filtrar productos basado en la búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    producto.descripcion?.toLowerCase().includes(busquedaProducto.toLowerCase())
  ).slice(0, 5);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
    setCantidad(1);
    setPrecioUnitario(0); // El precio se ingresará manualmente para negociación
    setEsProductoNuevo(false);
    setNombreProductoNuevo('');
  };

  const crearProductoNuevo = () => {
    if (!busquedaProducto.trim()) return;
    
    setEsProductoNuevo(true);
    setNombreProductoNuevo(busquedaProducto);
    setProductoSeleccionado({
      id: 'nuevo',
      nombre: busquedaProducto,
      precio: 0,
      stock_actual: 0
    });
    setCantidad(1);
    setPrecioUnitario(0);
  };

  const agregarProductoAOrden = () => {
    if (!productoSeleccionado && !esProductoNuevo) {
      setMensaje('❌ Debe seleccionar un producto o crear uno nuevo');
      return;
    }

    if (precioUnitario <= 0) {
      setMensaje('❌ Debe especificar un precio unitario válido');
      return;
    }

    const nombreProducto = esProductoNuevo ? nombreProductoNuevo : productoSeleccionado.nombre;
    const productoId = esProductoNuevo ? `nuevo_${Date.now()}` : productoSeleccionado.id;
    
    const existeEnOrden = orden.productos.find(p => 
      (esProductoNuevo && p.es_nuevo && p.nombre === nombreProducto) ||
      (!esProductoNuevo && p.producto_id === productoSeleccionado.id)
    );
    
    if (existeEnOrden) {
      setOrden(prev => ({
        ...prev,
        productos: prev.productos.map(p =>
          ((esProductoNuevo && p.es_nuevo && p.nombre === nombreProducto) ||
           (!esProductoNuevo && p.producto_id === productoSeleccionado.id))
            ? { ...p, cantidad: p.cantidad + cantidad, precio_unitario: precioUnitario }
            : p
        )
      }));
    } else {
      setOrden(prev => ({
        ...prev,
        productos: [...prev.productos, {
          producto_id: esProductoNuevo ? null : productoSeleccionado.id,
          producto_nombre: nombreProducto,
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          es_nuevo: esProductoNuevo,
          nombre: nombreProducto
        }]
      }));
    }

    // Limpiar selección
    setBusquedaProducto('');
    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecioUnitario(0);
    setEsProductoNuevo(false);
    setNombreProductoNuevo('');
    setMensaje('✅ Producto agregado a la orden');
  };

  const eliminarProducto = (producto_id) => {
    setOrden(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.producto_id !== producto_id)
    }));
  };

  const actualizarCantidadProducto = (producto_id, nuevaCantidad) => {
    setOrden(prev => ({
      ...prev,
      productos: prev.productos.map(p =>
        p.producto_id === producto_id
          ? { ...p, cantidad: Math.max(1, nuevaCantidad) }
          : p
      )
    }));
  };

  const calcularTotal = () => {
    return orden.productos.reduce((total, producto) => {
      return total + (producto.cantidad * producto.precio_unitario);
    }, 0).toFixed(2);
  };

  const crearOrden = async (e) => {
    e.preventDefault();
    
    if (orden.productos.length === 0) {
      setMensaje('❌ Debe agregar al menos un producto a la orden');
      return;
    }

    setEnviando(true);
    setMensaje('');

    try {
      const ordenData = {
        proveedor_id: parseInt(orden.proveedor_id),
        productos: orden.productos.map(p => ({
          producto_id: p.producto_id ? parseInt(p.producto_id) : null,
          cantidad: parseInt(p.cantidad),
          precio_unitario: parseFloat(p.precio_unitario),
          nombre: p.es_nuevo ? p.nombre : null
        }))
      };

      const resultado = await apiService.crearOrden(ordenData);
      
      if (resultado.exito) {
        setMensaje('✅ Orden de compra creada exitosamente');
        setOrden({
          proveedor_id: '',
          productos: []
        });
      } else {
        setMensaje('❌ Error: ' + resultado.mensaje);
      }
    } catch (error) {
      setMensaje('❌ Error creando orden: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="crear-orden-compra">
      <div className="form-header">
        <h3>📝 Crear Orden de Compra</h3>
        <p>Genera una nueva orden de compra para un proveedor</p>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={crearOrden} className="formulario-orden">
        <div className="form-group">
          <label htmlFor="proveedor">
            <span className="label-icon">🏭</span>
            Seleccionar Proveedor
          </label>
          <select
            id="proveedor"
            value={orden.proveedor_id}
            onChange={(e) => setOrden(prev => ({ ...prev, proveedor_id: e.target.value }))}
            required
          >
            <option value="">-- Seleccionar proveedor --</option>
            {proveedores.map(proveedor => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre_empresa} - {proveedor.nombre} {proveedor.apellido}
              </option>
            ))}
          </select>
        </div>

        <div className="productos-orden">
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
                  <>
                    {productosFiltrados.map(producto => (
                      <div 
                        key={producto.id} 
                        className="resultado-item"
                        onClick={() => seleccionarProducto(producto)}
                      >
                        <div className="resultado-info">
                          <span className="resultado-nombre">{producto.nombre}</span>
                          <span className="resultado-precio">Precio actual: ${producto.precio.toFixed(2)}</span>
                        </div>
                        <div className="resultado-stock">
                          Stock actual: {producto.stock_actual}
                        </div>
                      </div>
                    ))}
                    <div className="crear-producto-nuevo">
                      <button 
                        type="button"
                        onClick={crearProductoNuevo}
                        className="btn-producto-nuevo"
                      >
                        ➕ Crear producto nuevo: "{busquedaProducto}"
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="sin-resultados">
                    <p>No se encontraron productos</p>
                    <button 
                      type="button"
                      onClick={crearProductoNuevo}
                      className="btn-producto-nuevo"
                    >
                      ➕ Crear producto nuevo: "{busquedaProducto}"
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Producto seleccionado */}
            {productoSeleccionado && (
              <div className="producto-seleccionado">
                <div className="producto-sel-info">
                  <h5>{productoSeleccionado.nombre}</h5>
                  {esProductoNuevo ? (
                    <p className="producto-nuevo-badge">🆕 Producto Nuevo</p>
                  ) : (
                    <>
                      <p className="producto-sel-precio">Precio actual: ${productoSeleccionado.precio.toFixed(2)}</p>
                      <p className="producto-sel-stock">Stock actual: {productoSeleccionado.stock_actual}</p>
                    </>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="cantidad-container">
                    <label htmlFor="cantidad">Cantidad a pedir:</label>
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
                        className="input-cantidad"
                      />
                      <button
                        type="button"
                        onClick={() => setCantidad(cantidad + 1)}
                        className="btn-cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="precio-container">
                    <label htmlFor="precio">Precio negociado:</label>
                    <input
                      type="number"
                      id="precio"
                      value={precioUnitario}
                      onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="input-precio"
                      placeholder="0.00"
                      required
                    />
                    <small>Precio por unidad según negociación con proveedor</small>
                  </div>
                </div>

                <div className="subtotal-preview">
                  Subtotal: ${(precioUnitario * cantidad).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={agregarProductoAOrden}
                  className="btn-agregar-orden"
                  disabled={precioUnitario <= 0}
                >
                  <span>📦</span> Agregar a la Orden
                </button>
              </div>
            )}
          </div>

          {/* Lista de productos en la orden */}
          {orden.productos.length > 0 && (
            <div className="productos-en-orden">
              <h5>📋 Productos en la Orden</h5>
              <div className="orden-items">
                {orden.productos.map((producto) => (
                  <div key={producto.producto_id} className="orden-item">
                    <div className="item-info">
                      <span className="item-nombre">{producto.producto_nombre}</span>
                      <span className="item-precio">${producto.precio_unitario.toFixed(2)} c/u</span>
                    </div>
                    <div className="item-cantidad">
                      <button
                        type="button"
                        onClick={() => actualizarCantidadProducto(producto.producto_id, producto.cantidad - 1)}
                        className="btn-cantidad-small"
                      >
                        -
                      </button>
                      <span className="cantidad-display">{producto.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidadProducto(producto.producto_id, producto.cantidad + 1)}
                        className="btn-cantidad-small"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-subtotal">
                      ${(producto.cantidad * producto.precio_unitario).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.producto_id)}
                      className="btn-eliminar-item"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="total-orden">
                <div className="total-info">
                  <span className="total-label">Total de la Orden:</span>
                  <span className="total-valor">${calcularTotal()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-crear-orden"
            disabled={enviando || orden.productos.length === 0}
          >
            {enviando ? (
              <>
                <span className="spinner"></span>
                Creando Orden...
              </>
            ) : (
              <>
                <span className="btn-icon">📝</span>
                Crear Orden de Compra
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-info">
        <h4>💡 Información sobre Órdenes:</h4>
        <ul>
          <li>• Las órdenes se crean con estado "pendiente"</li>
          <li>• El precio se autocompleta con el precio actual del producto</li>
          <li>• Puedes modificar el precio según negociación con proveedor</li>
          <li>• La orden se puede convertir en factura una vez recibida</li>
        </ul>
      </div>
    </div>
  );
};

export default CrearOrdenCompra;
