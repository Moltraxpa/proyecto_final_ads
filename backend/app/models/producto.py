"""
Modelo de Producto
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class Producto:
    id: Optional[int]
    nombre: str
    descripcion: str
    precio: float
    stock_actual: int
    stock_minimo: int
    proveedor_id: Optional[int] = None
    
    def __init__(self, nombre: str, descripcion: str, precio: float, stock_actual: int, stock_minimo: int, proveedor_id: Optional[int] = None, id: Optional[int] = None):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion
        self.precio = precio
        self.stock_actual = stock_actual
        self.stock_minimo = stock_minimo
        self.proveedor_id = proveedor_id
    
    def registrar(self) -> bool:
        """Registrar producto en la base de datos"""
        from app.database import db
        query = """
        INSERT INTO producto (nombre, descripcion, precio, stock_actual, stock_minimo, proveedor_id)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        try:
            self.id = db.execute_query(query, (self.nombre, self.descripcion, self.precio, self.stock_actual, self.stock_minimo, self.proveedor_id))
            return True
        except Exception:
            return False
    
    def actualizar(self) -> bool:
        """Actualizar producto en la base de datos"""
        if not self.id:
            return False
        
        from app.database import db
        query = """
        UPDATE producto 
        SET nombre = ?, descripcion = ?, precio = ?, stock_actual = ?, stock_minimo = ?, proveedor_id = ?
        WHERE id = ?
        """
        try:
            db.execute_query(query, (self.nombre, self.descripcion, self.precio, self.stock_actual, self.stock_minimo, self.proveedor_id, self.id))
            return True
        except Exception:
            return False
    
    def verificar_disponibilidad(self) -> bool:
        """Verificar si el producto está disponible"""
        return self.stock_actual > 0
    
    def generar_alerta_stock_bajo(self) -> bool:
        """Generar alerta si el stock está bajo"""
        return self.stock_actual <= self.stock_minimo
    
    @staticmethod
    def obtener_por_id(producto_id: int):
        """Obtener producto por ID"""
        from app.database import db
        query = "SELECT * FROM producto WHERE id = ?"
        resultado = db.fetch_one(query, (producto_id,))
        
        if resultado:
            return Producto(
                id=resultado[0],
                nombre=resultado[1],
                descripcion=resultado[2],
                precio=resultado[3],
                stock_actual=resultado[4],
                stock_minimo=resultado[5],
                proveedor_id=resultado[6]
            )
        return None
    
    @staticmethod
    def obtener_todos():
        """Obtener todos los productos"""
        from app.database import db
        query = "SELECT * FROM producto"
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
    
    def eliminar(self) -> bool:
        """Eliminar producto (solo si no está en ventas activas)"""
        from app.database import db
        
        try:
            # Verificar si el producto está en ventas
            query_ventas = """
            SELECT COUNT(*) FROM venta_producto WHERE producto_id = ?
            """
            resultado = db.fetch_one(query_ventas, (self.id,))
            
            if resultado and resultado[0] > 0:
                return False  # No se puede eliminar si está en ventas
            
            # Verificar si está en órdenes pendientes
            query_ordenes = """
            SELECT COUNT(*) FROM orden_producto op
            JOIN orden o ON op.orden_id = o.id
            WHERE op.producto_id = ? AND o.estado IN ('pendiente', 'confirmada')
            """
            resultado = db.fetch_one(query_ordenes, (self.id,))
            
            if resultado and resultado[0] > 0:
                return False  # No se puede eliminar si está en órdenes activas
            
            # Eliminar registros relacionados primero
            db.execute_query("DELETE FROM inventario WHERE producto_id = ?", (self.id,))
            
            # Eliminar el producto
            db.execute_query("DELETE FROM producto WHERE id = ?", (self.id,))
            
            return True
        except Exception:
            return False
