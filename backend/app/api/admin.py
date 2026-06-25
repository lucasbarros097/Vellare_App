"""
Vellare Doces — API: Admin
==========================
Rotas protegidas para gerenciamento de pedidos.
Autenticação via header X-Admin-Key.
"""

from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Order, OrderItem
from app.schemas.schemas import OrderListOut, OrderOut, OrderStatusUpdate
from app.services.export import generate_orders_csv, generate_orders_pdf

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Status válidos para transição
VALID_STATUSES = {"pendente", "preparando", "pronto", "entregue"}


def verify_admin_key(x_admin_key: str = Header(..., alias="X-Admin-Key")):
    """Dependency: verifica a chave de admin no header."""
    if x_admin_key != settings.admin_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chave de administração inválida.",
        )
    return True


def apply_date_filters(query, start_date: date | None, end_date: date | None):
    """
    Aplica o filtro de data compensando o fuso horário (UTC-3 do Brasil).
    O dia começa às 03:00:00 (UTC) e termina às 02:59:59 (UTC) do dia seguinte.
    """
    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time()) + timedelta(hours=3)
        query = query.filter(Order.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time()) + timedelta(hours=3)
        query = query.filter(Order.created_at <= end_dt)
        
    return query


@router.get("/orders", response_model=OrderListOut)
def list_orders(
    status_filter: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_admin_key),
):
    """
    Lista todos os pedidos (fila da doceira).
    Filtros opcionais por status e range de datas.
    """
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    )

    if status_filter and status_filter in VALID_STATUSES:
        query = query.filter(Order.status == status_filter)

    # Aplica o filtro de datas com fuso corrigido para o Brasil
    query = apply_date_filters(query, start_date, end_date)

    orders = query.order_by(Order.created_at.desc()).all()

    # Deduplica resultados do joinedload
    unique_orders = list({o.id: o for o in orders}.values())
    unique_orders.sort(key=lambda o: o.created_at, reverse=True)

    orders_out = []
    for order in unique_orders:
        from app.api.orders import _serialize_order
        orders_out.append(_serialize_order(order))

    return OrderListOut(orders=orders_out, total_count=len(orders_out))


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_admin_key),
):
    """Atualiza o status de um pedido."""
    if status_data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Use: {', '.join(VALID_STATUSES)}",
        )

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

    order.status = status_data.status
    db.commit()
    db.refresh(order)

    from app.api.orders import _serialize_order
    return _serialize_order(order)


@router.get("/export/pdf")
def export_orders_pdf(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_admin_key),
):
    """Exporta pedidos em PDF com filtro de data."""
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    )

    query = apply_date_filters(query, start_date, end_date)
    orders = query.order_by(Order.created_at.desc()).all()

    unique_orders = list({o.id: o for o in orders}.values())
    unique_orders.sort(key=lambda o: o.created_at, reverse=True)

    pdf_bytes = generate_orders_pdf(unique_orders)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=vellare_pedidos.pdf"},
    )


@router.get("/export/csv")
def export_orders_csv(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    _auth: bool = Depends(verify_admin_key),
):
    """Exporta pedidos em CSV com filtro de data."""
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    )

    query = apply_date_filters(query, start_date, end_date)
    orders = query.order_by(Order.created_at.desc()).all()

    unique_orders = list({o.id: o for o in orders}.values())
    unique_orders.sort(key=lambda o: o.created_at, reverse=True)

    csv_content = generate_orders_csv(unique_orders)

    return Response(
        content=csv_content.encode("utf-8-sig"),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vellare_pedidos.csv"},
    )