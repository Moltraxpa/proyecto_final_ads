"""
Servicio de Proveedores
Contiene la lógica de negocio para gestión de proveedores
"""

from app.models.proveedor import Proveedor
from app.database import db
from datetime import datetime

class ProveedoresService:
    
    def crear_orden(self, orden_data):
        """Crear una nueva orden de compra"""
        proveedor = Proveedor.obtener_por_id(orden_data.proveedor_id)
        if not proveedor:
            return {"exito": False, "mensaje": "Proveedor no encontrado"}
        
        productos_data = [
            {
                "producto_id": p.producto_id,
                "cantidad": p.cantidad,
                "precio_unitario": p.precio_unitario,
                "nombre": getattr(p, 'nombre', None) if p.producto_id is None else None
            } for p in orden_data.productos
        ]
        
        if proveedor.enviar_orden(productos_data):
            # Obtener el ID de la orden recién creada
            query = "SELECT id FROM orden WHERE proveedor_id = ? ORDER BY fecha DESC LIMIT 1"
            resultado = db.fetch_one(query, (proveedor.id,))
            orden_id = resultado[0] if resultado else None
            
            return {
                "exito": True,
                "orden_id": orden_id,
                "fecha": datetime.now().strftime("%Y-%m-%d"),
                "mensaje": "Orden creada exitosamente"
            }
        else:
            return {"exito": False, "mensaje": "Error al crear la orden"}
    
    def obtener_ordenes(self):
        """Obtener todas las órdenes con sus productos"""
        query = """
        SELECT o.*, pr.nombre_empresa
        FROM orden o
        JOIN proveedor pr ON o.proveedor_id = pr.id
        ORDER BY o.fecha DESC
        """
        resultados = db.fetch_all(query)
        
        ordenes = []
        for resultado in resultados:
            orden_id = resultado[0]
            
            # Obtener productos de esta orden
            query_productos = """
            SELECT op.*, p.nombre, p.descripcion
            FROM orden_producto op
            JOIN producto p ON op.producto_id = p.id
            WHERE op.orden_id = ?
            """
            productos_resultado = db.fetch_all(query_productos, (orden_id,))
            
            productos = []
            total = 0
            for prod in productos_resultado:
                producto_info = {
                    "id": prod[1],  # producto_id
                    "nombre": prod[4],  # nombre
                    "descripcion": prod[5],  # descripcion
                    "cantidad": prod[2],  # cantidad
                    "precio": prod[3],  # precio_unitario
                }
                productos.append(producto_info)
                total += (prod[2] * prod[3]) if prod[3] else 0  # cantidad * precio_unitario
            
            ordenes.append({
                "id": resultado[0],
                "fecha": resultado[1],
                "estado": resultado[2],
                "proveedor_id": resultado[3],
                "administradora_id": resultado[4],
                "nombre_empresa": resultado[5],
                "productos": productos,
                "total": total
            })
        
        return ordenes
    
    def crear_factura(self, factura_data):
        """Crear una nueva factura"""
        # Verificar que la orden existe
        query_orden = "SELECT * FROM orden WHERE id = ?"
        orden = db.fetch_one(query_orden, (factura_data.orden_id,))
        
        if not orden:
            return {"exito": False, "mensaje": "Orden no encontrada"}
        
        # Verificar que el proveedor existe
        proveedor = Proveedor.obtener_por_id(factura_data.proveedor_id)
        if not proveedor:
            return {"exito": False, "mensaje": "Proveedor no encontrado"}
        
        if proveedor.enviar_factura(factura_data.orden_id, factura_data.total):
            # Obtener el ID de la factura recién creada
            query = "SELECT id FROM factura WHERE orden_id = ? ORDER BY fecha DESC LIMIT 1"
            resultado = db.fetch_one(query, (factura_data.orden_id,))
            factura_id = resultado[0] if resultado else None
            
            return {
                "exito": True,
                "factura_id": factura_id,
                "fecha": datetime.now().strftime("%Y-%m-%d"),
                "mensaje": "Factura creada exitosamente"
            }
        else:
            return {"exito": False, "mensaje": "Error al crear la factura"}
    
    def obtener_facturas(self):
        """Obtener todas las facturas"""
        query = """
        SELECT f.*, p.nombre_empresa
        FROM factura f
        JOIN proveedor pr ON f.proveedor_id = pr.id
        JOIN persona p ON pr.id = p.id
        ORDER BY f.fecha DESC
        """
        resultados = db.fetch_all(query)
        
        facturas = []
        for resultado in resultados:
            facturas.append({
                "id": resultado[0],
                "fecha": resultado[1],
                "total": resultado[2],
                "estado": resultado[3],
                "orden_id": resultado[4],
                "proveedor_id": resultado[5],
                "nombre_empresa": resultado[6]
            })
        
        return facturas
    
    def procesar_pago_factura(self, proveedor_id: int, factura_id: int, monto: float):
        """Procesar pago de una factura"""
        # Verificar que la factura existe y pertenece al proveedor
        query_factura = "SELECT * FROM factura WHERE id = ? AND proveedor_id = ?"
        factura = db.fetch_one(query_factura, (factura_id, proveedor_id))
        
        if not factura:
            return {"exito": False, "mensaje": "Factura no encontrada"}
        
        # Registrar el pago
        query_pago = """
        INSERT INTO pago (monto, fecha, metodo, estado, orden_id)
        VALUES (?, ?, ?, ?, ?)
        """
        fecha = datetime.now().strftime("%Y-%m-%d")
        
        try:
            db.execute_query(query_pago, (monto, fecha, "transferencia", "completado", factura[4]))
            
            # Actualizar estado de la factura
            query_actualizar = "UPDATE factura SET estado = ? WHERE id = ?"
            db.execute_query(query_actualizar, ("pagada", factura_id))
            
            return {"exito": True, "mensaje": "Pago procesado exitosamente"}
        except Exception:
            return {"exito": False, "mensaje": "Error al procesar el pago"}
    
    def obtener_ordenes_proveedor(self, proveedor_id: int):
        """Obtener órdenes de un proveedor específico"""
        query = "SELECT * FROM orden WHERE proveedor_id = ? ORDER BY fecha DESC"
        return db.fetch_all(query, (proveedor_id,))
    
    def actualizar_estado_orden(self, orden_id: int, nuevo_estado: str):
        """Actualizar estado de una orden"""
        query = "UPDATE orden SET estado = ? WHERE id = ?"
        try:
            db.execute_query(query, (nuevo_estado, orden_id))
            return {"exito": True, "mensaje": "Estado actualizado exitosamente"}
        except Exception:
            return {"exito": False, "mensaje": "Error al actualizar el estado"}
    
    def eliminar_orden(self, orden_id: int):
        """Eliminar una orden (solo si está en estado pendiente)"""
        # Verificar estado de la orden
        query_orden = "SELECT estado FROM orden WHERE id = ?"
        resultado = db.fetch_one(query_orden, (orden_id,))
        
        if not resultado:
            return {"exito": False, "mensaje": "Orden no encontrada"}
        
        if resultado[0] != 'pendiente':
            return {"exito": False, "mensaje": "Solo se pueden eliminar órdenes pendientes"}
        
        try:
            # Eliminar productos de la orden
            db.execute_query("DELETE FROM orden_producto WHERE orden_id = ?", (orden_id,))
            # Eliminar la orden
            db.execute_query("DELETE FROM orden WHERE id = ?", (orden_id,))
            
            return {"exito": True, "mensaje": "Orden eliminada exitosamente"}
        except Exception:
            return {"exito": False, "mensaje": "Error al eliminar la orden"}
