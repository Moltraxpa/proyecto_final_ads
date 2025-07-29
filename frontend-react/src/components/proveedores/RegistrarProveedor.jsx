import React, { useState } from 'react';
import apiService from '../../services/apiService';

const RegistrarProveedor = () => {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    direccion: '',
    ruc: '',
    nombre_empresa: ''
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const resultado = await apiService.registrarProveedor(formData);

      if (resultado.exito) {
        setMensaje({ tipo: 'exito', texto: 'Proveedor registrado exitosamente' });
        // Limpiar formulario
        setFormData({
          nombre: '',
          apellido: '',
          telefono: '',
          correo: '',
          direccion: '',
          ruc: '',
          nombre_empresa: ''
        });
      } else {
        setMensaje({ tipo: 'error', texto: resultado.mensaje });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar el proveedor' });
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      direccion: '',
      ruc: '',
      nombre_empresa: ''
    });
    setMensaje(null);
  };

  return (
    <div>
      <div className="form-header">
        <h3>🏢 Registrar Nuevo Proveedor</h3>
        <p>Agrega un nuevo proveedor al sistema de gestión</p>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="formulario-proveedor">
        {/* Información Básica */}
        <div className="seccion-formulario">
          <h4>📋 Información Básica</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">🏢</span>
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={manejarCambio}
                required
                placeholder="Ej: Distribuidora ABC S.A."
              />
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">👤</span>
                Nombre del Representante *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                required
                placeholder="Nombre del representante"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">👤</span>
                Apellido del Representante *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={manejarCambio}
                required
                placeholder="Apellido del representante"
              />
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🆔</span>
                RUC *
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={manejarCambio}
                required
                placeholder="0123456789001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">📞</span>
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={manejarCambio}
                required
                placeholder="0999999999"
              />
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">📧</span>
                Email *
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={manejarCambio}
                required
                placeholder="contacto@empresa.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📍</span>
              Dirección
            </label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={manejarCambio}
              rows="2"
              placeholder="Dirección completa del proveedor"
            />
          </div>
        </div>

        {/* Información Comercial */}
        <div className="seccion-formulario">
          <h4>💼 Información Comercial</h4>
          
          <div className="form-group">
            <label>
              <span className="label-icon">📦</span>
              Productos que Ofrece *
            </label>
            <textarea
              name="productos"
              value={formData.productos}
              onChange={manejarCambio}
              required
              rows="3"
              placeholder="Describe los productos o servicios que ofrece este proveedor..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">💰</span>
                Condiciones de Pago *
              </label>
              <select
                name="condicionesPago"
                value={formData.condicionesPago}
                onChange={manejarCambio}
                required
              >
                <option value="contado">💵 Contado</option>
                <option value="credito_15">💳 Crédito 15 días</option>
                <option value="credito_30">💳 Crédito 30 días</option>
                <option value="credito_45">💳 Crédito 45 días</option>
                <option value="credito_60">💳 Crédito 60 días</option>
                <option value="otro">🔄 Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🚚</span>
                Tiempo de Entrega (días)
              </label>
              <input
                type="number"
                name="tiempoEntrega"
                value={formData.tiempoEntrega}
                onChange={manejarCambio}
                min="0"
                max="365"
                placeholder="Ej: 7"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">⭐</span>
              Calificación Inicial (1-5)
            </label>
            <select
              name="calificacion"
              value={formData.calificacion}
              onChange={manejarCambio}
            >
              <option value="1">⭐ 1 - Muy Malo</option>
              <option value="2">⭐⭐ 2 - Malo</option>
              <option value="3">⭐⭐⭐ 3 - Regular</option>
              <option value="4">⭐⭐⭐⭐ 4 - Bueno</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 - Excelente</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              Notas Adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={manejarCambio}
              rows="3"
              placeholder="Información adicional, comentarios, observaciones especiales..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-registrar"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              <>
                <span>💾</span>
                Registrar Proveedor
              </>
            )}
          </button>

          <button
            type="button"
            onClick={limpiarFormulario}
            className="btn-cancelar"
            disabled={cargando}
          >
            <span>🔄</span>
            Limpiar Formulario
          </button>
        </div>
      </form>

      <div className="form-info">
        <h4>ℹ️ Información Importante</h4>
        <ul>
          <li>✅ Los campos marcados con * son obligatorios</li>
          <li>📝 La información puede ser editada posteriormente</li>
          <li>⭐ La calificación ayuda a evaluar el rendimiento del proveedor</li>
          <li>🚚 El tiempo de entrega es orientativo y puede variar</li>
          <li>💼 Mantén actualizada la información de contacto</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrarProveedor;
