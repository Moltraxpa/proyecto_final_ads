"""
Controlador de Ventas
Gestiona registro de ventas, pagos y comprobantes
Sistema de Gestión Papelería Dohko
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.ventas_schemas import (
    VentaCreate, VentaUpdate, VentaResponse, PagoCreate, PagoResponse,
    ComprobanteResponse, VerificarDisponibilidadVentaRequest
)
from app.models.venta import Venta
from app.services.ventas_service import VentasService
from app.utils.performance import medir_tiempo_transaccion

router = APIRouter()
ventas_service = VentasService()

@router.post("/", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
@medir_tiempo_transaccion("Registrar Venta")
async def registrar_venta(venta_data: VentaCreate):
    """Registrar una nueva venta"""
    try:
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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"exito": False, "mensaje": resultado["mensaje"]}
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"exito": False, "mensaje": str(e)}
        )
    except Exception as e:
        print(f"Error en registrar_venta: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al registrar venta"}
        )

@router.get("/", response_model=List[VentaResponse])
@medir_tiempo_transaccion("Obtener Ventas")
async def obtener_ventas():
    """Obtener todas las ventas"""
    try:
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
    except Exception as e:
        print(f"Error en obtener_ventas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al obtener ventas"}
        )

@router.get("/{venta_id}")
@medir_tiempo_transaccion("Obtener Venta")
async def obtener_venta(venta_id: int):
    """Obtener una venta específica con productos"""
    try:
        venta = Venta.obtener_por_id(venta_id)
        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"exito": False, "mensaje": "Venta no encontrada"}
            )
        
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
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en obtener_venta: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al obtener venta"}
        )


@router.post("/{venta_id}/pago", response_model=PagoResponse)
@medir_tiempo_transaccion("Procesar Pago")
async def procesar_pago(venta_id: int, pago_data: PagoCreate):
    """Procesar pago de una venta"""
    try:
        venta = Venta.obtener_por_id(venta_id)
        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"exito": False, "mensaje": "Venta no encontrada"}
            )
        
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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"exito": False, "mensaje": "Error al procesar el pago"}
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en procesar_pago: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al procesar pago"}
        )


@router.put("/{venta_id}", response_model=VentaResponse)
@medir_tiempo_transaccion("Actualizar Venta")
async def actualizar_venta(venta_id: int, venta_data: VentaUpdate):
    """Actualizar información de una venta"""
    try:
        venta = Venta.obtener_por_id(venta_id)
        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"exito": False, "mensaje": "Venta no encontrada"}
            )
        
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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"exito": False, "mensaje": "Error al actualizar la venta"}
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en actualizar_venta: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al actualizar venta"}
        )

@router.delete("/{venta_id}")
@medir_tiempo_transaccion("Eliminar Venta")
async def eliminar_venta(venta_id: int):
    """Eliminar una venta"""
    try:
        venta = Venta.obtener_por_id(venta_id)
        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"exito": False, "mensaje": "Venta no encontrada"}
            )
        
        if venta.eliminar():
            return {"mensaje": "Venta eliminada exitosamente"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"exito": False, "mensaje": "Error al eliminar la venta"}
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en eliminar_venta: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al eliminar venta"}
        )

@router.get("/{venta_id}/productos")
@medir_tiempo_transaccion("Obtener Productos Venta")
async def obtener_productos_venta(venta_id: int):
    """Obtener productos de una venta específica"""
    try:
        productos = ventas_service.obtener_productos_venta(venta_id)
        return {"venta_id": venta_id, "productos": productos}
    except Exception as e:
        print(f"Error en obtener_productos_venta: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"exito": False, "mensaje": "Error interno del servidor al obtener productos de venta"}
        )
