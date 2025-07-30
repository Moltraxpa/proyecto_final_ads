# Sistema de Gestión - Papelería Dohko

Sistema completo de gestión para la Papelería Dohko, diseñado para automatizar el control de inventario, registro de ventas y gestión de proveedores.

## Características Principales

### 🏪 Módulo de Gestión de Inventario
- ✅ Registrar productos con información completa
- ✅ Actualizar stock automático tras ventas
- ✅ Alertas automáticas de stock bajo
- ✅ Verificación de disponibilidad en tiempo real
- ✅ Historial de movimientos de inventario

### 💰 Módulo de Registro de Ventas
- ✅ Registro de ventas con múltiples productos
- ✅ Verificación de disponibilidad antes de vender
- ✅ Generación automática de comprobantes
- ✅ Procesamiento de pagos
- ✅ Actualización automática del inventario

### 🏭 Módulo de Control de Proveedores
- ✅ Registro completo de proveedores
- ✅ Gestión de órdenes de compra
- ✅ Control de facturas
- ✅ Procesamiento de pagos a proveedores

## Estructura del Proyecto

```
proyecto_Ads/pro/
├── backend/                 # API Backend con FastAPI
│   ├── app/
│   │   ├── models/         # Modelos de datos (SQLAlchemy)
│   │   ├── controllers/    # Controladores (API endpoints)
│   │   ├── schemas/        # Esquemas de validación (Pydantic)
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Lógica de negocio (Utilidades Performance)
│   │   └── database.py     # Configuración de base de datos
│   ├── main.py            # Punto de entrada de la aplicación
│   └── requirements.txt   # Dependencias Python
├── frontend/              # Frontend con HTML/CSS/JS
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── database/              # Scripts de base de datos
    └── create_database.py # Script para crear la BD
```

## Instalación y Configuración

### Requisitos Previos
- Python 3.8 o superior
- Navegador web moderno

### Instalación del Backend

1. **Navegar al directorio del backend:**
```bash
cd backend
```

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Crear la base de datos:**
```bash
cd ../database
python create_database.py
```

4. **Ejecutar el servidor:**
```bash
cd ../backend
python main.py
```

El servidor estará disponible en: http://localhost:8000

### Configuración del Frontend

1. **Abrir el archivo frontend/index.html en un navegador web**

O usar un servidor web local:
```bash
cd frontend
npm run dev
```

Luego abrir: http://localhost:5173

## Uso del Sistema

### 1. Gestión de Inventario
- **Registrar Producto**: Completar el formulario con nombre, descripción, precio, stock inicial y mínimo
- **Ver Productos**: Lista todos los productos con indicadores de stock bajo
- **Alertas**: Muestra productos que necesitan reposición

### 2. Registro de Ventas
- **Nueva Venta**: Seleccionar productos, cantidades y precios
- **Verificación**: El sistema verifica disponibilidad automáticamente
- **Comprobante**: Se genera automáticamente tras cada venta

### 3. Gestión de Proveedores
- **Registrar Proveedor**: Datos completos incluyendo RUC y empresa
- **Órdenes**: Crear y gestionar órdenes de compra
- **Facturas**: Control de facturas y pagos

## API Documentation

El sistema incluye documentación automática de la API:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno para Python
- **SQLite**: Base de datos ligera
- **Pydantic**: Validación de datos
- **Uvicorn**: Servidor ASGI

### Frontend
- **HTML5**: Estructura
- **CSS3**: Estilos y diseño responsive
- **JavaScript**: Funcionalidad interactiva

## Base de Datos

El sistema utiliza SQLite con las siguientes tablas principales:
- `persona` - Información base de personas
- `cliente` - Datos específicos de clientes
- `proveedor` - Datos específicos de proveedores
- `producto` - Catálogo de productos
- `inventario` - Movimientos de inventario
- `venta` - Registro de ventas
- `orden` - Órdenes de compra
- `factura` - Facturas de proveedores
- `pago` - Registro de pagos
- `comprobante` - Comprobantes de venta
- `alerta` - Alertas del sistema

## Funcionalidades Implementadas

✅ **Completadas:**
- Gestión completa de inventario
- Sistema de alertas de stock bajo
- Registro de ventas con múltiples productos
- Gestión de proveedores y órdenes
- Interfaz web funcional
- API RESTful completa


---

**Sistema de Gestión Papelería Dohko v1.0**  
*Desarrollado para optimizar la gestión y mejorar la eficiencia operativa*
*Desarrollado por Pablo Paucar*
