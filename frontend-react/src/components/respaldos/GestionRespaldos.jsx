import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const GestionRespaldos = () => {
    const [respaldos, setRespaldos] = useState([]);
    const [estadoProgramador, setEstadoProgramador] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        cargarEstadoRespaldos();
    }, []);

    const cargarEstadoRespaldos = async () => {
        try {
            setCargando(true);
            setMensaje(''); // Limpiar mensajes anteriores
            
            console.log('🔍 Cargando estado de respaldos...');
            const response = await apiService.get('/respaldos/estado');
            console.log('📡 Respuesta del servidor:', response);
            
            if (response.exito) {
                console.log('📊 Estructura completa de response.data:', response.data);
                console.log('🔍 Verificando respaldos_disponibles:', response.data.data?.respaldos_disponibles);
                console.log('🔍 Primer respaldo con tipo:', response.data.data?.respaldos_disponibles?.[0]);
                
                const respaldosData = response.data.data?.respaldos_disponibles || [];
                console.log('📁 Respaldos extraídos:', respaldosData);
                console.log('📁 Respaldos encontrados:', respaldosData.length);
                
                setRespaldos(respaldosData);
                setEstadoProgramador(response.data.data?.programador);
                console.log('✅ Estado cargado correctamente');
            } else {
                console.log('❌ Error en respuesta:', response);
                setMensaje({ tipo: 'error', texto: 'Error: No se pudo obtener el estado de respaldos' });
                setRespaldos([]);
            }
        } catch (error) {
            console.error('💥 Error al cargar estado de respaldos:', error);
            setMensaje({ tipo: 'error', texto: 'Error al cargar el estado de respaldos' });
            setRespaldos([]); // Asegurar que respaldos sea un array vacío
        } finally {
            setCargando(false);
        }
    };

    const crearRespaldoManual = async () => {
        try {
            setCargando(true);
            setMensaje({ tipo: 'procesando', texto: '⏳ Creando respaldo...' });
            
            console.log('🔧 Iniciando respaldo manual...');
            const response = await apiService.post('/respaldos/manual');
            console.log('📡 Respuesta del respaldo manual:', response);
            
            if (response.exito) {
                console.log('📊 Estructura respuesta respaldo manual:', response);
                console.log('📄 Data del respaldo:', response.data.data);
                
                const mensaje = `✅ Respaldo creado: ${response.data.data?.archivo} (${response.data.data?.tamaño})`;
                console.log('💬 Mensaje generado:', mensaje);
                console.log('✅ Respaldo exitoso:', mensaje);
                setMensaje({ tipo: 'exito', texto: mensaje });
                await cargarEstadoRespaldos(); // Recargar lista
                
                // Limpiar mensaje después de 5 segundos
                setTimeout(() => setMensaje(''), 5000);
            } else {
                console.log('❌ Error en respuesta del respaldo:', response);
                setMensaje({ tipo: 'error', texto: '❌ Error: No se pudo crear el respaldo' });
            }
        } catch (error) {
            console.error('💥 Error al crear respaldo manual:', error);
            setMensaje({ tipo: 'error', texto: '❌ Error al crear respaldo manual' });
            
            // Limpiar mensaje de error después de 5 segundos
            setTimeout(() => setMensaje(''), 5000);
        } finally {
            setCargando(false);
        }
    };

    const limpiarRespaldos = async () => {
        if (!window.confirm('¿Estás seguro de eliminar respaldos antiguos (más de 6 meses)?')) {
            return;
        }

        try {
            setCargando(true);
            setMensaje({ tipo: 'procesando', texto: '🧹 Limpiando respaldos antiguos...' });
            
            const response = await apiService.delete('/respaldos/limpiar');
            
            if (response.exito) {
                setMensaje({ tipo: 'exito', texto: `✅ ${response.data.mensaje || response.mensaje}` });
                await cargarEstadoRespaldos(); // Recargar lista
                
                // Limpiar mensaje después de 5 segundos
                setTimeout(() => setMensaje(''), 5000);
            } else {
                setMensaje({ tipo: 'error', texto: '❌ Error al limpiar respaldos' });
            }
        } catch (error) {
            console.error('Error al limpiar respaldos:', error);
            setMensaje({ tipo: 'error', texto: '❌ Error al limpiar respaldos' });
            
            // Limpiar mensaje de error después de 5 segundos
            setTimeout(() => setMensaje(''), 5000);
        } finally {
            setCargando(false);
        }
    };

    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleString('es-EC');
    };

    const formatearTamaño = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="gestion-respaldos">
            <style>{`
                .gestion-respaldos {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .cargando-global {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    padding: 20px;
                    background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
                    border: 2px solid #2196f3;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    font-weight: bold;
                    color: #1976d2;
                    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
                }
                
                .spinner {
                    width: 28px;
                    height: 28px;
                    border: 4px solid #e3f2fd;
                    border-top: 4px solid #2196f3;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .mensaje-respaldo {
                    padding: 16px 20px;
                    margin: 20px 0;
                    border-radius: 10px;
                    font-weight: 500;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    animation: slideInDown 0.4s ease-out;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                .mensaje-respaldo::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 4px;
                    background: currentColor;
                }
                
                .mensaje-respaldo.exito {
                    background: linear-gradient(135deg, #d4edda, #c8e6c9);
                    color: #2e7d32;
                    border: 1px solid #4caf50;
                }
                
                .mensaje-respaldo.error {
                    background: linear-gradient(135deg, #f8d7da, #ffcdd2);
                    color: #c62828;
                    border: 1px solid #f44336;
                }
                
                .mensaje-respaldo.procesando {
                    background: linear-gradient(135deg, #fff3cd, #ffe082);
                    color: #f57c00;
                    border: 1px solid #ff9800;
                }
                
                .mensaje-respaldo.info {
                    background: linear-gradient(135deg, #d1ecf1, #b3e5fc);
                    color: #0277bd;
                    border: 1px solid #03a9f4;
                }
                
                .mensaje-contenido {
                    flex: 1;
                    font-size: 16px;
                    line-height: 1.4;
                }
                
                .mensaje-cerrar {
                    background: none;
                    border: none;
                    font-size: 24px;
                    font-weight: bold;
                    color: inherit;
                    opacity: 0.7;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 15px;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }
                
                .mensaje-cerrar:hover {
                    opacity: 1;
                    background: rgba(0,0,0,0.1);
                }
                
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .estado-programador {
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                
                .estado-programador.activo {
                    background: linear-gradient(135deg, #d4edda, #c8e6c9);
                    border-left: 5px solid #28a745;
                }
                
                .estado-programador.inactivo {
                    background: linear-gradient(135deg, #f8d7da, #ffcdd2);
                    border-left: 5px solid #dc3545;
                }
                
                .botones-control {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    margin: 15px 0;
                }
                
                .botones-control .btn {
                    padding: 10px 20px;
                    font-weight: 500;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                
                .lista-respaldos {
                    margin-top: 25px;
                }
                
                .no-respaldos {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                    font-style: italic;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                
                .tabla-respaldos table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .tabla-respaldos th {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                
                .tabla-respaldos td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #eee;
                }
                
                .tabla-respaldos tr:hover {
                    background-color: #f8f9fa;
                }
                
                .nombre-archivo {
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                    color: #333;
                }
            `}</style>
            
            <div className="card">
                <div className="card-header">
                    <h3>🔒 Gestión de Respaldos</h3>
                    <p>Sistema automático de respaldos de la base de datos</p>
                </div>

                <div className="card-body">
                    {/* Indicador de carga global */}
                    {cargando && (
                        <div className="cargando-global">
                            <div className="spinner"></div>
                            <span>Procesando operación...</span>
                        </div>
                    )}

                    {/* Estado del Programador */}
                    <div className="seccion-estado">
                        <h4>📅 Sistema de Respaldos Automáticos</h4>
                        {estadoProgramador && (
                            <div className={`estado-programador ${estadoProgramador.ejecutando ? 'activo' : 'inactivo'}`}>
                                <div className="estado-badge">
                                    {estadoProgramador.ejecutando ? '🟢 Sistema Activo' : '🔴 Sistema Inactivo'}
                                </div>
                                <p><strong>📅 Fecha del servidor:</strong> {estadoProgramador.fecha_actual}</p>
                                <p><strong>⏰ Programación:</strong> Respaldos automáticos cada mes el día 1 a las 2:00 AM</p>
                                <p><strong>🔄 Limpieza:</strong> Se eliminan respaldos antiguos automáticamente cada 90 días</p>
                                
                                <div style={{marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.3)', borderRadius: '5px'}}>
                                    <small>
                                        <strong>ℹ️ Información:</strong> El sistema crea respaldos automáticamente según la programación. 
                                        También puedes crear respaldos manuales cuando lo necesites.
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controles */}
                    <div className="controles-respaldo">
                        <h4>🎛️ Controles Manuales</h4>
                        <div className="botones-control">
                            <button 
                                onClick={crearRespaldoManual}
                                disabled={cargando}
                                className="btn btn-primary"
                            >
                                {cargando ? '⏳ Procesando...' : '💾 Crear Respaldo Manual'}
                            </button>
                            
                            <button 
                                onClick={limpiarRespaldos}
                                disabled={cargando}
                                className="btn btn-warning"
                            >
                                🧹 Limpiar Respaldos Antiguos
                            </button>
                            
                            <button 
                                onClick={cargarEstadoRespaldos}
                                disabled={cargando}
                                className="btn btn-secondary"
                            >
                                🔄 Actualizar
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    {mensaje && (
                        <div className={`mensaje-respaldo ${mensaje.tipo || 'info'}`}>
                            <div className="mensaje-contenido">
                                {mensaje.texto || mensaje}
                            </div>
                            <button 
                                className="mensaje-cerrar"
                                onClick={() => setMensaje('')}
                                title="Cerrar mensaje"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Lista de Respaldos */}
                    <div className="lista-respaldos">
                        <h4>📁 Respaldos Disponibles ({respaldos?.length || 0})</h4>
                        
                        {!respaldos || respaldos.length === 0 ? (
                            <p className="no-respaldos">No hay respaldos disponibles</p>
                        ) : (
                            <div className="tabla-respaldos">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>📄 Archivo</th>
                                            <th>📅 Fecha</th>
                                            <th>📊 Tamaño</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {respaldos.map((respaldo, index) => (
                                            <tr key={index}>
                                                <td className="nombre-archivo">{respaldo.nombre}</td>
                                                <td>{formatearFecha(respaldo.fecha)}</td>
                                                <td>{respaldo.tamaño}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .gestion-respaldos {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .seccion-estado {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .estado-programador {
                    padding: 1rem;
                    border-radius: 6px;
                    border-left: 4px solid;
                }

                .estado-programador.activo {
                    background: #d4edda;
                    border-color: #28a745;
                }

                .estado-programador.inactivo {
                    background: #f8d7da;
                    border-color: #dc3545;
                }

                .estado-badge {
                    font-weight: bold;
                    font-size: 1.1em;
                    margin-bottom: 0.5rem;
                }

                .controles-respaldo {
                    margin-bottom: 2rem;
                }

                .botones-control {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .botones-control .btn {
                    flex: 1;
                    min-width: 200px;
                }

                .mensaje-respaldo {
                    position: relative;
                    padding: 1rem 3rem 1rem 1rem;
                    margin: 1rem 0;
                    border-radius: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    border-left: 4px solid;
                    font-size: 0.95rem;
                    line-height: 1.4;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .mensaje-respaldo.exito {
                    background: #d4edda;
                    border-color: #28a745;
                    color: #155724;
                }

                .mensaje-respaldo.error {
                    background: #f8d7da;
                    border-color: #dc3545;
                    color: #721c24;
                }

                .mensaje-respaldo.procesando {
                    background: #fff3cd;
                    border-color: #ffc107;
                    color: #856404;
                }

                .mensaje-respaldo.info {
                    background: #d1ecf1;
                    border-color: #17a2b8;
                    color: #0c5460;
                }

                .mensaje-contenido {
                    font-weight: 500;
                }

                .mensaje-cerrar {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: inherit;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }

                .mensaje-cerrar:hover {
                    opacity: 1;
                }

                .lista-respaldos h4 {
                    margin-bottom: 1rem;
                }

                .no-respaldos {
                    text-align: center;
                    color: #6c757d;
                    font-style: italic;
                    padding: 2rem;
                }

                .tabla-respaldos {
                    overflow-x: auto;
                }

                .tabla-respaldos table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }

                .tabla-respaldos th,
                .tabla-respaldos td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid #dee2e6;
                }

                .tabla-respaldos th {
                    background: #f8f9fa;
                    font-weight: 600;
                }

                .nombre-archivo {
                    font-family: monospace;
                    font-size: 0.9em;
                }

                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: 500;
                }

                .badge-info {
                    background: #d1ecf1;
                    color: #0c5460;
                }

                @media (max-width: 768px) {
                    .botones-control {
                        flex-direction: column;
                    }
                    
                    .botones-control .btn {
                        min-width: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default GestionRespaldos;
