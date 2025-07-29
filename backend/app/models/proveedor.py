"""
Modelo de Proveedor
"""

from dataclasses import dataclass
from typing import Optional
from app.models.persona import Persona

@dataclass
class Proveedor(Persona):
    ruc: str
    nombre_empresa: str
    telefono: str
    
    def __init__(self, nombre: str, apellido: str, direccion: str, correo: str, 
                 ruc: str, nombre_empresa: str, telefono: str, id: Optional[int] = None):
        super().__init__(nombre, apellido, direccion, correo, "proveedor", id)
        self.ruc = ruc
        self.nombre_empresa = nombre_empresa
        self.telefono = telefono
    
    def registrar_proveedor(self) -> bool:
        """Registrar proveedor completo"""
        # Primero registrar como persona
        if self.anadir():
            # Luego registrar los datos específicos del proveedor
            from app.database import db
            query = """
            INSERT INTO proveedor (id, ruc, nombre_empresa, telefono)
            VALUES (?, ?, ?, ?)
            """
            try:
                db.execute_query(query, (self.id, self.ruc, self.nombre_empresa, self.telefono))
                return True
            except Exception:
                return False
        return False
    
    def enviar_orden(self, productos: list) -> bool:
        """Enviar orden de compra al proveedor"""
        from app.database import db
        from datetime import datetime
        
        # Crear la orden
        query_orden = """
        INSERT INTO orden (fecha, estado, proveedor_id, administradora_id)
        VALUES (?, ?, ?, ?)
        """
        fecha = datetime.now().strftime("%Y-%m-%d")
        
        try:
            orden_id = db.execute_query(query_orden, (fecha, "pendiente", self.id, 1))  # 1 es la administradora
            
            # Agregar productos a la orden
            for producto in productos:
                producto_id = producto['producto_id']
                
                # Si el producto_id es None, crear un producto temporal
                if producto_id is None:
                    # Crear un producto temporal con precio y stock básicos
                    query_producto = """
                    INSERT INTO producto (nombre, descripcion, precio, stock_actual, stock_minimo, proveedor_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """
                    nombre_producto = producto.get('nombre', f'Producto_Orden_{orden_id}_{len([p for p in productos if p["producto_id"] is None]) + 1}')
                    precio_base = producto.get('precio_unitario', 0)
                    producto_id = db.execute_query(query_producto, (nombre_producto, 'Producto de orden de compra', precio_base, 0, 1, self.id))
                    
                    # NO necesitamos crear entrada en inventario porque el producto ya tiene stock_actual
                
                query_orden_producto = """
                INSERT INTO orden_producto (orden_id, producto_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
                """
                db.execute_query(query_orden_producto, (orden_id, producto_id, producto['cantidad'], producto.get('precio_unitario')))
            
            return True
        except Exception as e:
            print(f"Error en enviar_orden: {e}")  # Para debugging
            return False
    
    def enviar_factura(self, orden_id: int, total: float) -> bool:
        """Enviar factura por una orden"""
        from app.database import db
        from datetime import datetime
        
        query = """
        INSERT INTO factura (fecha, total, estado, orden_id, proveedor_id)
        VALUES (?, ?, ?, ?, ?)
        """
        fecha = datetime.now().strftime("%Y-%m-%d")
        
        try:
            db.execute_query(query, (fecha, total, "pendiente", orden_id, self.id))
            return True
        except Exception:
            return False
    
    @staticmethod
    def obtener_todos():
        """Obtener todos los proveedores"""
        from app.database import db
        query = """
        SELECT p.*, pr.ruc, pr.nombre_empresa, pr.telefono
        FROM persona p
        JOIN proveedor pr ON p.id = pr.id
        WHERE p.tipo = 'proveedor'
        """
        resultados = db.fetch_all(query)
        
        proveedores = []
        for resultado in resultados:
            proveedores.append(Proveedor(
                id=resultado[0],
                nombre=resultado[1],
                apellido=resultado[2],
                direccion=resultado[3],
                correo=resultado[4],
                ruc=resultado[6],
                nombre_empresa=resultado[7],
                telefono=resultado[8]
            ))
        return proveedores
    
    @staticmethod
    def obtener_por_id(proveedor_id: int):
        """Obtener proveedor por ID"""
        from app.database import db
        query = """
        SELECT p.*, pr.ruc, pr.nombre_empresa, pr.telefono
        FROM persona p
        JOIN proveedor pr ON p.id = pr.id
        WHERE p.id = ? AND p.tipo = 'proveedor'
        """
        resultado = db.fetch_one(query, (proveedor_id,))
        
        if resultado:
            return Proveedor(
                id=resultado[0],
                nombre=resultado[1],
                apellido=resultado[2],
                direccion=resultado[3],
                correo=resultado[4],
                ruc=resultado[6],
                nombre_empresa=resultado[7],
                telefono=resultado[8]
            )
        return None
    
    def actualizar(self) -> bool:
        """Actualizar datos del proveedor"""
        from app.database import db
        
        try:
            # Actualizar datos en persona
            query_persona = """
            UPDATE persona 
            SET nombre = ?, apellido = ?, direccion = ?, correo = ?
            WHERE id = ?
            """
            db.execute_query(query_persona, (self.nombre, self.apellido, self.direccion, self.correo, self.id))
            
            # Actualizar datos específicos del proveedor
            query_proveedor = """
            UPDATE proveedor 
            SET ruc = ?, nombre_empresa = ?, telefono = ?
            WHERE id = ?
            """
            db.execute_query(query_proveedor, (self.ruc, self.nombre_empresa, self.telefono, self.id))
            return True
        except Exception:
            return False
    
    def eliminar(self) -> bool:
        """Eliminar proveedor (solo si no tiene órdenes activas)"""
        from app.database import db
        
        try:
            # Verificar si tiene órdenes pendientes
            query_ordenes = """
            SELECT COUNT(*) FROM orden WHERE proveedor_id = ? AND estado IN ('pendiente', 'confirmada', 'en_transito')
            """
            resultado = db.fetch_one(query_ordenes, (self.id,))
            
            if resultado and resultado[0] > 0:
                return False  # No se puede eliminar si tiene órdenes activas
            
            # Eliminar de proveedor primero (FK constraint)
            query_proveedor = "DELETE FROM proveedor WHERE id = ?"
            db.execute_query(query_proveedor, (self.id,))
            
            # Eliminar de persona
            query_persona = "DELETE FROM persona WHERE id = ?"
            db.execute_query(query_persona, (self.id,))
            
            return True
        except Exception:
            return False
