"""
Servicio de Respaldos Automáticos
Sistema de Gestión Papelería Dohko
"""

import os
import shutil
from datetime import datetime

class BackupService:
    """Servicio para gestionar respaldos automáticos de la base de datos"""
    
    def __init__(self):
        # Obtener la ruta base del proyecto (backend está en pro/backend, necesitamos pro/)
        self.backend_dir = os.path.dirname(os.path.abspath(__file__))  # app/services
        self.app_dir = os.path.dirname(self.backend_dir)  # app
        self.backend_root = os.path.dirname(self.app_dir)  # backend
        self.project_root = os.path.dirname(self.backend_root)  # pro
        
        self.ruta_db = os.path.join(self.project_root, "database", "papeleria_dohko.db")
        self.ruta_respaldos = os.path.join(self.project_root, "respaldos")
        
        print(f"🔍 DEBUG - Rutas configuradas:")
        print(f"   - Base de datos: {self.ruta_db}")
        print(f"   - Respaldos: {self.ruta_respaldos}")
        print(f"   - DB existe: {os.path.exists(self.ruta_db)}")
    
    def realizar_respaldo(self):
        """Crear respaldo de la base de datos con timestamp"""
        try:
            # Crear carpeta de respaldos si no existe
            if not os.path.exists(self.ruta_respaldos):
                os.makedirs(self.ruta_respaldos)
            
            # Verificar que la base de datos existe
            if not os.path.exists(self.ruta_db):
                return {"exito": False, "mensaje": "Base de datos no encontrada"}
            
            # Generar nombre del archivo de respaldo
            fecha_hora = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            nombre_respaldo = f"respaldo_papeleria_dohko_{fecha_hora}.db"
            ruta_respaldo_completa = os.path.join(self.ruta_respaldos, nombre_respaldo)
            
            # Realizar la copia de seguridad
            shutil.copy2(self.ruta_db, ruta_respaldo_completa)
            
            # Obtener tamaño del archivo
            tamaño = os.path.getsize(ruta_respaldo_completa)
            tamaño_kb = round(tamaño / 1024, 2)
            
            return {
                "exito": True, 
                "mensaje": f"Respaldo realizado exitosamente: {nombre_respaldo}",
                "archivo": nombre_respaldo,
                "tamaño": f"{tamaño_kb} KB",
                "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
        except Exception as e:
            return {"exito": False, "mensaje": f"Error al realizar respaldo: {str(e)}"}
    
    def listar_respaldos(self):
        """Listar todos los respaldos disponibles"""
        try:
            if not os.path.exists(self.ruta_respaldos):
                return {"exito": True, "respaldos": []}
            
            archivos = []
            for archivo in os.listdir(self.ruta_respaldos):
                if archivo.endswith('.db'):
                    ruta_archivo = os.path.join(self.ruta_respaldos, archivo)
                    tamaño = os.path.getsize(ruta_archivo)
                    
                    # Extraer fecha del nombre del archivo (formato: respaldo_papeleria_dohko_2025-07-29_02-56-58.db)
                    try:
                        # Buscar el patrón de fecha en el nombre: YYYY-MM-DD_HH-MM-SS
                        import re
                        patron = r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})'
                        match = re.search(patron, archivo)
                        
                        if match:
                            fecha_str = match.group(1)  # 2025-07-29
                            hora_str = match.group(2).replace('-', ':')  # 02:56:58
                            fecha_completa = f"{fecha_str} {hora_str}"
                            
                            # Validar que se puede parsear la fecha
                            datetime.strptime(fecha_completa, "%Y-%m-%d %H:%M:%S")
                            fecha_formateada = fecha_completa
                        else:
                            # Si no se puede extraer del nombre, usar fecha de modificación
                            fecha_modificacion = os.path.getmtime(ruta_archivo)
                            fecha_formateada = datetime.fromtimestamp(fecha_modificacion).strftime("%Y-%m-%d %H:%M:%S")
                    except:
                        # En caso de error, usar fecha de modificación como fallback
                        fecha_modificacion = os.path.getmtime(ruta_archivo)
                        fecha_formateada = datetime.fromtimestamp(fecha_modificacion).strftime("%Y-%m-%d %H:%M:%S")
                    
                    archivos.append({
                        "nombre": archivo,
                        "tamaño": f"{round(tamaño / 1024, 2)} KB",
                        "fecha": fecha_formateada
                    })
                
            # Ordenar por fecha (más reciente primero)
            archivos.sort(key=lambda x: x['fecha'], reverse=True)
            
            return {"exito": True, "respaldos": archivos}
            
        except Exception as e:
            return {"exito": False, "mensaje": f"Error al listar respaldos: {str(e)}"}
    
    def limpiar_respaldos_antiguos(self, dias_antiguedad=90):
        """Eliminar respaldos más antiguos que el número de días especificado"""
        try:
            if not os.path.exists(self.ruta_respaldos):
                return {"exito": True, "mensaje": "No hay respaldos para limpiar"}
            
            eliminados = 0
            fecha_limite = datetime.now().timestamp() - (dias_antiguedad * 24 * 60 * 60)
            
            for archivo in os.listdir(self.ruta_respaldos):
                if archivo.endswith('.db'):
                    ruta_archivo = os.path.join(self.ruta_respaldos, archivo)
                    fecha_archivo = os.path.getmtime(ruta_archivo)
                    
                    if fecha_archivo < fecha_limite:
                        os.remove(ruta_archivo)
                        eliminados += 1
            
            return {
                "exito": True, 
                "mensaje": f"Limpieza completada. {eliminados} respaldos antiguos eliminados."
            }
            
        except Exception as e:
            return {"exito": False, "mensaje": f"Error al limpiar respaldos: {str(e)}"}

# Instancia única del servicio
backup_service = BackupService()
