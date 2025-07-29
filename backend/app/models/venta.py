"""
Modelo de Venta
"""

from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class Venta:
    id: Optional[int]
    fecha: str
    total: float
    estado: str
    cliente_id: Optional[int] = None
    administradora_id: Optional[int] = None
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    tipo_pago: Optional[str] = None
    observaciones: Optional[str] = None
    
    def __init__(self, total: float, cliente_id: Optional[int] = None, administradora_id: Optional[int] = None, 
                 estado: str = "completada", fecha: Optional[str] = None, id: Optional[int] = None,
                 cliente_nombre: Optional[str] = None, cliente_email: Optional[str] = None, 
                 cliente_telefono: Optional[str] = None, tipo_pago: Optional[str] = None,
                 observaciones: Optional[str] = None):
        self.id = id
        self.fecha = fecha or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.total = total
        self.estado = estado
        self.cliente_id = cliente_id
        self.administradora_id = administradora_id
        self.cliente_nombre = cliente_nombre
        self.cliente_email = cliente_email
        self.cliente_telefono = cliente_telefono
        self.tipo_pago = tipo_pago or 'efectivo'
        self.observaciones = observaciones
    
    def registrar(self) -> bool:
        """Registrar venta en la base de datos"""
        from app.database import db
        query = """
        INSERT INTO venta (fecha, total, estado, cliente_id, administradora_id, 
                          cliente_nombre, cliente_email, cliente_telefono, tipo_pago, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        try:
            self.id = db.execute_query(query, (
                self.fecha, self.total, self.estado, self.cliente_id, self.administradora_id,
                self.cliente_nombre, self.cliente_email, self.cliente_telefono, 
                self.tipo_pago, self.observaciones
            ))
            return True
        except Exception as e:
            print(f"Error registrando venta: {e}")
            return False
    
    def procesar_pago(self, monto: float, metodo: str, referencia: Optional[str] = None) -> bool:
        """Procesar pago de la venta"""
        if not self.id:
            return False
        
        from app.database import db
        query = """
        INSERT INTO pago (monto, fecha, metodo, referencia, estado, venta_id)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        fecha = datetime.now().strftime("%Y-%m-%d")
        try:
            db.execute_query(query, (monto, fecha, metodo, referencia, "completado", self.id))
            return True
        except Exception:
            return False
    
    def verificar_disponibilidad(self, productos: List[dict]) -> bool:
        """Verificar disponibilidad de productos para la venta"""
        from app.models.producto import Producto
        
        for item in productos:
            producto = Producto.obtener_por_id(item['producto_id'])
            if not producto or producto.stock_actual < item['cantidad']:
                return False
        return True
    
    def generar_comprobante(self) -> bool:
        """Generar comprobante de la venta"""
        if not self.id:
            return False
        
        from app.database import db
        query = """
        INSERT INTO comprobante (fecha, detalles, total, tipo, venta_id)
        VALUES (?, ?, ?, ?, ?)
        """
        detalles = f"Venta realizada el {self.fecha}"
        try:
            db.execute_query(query, (self.fecha, detalles, self.total, "venta", self.id))
            return True
        except Exception:
            return False
    
    def agregar_productos(self, productos: List[dict]) -> bool:
        """Agregar productos a la venta"""
        if not self.id:
            return False
        
        from app.database import db
        from app.models.producto import Producto
        
        try:
            for item in productos:
                # Agregar producto a la venta
                query_venta_producto = """
                INSERT INTO venta_producto (venta_id, producto_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
                """
                db.execute_query(query_venta_producto, (self.id, item['producto_id'], item['cantidad'], item['precio_unitario']))
                
                # Actualizar stock del producto
                producto = Producto.obtener_por_id(item['producto_id'])
                if producto:
                    producto.stock_actual -= item['cantidad']
                    producto.actualizar()
            return True
        except Exception:
            return False
    
    @staticmethod
    def obtener_todas():
        """Obtener todas las ventas"""
        from app.database import db
        query = """
        SELECT id, fecha, total, estado, cliente_id, administradora_id, 
               cliente_nombre, cliente_email, cliente_telefono, tipo_pago, observaciones 
        FROM venta ORDER BY fecha DESC
        """
        resultados = db.fetch_all(query)
        
        ventas = []
        for resultado in resultados:
            ventas.append(Venta(
                id=resultado[0],
                fecha=resultado[1],
                total=resultado[2],
                estado=resultado[3],
                cliente_id=resultado[4],
                administradora_id=resultado[5],
                cliente_nombre=resultado[6] if len(resultado) > 6 else None,
                cliente_email=resultado[7] if len(resultado) > 7 else None,
                cliente_telefono=resultado[8] if len(resultado) > 8 else None,
                tipo_pago=resultado[9] if len(resultado) > 9 else None,
                observaciones=resultado[10] if len(resultado) > 10 else None
            ))
        return ventas
    
    @staticmethod
    def obtener_por_id(venta_id: int):
        """Obtener venta por ID"""
        from app.database import db
        query = """
        SELECT id, fecha, total, estado, cliente_id, administradora_id, 
               cliente_nombre, cliente_email, cliente_telefono, tipo_pago, observaciones 
        FROM venta WHERE id = ?
        """
        resultado = db.fetch_one(query, (venta_id,))
        
        if resultado:
            return Venta(
                id=resultado[0],
                fecha=resultado[1],
                total=resultado[2],
                estado=resultado[3],
                cliente_id=resultado[4],
                administradora_id=resultado[5],
                cliente_nombre=resultado[6] if len(resultado) > 6 else None,
                cliente_email=resultado[7] if len(resultado) > 7 else None,
                cliente_telefono=resultado[8] if len(resultado) > 8 else None,
                tipo_pago=resultado[9] if len(resultado) > 9 else None,
                observaciones=resultado[10] if len(resultado) > 10 else None
            )
        return None
    
    def actualizar(self) -> bool:
        """Actualizar datos de la venta"""
        from app.database import db
        query = """
        UPDATE venta 
        SET cliente_nombre = ?, cliente_email = ?, cliente_telefono = ?, 
            tipo_pago = ?, observaciones = ?
        WHERE id = ?
        """
        try:
            db.execute_query(query, (
                self.cliente_nombre, self.cliente_email, self.cliente_telefono, 
                self.tipo_pago, self.observaciones, self.id
            ))
            return True
        except Exception:
            return False
    
    def eliminar(self) -> bool:
        """Eliminar venta (restaurar stock y eliminar registros)"""
        if not self.id:
            return False
        
        from app.database import db
        from app.models.producto import Producto
        
        try:
            # Restaurar stock de productos
            query_productos = """
            SELECT producto_id, cantidad FROM venta_producto WHERE venta_id = ?
            """
            productos_venta = db.fetch_all(query_productos, (self.id,))
            
            for producto_id, cantidad in productos_venta:
                producto = Producto.obtener_por_id(producto_id)
                if producto:
                    producto.stock_actual += cantidad
                    producto.actualizar()
            
            # Eliminar registros relacionados
            db.execute_query("DELETE FROM venta_producto WHERE venta_id = ?", (self.id,))
            db.execute_query("DELETE FROM comprobante WHERE venta_id = ?", (self.id,))
            db.execute_query("DELETE FROM pago WHERE venta_id = ?", (self.id,))
            db.execute_query("DELETE FROM venta WHERE id = ?", (self.id,))
            
            return True
        except Exception:
            return False
