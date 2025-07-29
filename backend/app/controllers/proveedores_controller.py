"""
Controlador de Proveedores
Gestiona proveedores, órdenes y facturas
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.schemas.proveedores_schemas import (
    ProveedorCreate, ProveedorUpdate, ProveedorResponse,
    OrdenCreate, OrdenResponse, FacturaCreate, FacturaResponse
)
from app.models.proveedor import Proveedor
from app.services.proveedores_service import ProveedoresService

router = APIRouter()
proveedores_service = ProveedoresService()

class EstadoOrdenUpdate(BaseModel):
    nuevo_estado: str

@router.post("/", response_model=ProveedorResponse)
def registrar_proveedor(proveedor_data: ProveedorCreate):
    """Registrar un nuevo proveedor"""
    nuevo_proveedor = Proveedor(
        nombre=proveedor_data.nombre,
        apellido=proveedor_data.apellido,
        direccion=proveedor_data.direccion,
        correo=proveedor_data.correo,
        ruc=proveedor_data.ruc,
        nombre_empresa=proveedor_data.nombre_empresa,
        telefono=proveedor_data.telefono
    )
    
    if nuevo_proveedor.registrar_proveedor():
        return ProveedorResponse(
            id=nuevo_proveedor.id,
            nombre=nuevo_proveedor.nombre,
            apellido=nuevo_proveedor.apellido,
            direccion=nuevo_proveedor.direccion,
            correo=nuevo_proveedor.correo,
            ruc=nuevo_proveedor.ruc,
            nombre_empresa=nuevo_proveedor.nombre_empresa,
            telefono=nuevo_proveedor.telefono
        )
    else:
        raise HTTPException(status_code=400, detail="Error al registrar el proveedor")

@router.get("/", response_model=List[ProveedorResponse])
def obtener_proveedores():
    """Obtener todos los proveedores"""
    proveedores = Proveedor.obtener_todos()
    return [
        ProveedorResponse(
            id=p.id,
            nombre=p.nombre,
            apellido=p.apellido,
            direccion=p.direccion,
            correo=p.correo,
            ruc=p.ruc,
            nombre_empresa=p.nombre_empresa,
            telefono=p.telefono
        ) for p in proveedores
    ]

@router.post("/ordenes", response_model=OrdenResponse)
def crear_orden(orden_data: OrdenCreate):
    """Crear una nueva orden de compra"""
    resultado = proveedores_service.crear_orden(orden_data)
    
    if resultado["exito"]:
        return OrdenResponse(
            id=resultado["orden_id"],
            fecha=resultado["fecha"],
            estado="pendiente",
            proveedor_id=orden_data.proveedor_id,
            administradora_id=1
        )
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.get("/ordenes")
def obtener_ordenes():
    """Obtener todas las órdenes"""
    ordenes = proveedores_service.obtener_ordenes()
    return ordenes

@router.put("/ordenes/{orden_id}/estado")
def actualizar_estado_orden(orden_id: int, estado_data: EstadoOrdenUpdate):
    """Actualizar estado de una orden"""
    resultado = proveedores_service.actualizar_estado_orden(orden_id, estado_data.nuevo_estado)
    
    if resultado["exito"]:
        return {"mensaje": resultado["mensaje"]}
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.delete("/ordenes/{orden_id}")
def eliminar_orden(orden_id: int):
    """Eliminar una orden"""
    resultado = proveedores_service.eliminar_orden(orden_id)
    
    if resultado["exito"]:
        return {"mensaje": resultado["mensaje"]}
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.get("/{proveedor_id}", response_model=ProveedorResponse)
def obtener_proveedor(proveedor_id: int):
    """Obtener un proveedor específico"""
    proveedor = Proveedor.obtener_por_id(proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    return ProveedorResponse(
        id=proveedor.id,
        nombre=proveedor.nombre,
        apellido=proveedor.apellido,
        direccion=proveedor.direccion,
        correo=proveedor.correo,
        ruc=proveedor.ruc,
        nombre_empresa=proveedor.nombre_empresa,
        telefono=proveedor.telefono
    )

@router.post("/facturas", response_model=FacturaResponse)
def crear_factura(factura_data: FacturaCreate):
    """Crear una nueva factura"""
    resultado = proveedores_service.crear_factura(factura_data)
    
    if resultado["exito"]:
        return FacturaResponse(
            id=resultado["factura_id"],
            fecha=resultado["fecha"],
            total=factura_data.total,
            estado="pendiente",
            orden_id=factura_data.orden_id,
            proveedor_id=factura_data.proveedor_id
        )
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.get("/facturas")
def obtener_facturas():
    """Obtener todas las facturas"""
    facturas = proveedores_service.obtener_facturas()
    return facturas

@router.put("/{proveedor_id}", response_model=ProveedorResponse)
def actualizar_proveedor(proveedor_id: int, proveedor_data: ProveedorUpdate):
    """Actualizar un proveedor existente"""
    proveedor = Proveedor.obtener_por_id(proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    # Actualizar los datos
    proveedor.nombre = proveedor_data.nombre
    proveedor.apellido = proveedor_data.apellido
    proveedor.direccion = proveedor_data.direccion
    proveedor.correo = proveedor_data.correo
    proveedor.ruc = proveedor_data.ruc
    proveedor.nombre_empresa = proveedor_data.nombre_empresa
    proveedor.telefono = proveedor_data.telefono
    
    if proveedor.actualizar():
        return ProveedorResponse(
            id=proveedor.id,
            nombre=proveedor.nombre,
            apellido=proveedor.apellido,
            direccion=proveedor.direccion,
            correo=proveedor.correo,
            ruc=proveedor.ruc,
            nombre_empresa=proveedor.nombre_empresa,
            telefono=proveedor.telefono
        )
    else:
        raise HTTPException(status_code=400, detail="Error al actualizar el proveedor")

@router.delete("/{proveedor_id}")
def eliminar_proveedor(proveedor_id: int):
    """Eliminar un proveedor"""
    proveedor = Proveedor.obtener_por_id(proveedor_id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    if proveedor.eliminar():
        return {"mensaje": "Proveedor eliminado exitosamente"}
    else:
        raise HTTPException(status_code=400, detail="No se puede eliminar el proveedor. Tiene órdenes activas o error en la operación.")

@router.put("/{proveedor_id}/pago-factura/{factura_id}")
def procesar_pago_factura(proveedor_id: int, factura_id: int, monto: float):
    """Procesar pago de una factura"""
    resultado = proveedores_service.procesar_pago_factura(proveedor_id, factura_id, monto)
    
    if resultado["exito"]:
        return {"mensaje": resultado["mensaje"]}
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])
