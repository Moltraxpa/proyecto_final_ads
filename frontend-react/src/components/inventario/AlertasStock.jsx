import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const AlertasStock = () => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarAlertas = async () => {
    setCargando(true);
    try {
      const resultado = await apiService.obtenerAlertasStockBajo();
      if (resultado.exito) {
        setAlertas(resultado.data || []);
      } else {
        console.error('Error cargando alertas:', resultado.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const actualizarStock = async (productoId, cantidad) => {
    try {
      const resultado = await apiService.actualizarStock(productoId, cantidad);
      if (resultado.exito) {
        cargarAlertas(); // Recargar alertas
      } else {
        alert('Error actualizando stock: ' + resultado.mensaje);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner-grande"></div>
        <p>Cargando alertas...</p>
      </div>
    );
  }

  return (
    <div className="alertas-stock">
      <div className="alertas-header">
        <h3>⚠️ Alertas de Stock Bajo</h3>
        <p>Productos que necesitan reposición urgente</p>
        <button onClick={cargarAlertas} className="btn-recargar">
          <span className="btn-icon">🔄</span>
          Actualizar Alertas
        </button>
      </div>

      {alertas.length === 0 ? (
        <div className="sin-alertas">
          <div className="sin-alertas-icono">✅</div>
          <h3>¡Todo está bien!</h3>
          <p>No hay productos con stock bajo en este momento.</p>
          <div className="tips">
            <h4>💡 Consejos:</h4>
            <ul>
              <li>• Revisa regularmente las alertas para mantener el inventario</li>
              <li>• Ajusta los stocks mínimos según la demanda</li>
              <li>• Programa pedidos automáticos para productos críticos</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="resumen-alertas">
            <div className="stat-card urgente">
              <div className="stat-number">{alertas.length}</div>
              <div className="stat-label">Productos con stock bajo</div>
            </div>
            <div className="stat-card critico">
              <div className="stat-number">
                {alertas.filter(p => p.stock_actual === 0).length}
              </div>
              <div className="stat-label">Sin stock (crítico)</div>
            </div>
            <div className="stat-card muy-bajo">
              <div className="stat-number">
                {alertas.filter(p => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo / 2).length}
              </div>
              <div className="stat-label">Stock muy bajo</div>
            </div>
          </div>

          <div className="alertas-lista">
            {alertas.map(producto => {
              const porcentajeStock = (producto.stock_actual / producto.stock_minimo) * 100;
              let nivelAlerta = 'bajo';
              
              if (producto.stock_actual === 0) {
                nivelAlerta = 'critico';
              } else if (porcentajeStock <= 50) {
                nivelAlerta = 'muy-bajo';
              }

              return (
                <div key={producto.id} className={`alerta-card ${nivelAlerta}`}>
                  <div className="alerta-info">
                    <div className="alerta-header">
                      <h4 className="producto-nombre">{producto.nombre}</h4>
                      <span className={`nivel-badge ${nivelAlerta}`}>
                        {producto.stock_actual === 0 ? '🔴 SIN STOCK' : 
                         nivelAlerta === 'muy-bajo' ? '🟠 MUY BAJO' : '🟡 STOCK BAJO'}
                      </span>
                    </div>
                    
                    <p className="producto-descripcion">{producto.descripcion}</p>
                    
                    <div className="stock-info">
                      <div className="stock-actual">
                        <span className="label">Stock Actual:</span>
                        <span className={`valor ${producto.stock_actual === 0 ? 'critico' : ''}`}>
                          {producto.stock_actual}
                        </span>
                      </div>
                      <div className="stock-minimo">
                        <span className="label">Stock Mínimo:</span>
                        <span className="valor">{producto.stock_minimo}</span>
                      </div>
                      <div className="precio">
                        <span className="label">Precio:</span>
                        <span className="valor">${producto.precio}</span>
                      </div>
                    </div>

                    <div className="barra-progreso">
                      <div 
                        className={`progreso ${nivelAlerta}`}
                        style={{ width: `${Math.min(porcentajeStock, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="alerta-acciones">
                    <div className="acciones-rapidas">
                      <h5>Acciones Rápidas:</h5>
                      <div className="botones-stock">
                        <button 
                          onClick={() => actualizarStock(producto.id, 10)}
                          className="btn-stock-rapido"
                        >
                          +10
                        </button>
                        <button 
                          onClick={() => actualizarStock(producto.id, 25)}
                          className="btn-stock-rapido"
                        >
                          +25
                        </button>
                        <button 
                          onClick={() => actualizarStock(producto.id, 50)}
                          className="btn-stock-rapido"
                        >
                          +50
                        </button>
                      </div>
                    </div>

                    <div className="sugerencias">
                      <h5>💡 Sugerencias:</h5>
                      <ul>
                        <li>Reponer al menos {producto.stock_minimo * 2} unidades</li>
                        <li>Contactar proveedor para pedido urgente</li>
                        {producto.stock_actual === 0 && (
                          <li className="critico">⚠️ CRÍTICO: Producto agotado</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AlertasStock;
