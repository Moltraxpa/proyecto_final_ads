<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sistema de Gestión Papelería Dohko - Instrucciones para Copilot

## Contexto del Proyecto
Este es un sistema de gestión para una papelería real llamada "Papelería Dohko" en Quito, Ecuador. El objetivo es automatizar la gestión de inventario, ventas y proveedores.

## Arquitectura del Sistema
- **Backend**: FastAPI con Python, estructura MVC
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Base de Datos**: SQLite con estructura basada en el diagrama de clases proporcionado
- **Patrón**: MVC adaptado para APIs RESTful

## Entidades Principales
Basadas en el diagrama de clases:
- **Persona** (clase base): Cliente, DueñaAdministradora, Proveedor
- **Producto**: Inventario de la papelería
- **Inventario**: Control de stock y movimientos
- **Venta**: Transacciones de venta
- **Orden**: Órdenes de compra a proveedores
- **Pago**: Gestión de pagos
- **Comprobante**: Recibos de venta
- **Factura**: Facturas de proveedores
- **Alerta**: Notificaciones de stock bajo

## Reglas de Código
1. **Simplicidad**: Mantener código básico y legible
2. **Modularidad**: Cada módulo (inventario, ventas, proveedores) independiente
3. **Validación**: Usar Pydantic para validación de datos
4. **Error Handling**: Manejo básico de errores con try/catch
5. **Base de Datos**: Usar consultas SQL directas, no ORM complejo

## Funcionalidades Clave
### Inventario
- Registrar productos
- Actualizar stock (automático tras ventas)
- Generar alertas de stock bajo
- Verificar disponibilidad

### Ventas
- Registrar ventas con múltiples productos
- Verificar disponibilidad antes de vender
- Generar comprobantes automáticamente
- Procesar pagos

### Proveedores
- Registrar proveedores completos
- Gestionar órdenes de compra
- Control de facturas y pagos

## Convenciones de Nomenclatura
- **Archivos**: snake_case (ejemplo: inventario_controller.py)
- **Clases**: PascalCase (ejemplo: InventarioService)
- **Funciones**: snake_case (ejemplo: registrar_producto)
- **Variables**: snake_case (ejemplo: stock_actual)
- **Endpoints**: kebab-case (ejemplo: /stock-bajo)

## Estructura de Respuestas API
```python
# Éxito
{"exito": True, "mensaje": "Operación exitosa", "data": {...}}

# Error
{"exito": False, "mensaje": "Descripción del error"}
```

## Patrones de Base de Datos
- Usar métodos estáticos para consultas (ejemplo: `Producto.obtener_todos()`)
- Métodos de instancia para operaciones (ejemplo: `producto.registrar()`)
- Manejo de transacciones simples con try/except

## Frontend
- JavaScript vanilla, sin frameworks
- Funciones específicas por módulo
- Manejo de errores con mensajes al usuario
- Interfaz responsive y simple

Cuando generes código para este proyecto, mantén estos principios y usa la estructura existente como referencia.
