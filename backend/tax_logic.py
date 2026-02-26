"""
tax_logic.py — GST rate/type calculation for Indian Shopify sellers.

Rules:
- Parse order Created at → determine GST rate from tax_rules config (date ranges)
- Check Billing Province Name vs seller_state → CGST+SGST (same state) or IGST (interstate)
- Taxable amount = Subtotal / (1 + rate/100)
- Discounts distributed proportionally across line items
"""

from datetime import date, datetime
from typing import Any


def get_gst_rate(created_at: str, tax_rules: list[dict]) -> float:
    """
    Given an order's created_at string and a list of tax rule dicts,
    return the applicable GST rate (as a percentage, e.g. 5 or 12).

    tax_rules: [{"from": "YYYY-MM-DD", "to": "YYYY-MM-DD" | null, "rate": 5}, ...]
    """
    order_date = _parse_date(created_at)
    if order_date is None:
        # Default to last rule's rate if date unparseable
        return float(tax_rules[-1]["rate"]) if tax_rules else 0.0

    for rule in tax_rules:
        rule_from = _parse_date(rule.get("from", ""))
        rule_to_raw = rule.get("to")
        rule_to = _parse_date(rule_to_raw) if rule_to_raw else None

        if rule_from is None:
            continue

        after_start = order_date >= rule_from
        before_end = (rule_to is None) or (order_date <= rule_to)

        if after_start and before_end:
            return float(rule["rate"])

    # Fallback: last rule
    return float(tax_rules[-1]["rate"]) if tax_rules else 0.0


def get_gst_type(billing_province_name: str, seller_state: str) -> str:
    """
    Returns 'intra' (CGST+SGST) if buyer is in same state as seller, else 'inter' (IGST).
    """
    buyer = billing_province_name.strip().lower()
    seller = seller_state.strip().lower()
    return "intra" if buyer == seller else "inter"


def compute_tax_breakdown(order: dict[str, Any], config: dict) -> dict[str, Any]:
    """
    Given an order dict and config, compute all GST-related fields.
    Returns a dict with tax amounts, type, rate, and per-item breakdown.
    """
    tax_rules = config.get("tax_rules", [])
    seller_state = config.get("company", {}).get("seller_state", "")

    rate = get_gst_rate(order["created_at"], tax_rules)
    gst_type = get_gst_type(order["billing_province_name"], seller_state)

    subtotal = order["subtotal"]
    rate_decimal = rate / 100.0

    # Back-calculate taxable amount (subtotal is inclusive of GST)
    taxable = subtotal / (1 + rate_decimal)
    total_gst = subtotal - taxable

    if gst_type == "intra":
        cgst = total_gst / 2
        sgst = total_gst / 2
        igst = 0.0
    else:
        cgst = 0.0
        sgst = 0.0
        igst = total_gst

    # Per-line-item breakdown (proportional by price * qty)
    items = order.get("line_items", [])
    total_line_value = sum(i["price"] * i["quantity"] for i in items) or 1.0
    item_breakdown = []

    for item in items:
        line_val = item["price"] * item["quantity"]
        proportion = line_val / total_line_value

        item_taxable = taxable * proportion
        item_gst = total_gst * proportion

        # Proportional discount
        total_discount = sum(i.get("discount", 0) for i in items)
        item_discount = total_discount * proportion

        item_breakdown.append({
            **item,
            "taxable": round(item_taxable, 2),
            "gst": round(item_gst, 2),
            "discount": round(item_discount, 2),
            "total_with_gst": round(item_taxable + item_gst - item_discount, 2),
        })

    return {
        "rate": rate,
        "gst_type": gst_type,
        "taxable": round(taxable, 2),
        "total_gst": round(total_gst, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "igst": round(igst, 2),
        "item_breakdown": item_breakdown,
    }


def _parse_date(val: str) -> date | None:
    if not val:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(val[:len(fmt)], fmt).date()
        except (ValueError, TypeError):
            pass
    # Try dateutil as fallback
    try:
        from dateutil import parser as du
        return du.parse(val).date()
    except Exception:
        return None
