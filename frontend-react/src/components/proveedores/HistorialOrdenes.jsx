import React, { useState, useEffect } from 'react';
import  apiService  from '../../services/apiService';

const HistorialOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    proveedor: '',
    ordenar: 'fecha_desc'
  });
  const [proveedores, setProveedores] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resultadoProveedores, resultadoOrdenes] = await Promise.all([
        apiService.get('/proveedores'),
        apiService.get('/proveedores/ordenes')
      ]);
      
      if (resultadoProveedores.exito) {
        setProveedores(resultadoProveedores.data);
      }
      
      if (resultadoOrdenes.exito) {
        setOrdenes(resultadoOrdenes.data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const coincideBusqueda = !filtros.busqueda || 
      (orden.nombre_empresa && orden.nombre_empresa.toLowerCase().includes(filtros.busqueda.toLowerCase())) ||
      orden.id.toString().includes(filtros.busqueda) ||
      (orden.productos && orden.productos.some(p => p.nombre && p.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())));

    const coincideEstado = !filtros.estado || orden.estado === filtros.estado;

    const fechaOrden = orden.fecha;
    const coincideFechaDesde = !filtros.fechaDesde || fechaOrden >= filtros.fechaDesde;
    const coincideFechaHasta = !filtros.fechaHasta || fechaOrden <= filtros.fechaHasta;

    const coincideProveedor = !filtros.proveedor || orden.nombre_empresa === filtros.proveedor;

    return coincideBusqueda && coincideEstado && coincideFechaDesde && coincideFechaHasta && coincideProveedor;
  }).sort((a, b) => {
    switch (filtros.ordenar) {
      case 'fecha_asc':
        return new Date(a.fecha) - new Date(b.fecha);
      case 'fecha_desc':
        return new Date(b.fecha) - new Date(a.fecha);
      case 'total_asc':
        return a.total - b.total;
      case 'total_desc':
        return b.total - a.total;
      case 'proveedor':
        return (a.nombre_empresa || '').localeCompare(b.nombre_empresa || '');
      case 'estado':
        return a.estado.localeCompare(b.estado);
      default:
        return 0;
    }
  });

  const actualizarEstadoOrden = async (ordenId, nuevoEstado) => {
    if (!nuevoEstado) {
      return; // No hacer nada si no se seleccionó un estado válido
    }
    
    try {
      const resultado = await apiService.put(`/proveedores/ordenes/${ordenId}/estado`, { nuevo_estado: nuevoEstado });
      if (resultado.exito) {
        setOrdenes(ordenes.map(orden => 
          orden.id === ordenId ? { ...orden, estado: nuevoEstado } : orden
        ));
        alert(`✅ Estado actualizado exitosamente a: ${nuevoEstado}`);
      } else {
        alert(`❌ Error al actualizar estado: ${resultado.mensaje}`);
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('❌ Error inesperado al actualizar el estado. Por favor, intente nuevamente.');
    }
  };

  const eliminarOrden = async (ordenId) => {
    if (window.confirm('¿Está seguro que desea eliminar esta orden? Esta acción no se puede deshacer.')) {
      try {
        const resultado = await apiService.delete(`/proveedores/ordenes/${ordenId}`);
        if (resultado.exito) {
          setOrdenes(ordenes.filter(orden => orden.id !== ordenId));
          alert('Orden eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        alert('Error al eliminar orden');
      }
    }
  };

  const verDetalles = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarDetalles(true);
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setOrdenSeleccionada(null);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const formatearEstado = (estado) => {
    const estados = {
      'pendiente': { texto: '⏳ Pendiente', clase: 'estado-pendiente' },
      'confirmada': { texto: '✅ Confirmada', clase: 'estado-confirmada' },
      'en_transito': { texto: '🚚 En Tránsito', clase: 'estado-transito' },
      'entregada': { texto: '📦 Entregada', clase: 'estado-entregada' },
      'cancelada': { texto: '❌ Cancelada', clase: 'estado-cancelada' }
    };
    return estados[estado] || { texto: estado, clase: '' };
  };

  const calcularResumen = () => {
    const total = ordenesFiltradas.reduce((sum, orden) => sum + orden.total, 0);
    const pendientes = ordenesFiltradas.filter(o => o.estado === 'pendiente').length;
    const entregadas = ordenesFiltradas.filter(o => o.estado === 'entregada').length;
    const enTransito = ordenesFiltradas.filter(o => o.estado === 'en_transito').length;

    return {
      cantidad: ordenesFiltradas.length,
      total,
      pendientes,
      entregadas,
      enTransito
    };
  };

  const resumen = calcularResumen();

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner-grande"></div>
        <p>Cargando historial de órdenes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="form-header">
        <h3>📋 Historial de Órdenes de Compra</h3>
        <p>Seguimiento y gestión de todas las órdenes realizadas</p>
      </div>

      {/* Resumen */}
      <div className="resumen-ordenes">
        <div className="stat-card">
          <div className="stat-number">{resumen.cantidad}</div>
          <div className="stat-label">Total Órdenes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${resumen.total ? resumen.total.toFixed(2) : '0.00'}</div>
          <div className="stat-label">Valor Total</div>
        </div>
        <div className="stat-card pendiente">
          <div className="stat-number">{resumen.pendientes}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-card transito">
          <div className="stat-number">{resumen.enTransito}</div>
          <div className="stat-label">En Tránsito</div>
        </div>
        <div className="stat-card entregada">
          <div className="stat-number">{resumen.entregadas}</div>
          <div className="stat-label">Entregadas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="controles-lista">
        <div className="filtros">
          <div className="filtro-busqueda">
            <label>🔍 Buscar</label>
            <input
              type="text"
              placeholder="Proveedor, ID o producto..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>

          <div className="filtro-estado">
            <label>📊 Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_transito">En Tránsito</option>
              <option value="entregada">Entregada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="filtro-proveedor">
            <label>🏢 Proveedor</label>
            <select
              value={filtros.proveedor}
              onChange={(e) => setFiltros({...filtros, proveedor: e.target.value})}
            >
              <option value="">Todos</option>
              {proveedores.map(proveedor => (
                <option key={proveedor.id} value={proveedor.nombre_empresa}>
                  {proveedor.nombre_empresa}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-fecha">
            <label>📅 Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>

          <div className="filtro-fecha">
            <label>📅 Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>

          <div className="filtro-orden">
            <label>📋 Ordenar por</label>
            <select
              value={filtros.ordenar}
              onChange={(e) => setFiltros({...filtros, ordenar: e.target.value})}
            >
              <option value="fecha_desc">Fecha (Más reciente)</option>
              <option value="fecha_asc">Fecha (Más antigua)</option>
              <option value="total_desc">Total (Mayor a menor)</option>
              <option value="total_asc">Total (Menor a mayor)</option>
              <option value="proveedor">Proveedor (A-Z)</option>
              <option value="estado">Estado</option>
            </select>
          </div>
        </div>

        <button
          onClick={cargarDatos}
          className="btn-recargar"
        >
          <span>🔄</span>
          Actualizar
        </button>
      </div>

      {/* Lista de Órdenes */}
      {ordenesFiltradas.length === 0 ? (
        <div className="sin-ordenes">
          <span className="sin-ordenes-icono">📋</span>
          <h3>No hay órdenes registradas</h3>
          <p>No se encontraron órdenes que coincidan con los filtros aplicados</p>
        </div>
      ) : (
        <div className="ordenes-tabla">
          <div className="tabla-header">
            <div>ID</div>
            <div>Proveedor</div>
            <div>Fecha</div>
            <div>Estado</div>
            <div>Total</div>
            <div>Acciones</div>
          </div>
          
          {ordenesFiltradas.map(orden => {
            const estadoInfo = formatearEstado(orden.estado);
            return (
              <div key={orden.id} className="tabla-fila">
                <div className="orden-id">#{orden.id}</div>
                <div className="orden-proveedor">{orden.nombre_empresa || 'Proveedor no especificado'}</div>
                <div className="orden-fecha">{formatearFecha(orden.fecha)}</div>
                <div className="orden-estado">
                  <span className={`badge-estado ${estadoInfo.clase}`}>
                    {estadoInfo.texto}
                  </span>
                </div>
                <div className="orden-total">${orden.total ? orden.total.toFixed(2) : '0.00'}</div>
                <div className="orden-acciones">
                  <button
                    onClick={() => verDetalles(orden)}
                    className="btn-ver-detalles"
                  >
                    👁️ Ver
                  </button>
                  {orden.estado === 'pendiente' && (
                    <>
                      <select
                        onChange={(e) => actualizarEstadoOrden(orden.id, e.target.value)}
                        value=""
                        className="select-estado"
                      >
                        <option value="">Cambiar estado</option>
                        <option value="confirmada">Confirmar</option>
                        <option value="cancelada">Cancelar</option>
                      </select>
                      <button
                        onClick={() => eliminarOrden(orden.id)}
                        className="btn-eliminar"
                      >
                        🗑️ Eliminar
                      </button>
                    </>
                  )}
                  {orden.estado === 'en_transito' && (
                    <button
                      onClick={() => actualizarEstadoOrden(orden.id, 'entregada')}
                      className="btn-marcar-entregada"
                    >
                      ✅ Marcar Entregada
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalles */}
      {mostrarDetalles && ordenSeleccionada && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Orden de Compra #{ordenSeleccionada.id}</h3>
              <button onClick={cerrarDetalles} className="btn-cerrar">✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-info">
                <div className="info-orden">
                  <h4>📊 Información de la Orden</h4>
                  <p><strong>Proveedor:</strong> {ordenSeleccionada.nombre_empresa || 'Proveedor no especificado'}</p>
                  <p><strong>Fecha:</strong> {formatearFecha(ordenSeleccionada.fecha)}</p>
                  <p><strong>Estado:</strong> {formatearEstado(ordenSeleccionada.estado).texto}</p>
                  <p><strong>Total:</strong> ${ordenSeleccionada.total ? ordenSeleccionada.total.toFixed(2) : '0.00'}</p>
                  {ordenSeleccionada.observaciones && (
                    <p><strong>Observaciones:</strong> {ordenSeleccionada.observaciones}</p>
                  )}
                </div>
              </div>

              <div className="productos-orden">
                <h4>📦 Productos Solicitados</h4>
                <div className="productos-detalle">
                  {ordenSeleccionada.productos && ordenSeleccionada.productos.length > 0 ? (
                    ordenSeleccionada.productos.map((producto, index) => (
                      <div key={index} className="producto-detalle">
                        <div className="producto-nombre">{producto.nombre}</div>
                        <div className="producto-cantidad">Cant: {producto.cantidad}</div>
                        <div className="producto-precio">${producto.precio ? producto.precio.toFixed(2) : '0.00'} c/u</div>
                        <div className="producto-subtotal">
                          ${producto.precio && producto.cantidad ? (producto.precio * producto.cantidad).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="sin-productos">
                      <p>No se encontraron productos para esta orden.</p>
                      <p><em>Los detalles de productos pueden no estar disponibles para órdenes anteriores.</em></p>
                    </div>
                  )}
                </div>
                <div className="total-orden">
                  <strong>Total: ${ordenSeleccionada.total ? ordenSeleccionada.total.toFixed(2) : '0.00'}</strong>
                </div>
              </div>

              <div className="acciones-orden">
                {ordenSeleccionada.estado === 'pendiente' && (
                  <div className="cambiar-estado">
                    <h4>🔄 Cambiar Estado</h4>
                    <div className="botones-estado">
                      <button
                        onClick={() => {
                          actualizarEstadoOrden(ordenSeleccionada.id, 'confirmada');
                          setOrdenSeleccionada({...ordenSeleccionada, estado: 'confirmada'});
                        }}
                        className="btn-confirmar"
                      >
                        ✅ Confirmar Orden
                      </button>
                      <button
                        onClick={() => {
                          actualizarEstadoOrden(ordenSeleccionada.id, 'cancelada');
                          setOrdenSeleccionada({...ordenSeleccionada, estado: 'cancelada'});
                        }}
                        className="btn-cancelar-orden"
                      >
                        ❌ Cancelar Orden
                      </button>
                    </div>
                  </div>
                )}

                {ordenSeleccionada.estado === 'en_transito' && (
                  <div className="marcar-entregada">
                    <h4>📦 Confirmar Entrega</h4>
                    <button
                      onClick={() => {
                        actualizarEstadoOrden(ordenSeleccionada.id, 'entregada');
                        setOrdenSeleccionada({...ordenSeleccionada, estado: 'entregada'});
                      }}
                      className="btn-marcar-entregada"
                    >
                      ✅ Marcar como Entregada
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialOrdenes;
