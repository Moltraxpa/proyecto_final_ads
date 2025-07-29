"""
Configuración de la base de datos
"""

import sqlite3
import os
from typing import Optional

class DatabaseConnection:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'papeleria_dohko.db')
    
    def get_connection(self):
        """Obtener conexión a la base de datos"""
        return sqlite3.connect(self.db_path)
    
    def execute_query(self, query: str, params: tuple = ()):
        """Ejecutar una consulta que no devuelve resultados"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()
    
    def fetch_one(self, query: str, params: tuple = ()):
        """Ejecutar una consulta que devuelve un resultado"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            return cursor.fetchone()
        finally:
            conn.close()
    
    def fetch_all(self, query: str, params: tuple = ()):
        """Ejecutar una consulta que devuelve múltiples resultados"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            return cursor.fetchall()
        finally:
            conn.close()

# Instancia global de la base de datos
db = DatabaseConnection()
