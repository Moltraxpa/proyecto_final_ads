"""
Utilidades para medición de rendimiento
Sistema de Gestión Papelería Dohko
"""

import time
import functools
from datetime import datetime

def medir_tiempo_transaccion(operacion: str):
    """
    Decorador para medir y mostrar el tiempo de ejecución de transacciones
    """
    def decorador(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            inicio = time.time()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            try:
                print(f"⏱️  [{timestamp}] Iniciando {operacion}...")
                resultado = await func(*args, **kwargs)
                tiempo_transcurrido = time.time() - inicio
                
                # Determinar el color/emoji según el tiempo
                if tiempo_transcurrido < 0.1:
                    emoji = "🟢"  # Muy rápido
                elif tiempo_transcurrido < 0.5:
                    emoji = "🟡"  # Rápido
                elif tiempo_transcurrido < 1.0:
                    emoji = "🟠"  # Moderado
                else:
                    emoji = "🔴"  # Lento
                
                print(f"{emoji} [{timestamp}] {operacion} completada en {tiempo_transcurrido:.3f}s")
                return resultado
                
            except Exception as e:
                tiempo_transcurrido = time.time() - inicio
                print(f"❌ [{timestamp}] {operacion} falló después de {tiempo_transcurrido:.3f}s - Error: {str(e)}")
                raise e
                
        return wrapper
    return decorador

def medir_tiempo_sincrono(operacion: str):
    """
    Decorador para medir y mostrar el tiempo de ejecución de funciones síncronas
    """
    def decorador(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            inicio = time.time()
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            try:
                print(f"⏱️  [{timestamp}] Iniciando {operacion}...")
                resultado = func(*args, **kwargs)
                tiempo_transcurrido = time.time() - inicio
                
                # Determinar el color/emoji según el tiempo
                if tiempo_transcurrido < 0.1:
                    emoji = "🟢"  # Muy rápido
                elif tiempo_transcurrido < 0.5:
                    emoji = "🟡"  # Rápido
                elif tiempo_transcurrido < 1.0:
                    emoji = "🟠"  # Moderado
                else:
                    emoji = "🔴"  # Lento
                
                print(f"{emoji} [{timestamp}] {operacion} completada en {tiempo_transcurrido:.3f}s")
                return resultado
                
            except Exception as e:
                tiempo_transcurrido = time.time() - inicio
                print(f"❌ [{timestamp}] {operacion} falló después de {tiempo_transcurrido:.3f}s - Error: {str(e)}")
                raise e
                
        return wrapper
    return decorador
