"""
csv_parser.py — Parse Shopify order export CSV into order dicts.
Filters to real order rows (Subtotal != '') and groups line items by order Name.
"""

import io
import csv
from typing import Any


def parse_shopify_csv(file_bytes: bytes) -> list[dict[str, Any]]:
    """
    Parse Shopify order export CSV bytes into a list of order dicts.
    Each order dict contains company/shipping info + a list of line items.
    Returns orders in the order they first appear in the CSV.
    """
    text = file_bytes.decode("utf-8-sig")  # handle BOM
    reader = csv.DictReader(io.StringIO(text))

    orders: dict[str, dict] = {}  # keyed by order Name, preserves insertion order

    for row in reader:
        # Skip rows that are continuation line items (no Subtotal = header/address rows)
        subtotal_raw = row.get("Subtotal", "").strip()
        lineitem_name = row.get("Lineitem name", "").strip()

        order_name = row.get("Name", "").strip()
        if not order_name:
            continue

        if order_name not in orders:
            # First row for this order — capture order-level fields
            orders[order_name] = {
                "order_number": order_name,
                "created_at": row.get("Created at", "").strip(),
                "customer_name": _full_name(row),
                "billing_address1": row.get("Billing Address1", "").strip(),
                "billing_address2": row.get("Billing Address2", "").strip(),
                "billing_city": row.get("Billing City", "").strip(),
                "billing_zip": row.get("Billing Zip", "").strip(),
                "billing_province": row.get("Billing Province", "").strip(),
                "billing_province_name": row.get("Billing Province Name", "").strip(),
                "billing_country": row.get("Billing Country", "").strip(),
                "email": row.get("Email", "").strip(),
                "phone": row.get("Phone", "").strip(),
                "subtotal": _float(subtotal_raw),
                "shipping": _float(row.get("Shipping", "").strip()),
                "taxes": _float(row.get("Taxes", "").strip()),
                "total": _float(row.get("Total", "").strip()),
                "payment_method": row.get("Payment Method", "").strip(),
                "fulfillment_status": row.get("Fulfillment Status", "").strip(),
                "line_items": [],
            }

        # Only add line items that have a name
        if lineitem_name:
            orders[order_name]["line_items"].append({
                "name": lineitem_name,
                "quantity": _int(row.get("Lineitem quantity", "1")),
                "price": _float(row.get("Lineitem price", "0")),
                "sku": row.get("Lineitem sku", "").strip(),
                "discount": _float(row.get("Lineitem discount", "0")),
                "variant": row.get("Lineitem variant title", "").strip(),
            })

    # Return only orders that have a subtotal (real orders, not just address continuations)
    return [o for o in orders.values() if o["subtotal"] > 0 or o["line_items"]]


def _full_name(row: dict) -> str:
    first = row.get("Billing Name", "").strip()
    if first:
        return first
    return f"{row.get('Billing First Name','').strip()} {row.get('Billing Last Name','').strip()}".strip()


def _float(val: str) -> float:
    try:
        return float(val.replace(",", "")) if val else 0.0
    except ValueError:
        return 0.0


def _int(val: str) -> int:
    try:
        return int(val) if val else 1
    except ValueError:
        return 1
