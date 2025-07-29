import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const ListaVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: '',
    tipoPago: '',
    ordenar: 'fecha_desc'
  });
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [ventaAEditar, setVentaAEditar] = useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const response = await apiService.get('/ventas');
      if (response.exito) {
        setVentas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setCargando(false);
    }
  };

  const ventasFiltradas = ventas.filter(venta => {
    const coincideBusqueda = !filtros.busqueda || 
      (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) ||
      venta.id.toString().includes(filtros.busqueda);

    const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
    const coincideFechaDesde = !filtros.fechaDesde || fechaVenta >= filtros.fechaDesde;
    const coincideFechaHasta = !filtros.fechaHasta || fechaVenta <= filtros.fechaHasta;

    const coincideTipoPago = !filtros.tipoPago || venta.tipo_pago === filtros.tipoPago;

    return coincideBusqueda && coincideFechaDesde && coincideFechaHasta && coincideTipoPago;
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
      case 'cliente':
        return (a.cliente_nombre || '').localeCompare(b.cliente_nombre || '');
      default:
        return 0;
    }
  });

  const calcularResumen = () => {
    const total = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
    const efectivo = ventasFiltradas.filter(v => v.tipo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0);
    const tarjeta = ventasFiltradas.filter(v => v.tipo_pago === 'tarjeta').reduce((sum, v) => sum + v.total, 0);
    const transferencia = ventasFiltradas.filter(v => v.tipo_pago === 'transferencia').reduce((sum, v) => sum + v.total, 0);

    return {
      cantidad: ventasFiltradas.length,
      total,
      efectivo,
      tarjeta,
      transferencia
    };
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const verDetalles = async (ventaId) => {
    try {
      const data = await apiService.get(`/ventas/${ventaId}`);
      if (data.exito) {
        setVentaSeleccionada(data.data);
        setMostrarDetalles(true);
      }
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
    }
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setVentaSeleccionada(null);
  };

  const editarVenta = (venta) => {
    setVentaAEditar({...venta});
    setMostrarFormularioEditar(true);
  };

  const actualizarVenta = async (datosActualizados) => {
    try {
      const resultado = await apiService.put(`/ventas/${ventaAEditar.id}`, datosActualizados);
      if (resultado.exito) {
        // Actualizar la lista de ventas
        setVentas(ventas.map(v => 
          v.id === ventaAEditar.id ? resultado.data : v
        ));
        setMostrarFormularioEditar(false);
        setVentaAEditar(null);
        alert('Venta actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      alert('Error al actualizar venta');
    }
  };

  const eliminarVenta = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta venta? Esto restaurará el stock de los productos.')) {
      try {
        const resultado = await apiService.delete(`/ventas/${id}`);
        if (resultado.exito) {
          setVentas(ventas.filter(v => v.id !== id));
          if (ventaSeleccionada?.id === id) {
            cerrarDetalles();
          }
          alert('Venta eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar venta:', error);
        alert('Error al eliminar venta');
      }
    }
  };

  const cancelarEdicion = () => {
    setMostrarFormularioEditar(false);
    setVentaAEditar(null);
  };

  const resumen = calcularResumen();

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner-grande"></div>
        <p>Cargando ventas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="form-header">
        <h3>📊 Lista de Ventas</h3>
        <p>Historial y gestión de todas las ventas realizadas</p>
      </div>

      {/* Resumen */}
      <div className="resumen-ventas">
        <div className="stat-card">
          <div className="stat-number">{resumen.cantidad}</div>
          <div className="stat-label">Ventas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${resumen.total.toFixed(2)}</div>
          <div className="stat-label">Total Vendido</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${resumen.efectivo.toFixed(2)}</div>
          <div className="stat-label">Efectivo</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${resumen.tarjeta.toFixed(2)}</div>
          <div className="stat-label">Tarjeta</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${resumen.transferencia.toFixed(2)}</div>
          <div className="stat-label">Transferencia</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="controles-lista">
        <div className="filtros">
          <div className="filtro-busqueda">
            <label>🔍 Buscar</label>
            <input
              type="text"
              placeholder="Cliente o ID de venta..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
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

          <div className="filtro-tipo-pago">
            <label>💳 Tipo de Pago</label>
            <select
              value={filtros.tipoPago}
              onChange={(e) => setFiltros({...filtros, tipoPago: e.target.value})}
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
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
              <option value="cliente">Cliente (A-Z)</option>
            </select>
          </div>
        </div>

        <button
          onClick={cargarVentas}
          className="btn-recargar"
        >
          <span>🔄</span>
          Actualizar
        </button>
      </div>

      {/* Lista de Ventas */}
      {ventasFiltradas.length === 0 ? (
        <div className="sin-ventas">
          <span className="sin-ventas-icono">📊</span>
          <h3>No hay ventas registradas</h3>
          <p>No se encontraron ventas que coincidan con los filtros aplicados</p>
        </div>
      ) : (
        <div className="ventas-tabla">
          <div className="tabla-header">
            <div>ID</div>
            <div>Cliente</div>
            <div>Fecha</div>
            <div>Tipo Pago</div>
            <div>Total</div>
            <div>Acciones</div>
          </div>
          
          {ventasFiltradas.map(venta => (
            <div key={venta.id} className="tabla-fila">
              <div className="venta-id">#{venta.id}</div>
              <div className="venta-cliente">{venta.cliente_nombre || 'Cliente no registrado'}</div>
              <div className="venta-fecha">{formatearFecha(venta.fecha)}</div>
              <div className="venta-tipo-pago">
                <span className={`badge-pago ${venta.tipo_pago || 'efectivo'}`}>
                  {(venta.tipo_pago === 'efectivo' || !venta.tipo_pago) && '💵'}
                  {venta.tipo_pago === 'tarjeta' && '💳'}
                  {venta.tipo_pago === 'transferencia' && '🏦'}
                  {venta.tipo_pago || 'efectivo'}
                </span>
              </div>
              <div className="venta-total">${venta.total.toFixed(2)}</div>
              <div className="venta-acciones">
                <button
                  onClick={() => verDetalles(venta.id)}
                  className="btn-ver-detalles"
                >
                  👁️ Ver
                </button>
                <button
                  onClick={() => editarVenta(venta)}
                  className="btn-editar"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarVenta(venta.id)}
                  className="btn-eliminar"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      {mostrarDetalles && ventaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🧾 Detalles de Venta #{ventaSeleccionada.id}</h3>
              <button onClick={cerrarDetalles} className="btn-cerrar">✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detalle-info">
                <div className="info-cliente">
                  <h4>👤 Información del Cliente</h4>
                  <p><strong>Nombre:</strong> {ventaSeleccionada.cliente_nombre || 'Cliente no registrado'}</p>
                  {ventaSeleccionada.cliente_email && (
                    <p><strong>Email:</strong> {ventaSeleccionada.cliente_email}</p>
                  )}
                  {ventaSeleccionada.cliente_telefono && (
                    <p><strong>Teléfono:</strong> {ventaSeleccionada.cliente_telefono}</p>
                  )}
                </div>

                <div className="info-venta">
                  <h4>💰 Información de Venta</h4>
                  <p><strong>Fecha:</strong> {formatearFecha(ventaSeleccionada.fecha)}</p>
                  <p><strong>Tipo de Pago:</strong> {ventaSeleccionada.tipo_pago || 'efectivo'}</p>
                  <p><strong>Total:</strong> ${ventaSeleccionada.total.toFixed(2)}</p>
                  {ventaSeleccionada.observaciones && (
                    <p><strong>Observaciones:</strong> {ventaSeleccionada.observaciones}</p>
                  )}
                </div>
              </div>

              <div className="productos-vendidos">
                <h4>📦 Productos Vendidos</h4>
                <div className="productos-detalle">
                  {ventaSeleccionada.productos?.map((producto, index) => (
                    <div key={index} className="producto-detalle">
                      <div className="producto-nombre">{producto.nombre}</div>
                      <div className="producto-cantidad">Cant: {producto.cantidad}</div>
                      <div className="producto-precio">${(producto.precio_unitario || producto.precio || 0).toFixed(2)} c/u</div>
                      <div className="producto-subtotal">
                        ${((producto.precio_unitario || producto.precio || 0) * producto.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="total-venta">
                  <strong>Total: ${ventaSeleccionada.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Edición de Venta */}
      {mostrarFormularioEditar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FormularioEditarVenta 
              venta={ventaAEditar}
              onActualizar={actualizarVenta}
              onCancelar={cancelarEdicion}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para editar venta
const FormularioEditarVenta = ({ venta, onActualizar, onCancelar }) => {
  const [formData, setFormData] = useState({
    cliente_nombre: venta.cliente_nombre || '',
    cliente_email: venta.cliente_email || '',
    cliente_telefono: venta.cliente_telefono || '',
    tipo_pago: venta.tipo_pago || 'efectivo',
    observaciones: venta.observaciones || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onActualizar(formData);
  };

  return (
    <div className="formulario-editar-venta">
      <h3>✏️ Editar Venta</h3>
      <p><strong>ID:</strong> #{venta.id} | <strong>Total:</strong> ${venta.total.toFixed(2)}</p>
      <form onSubmit={handleSubmit}>
        <div className="campos-grid">
          <div className="campo">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              name="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={handleInputChange}
              placeholder="Nombre del cliente"
            />
          </div>
          <div className="campo">
            <label>Email del Cliente</label>
            <input
              type="email"
              name="cliente_email"
              value={formData.cliente_email}
              onChange={handleInputChange}
              placeholder="email@ejemplo.com"
            />
          </div>
          <div className="campo">
            <label>Teléfono del Cliente</label>
            <input
              type="text"
              name="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={handleInputChange}
              placeholder="123456789"
            />
          </div>
          <div className="campo">
            <label>Tipo de Pago</label>
            <select
              name="tipo_pago"
              value={formData.tipo_pago}
              onChange={handleInputChange}
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="transferencia">🏦 Transferencia</option>
            </select>
          </div>
          <div className="campo campo-completo">
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Observaciones adicionales..."
              rows="3"
            />
          </div>
        </div>
        <div className="botones-formulario">
          <button type="submit" className="btn-guardar">
            💾 Guardar Cambios
          </button>
          <button type="button" onClick={onCancelar} className="btn-cancelar">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListaVentas;
