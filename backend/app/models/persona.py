"""
Modelo de Persona - Clase base
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class Persona:
    id: Optional[int]
    nombre: str
    apellido: str
    direccion: str
    correo: str
    tipo: str  # 'cliente', 'administradora', 'proveedor'
    
    def __init__(self, nombre: str, apellido: str, direccion: str, correo: str, tipo: str, id: Optional[int] = None):
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.direccion = direccion
        self.correo = correo
        self.tipo = tipo
    
    def anadir(self) -> bool:
        """Añadir persona a la base de datos"""
        from app.database import db
        query = """
        INSERT INTO persona (nombre, apellido, direccion, correo, tipo)
        VALUES (?, ?, ?, ?, ?)
        """
        try:
            self.id = db.execute_query(query, (self.nombre, self.apellido, self.direccion, self.correo, self.tipo))
            return True
        except Exception:
            return False
    
    def eliminar(self) -> bool:
        """Eliminar persona de la base de datos"""
        if not self.id:
            return False
        
        from app.database import db
        query = "DELETE FROM persona WHERE id = ?"
        try:
            db.execute_query(query, (self.id,))
            return True
        except Exception:
            return False
    
    def actualizar_correo(self, nuevo_correo: str) -> str:
        """Actualizar correo de la persona"""
        if not self.id:
            return "Error: No se puede actualizar sin ID"
        
        from app.database import db
        query = "UPDATE persona SET correo = ? WHERE id = ?"
        try:
            db.execute_query(query, (nuevo_correo, self.id))
            self.correo = nuevo_correo
            return "Correo actualizado exitosamente"
        except Exception:
            return "Error al actualizar correo"
