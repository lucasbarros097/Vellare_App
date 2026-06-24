"""
Vellare Doces — API: Pedidos
============================
Rotas públicas para criar e consultar pedidos.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import Order, OrderItem, Product
from app.schemas.schemas import OrderCreate, OrderItemOut, OrderOut

router = APIRouter(prefix="/api/orders", tags=["Pedidos"])


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Cria um novo pedido com seus itens.
    Calcula automaticamente subtotal e total.
    """
    # Validar que todos os produtos existem e estão ativos
    product_ids = [item.product_id for item in order_data.items]
    products = (
        db.query(Product)
        .filter(Product.id.in_(product_ids), Product.is_active.is_(True))
        .all()
    )
    products_map = {p.id: p for p in products}

    # Verificar se todos os IDs foram encontrados
    missing = set(product_ids) - set(products_map.keys())
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Produtos não encontrados ou inativos: {missing}",
        )

    # Criar o pedido
    order = Order(
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        notes=order_data.notes,
        status="pendente",
        total=0.0,
    )
    db.add(order)
    db.flush()  # Gera o ID do pedido

    # Criar os itens e calcular total
    total = 0.0
    for item_data in order_data.items:
        product = products_map[item_data.product_id]
        subtotal = product.price * item_data.quantity
        total += subtotal

        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=product.price,
            subtotal=subtotal,
        )
        db.add(order_item)

    # Atualizar total do pedido
    order.total = round(total, 2)
    db.commit()
    db.refresh(order)

    # Carregar relacionamentos para resposta
    db.refresh(order, ["items"])
    return _serialize_order(order)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Consulta um pedido pelo ID."""
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido #{order_id} não encontrado.",
        )

    return _serialize_order(order)


def _serialize_order(order: Order) -> OrderOut:
    """Serializa um pedido com nomes dos produtos nos itens."""
    items_out = []
    for item in order.items:
        items_out.append(
            OrderItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
        )

    return OrderOut(
        id=order.id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        notes=order.notes,
        status=order.status,
        total=order.total,
        created_at=order.created_at,
        items=items_out,
    )
