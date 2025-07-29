"""
Servicio de Inventario
Contiene la lógica de negocio para gestión de inventario
"""

from app.models.producto import Producto
from app.models.inventario import Inventario

class InventarioService:
    
    def actualizar_stock(self, producto_id: int, cantidad: int):
        """Actualizar stock de un producto"""
        producto = Producto.obtener_por_id(producto_id)
        if not producto:
            return {"exito": False, "mensaje": "Producto no encontrado"}
        
        inventario = Inventario(producto_id=producto_id, cantidad=cantidad)
        
        if inventario.actualizar_stock(producto, cantidad):
            # Verificar si necesita generar alerta
            inventario.generar_alerta(producto)
            
            return {
                "exito": True,
                "mensaje": "Stock actualizado exitosamente",
                "nuevo_stock": producto.stock_actual
            }
        else:
            return {"exito": False, "mensaje": "Error al actualizar el stock"}
    
    def verificar_disponibilidad(self, producto_id: int):
        """Verificar disponibilidad de un producto"""
        producto = Producto.obtener_por_id(producto_id)
        if not producto:
            return {"disponible": False, "mensaje": "Producto no encontrado", "stock": 0}
        
        inventario = Inventario(producto_id=producto_id, cantidad=0)
        disponible = inventario.verificar_disponibilidad(producto)
        
        return {
            "disponible": disponible,
            "stock_actual": producto.stock_actual,
            "stock_minimo": producto.stock_minimo,
            "necesita_reposicion": producto.generar_alerta_stock_bajo()
        }
    
    def obtener_productos_stock_bajo(self):
        """Obtener productos con stock bajo"""
        return Inventario.obtener_productos_stock_bajo()
    
    def generar_alerta_stock(self, producto_id: int):
        """Generar alerta de stock bajo para un producto"""
        producto = Producto.obtener_por_id(producto_id)
        if producto and producto.generar_alerta_stock_bajo():
            inventario = Inventario(producto_id=producto_id, cantidad=0)
            inventario.generar_alerta(producto)
            return {"mensaje": f"Alerta generada para {producto.nombre}"}
        return {"mensaje": "No se requiere alerta para este producto"}
