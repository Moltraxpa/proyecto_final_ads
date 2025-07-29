"""
Servicio de Ventas
Contiene la lógica de negocio para gestión de ventas
"""

from app.models.venta import Venta
from app.models.producto import Producto
from app.database import db

class VentasService:
    
    def registrar_venta(self, venta_data):
        """Registrar una nueva venta completa"""
        # Verificar disponibilidad de productos
        productos_data = [
            {
                "producto_id": p.producto_id,
                "cantidad": p.cantidad,
                "precio_unitario": p.precio_unitario
            } for p in venta_data.productos
        ]
        
        # Verificar disponibilidad
        if not self.verificar_disponibilidad_productos(productos_data)["disponible"]:
            return {"exito": False, "mensaje": "Algunos productos no están disponibles en la cantidad solicitada"}
        
        # Calcular total
        total = sum(p.cantidad * p.precio_unitario for p in venta_data.productos)
        
        # Crear la venta con la información completa del cliente
        venta = Venta(
            total=total,
            cliente_id=venta_data.cliente_id,
            administradora_id=venta_data.administradora_id,
            cliente_nombre=venta_data.cliente_nombre,
            cliente_email=venta_data.cliente_email,
            cliente_telefono=venta_data.cliente_telefono,
            tipo_pago=venta_data.tipo_pago,
            observaciones=venta_data.observaciones
        )
        
        if venta.registrar():
            # Agregar productos a la venta y actualizar stock
            if venta.agregar_productos(productos_data):
                # Generar comprobante automáticamente
                venta.generar_comprobante()
                return {"exito": True, "venta": venta, "mensaje": "Venta registrada exitosamente"}
            else:
                return {"exito": False, "mensaje": "Error al procesar los productos de la venta"}
        else:
            return {"exito": False, "mensaje": "Error al registrar la venta"}
    
    def verificar_disponibilidad_productos(self, productos):
        """Verificar disponibilidad de múltiples productos"""
        productos_no_disponibles = []
        
        for item in productos:
            producto = Producto.obtener_por_id(item['producto_id'])
            if not producto or producto.stock_actual < item['cantidad']:
                productos_no_disponibles.append({
                    "producto_id": item['producto_id'],
                    "nombre": producto.nombre if producto else "Producto no encontrado",
                    "stock_disponible": producto.stock_actual if producto else 0,
                    "cantidad_solicitada": item['cantidad']
                })
        
        return {
            "disponible": len(productos_no_disponibles) == 0,
            "productos_no_disponibles": productos_no_disponibles
        }
    
    def generar_comprobante(self, venta_id: int):
        """Generar comprobante para una venta"""
        venta = Venta.obtener_por_id(venta_id)
        if not venta:
            return {"exito": False, "mensaje": "Venta no encontrada"}
        
        if venta.generar_comprobante():
            # Obtener detalles del comprobante
            comprobante_info = self.obtener_detalles_comprobante(venta_id)
            return {"exito": True, "comprobante": comprobante_info}
        else:
            return {"exito": False, "mensaje": "Error al generar el comprobante"}
    
    def obtener_detalles_comprobante(self, venta_id: int):
        """Obtener detalles completos del comprobante"""
        query = """
        SELECT c.*, v.fecha, v.total
        FROM comprobante c
        JOIN venta v ON c.venta_id = v.id
        WHERE c.venta_id = ?
        """
        resultado = db.fetch_one(query, (venta_id,))
        
        if resultado:
            return {
                "id": resultado[0],
                "fecha": resultado[1],
                "detalles": resultado[2],
                "total": resultado[3],
                "tipo": resultado[4],
                "productos": self.obtener_productos_venta(venta_id)
            }
        return None
    
    def obtener_productos_venta(self, venta_id: int):
        """Obtener productos de una venta específica"""
        query = """
        SELECT vp.*, p.nombre, p.descripcion
        FROM venta_producto vp
        JOIN producto p ON vp.producto_id = p.id
        WHERE vp.venta_id = ?
        """
        resultados = db.fetch_all(query, (venta_id,))
        
        productos = []
        for resultado in resultados:
            productos.append({
                "producto_id": resultado[1],
                "cantidad": resultado[2],
                "precio_unitario": resultado[3],
                "nombre": resultado[4],
                "descripcion": resultado[5],
                "subtotal": resultado[2] * resultado[3]
            })
        
        return productos
