"""
Script para crear la base de datos del Sistema de Gestión Papelería Dohko
Basado en el diagrama de clases proporcionado
"""

import sqlite3
import os

def create_database():
    # Crear el directorio de la base de datos si no existe
    db_path = os.path.join(os.path.dirname(__file__), 'papeleria_dohko.db')
    
    # Conectar a la base de datos (se crea si no existe)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Tabla Persona (clase base)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS persona (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        direccion TEXT,
        correo TEXT,
        tipo TEXT NOT NULL -- 'cliente', 'administradora', 'proveedor'
    )
    ''')
    
    # Tabla Cliente
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cliente (
        id INTEGER PRIMARY KEY,
        tipo TEXT DEFAULT 'regular',
        FOREIGN KEY (id) REFERENCES persona (id)
    )
    ''')
    
    # Tabla Proveedor
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS proveedor (
        id INTEGER PRIMARY KEY,
        ruc TEXT,
        nombre_empresa TEXT,
        telefono TEXT,
        FOREIGN KEY (id) REFERENCES persona (id)
    )
    ''')
    
    # Tabla Producto
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS producto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        stock_actual INTEGER NOT NULL DEFAULT 0,
        stock_minimo INTEGER NOT NULL DEFAULT 0,
        proveedor_id INTEGER,
        FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
    )
    ''')
    
    # Tabla Inventario
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS inventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES producto (id)
    )
    ''')
    
    # Tabla Venta
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        total REAL NOT NULL,
        estado TEXT DEFAULT 'completada',
        cliente_id INTEGER,
        administradora_id INTEGER,
        FOREIGN KEY (cliente_id) REFERENCES cliente (id),
        FOREIGN KEY (administradora_id) REFERENCES persona (id)
    )
    ''')
    
    # Tabla Orden
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orden (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        proveedor_id INTEGER NOT NULL,
        administradora_id INTEGER,
        FOREIGN KEY (proveedor_id) REFERENCES proveedor (id),
        FOREIGN KEY (administradora_id) REFERENCES persona (id)
    )
    ''')
    
    # Tabla Alerta
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mensaje TEXT NOT NULL,
        fecha DATE NOT NULL,
        tipo TEXT DEFAULT 'stock_bajo',
        producto_id INTEGER,
        FOREIGN KEY (producto_id) REFERENCES producto (id)
    )
    ''')
    
    # Tabla Pago
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pago (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        fecha DATE NOT NULL,
        metodo TEXT NOT NULL,
        referencia TEXT,
        estado TEXT DEFAULT 'pendiente',
        venta_id INTEGER,
        orden_id INTEGER,
        FOREIGN KEY (venta_id) REFERENCES venta (id),
        FOREIGN KEY (orden_id) REFERENCES orden (id)
    )
    ''')
    
    # Tabla Comprobante
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS comprobante (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        detalles TEXT,
        total REAL NOT NULL,
        tipo TEXT DEFAULT 'venta',
        venta_id INTEGER,
        FOREIGN KEY (venta_id) REFERENCES venta (id)
    )
    ''')
    
    # Tabla Factura
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS factura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        total REAL NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        orden_id INTEGER,
        proveedor_id INTEGER,
        FOREIGN KEY (orden_id) REFERENCES orden (id),
        FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
    )
    ''')
    
    # Tabla de relación muchos a muchos para productos en ventas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS venta_producto (
        venta_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        PRIMARY KEY (venta_id, producto_id),
        FOREIGN KEY (venta_id) REFERENCES venta (id),
        FOREIGN KEY (producto_id) REFERENCES producto (id)
    )
    ''')
    
    # Tabla de relación muchos a muchos para productos en órdenes
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orden_producto (
        orden_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL,
        PRIMARY KEY (orden_id, producto_id),
        FOREIGN KEY (orden_id) REFERENCES orden (id),
        FOREIGN KEY (producto_id) REFERENCES producto (id)
    )
    ''')
    
    # Insertar datos de ejemplo
    # Administradora
    cursor.execute('''
    INSERT OR IGNORE INTO persona (id, nombre, apellido, direccion, correo, tipo)
    VALUES (1, 'María', 'González', 'Solanda, Quito', 'maria@papeleriadohko.com', 'administradora')
    ''')
    
    # Algunos productos de ejemplo
    cursor.execute('''
    INSERT OR IGNORE INTO producto (nombre, descripcion, precio, stock_actual, stock_minimo)
    VALUES 
    ('Cuaderno Universitario', 'Cuaderno de 100 hojas universitario', 2.50, 50, 10),
    ('Bolígrafo Azul', 'Bolígrafo tinta azul', 0.50, 100, 20),
    ('Lápiz HB', 'Lápiz grafito HB', 0.30, 80, 15),
    ('Borrador Blanco', 'Borrador de miga de pan', 0.25, 60, 10)
    ''')
    
    conn.commit()
    conn.close()
    
    print("Base de datos creada exitosamente en:", db_path)

if __name__ == "__main__":
    create_database()
