"""
Programador de Respaldos Mensuales
Sistema de Gestión Papelería Dohko
"""

import schedule
import time
import threading
from datetime import datetime
from app.services.backup_service import backup_service

class BackupScheduler:
    """Programador para ejecutar respaldos automáticos mensuales"""
    
    def __init__(self):
        self.ejecutando = False
        self.hilo_programador = None
    
    def ejecutar_respaldo_programado(self):
        """Ejecutar respaldo programado con logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando respaldo automático mensual...")
        
        # Realizar respaldo
        resultado = backup_service.realizar_respaldo()
        
        if resultado["exito"]:
            print(f"✅ Respaldo exitoso: {resultado['archivo']} ({resultado['tamaño']})")
            
            # Limpiar respaldos antiguos (mantener respaldos de 6 meses)
            limpieza = backup_service.limpiar_respaldos_antiguos(180)
            if limpieza["exito"]:
                print(f"🧹 {limpieza['mensaje']}")
        else:
            print(f"❌ Error en respaldo: {resultado['mensaje']}")
    
    def iniciar_programador(self):
        """Iniciar el programador de respaldos mensuales"""
        if self.ejecutando:
            print("⚠️ El programador ya está ejecutándose.")
            return
        
        # Programar respaldo cada 30 días a las 2:00 AM (simulando mensual)
        schedule.every(30).days.at("02:00").do(self.ejecutar_respaldo_programado)
        
        # También programar una limpieza cada 90 días (3 meses)
        schedule.every(90).days.at("03:00").do(
            lambda: backup_service.limpiar_respaldos_antiguos(180)
        )
        
        # Para pruebas: respaldo cada 5 minutos (comentar en producción)
        #schedule.every(1).minutes.do(self.ejecutar_respaldo_programado)
        
        self.ejecutando = True
        print("🕐 Programador de respaldos iniciado.")
        print("📅 Respaldos programados: Cada 30 días a las 2:00 AM")
        print("🧹 Limpieza automática: Cada 90 días a las 3:00 AM")
        
        # Ejecutar el programador en un hilo separado
        self.hilo_programador = threading.Thread(target=self._ejecutar_bucle, daemon=True)
        self.hilo_programador.start()
    
    def _ejecutar_bucle(self):
        """Bucle principal del programador"""
        while self.ejecutando:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto
    
    def detener_programador(self):
        """Detener el programador de respaldos"""
        self.ejecutando = False
        schedule.clear()
        print("🛑 Programador de respaldos detenido.")
    
    def respaldo_manual(self):
        """Ejecutar respaldo manual inmediato"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Ejecutando respaldo manual...")
        resultado = backup_service.realizar_respaldo()
        
        if resultado["exito"]:
            print(f"✅ Respaldo manual exitoso: {resultado['archivo']} ({resultado['tamaño']})")
            return resultado
        else:
            print(f"❌ Error en respaldo manual: {resultado['mensaje']}")
            return resultado
    
    def estado_programador(self):
        """Obtener estado del programador"""
        return {
            "ejecutando": self.ejecutando,
            "proximas_ejecuciones": [str(job) for job in schedule.jobs],
            "fecha_actual": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

# Instancia única del programador
backup_scheduler = BackupScheduler()
