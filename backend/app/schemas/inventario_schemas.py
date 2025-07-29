"""
Esquemas de validación para Productos e Inventario
"""

from pydantic import BaseModel
from typing import Optional, List

class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    stock_actual: int
    stock_minimo: int
    proveedor_id: Optional[int] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    proveedor_id: Optional[int] = None

class ProductoResponse(ProductoBase):
    id: int
    
    class Config:
        from_attributes = True

class ActualizarStockRequest(BaseModel):
    producto_id: int
    cantidad: int  # Puede ser positivo (entrada) o negativo (salida)

class VerificarDisponibilidadRequest(BaseModel):
    producto_id: int

class AlertaResponse(BaseModel):
    id: int
    mensaje: str
    fecha: str
    tipo: str
    producto_id: Optional[int] = None

class InventarioMovimientoResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    fecha_actualizacion: str
