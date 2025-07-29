const API_BASE_URL = 'http://localhost:8000/api';

// Clase para manejar todas las llamadas a la API
class ApiService {
  
  // Método genérico para hacer peticiones
  async hacerPeticion(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        // Intentar obtener el mensaje de error del backend
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.mensaje) {
            errorMessage = errorData.mensaje;
          }
        } catch {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const data = await response.json();
      return { exito: true, data };
    } catch (error) {
      console.error('Error en petición API:', error);
      return { exito: false, mensaje: error.message, status: error.status };
    }
  }

  // ============ MÉTODOS HTTP BÁSICOS ============
  
  async get(endpoint) {
    return this.hacerPeticion(endpoint);
  }

  async post(endpoint, data) {
    return this.hacerPeticion(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.hacerPeticion(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.hacerPeticion(endpoint, {
      method: 'DELETE'
    });
  }

  // ============ INVENTARIO ============
  
  async obtenerProductos() {
    return this.hacerPeticion('/inventario/productos');
  }

  async obtenerProducto(id) {
    return this.hacerPeticion(`/inventario/productos/${id}`);
  }

  async registrarProducto(producto) {
    return this.hacerPeticion('/inventario/productos', {
      method: 'POST',
      body: JSON.stringify(producto)
    });
  }

  async actualizarProducto(id, producto) {
    return this.hacerPeticion(`/inventario/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto)
    });
  }

  async actualizarStock(productoId, cantidad) {
    return this.hacerPeticion('/inventario/stock/actualizar', {
      method: 'PUT',
      body: JSON.stringify({ producto_id: productoId, cantidad })
    });
  }

  async verificarDisponibilidad(productoId) {
    return this.hacerPeticion(`/inventario/disponibilidad/${productoId}`);
  }

  async obtenerAlertasStockBajo() {
    return this.hacerPeticion('/inventario/alertas/stock-bajo');
  }

  async obtenerHistorialProducto(productoId) {
    return this.hacerPeticion(`/inventario/productos/${productoId}/historial`);
  }

  // ============ VENTAS ============
  
  async obtenerVentas() {
    return this.hacerPeticion('/ventas/');
  }

  async obtenerVenta(id) {
    return this.hacerPeticion(`/ventas/${id}`);
  }

  async registrarVenta(venta) {
    return this.hacerPeticion('/ventas/', {
      method: 'POST',
      body: JSON.stringify(venta)
    });
  }

  async verificarDisponibilidadVenta(productos) {
    return this.hacerPeticion('/ventas/verificar-disponibilidad', {
      method: 'POST',
      body: JSON.stringify({ productos })
    });
  }

  async procesarPago(ventaId, pago) {
    return this.hacerPeticion(`/ventas/${ventaId}/pago`, {
      method: 'POST',
      body: JSON.stringify(pago)
    });
  }

  async generarComprobante(ventaId) {
    return this.hacerPeticion(`/ventas/${ventaId}/comprobante`, {
      method: 'POST'
    });
  }

  async obtenerProductosVenta(ventaId) {
    return this.hacerPeticion(`/ventas/${ventaId}/productos`);
  }

  // ============ PROVEEDORES ============
  
  async obtenerProveedores() {
    return this.hacerPeticion('/proveedores/');
  }

  async obtenerProveedor(id) {
    return this.hacerPeticion(`/proveedores/${id}`);
  }

  async registrarProveedor(proveedor) {
    return this.hacerPeticion('/proveedores/', {
      method: 'POST',
      body: JSON.stringify(proveedor)
    });
  }

  async crearOrden(orden) {
    return this.hacerPeticion('/proveedores/ordenes', {
      method: 'POST',
      body: JSON.stringify(orden)
    });
  }

  async obtenerOrdenes() {
    return this.hacerPeticion('/proveedores/ordenes');
  }

  async crearFactura(factura) {
    return this.hacerPeticion('/proveedores/facturas', {
      method: 'POST',
      body: JSON.stringify(factura)
    });
  }

  async obtenerFacturas() {
    return this.hacerPeticion('/proveedores/facturas');
  }

  async procesarPagoFactura(proveedorId, facturaId, monto) {
    return this.hacerPeticion(`/proveedores/${proveedorId}/pago-factura/${facturaId}`, {
      method: 'PUT',
      body: JSON.stringify({ monto })
    });
  }
}

// Exportar una instancia única del servicio
const apiService = new ApiService();
export default apiService;
