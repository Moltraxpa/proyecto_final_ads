"""
Controlador de Inventario
Gestiona productos, stock y alertas
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.inventario_schemas import (
    ProductoCreate, ProductoUpdate, ProductoResponse, 
    ActualizarStockRequest, VerificarDisponibilidadRequest,
    AlertaResponse
)
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.services.inventario_service import InventarioService

router = APIRouter()
inventario_service = InventarioService()

@router.post("/productos", response_model=ProductoResponse)
def registrar_producto(producto: ProductoCreate):
    """Registrar un nuevo producto en el inventario"""
    nuevo_producto = Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        stock_actual=producto.stock_actual,
        stock_minimo=producto.stock_minimo,
        proveedor_id=producto.proveedor_id
    )
    
    if nuevo_producto.registrar():
        return ProductoResponse(
            id=nuevo_producto.id,
            nombre=nuevo_producto.nombre,
            descripcion=nuevo_producto.descripcion,
            precio=nuevo_producto.precio,
            stock_actual=nuevo_producto.stock_actual,
            stock_minimo=nuevo_producto.stock_minimo,
            proveedor_id=nuevo_producto.proveedor_id
        )
    else:
        raise HTTPException(status_code=400, detail="Error al registrar el producto")

@router.get("/productos", response_model=List[ProductoResponse])
def obtener_productos():
    """Obtener todos los productos del inventario"""
    productos = Producto.obtener_todos()
    return [
        ProductoResponse(
            id=p.id,
            nombre=p.nombre,
            descripcion=p.descripcion,
            precio=p.precio,
            stock_actual=p.stock_actual,
            stock_minimo=p.stock_minimo,
            proveedor_id=p.proveedor_id
        ) for p in productos
    ]

@router.get("/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int):
    """Obtener un producto específico por ID"""
    producto = Producto.obtener_por_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    return ProductoResponse(
        id=producto.id,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        stock_actual=producto.stock_actual,
        stock_minimo=producto.stock_minimo,
        proveedor_id=producto.proveedor_id
    )

@router.put("/stock/actualizar")
def actualizar_stock(request: ActualizarStockRequest):
    """Actualizar stock de un producto (manual o automático)"""
    resultado = inventario_service.actualizar_stock(request.producto_id, request.cantidad)
    if resultado["exito"]:
        return {"mensaje": resultado["mensaje"], "nuevo_stock": resultado["nuevo_stock"]}
    else:
        raise HTTPException(status_code=400, detail=resultado["mensaje"])

@router.get("/disponibilidad/{producto_id}")
def verificar_disponibilidad(producto_id: int):
    """Verificar disponibilidad de un producto"""
    disponibilidad = inventario_service.verificar_disponibilidad(producto_id)
    return disponibilidad

@router.get("/alertas/stock-bajo", response_model=List[ProductoResponse])
def obtener_alertas_stock_bajo():
    """Obtener productos con stock bajo"""
    productos_stock_bajo = Inventario.obtener_productos_stock_bajo()
    return [
        ProductoResponse(
            id=p.id,
            nombre=p.nombre,
            descripcion=p.descripcion,
            precio=p.precio,
            stock_actual=p.stock_actual,
            stock_minimo=p.stock_minimo,
            proveedor_id=p.proveedor_id
        ) for p in productos_stock_bajo
    ]

@router.get("/productos/{producto_id}/historial")
def obtener_historial_producto(producto_id: int):
    """Obtener historial de movimientos de un producto"""
    historial = Inventario.obtener_historial_producto(producto_id)
    return {"producto_id": producto_id, "movimientos": historial}

@router.put("/productos/{producto_id}")
def actualizar_producto(producto_id: int, producto_data: ProductoUpdate):
    """Actualizar información de un producto"""
    producto = Producto.obtener_por_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Actualizar solo los campos proporcionados
    if producto_data.nombre is not None:
        producto.nombre = producto_data.nombre
    if producto_data.descripcion is not None:
        producto.descripcion = producto_data.descripcion
    if producto_data.precio is not None:
        producto.precio = producto_data.precio
    if producto_data.stock_actual is not None:
        producto.stock_actual = producto_data.stock_actual
    if producto_data.stock_minimo is not None:
        producto.stock_minimo = producto_data.stock_minimo
    if producto_data.proveedor_id is not None:
        producto.proveedor_id = producto_data.proveedor_id
    
    if producto.actualizar():
        return {"mensaje": "Producto actualizado exitosamente"}
    else:
        raise HTTPException(status_code=400, detail="Error al actualizar el producto")

@router.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int):
    """Eliminar un producto"""
    producto = Producto.obtener_por_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if producto.eliminar():
        return {"mensaje": "Producto eliminado exitosamente"}
    else:
        raise HTTPException(status_code=400, detail="No se puede eliminar el producto. Está siendo usado en ventas u órdenes activas.")
