import React from 'react';
import GestionRespaldos from '../components/respaldos/GestionRespaldos';

const RespaldosPage = () => {
    return (
        <div className="respaldos-page">
            <div className="page-header">
                <h1>🔒 Sistema de Respaldos</h1>
                <p className="page-description">
                    Gestión automática y manual de respaldos de la base de datos del sistema
                </p>
            </div>

            <div className="page-content">
                <GestionRespaldos />
            </div>

            <div className="info-section">
                <div className="card">
                    <div className="card-header">
                        <h3>ℹ️ Información del Sistema de Respaldos</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <h4>🕐 Programación Automática</h4>
                                <p>Los respaldos se ejecutan automáticamente cada mes el día 1 a las 2:00 AM</p>
                            </div>
                            
                            <div className="info-item">
                                <h4>💾 Respaldos Manuales</h4>
                                <p>Puedes crear respaldos manuales en cualquier momento usando el botón correspondiente</p>
                            </div>
                            
                            <div className="info-item">
                                <h4>🧹 Limpieza Automática</h4>
                                <p>Los respaldos antiguos (más de 6 meses) se eliminan automáticamente para ahorrar espacio</p>
                            </div>
                            
                            <div className="info-item">
                                <h4>📁 Ubicación</h4>
                                <p>Los respaldos se almacenan en la carpeta <code>database/respaldos/</code> del sistema</p>
                            </div>
                            
                            <div className="info-item">
                                <h4>🔒 Seguridad</h4>
                                <p>Cada respaldo incluye toda la información de productos, ventas, inventario y proveedores</p>
                            </div>
                            
                            <div className="info-item">
                                <h4>📊 Formato</h4>
                                <p>Los respaldos se guardan en formato SQLite con timestamp para fácil identificación</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .respaldos-page {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                }

                .page-description {
                    color: #6c757d;
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .page-content {
                    margin-bottom: 3rem;
                }

                .info-section {
                    margin-top: 3rem;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .info-item {
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #007bff;
                }

                .info-item h4 {
                    margin: 0 0 0.5rem 0;
                    color: #2c3e50;
                }

                .info-item p {
                    margin: 0;
                    color: #6c757d;
                    line-height: 1.5;
                }

                .info-item code {
                    background: #e9ecef;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                }

                @media (max-width: 768px) {
                    .respaldos-page {
                        padding: 1rem;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default RespaldosPage;
