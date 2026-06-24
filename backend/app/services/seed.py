"""
Vellare Doces — Seed de Dados Iniciais
=======================================
Popula as 8 trufas no banco (idempotente).
"""

from sqlalchemy.orm import Session

from app.models.models import Product

# Catálogo oficial extraído do cardápio
TRUFAS = [
    # Sabores Tradicionais — R$ 3,20
    {
        "name": "Leite condensado",
        "category": "tradicional",
        "price": 3.20,
        "description": "Trufa clássica de leite condensado, com recheio cremoso e irresistível.",
    },
    {
        "name": "Doce de leite",
        "category": "tradicional",
        "price": 3.20,
        "description": "Trufa com recheio de doce de leite artesanal, derrete na boca.",
    },
    {
        "name": "Coco",
        "category": "tradicional",
        "price": 3.20,
        "description": "Trufa de coco ralado com textura suave e sabor tropical.",
    },
    {
        "name": "Limão",
        "category": "tradicional",
        "price": 3.20,
        "description": "Trufa refrescante de limão, equilíbrio perfeito entre doce e cítrico.",
    },
    {
        "name": "Cacau",
        "category": "tradicional",
        "price": 3.20,
        "description": "Trufa intensa de cacau puro, para os amantes de chocolate.",
    },
    {
        "name": "Chocolate",
        "category": "tradicional",
        "price": 3.20,
        "description": "Trufa de chocolate ao leite, o clássico que nunca falha.",
    },
    # Sabores Gourmet — R$ 4,50
    {
        "name": "Geléia de morango",
        "category": "gourmet",
        "price": 4.50,
        "description": "Trufa gourmet com geléia de morango artesanal, explosão de sabor.",
    },
    {
        "name": "Ganache com conhaque",
        "category": "gourmet",
        "price": 4.50,
        "description": "Trufa sofisticada com ganache de chocolate e toque de conhaque.",
    },
]


def seed_products(db: Session) -> None:
    """
    Insere os produtos iniciais no banco.
    Idempotente: só insere se a tabela estiver vazia.
    """
    existing_count = db.query(Product).count()
    if existing_count > 0:
        return

    for trufa_data in TRUFAS:
        product = Product(**trufa_data)
        db.add(product)

    db.commit()
    print(f"[SEED] {len(TRUFAS)} trufas inseridas com sucesso.")
