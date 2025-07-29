"""
Archivo principal de la aplicación FastAPI
Sistema de Gestión Papelería Dohko
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.controllers import inventario_controller, ventas_controller, proveedores_controller

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión Papelería Dohko",
    description="Sistema para gestionar inventario, ventas y proveedores",
    version="1.0.0"
)

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los controladores (routers)
app.include_router(
    inventario_controller.router,
    prefix="/api/inventario",
    tags=["Inventario"]
)

app.include_router(
    ventas_controller.router,
    prefix="/api/ventas",
    tags=["Ventas"]
)

app.include_router(
    proveedores_controller.router,
    prefix="/api/proveedores",
    tags=["Proveedores"]
)

# Ruta principal
@app.get("/")
def read_root():
    return {
        "mensaje": "Bienvenido al Sistema de Gestión Papelería Dohko",
        "version": "1.0.0",
        "estado": "funcionando"
    }

# Ruta de salud del sistema
@app.get("/health")
def health_check():
    return {"estado": "saludable"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
