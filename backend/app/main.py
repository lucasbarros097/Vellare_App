"""
Vellare Doces — FastAPI Application
====================================
App factory com lifespan, CORS e routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle hook: executa na inicialização e shutdown.
    - Cria tabelas no banco (se não existirem)
    - Executa seed de dados iniciais
    """
    # ── Startup ──
    print("[STARTUP] Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("[STARTUP] Tabelas criadas com sucesso.")

    # Seed de dados iniciais
    print("[STARTUP] Executando seed de produtos...")
    from app.services.seed import seed_products

    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()

    print("[STARTUP] Aplicação pronta para receber requests.")

    yield

    # ── Shutdown ──
    print("[SHUTDOWN] Encerrando aplicação...")
    engine.dispose()


# ── App Factory ──
app = FastAPI(
    title="Vellare Doces API",
    description=(
        "API de gestão de pedidos da confeitaria Vellare. "
        "Permite listar produtos, criar pedidos e gerenciar a fila de produção."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Para download de PDF/CSV
)

# ── Routers ──
from app.api.admin import router as admin_router
from app.api.orders import router as orders_router
from app.api.products import router as products_router

app.include_router(products_router)
app.include_router(orders_router)
app.include_router(admin_router)


# ── Health Check ──
@app.get("/api/health", tags=["Health"])
def health_check():
    """Endpoint de health check para monitoramento."""
    return {"status": "healthy", "service": "vellare-api"}
