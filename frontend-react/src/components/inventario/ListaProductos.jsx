import React, { useState } from 'react';
import apiService from '../../services/apiService';

const ListaProductos = ({ productos, cargando, onRecargar }) => {
  const [filtro, setFiltro] = useState('');
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [mostrarSoloStockBajo, setMostrarSoloStockBajo] = useState(false);

  const productosFiltrados = productos
    .filter(producto => {
      const coincideFiltro = producto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                           producto.descripcion.toLowerCase().includes(filtro.toLowerCase());
      
      const cumpleStockBajo = !mostrarSoloStockBajo || producto.stock_actual <= producto.stock_minimo;
      
      return coincideFiltro && cumpleStockBajo;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'precio':
          return a.precio - b.precio;
        case 'stock':
          return a.stock_actual - b.stock_actual;
        case 'stock_bajo':
          return (a.stock_actual <= a.stock_minimo ? 0 : 1) - (b.stock_actual <= b.stock_minimo ? 0 : 1);
        default:
          return 0;
      }
    });

  const actualizarStockRapido = async (productoId, cambio) => {
    try {
      const resultado = await apiService.actualizarStock(productoId, cambio);
      if (resultado.exito) {
        onRecargar();
      } else {
        alert('Error actualizando stock: ' + resultado.mensaje);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      try {
        const resultado = await apiService.delete(`/inventario/productos/${id}`);
        if (resultado.exito) {
          alert('Producto eliminado exitosamente');
          onRecargar();
        } else {
          alert('Error: ' + resultado.mensaje);
        }
      } catch (error) {
        alert('Error al eliminar producto: ' + error.message);
      }
    }
  };

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner-grande"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="lista-productos">
      <div className="controles-lista">
        <div className="filtros">
          <div className="filtro-busqueda">
            <label htmlFor="filtro">
              <span className="label-icon">🔍</span>
              Buscar:
            </label>
            <input
              type="text"
              id="filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
            />
          </div>

          <div className="filtro-orden">
            <label htmlFor="orden">
              <span className="label-icon">🔄</span>
              Ordenar por:
            </label>
            <select
              id="orden"
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value)}
            >
              <option value="nombre">Nombre</option>
              <option value="precio">Precio</option>
              <option value="stock">Stock</option>
              <option value="stock_bajo">Stock Bajo Primero</option>
            </select>
          </div>

          <div className="filtro-stock">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={mostrarSoloStockBajo}
                onChange={(e) => setMostrarSoloStockBajo(e.target.checked)}
              />
              <span className="checkmark"></span>
              Solo stock bajo ⚠️
            </label>
          </div>
        </div>

        <div className="acciones-lista">
          <button onClick={onRecargar} className="btn-recargar">
            <span className="btn-icon">🔄</span>
            Actualizar Lista
          </button>
          <div className="estadisticas">
            <span className="total-productos">
              📦 Total: {productos.length} productos
            </span>
            <span className="productos-filtrados">
              🔍 Mostrando: {productosFiltrados.length}
            </span>
          </div>
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="sin-productos">
          <div className="sin-productos-icono">📋</div>
          <h3>No se encontraron productos</h3>
          <p>
            {productos.length === 0 
              ? 'Aún no hay productos registrados. ¡Registra tu primer producto!'
              : 'No hay productos que coincidan con los filtros aplicados.'
            }
          </p>
        </div>
      ) : (
        <div className="productos-grid">
          {productosFiltrados.map(producto => (
            <div 
              key={producto.id} 
              className={`producto-card ${producto.stock_actual <= producto.stock_minimo ? 'stock-bajo' : ''}`}
            >
              <div className="producto-header">
                <h4 className="producto-nombre">{producto.nombre}</h4>
                {producto.stock_actual <= producto.stock_minimo && (
                  <span className="alerta-badge">⚠️ Stock Bajo</span>
                )}
              </div>

              <div className="producto-info">
                <p className="producto-descripcion">{producto.descripcion}</p>
                
                <div className="producto-detalles">
                  <div className="detalle-item">
                    <span className="detalle-label">💲 Precio:</span>
                    <span className="detalle-valor">${producto.precio}</span>
                  </div>
                  
                  <div className="detalle-item">
                    <span className="detalle-label">📦 Stock:</span>
                    <span className={`detalle-valor ${producto.stock_actual <= producto.stock_minimo ? 'stock-bajo-text' : ''}`}>
                      {producto.stock_actual}
                    </span>
                  </div>
                  
                  <div className="detalle-item">
                    <span className="detalle-label">⚠️ Mínimo:</span>
                    <span className="detalle-valor">{producto.stock_minimo}</span>
                  </div>
                </div>
              </div>

              <div className="producto-acciones">
                <div className="stock-rapido">
                  <button 
                    onClick={() => actualizarStockRapido(producto.id, -1)}
                    className="btn-stock btn-disminuir"
                    disabled={producto.stock_actual <= 0}
                    title="Disminuir stock en 1"
                  >
                    ➖
                  </button>
                  <span className="stock-actual">{producto.stock_actual}</span>
                  <button 
                    onClick={() => actualizarStockRapido(producto.id, 1)}
                    className="btn-stock btn-aumentar"
                    title="Aumentar stock en 1"
                  >
                    ➕
                  </button>
                </div>
                <div className="producto-botones">
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="btn-eliminar"
                    title="Eliminar producto"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaProductos;
