"""
Esquemas de validación para Proveedores
"""

from pydantic import BaseModel
from typing import Optional, List

class ProveedorBase(BaseModel):
    nombre: str
    apellido: str
    direccion: str
    correo: str
    ruc: str
    nombre_empresa: str
    telefono: str

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    nombre: str
    apellido: str
    direccion: str
    correo: str
    ruc: str
    nombre_empresa: str
    telefono: str

class ProveedorResponse(ProveedorBase):
    id: int
    
    class Config:
        from_attributes = True

class ProductoOrden(BaseModel):
    producto_id: Optional[int] = None
    cantidad: int
    precio_unitario: Optional[float] = None
    nombre: Optional[str] = None  # Para productos nuevos

class OrdenCreate(BaseModel):
    proveedor_id: int
    productos: List[ProductoOrden]

class OrdenResponse(BaseModel):
    id: int
    fecha: str
    estado: str
    proveedor_id: int
    administradora_id: Optional[int] = None

class FacturaCreate(BaseModel):
    orden_id: int
    proveedor_id: int
    total: float

class FacturaResponse(BaseModel):
    id: int
    fecha: str
    total: float
    estado: str
    orden_id: int
    proveedor_id: int
