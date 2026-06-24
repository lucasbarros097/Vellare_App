"""
Vellare Doces — Pydantic Schemas
================================
Validação de entrada e serialização de saída.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ──────────────────── Product ────────────────────


class ProductOut(BaseModel):
    """Schema de saída de produto."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    price: float
    description: str | None = None
    is_active: bool


# ──────────────────── Order Item ────────────────────


class OrderItemCreate(BaseModel):
    """Schema de criação de item do pedido."""

    product_id: int = Field(..., gt=0, description="ID do produto")
    quantity: int = Field(..., gt=0, le=100, description="Quantidade (1-100)")


class OrderItemOut(BaseModel):
    """Schema de saída de item do pedido."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str | None = None
    quantity: int
    unit_price: float
    subtotal: float


# ──────────────────── Order ────────────────────


class OrderCreate(BaseModel):
    """Schema de criação de pedido."""

    customer_name: str = Field(
        ..., min_length=2, max_length=150, description="Nome do cliente"
    )
    customer_phone: str = Field(
        ..., min_length=8, max_length=20, description="Telefone do cliente"
    )
    notes: str | None = Field(None, max_length=500, description="Observações")
    items: list[OrderItemCreate] = Field(
        ..., min_length=1, description="Itens do pedido (mínimo 1)"
    )


class OrderOut(BaseModel):
    """Schema de saída de pedido."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    customer_phone: str
    notes: str | None
    status: str
    total: float
    created_at: datetime
    items: list[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    """Schema para atualização de status."""

    status: str = Field(
        ...,
        description="Novo status: pendente, preparando, pronto, entregue",
    )


class OrderListOut(BaseModel):
    """Schema para lista de pedidos com paginação simples."""

    orders: list[OrderOut]
    total_count: int
