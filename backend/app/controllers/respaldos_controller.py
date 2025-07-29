"""
Controlador para gestión de respaldos
Sistema de Gestión Papelería Dohko
"""

from fastapi import APIRouter, HTTPException
from app.services.backup_service import backup_service
from app.services.backup_scheduler import backup_scheduler

router = APIRouter()

@router.get("/estado")
def obtener_estado_respaldos():
    """Obtener estado del sistema de respaldos"""
    try:
        respaldos_resultado = backup_service.listar_respaldos()
        estado_programador = backup_scheduler.estado_programador()
        
        # Verificar que el resultado de respaldos sea exitoso
        if not respaldos_resultado["exito"]:
            raise Exception(respaldos_resultado.get("mensaje", "Error al obtener respaldos"))
        
        respaldos_lista = respaldos_resultado.get("respaldos", [])
        
        return {
            "exito": True,
            "data": {
                "respaldos_disponibles": respaldos_lista,
                "total_respaldos": len(respaldos_lista),
                "programador": estado_programador
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estado: {str(e)}")

@router.post("/manual")
def crear_respaldo_manual():
    """Crear un respaldo manual inmediato"""
    try:
        resultado = backup_scheduler.respaldo_manual()
        
        if resultado["exito"]:
            return {
                "exito": True,
                "mensaje": "Respaldo manual creado exitosamente",
                "data": {
                    "archivo": resultado["archivo"],
                    "tamaño": resultado["tamaño"],
                    "fecha": resultado["fecha"]
                }
            }
        else:
            raise HTTPException(status_code=500, detail=resultado["mensaje"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear respaldo: {str(e)}")

@router.delete("/limpiar")
def limpiar_respaldos_antiguos():
    """Limpiar respaldos anteriores a 6 meses"""
    try:
        resultado = backup_service.limpiar_respaldos_antiguos(180)
        
        return {
            "exito": True,
            "mensaje": resultado["mensaje"],
            "data": {
                "archivos_eliminados": resultado.get("eliminados", 0)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al limpiar respaldos: {str(e)}")

@router.get("/listar")
def listar_respaldos():
    """Listar todos los respaldos disponibles"""
    try:
        resultado = backup_service.listar_respaldos()
        
        if not resultado["exito"]:
            raise Exception(resultado.get("mensaje", "Error al obtener respaldos"))
        
        respaldos_lista = resultado.get("respaldos", [])
        
        return {
            "exito": True,
            "data": respaldos_lista,
            "mensaje": f"Se encontraron {len(respaldos_lista)} respaldos"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar respaldos: {str(e)}")

@router.get("/programador/estado")
def estado_programador():
    """Obtener estado detallado del programador de respaldos"""
    try:
        estado = backup_scheduler.estado_programador()
        
        return {
            "exito": True,
            "data": estado,
            "mensaje": "Programador funcionando" if estado["ejecutando"] else "Programador detenido"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estado del programador: {str(e)}")
