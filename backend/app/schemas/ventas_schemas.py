"""
Esquemas de validación para Ventas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ProductoVenta(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class VentaCreate(BaseModel):
    productos: List[ProductoVenta]
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None  
    cliente_telefono: Optional[str] = None
    tipo_pago: Optional[str] = 'efectivo'
    observaciones: Optional[str] = None
    cliente_id: Optional[int] = None
    administradora_id: Optional[int] = 1  # Por defecto la administradora

class VentaUpdate(BaseModel):
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None  
    cliente_telefono: Optional[str] = None
    tipo_pago: Optional[str] = None
    observaciones: Optional[str] = None

class VentaResponse(BaseModel):
    id: int
    fecha: str
    total: float
    estado: str
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    tipo_pago: Optional[str] = None
    observaciones: Optional[str] = None
    cliente_id: Optional[int] = None
    administradora_id: Optional[int] = None

class PagoCreate(BaseModel):
    venta_id: int
    monto: float
    metodo: str  # 'efectivo', 'tarjeta', 'transferencia'
    referencia: Optional[str] = None

class PagoResponse(BaseModel):
    id: int
    monto: float
    fecha: str
    metodo: str
    referencia: Optional[str] = None
    estado: str

class ComprobanteResponse(BaseModel):
    id: int
    fecha: str
    detalles: str
    total: float
    tipo: str
    venta_id: int

class VerificarDisponibilidadVentaRequest(BaseModel):
    productos: List[ProductoVenta]
