"""
Vellare Doces — Exportação de Relatórios
========================================
Geração de PDF (ReportLab) e CSV para pedidos.
"""

import csv
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.models import Order


# ──── Cores Vellare ────
CHOCOLATE = colors.HexColor("#5B3A29")
CREAM = colors.HexColor("#F5F0E1")
GOLD = colors.HexColor("#C49A6C")
DARK = colors.HexColor("#3E2418")


def generate_orders_pdf(orders: list[Order]) -> bytes:
    """
    Gera relatório PDF com a lista de pedidos.
    Retorna os bytes do PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    # Estilo customizado para o título
    title_style = ParagraphStyle(
        "VellareTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=CHOCOLATE,
        spaceAfter=6 * mm,
    )

    subtitle_style = ParagraphStyle(
        "VellareSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=GOLD,
        spaceAfter=8 * mm,
    )

    elements = []

    # ── Header ──
    elements.append(Paragraph("Vellare Doces", title_style))
    elements.append(
        Paragraph(
            f"Relatório de Pedidos — {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            subtitle_style,
        )
    )
    elements.append(Spacer(1, 4 * mm))

    if not orders:
        elements.append(Paragraph("Nenhum pedido encontrado.", styles["Normal"]))
        doc.build(elements)
        return buffer.getvalue()

    # ── Tabela de Pedidos ──
    header = ["#", "Cliente", "Telefone", "Itens", "Total (R$)", "Status", "Data"]
    data = [header]

    for order in orders:
        items_str = ", ".join(
            f"{item.product.name} x{item.quantity}" for item in order.items
        )
        data.append(
            [
                str(order.id),
                order.customer_name,
                order.customer_phone,
                items_str,
                f"R$ {order.total:.2f}",
                order.status.capitalize(),
                order.created_at.strftime("%d/%m/%Y %H:%M"),
            ]
        )

    col_widths = [30, 85, 70, 130, 55, 55, 75]

    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                # Header
                ("BACKGROUND", (0, 0), (-1, 0), CHOCOLATE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                # Body
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                ("ALIGN", (0, 1), (0, -1), "CENTER"),
                ("ALIGN", (4, 1), (4, -1), "RIGHT"),
                ("ALIGN", (5, 1), (5, -1), "CENTER"),
                # Alternating rows
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREAM]),
                # Grid
                ("GRID", (0, 0), (-1, -1), 0.5, GOLD),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    elements.append(table)

    # ── Resumo ──
    elements.append(Spacer(1, 8 * mm))
    total_geral = sum(o.total for o in orders)
    elements.append(
        Paragraph(
            f"<b>Total de pedidos:</b> {len(orders)} &nbsp;&nbsp;&nbsp; "
            f"<b>Valor total:</b> R$ {total_geral:.2f}",
            styles["Normal"],
        )
    )

    doc.build(elements)
    return buffer.getvalue()


def generate_orders_csv(orders: list[Order]) -> str:
    """
    Gera relatório CSV com a lista de pedidos.
    Retorna a string CSV.
    """
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)

    # Header
    writer.writerow(
        [
            "ID",
            "Cliente",
            "Telefone",
            "Itens",
            "Total (R$)",
            "Status",
            "Observações",
            "Data Criação",
        ]
    )

    for order in orders:
        items_str = " | ".join(
            f"{item.product.name} x{item.quantity}" for item in order.items
        )
        writer.writerow(
            [
                order.id,
                order.customer_name,
                order.customer_phone,
                items_str,
                f"{order.total:.2f}",
                order.status,
                order.notes or "",
                order.created_at.strftime("%d/%m/%Y %H:%M"),
            ]
        )

    return output.getvalue()
