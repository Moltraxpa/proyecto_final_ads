"""
Modelo de Inventario
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime
from app.models.producto import Producto

@dataclass
class Inventario:
    id: Optional[int]
    producto_id: int
    cantidad: int
    fecha_actualizacion: Optional[str] = None
    
    def __init__(self, producto_id: int, cantidad: int, id: Optional[int] = None, fecha_actualizacion: Optional[str] = None):
        self.id = id
        self.producto_id = producto_id
        self.cantidad = cantidad
        self.fecha_actualizacion = fecha_actualizacion or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def actualizar_stock(self, producto: Producto, cantidad: int) -> bool:
        """Actualizar stock de un producto"""
        from app.database import db
        
        # Actualizar el stock del producto
        nuevo_stock = producto.stock_actual + cantidad
        query_producto = "UPDATE producto SET stock_actual = ? WHERE id = ?"
        
        try:
            db.execute_query(query_producto, (nuevo_stock, producto.id))
            
            # Registrar el movimiento en inventario
            query_inventario = """
            INSERT INTO inventario (producto_id, cantidad, fecha_actualizacion)
            VALUES (?, ?, ?)
            """
            db.execute_query(query_inventario, (producto.id, cantidad, self.fecha_actualizacion))
            
            # Actualizar el objeto producto
            producto.stock_actual = nuevo_stock
            return True
        except Exception:
            return False
    
    def verificar_disponibilidad(self, producto: Producto) -> bool:
        """Verificar si hay disponibilidad del producto"""
        return producto.verificar_disponibilidad()
    
    def generar_alerta(self, producto: Producto) -> None:
        """Generar alerta si el stock está bajo"""
        if producto.generar_alerta_stock_bajo():
            from app.database import db
            query = """
            INSERT INTO alerta (mensaje, fecha, tipo, producto_id)
            VALUES (?, ?, ?, ?)
            """
            mensaje = f"Stock bajo para {producto.nombre}. Stock actual: {producto.stock_actual}, Mínimo: {producto.stock_minimo}"
            fecha = datetime.now().strftime("%Y-%m-%d")
            db.execute_query(query, (mensaje, fecha, "stock_bajo", producto.id))
    
    @staticmethod
    def obtener_productos_stock_bajo() -> List[Producto]:
        """Obtener productos con stock bajo"""
        from app.database import db
        query = "SELECT * FROM producto WHERE stock_actual <= stock_minimo"
        resultados = db.fetch_all(query)
        
        productos = []
        for resultado in resultados:
            productos.append(Producto(
                id=resultado[0],
                nombre=resultado[1],
                descripcion=resultado[2],
                precio=resultado[3],
                stock_actual=resultado[4],
                stock_minimo=resultado[5],
                proveedor_id=resultado[6]
            ))
        return productos
    
    @staticmethod
    def obtener_historial_producto(producto_id: int):
        """Obtener historial de movimientos de un producto"""
        from app.database import db
        query = "SELECT * FROM inventario WHERE producto_id = ? ORDER BY fecha_actualizacion DESC"
        return db.fetch_all(query, (producto_id,))
