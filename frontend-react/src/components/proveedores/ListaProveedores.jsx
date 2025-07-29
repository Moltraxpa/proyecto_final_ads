import React, { useState, useEffect } from 'react';
import  apiService  from '../../services/apiService';

const ListaProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    ordenar: 'nombre_asc'
  });
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setCargando(true);
    try {
      const resultado = await apiService.get('/proveedores');
      if (resultado.exito) {
        setProveedores(resultado.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setCargando(false);
    }
  };

  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const coincideBusqueda = !filtros.busqueda || 
      proveedor.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      proveedor.apellido.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      proveedor.nombre_empresa.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      proveedor.correo.toLowerCase().includes(filtros.busqueda.toLowerCase());

    return coincideBusqueda;
  }).sort((a, b) => {
    switch (filtros.ordenar) {
      case 'nombre_asc':
        return a.nombre.localeCompare(b.nombre);
      case 'nombre_desc':
        return b.nombre.localeCompare(a.nombre);
      case 'empresa_asc':
        return a.nombre_empresa.localeCompare(b.nombre_empresa);
      case 'empresa_desc':
        return b.nombre_empresa.localeCompare(a.nombre_empresa);
      case 'id_asc':
        return a.id - b.id;
      case 'fecha_desc':
        return new Date(b.fecha_registro) - new Date(a.fecha_registro);
      default:
        return 0;
    }
  });

  const verDetalles = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setMostrarDetalles(true);
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este proveedor?')) {
      try {
        const resultado = await apiService.delete(`/proveedores/${id}`);
        if (resultado.exito) {
          setProveedores(proveedores.filter(p => p.id !== id));
          if (proveedorSeleccionado?.id === id) {
            cerrarDetalles();
          }
          alert('✅ Proveedor eliminado exitosamente');
        } else {
          // El mensaje ya viene procesado del servicio de API
          if (resultado.mensaje.includes('órdenes activas') || resultado.status === 400) {
            alert('❌ No se puede eliminar este proveedor\n\nEl proveedor tiene órdenes de compra asociadas.\nPrimero debe eliminar todas sus órdenes de compra.');
          } else {
            alert(`❌ Error: ${resultado.mensaje}`);
          }
        }
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        alert('❌ Error inesperado al eliminar proveedor. Por favor, intente nuevamente.');
      }
    }
  };

  const editarProveedor = (proveedor) => {
    setProveedorAEditar({...proveedor});
    setMostrarFormularioEditar(true);
  };

  const actualizarProveedor = async (datosActualizados) => {
    try {
      const resultado = await apiService.put(`/proveedores/${proveedorAEditar.id}`, datosActualizados);
      if (resultado.exito) {
        // Actualizar la lista de proveedores
        setProveedores(proveedores.map(p => 
          p.id === proveedorAEditar.id ? resultado.data : p
        ));
        setMostrarFormularioEditar(false);
        setProveedorAEditar(null);
        alert('✅ Proveedor actualizado exitosamente');
      } else {
        alert(`❌ Error al actualizar: ${resultado.mensaje}`);
      }
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      alert('❌ Error inesperado al actualizar proveedor. Por favor, intente nuevamente.');
    }
  };

  const cancelarEdicion = () => {
    setMostrarFormularioEditar(false);
    setProveedorAEditar(null);
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setProveedorSeleccionado(null);
  };

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner-grande"></div>
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="form-header">
        <h3>📋 Lista de Proveedores</h3>
        <p>Gestión y consulta de todos los proveedores registrados</p>
      </div>

      {/* Filtros */}
      <div className="controles-lista">
        <div className="filtros">
          <div className="filtro-busqueda">
            <label>🔍 Buscar</label>
            <input
              type="text"
              placeholder="Nombre, empresa, correo..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>

          <div className="filtro-orden">
            <label>📋 Ordenar por</label>
            <select
              value={filtros.ordenar}
              onChange={(e) => setFiltros({...filtros, ordenar: e.target.value})}
            >
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="nombre_desc">Nombre (Z-A)</option>
              <option value="empresa_asc">Empresa (A-Z)</option>
              <option value="empresa_desc">Empresa (Z-A)</option>
              <option value="id_asc">ID (Menor a Mayor)</option>
            </select>
          </div>
        </div>

        <button
          onClick={cargarProveedores}
          className="btn-recargar"
        >
          <span>🔄</span>
          Actualizar
        </button>
      </div>

      {/* Lista de Proveedores */}
      {proveedoresFiltrados.length === 0 ? (
        <div className="sin-proveedores">
          <span className="sin-proveedores-icono">🏢</span>
          <h3>No hay proveedores registrados</h3>
          <p>No se encontraron proveedores que coincidan con los filtros aplicados</p>
        </div>
      ) : (
        <div className="proveedores-grid">
          {proveedoresFiltrados.map(proveedor => (
            <div key={proveedor.id} className="proveedor-card">
              <div className="proveedor-header">
                <h4 className="proveedor-nombre">{proveedor.nombre} {proveedor.apellido}</h4>
                <span className="proveedor-id">ID: {proveedor.id}</span>
              </div>

              <div className="proveedor-info">
                <p className="proveedor-empresa">
                  <span>🏢</span> {proveedor.nombre_empresa}
                </p>
                <p className="proveedor-telefono">
                  <span>📞</span> {proveedor.telefono}
                </p>
                <p className="proveedor-email">
                  <span>📧</span> {proveedor.correo}
                </p>
                <p className="proveedor-direccion">
                  <span>�</span> {proveedor.direccion}
                </p>
                <p className="proveedor-ruc">
                  <span>�</span> RUC: {proveedor.ruc}
                </p>
              </div>

              <div className="proveedor-acciones">
                <button
                  onClick={() => verDetalles(proveedor)}
                  className="btn-ver-detalles"
                >
                  👁️ Ver Detalles
                </button>
                <button
                  onClick={() => editarProveedor(proveedor)}
                  className="btn-editar"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarProveedor(proveedor.id)}
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
      {mostrarDetalles && proveedorSeleccionado && (
        <div className="modal-overlay" onClick={cerrarDetalles}>
          <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏢 {proveedorSeleccionado.nombre_empresa}</h3>
              <div className="modal-acciones">
                <button onClick={cerrarDetalles} className="btn-cerrar">✕</button>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="detalles-proveedor">
                <div className="seccion-detalle">
                  <h4>👤 Información Personal</h4>
                  <p><strong>Nombre:</strong> {proveedorSeleccionado.nombre} {proveedorSeleccionado.apellido}</p>
                  <p><strong>Empresa:</strong> {proveedorSeleccionado.nombre_empresa}</p>
                  <p><strong>RUC:</strong> {proveedorSeleccionado.ruc}</p>
                  <p><strong>Teléfono:</strong> {proveedorSeleccionado.telefono}</p>
                  <p><strong>Email:</strong> {proveedorSeleccionado.correo}</p>
                  <p><strong>Dirección:</strong> {proveedorSeleccionado.direccion}</p>
                  <p><strong>ID:</strong> {proveedorSeleccionado.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Edición */}
      {mostrarFormularioEditar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Proveedor</h3>
              <button onClick={cancelarEdicion} className="btn-cerrar">×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                direccion: formData.get('direccion'),
                correo: formData.get('correo'),
                ruc: formData.get('ruc'),
                nombre_empresa: formData.get('nombre_empresa'),
                telefono: formData.get('telefono')
              };
              actualizarProveedor(data);
            }} className="formulario-editar">
              <div className="campo-grupo">
                <label>Nombre:</label>
                <input type="text" name="nombre" defaultValue={proveedorAEditar?.nombre} required />
              </div>
              <div className="campo-grupo">
                <label>Apellido:</label>
                <input type="text" name="apellido" defaultValue={proveedorAEditar?.apellido} required />
              </div>
              <div className="campo-grupo">
                <label>Dirección:</label>
                <input type="text" name="direccion" defaultValue={proveedorAEditar?.direccion} required />
              </div>
              <div className="campo-grupo">
                <label>Correo:</label>
                <input type="email" name="correo" defaultValue={proveedorAEditar?.correo} required />
              </div>
              <div className="campo-grupo">
                <label>RUC:</label>
                <input type="text" name="ruc" defaultValue={proveedorAEditar?.ruc} required />
              </div>
              <div className="campo-grupo">
                <label>Nombre Empresa:</label>
                <input type="text" name="nombre_empresa" defaultValue={proveedorAEditar?.nombre_empresa} required />
              </div>
              <div className="campo-grupo">
                <label>Teléfono:</label>
                <input type="text" name="telefono" defaultValue={proveedorAEditar?.telefono} required />
              </div>
              <div className="botones-formulario">
                <button type="submit" className="btn-guardar">💾 Guardar Cambios</button>
                <button type="button" onClick={cancelarEdicion} className="btn-cancelar">❌ Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaProveedores;
