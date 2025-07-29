"""
Controlador de Ventas
Gestiona registro de ventas, pagos y comprobantes
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.ventas_schemas import (
    VentaCreate, VentaUpdate, VentaResponse, PagoCreate, PagoResponse,
    ComprobanteResponse, VerificarDisponibilidadVentaRequest
)
from app.models.venta import Venta
from app.services.ventas_service import VentasService

router = APIRouter()
ventas_service = VentasService()

@router.post("/", response_model=VentaResponse)
def registrar_venta(venta_data: VentaCreate):
    """Registrar una nueva venta"""
    resultado = ventas_service.registrar_venta(venta_data)
    
    if resultado["exito"]:
        venta = resultado["venta"]
        return VentaResponse(
            id=venta.id,
            fecha=venta.fecha,
            total=venta.total,
            estado=venta.estado,
            cliente_nombre=getattr(venta, 'cliente_nombre', None),
            cliente_email=getattr(venta, 'cliente_email', None),
            cliente_telefono=getattr(venta, 'cliente_telefono', None),
            tipo_pago=getattr(venta, 'tipo_pago', None),
            observaciones=getattr(venta, 'observaciones', None),
            cliente_id=venta.cliente_id,
            administradora_id=venta.administradora_id
        )
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.get("/", response_model=List[VentaResponse])
def obtener_ventas():
    """Obtener todas las ventas"""
    ventas = Venta.obtener_todas()
    return [
        VentaResponse(
            id=v.id,
            fecha=v.fecha,
            total=v.total,
            estado=v.estado,
            cliente_nombre=getattr(v, 'cliente_nombre', None),
            cliente_email=getattr(v, 'cliente_email', None),
            cliente_telefono=getattr(v, 'cliente_telefono', None),
            tipo_pago=getattr(v, 'tipo_pago', None),
            observaciones=getattr(v, 'observaciones', None),
            cliente_id=v.cliente_id,
            administradora_id=v.administradora_id
        ) for v in ventas
    ]

@router.get("/{venta_id}")
def obtener_venta(venta_id: int):
    """Obtener una venta específica con productos"""
    venta = Venta.obtener_por_id(venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    # Obtener productos de la venta
    productos = ventas_service.obtener_productos_venta(venta_id)
    
    venta_response = VentaResponse(
        id=venta.id,
        fecha=venta.fecha,
        total=venta.total,
        estado=venta.estado,
        cliente_nombre=getattr(venta, 'cliente_nombre', None),
        cliente_email=getattr(venta, 'cliente_email', None),
        cliente_telefono=getattr(venta, 'cliente_telefono', None),
        tipo_pago=getattr(venta, 'tipo_pago', None),
        observaciones=getattr(venta, 'observaciones', None),
        cliente_id=venta.cliente_id,
        administradora_id=venta.administradora_id
    )
    
    # Convertir a dict y agregar productos
    venta_dict = venta_response.dict()
    venta_dict['productos'] = productos
    
    return venta_dict

@router.post("/verificar-disponibilidad")
def verificar_disponibilidad(request: VerificarDisponibilidadVentaRequest):
    """Verificar disponibilidad de productos para una venta"""
    productos_data = [
        {
            "producto_id": p.producto_id,
            "cantidad": p.cantidad,
            "precio_unitario": p.precio_unitario
        } for p in request.productos
    ]
    
    resultado = ventas_service.verificar_disponibilidad_productos(productos_data)
    return resultado

@router.post("/{venta_id}/pago", response_model=PagoResponse)
def procesar_pago(venta_id: int, pago_data: PagoCreate):
    """Procesar pago de una venta"""
    venta = Venta.obtener_por_id(venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    if venta.procesar_pago(pago_data.monto, pago_data.metodo, pago_data.referencia):
        return PagoResponse(
            id=1,  # Simplificado por ahora
            monto=pago_data.monto,
            fecha=venta.fecha,
            metodo=pago_data.metodo,
            referencia=pago_data.referencia,
            estado="completado"
        )
    else:
        raise HTTPException(status_code=400, detail="Error al procesar el pago")

@router.post("/{venta_id}/comprobante")
def generar_comprobante(venta_id: int):
    """Generar comprobante de una venta"""
    resultado = ventas_service.generar_comprobante(venta_id)
    
    if resultado["exito"]:
        return {"mensaje": "Comprobante generado exitosamente", "comprobante": resultado["comprobante"]}
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.put("/{venta_id}", response_model=VentaResponse)
def actualizar_venta(venta_id: int, venta_data: VentaUpdate):
    """Actualizar información de una venta"""
    venta = Venta.obtener_por_id(venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    # Actualizar solo los campos proporcionados
    if venta_data.cliente_nombre is not None:
        venta.cliente_nombre = venta_data.cliente_nombre
    if venta_data.cliente_email is not None:
        venta.cliente_email = venta_data.cliente_email
    if venta_data.cliente_telefono is not None:
        venta.cliente_telefono = venta_data.cliente_telefono
    if venta_data.tipo_pago is not None:
        venta.tipo_pago = venta_data.tipo_pago
    if venta_data.observaciones is not None:
        venta.observaciones = venta_data.observaciones
    
    if venta.actualizar():
        return VentaResponse(
            id=venta.id,
            fecha=venta.fecha,
            total=venta.total,
            estado=venta.estado,
            cliente_nombre=venta.cliente_nombre,
            cliente_email=venta.cliente_email,
            cliente_telefono=venta.cliente_telefono,
            tipo_pago=venta.tipo_pago,
            observaciones=venta.observaciones,
            cliente_id=venta.cliente_id,
            administradora_id=venta.administradora_id
        )
    else:
        raise HTTPException(status_code=400, detail="Error al actualizar la venta")

@router.delete("/{venta_id}")
def eliminar_venta(venta_id: int):
    """Eliminar una venta"""
    venta = Venta.obtener_por_id(venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    if venta.eliminar():
        return {"mensaje": "Venta eliminada exitosamente"}
    else:
        raise HTTPException(status_code=400, detail="Error al eliminar la venta")

@router.get("/{venta_id}/productos")
def obtener_productos_venta(venta_id: int):
    """Obtener productos de una venta específica"""
    productos = ventas_service.obtener_productos_venta(venta_id)
    return {"venta_id": venta_id, "productos": productos}
