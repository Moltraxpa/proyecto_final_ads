"""
Script para actualizar la tabla de ventas con campos adicionales
"""

import sqlite3
import os

def actualizar_tabla_ventas():
    """Agregar campos adicionales a la tabla venta"""
    
    db_path = os.path.join(os.path.dirname(__file__), 'papeleria_dohko.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar si las columnas ya existen
        cursor.execute("PRAGMA table_info(venta)")
        columnas = [info[1] for info in cursor.fetchall()]
        
        campos_nuevos = [
            ('cliente_nombre', 'TEXT'),
            ('cliente_email', 'TEXT'),
            ('cliente_telefono', 'TEXT'),
            ('tipo_pago', 'TEXT DEFAULT "efectivo"'),
            ('observaciones', 'TEXT')
        ]
        
        for campo, tipo in campos_nuevos:
            if campo not in columnas:
                query = f"ALTER TABLE venta ADD COLUMN {campo} {tipo}"
                cursor.execute(query)
                print(f"Columna {campo} agregada exitosamente")
            else:
                print(f"Columna {campo} ya existe")
        
        conn.commit()
        print("Actualización de tabla venta completada")
        
    except Exception as e:
        print(f"Error actualizando tabla: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    actualizar_tabla_ventas()
