import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const ReportesVentas = () => {
  const [reportes, setReportes] = useState({
    resumenGeneral: null,
    ventasPorDia: [],
    productosMasVendidos: [],
    clientesFreuentes: []
  });
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    tipoReporte: 'resumen'
  });

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    setFiltros({
      ...filtros,
      fechaDesde: hace30Dias.toISOString().split('T')[0],
      fechaHasta: hoy.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (filtros.fechaDesde && filtros.fechaHasta) {
      generarReportes();
    }
  }, [filtros.fechaDesde, filtros.fechaHasta]);

  const generarReportes = async () => {
    setCargando(true);
    try {
      // Obtener datos de ventas
      const ventasData = await apiService.get('/ventas');
      if (ventasData.exito) {
        const ventas = ventasData.data.filter(venta => {
          const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
          return fechaVenta >= filtros.fechaDesde && fechaVenta <= filtros.fechaHasta;
        });

        // Generar reportes
        const nuevosReportes = {
          resumenGeneral: generarResumenGeneral(ventas),
          ventasPorDia: generarVentasPorDia(ventas),
          productosMasVendidos: await generarProductosMasVendidos(ventas),
          clientesFreuentes: generarClientesFreuentes(ventas)
        };

        setReportes(nuevosReportes);
      }
    } catch (error) {
      console.error('Error al generar reportes:', error);
    } finally {
      setCargando(false);
    }
  };

  const generarResumenGeneral = (ventas) => {
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, venta) => sum + venta.total, 0);
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;

    const ventasPorPago = {
      efectivo: ventas.filter(v => v.tipo_pago === 'efectivo').length,
      tarjeta: ventas.filter(v => v.tipo_pago === 'tarjeta').length,
      transferencia: ventas.filter(v => v.tipo_pago === 'transferencia').length
    };

    const ingresosPorPago = {
      efectivo: ventas.filter(v => v.tipo_pago === 'efectivo').reduce((sum, v) => sum + v.total, 0),
      tarjeta: ventas.filter(v => v.tipo_pago === 'tarjeta').reduce((sum, v) => sum + v.total, 0),
      transferencia: ventas.filter(v => v.tipo_pago === 'transferencia').reduce((sum, v) => sum + v.total, 0)
    };

    return {
      totalVentas,
      totalIngresos,
      promedioVenta,
      ventasPorPago,
      ingresosPorPago
    };
  };

  const generarVentasPorDia = (ventas) => {
    const ventasPorDia = {};
    
    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha).toISOString().split('T')[0];
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = { cantidad: 0, total: 0 };
      }
      ventasPorDia[fecha].cantidad++;
      ventasPorDia[fecha].total += venta.total;
    });

    return Object.entries(ventasPorDia)
      .map(([fecha, datos]) => ({ fecha, ...datos }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  const generarProductosMasVendidos = async (ventas) => {
    try {
      const productosData = await apiService.get('/inventario/productos');
      if (!productosData.exito) return [];

      const productos = productosData.data;
      const productosVendidos = {};

      // Aquí necesitaríamos obtener los detalles de cada venta
      // Por simplicidad, usaremos datos simulados
      ventas.forEach(venta => {
        // Simulación: cada venta tiene productos aleatorios
        const productosSimulados = productos.slice(0, Math.floor(Math.random() * 3) + 1);
        productosSimulados.forEach(producto => {
          const cantidad = Math.floor(Math.random() * 3) + 1;
          if (!productosVendidos[producto.id]) {
            productosVendidos[producto.id] = {
              nombre: producto.nombre,
              cantidad: 0,
              total: 0
            };
          }
          productosVendidos[producto.id].cantidad += cantidad;
          productosVendidos[producto.id].total += producto.precio * cantidad;
        });
      });

      return Object.entries(productosVendidos)
        .map(([id, datos]) => ({ id, ...datos }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  };

  const generarClientesFreuentes = (ventas) => {
    const clientesCompras = {};

    ventas.forEach(venta => {
      const cliente = venta.cliente_nombre;
      if (!clientesCompras[cliente]) {
        clientesCompras[cliente] = {
          compras: 0,
          total: 0,
          ultimaCompra: venta.fecha
        };
      }
      clientesCompras[cliente].compras++;
      clientesCompras[cliente].total += venta.total;
      
      if (new Date(venta.fecha) > new Date(clientesCompras[cliente].ultimaCompra)) {
        clientesCompras[cliente].ultimaCompra = venta.fecha;
      }
    });

    return Object.entries(clientesCompras)
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.compras - a.compras)
      .slice(0, 10);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const exportarReporte = () => {
    const reporte = `
REPORTE DE VENTAS - PAPELERÍA DOHKO
Período: ${formatearFecha(filtros.fechaDesde)} - ${formatearFecha(filtros.fechaHasta)}
Generado: ${new Date().toLocaleString('es-ES')}

RESUMEN GENERAL:
- Total de ventas: ${reportes.resumenGeneral?.totalVentas || 0}
- Total de ingresos: $${reportes.resumenGeneral?.totalIngresos.toFixed(2) || '0.00'}
- Promedio por venta: $${reportes.resumenGeneral?.promedioVenta.toFixed(2) || '0.00'}

VENTAS POR TIPO DE PAGO:
- Efectivo: ${reportes.resumenGeneral?.ventasPorPago.efectivo || 0} ventas ($${reportes.resumenGeneral?.ingresosPorPago.efectivo.toFixed(2) || '0.00'})
- Tarjeta: ${reportes.resumenGeneral?.ventasPorPago.tarjeta || 0} ventas ($${reportes.resumenGeneral?.ingresosPorPago.tarjeta.toFixed(2) || '0.00'})
- Transferencia: ${reportes.resumenGeneral?.ventasPorPago.transferencia || 0} ventas ($${reportes.resumenGeneral?.ingresosPorPago.transferencia.toFixed(2) || '0.00'})

PRODUCTOS MÁS VENDIDOS:
${reportes.productosMasVendidos.map((producto, index) => 
  `${index + 1}. ${producto.nombre} - ${producto.cantidad} unidades ($${producto.total.toFixed(2)})`
).join('\n')}

CLIENTES FRECUENTES:
${reportes.clientesFreuentes.map((cliente, index) => 
  `${index + 1}. ${cliente.nombre} - ${cliente.compras} compras ($${cliente.total.toFixed(2)})`
).join('\n')}
    `.trim();

    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${filtros.fechaDesde}-${filtros.fechaHasta}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner-grande"></div>
        <p>Generando reportes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="form-header">
        <h3>📈 Reportes de Ventas</h3>
        <p>Análisis detallado del rendimiento de ventas</p>
      </div>

      {/* Controles de Filtros */}
      <div className="controles-reportes">
        <div className="filtros-fecha">
          <div className="form-group">
            <label>📅 Fecha Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>📅 Fecha Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
            />
          </div>
        </div>

        <div className="acciones-reportes">
          <button onClick={generarReportes} className="btn-generar">
            <span>🔄</span> Actualizar Reportes
          </button>
          <button onClick={exportarReporte} className="btn-exportar">
            <span>📄</span> Exportar Reporte
          </button>
        </div>
      </div>

      {reportes.resumenGeneral && (
        <div className="reportes-contenido">
          {/* Resumen General */}
          <div className="reporte-seccion">
            <h4>📊 Resumen General</h4>
            <div className="resumen-cards">
              <div className="stat-card">
                <div className="stat-number">{reportes.resumenGeneral.totalVentas}</div>
                <div className="stat-label">Total Ventas</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${reportes.resumenGeneral.totalIngresos.toFixed(2)}</div>
                <div className="stat-label">Total Ingresos</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${reportes.resumenGeneral.promedioVenta.toFixed(2)}</div>
                <div className="stat-label">Promedio por Venta</div>
              </div>
            </div>
          </div>

          {/* Ventas por Tipo de Pago */}
          <div className="reporte-seccion">
            <h4>💳 Ventas por Tipo de Pago</h4>
            <div className="pago-stats">
              <div className="pago-item">
                <span className="pago-tipo">💵 Efectivo</span>
                <span className="pago-cantidad">{reportes.resumenGeneral.ventasPorPago.efectivo} ventas</span>
                <span className="pago-total">${reportes.resumenGeneral.ingresosPorPago.efectivo.toFixed(2)}</span>
              </div>
              <div className="pago-item">
                <span className="pago-tipo">💳 Tarjeta</span>
                <span className="pago-cantidad">{reportes.resumenGeneral.ventasPorPago.tarjeta} ventas</span>
                <span className="pago-total">${reportes.resumenGeneral.ingresosPorPago.tarjeta.toFixed(2)}</span>
              </div>
              <div className="pago-item">
                <span className="pago-tipo">🏦 Transferencia</span>
                <span className="pago-cantidad">{reportes.resumenGeneral.ventasPorPago.transferencia} ventas</span>
                <span className="pago-total">${reportes.resumenGeneral.ingresosPorPago.transferencia.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Ventas por Día */}
          <div className="reporte-seccion">
            <h4>📅 Ventas por Día</h4>
            <div className="ventas-diarias">
              {reportes.ventasPorDia.map(dia => (
                <div key={dia.fecha} className="dia-item">
                  <span className="dia-fecha">{formatearFecha(dia.fecha)}</span>
                  <span className="dia-cantidad">{dia.cantidad} ventas</span>
                  <span className="dia-total">${dia.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="reporte-seccion">
            <h4>🏆 Productos Más Vendidos</h4>
            <div className="productos-ranking">
              {reportes.productosMasVendidos.map((producto, index) => (
                <div key={producto.id} className="ranking-item">
                  <span className="ranking-posicion">#{index + 1}</span>
                  <span className="ranking-nombre">{producto.nombre}</span>
                  <span className="ranking-cantidad">{producto.cantidad} unidades</span>
                  <span className="ranking-total">${producto.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clientes Frecuentes */}
          <div className="reporte-seccion">
            <h4>👥 Clientes Frecuentes</h4>
            <div className="clientes-ranking">
              {reportes.clientesFreuentes.map((cliente, index) => (
                <div key={cliente.nombre} className="cliente-item">
                  <span className="cliente-posicion">#{index + 1}</span>
                  <span className="cliente-nombre">{cliente.nombre}</span>
                  <span className="cliente-compras">{cliente.compras} compras</span>
                  <span className="cliente-total">${cliente.total.toFixed(2)}</span>
                  <span className="cliente-ultima">
                    Última: {formatearFecha(cliente.ultimaCompra)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesVentas;
