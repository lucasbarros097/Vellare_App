"""
Vellare Doces — API: Produtos
=============================
Rota pública para listar produtos.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Product
from app.schemas.schemas import ProductOut

router = APIRouter(prefix="/api/products", tags=["Produtos"])


@router.get("/", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    """Lista todos os produtos ativos do cardápio."""
    products = (
        db.query(Product)
        .filter(Product.is_active.is_(True))
        .order_by(Product.category, Product.id)
        .all()
    )
    return products
