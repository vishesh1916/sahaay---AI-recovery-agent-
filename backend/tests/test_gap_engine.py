"""Unit tests for SAHAAY Deterministic Financial Gap Engine."""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.gap_engine import GapEngine, PolicyRules
from schemas.insurance_state import LineItem, LineItemCategory

def test_proportionate_deduction_and_isolated_charges():
    """Verify that:
    1. Room rent is capped at ₹5,000/day
    2. Associated expenses are reduced by 71.43% (5000 / 7000)
    3. Non-associated expenses (Pharmacy, Diagnostics, Implants) are NOT reduced
    4. Excluded expenses (Consumables) are 100% deducted
    """
    engine = GapEngine()
    
    line_items = [
        LineItem(name="Room Rent", amount=70000, category=LineItemCategory.associated),
        LineItem(name="Surgeon Fees", amount=35000, category=LineItemCategory.associated),
        LineItem(name="Doctor Fees", amount=15000, category=LineItemCategory.associated),
        LineItem(name="OT Charges", amount=12000, category=LineItemCategory.associated),
        LineItem(name="Nursing Charges", amount=8000, category=LineItemCategory.associated),
        LineItem(name="Pharmacy", amount=18600, category=LineItemCategory.non_associated),
        LineItem(name="Diagnostics", amount=12000, category=LineItemCategory.non_associated),
        LineItem(name="Implants", amount=8000, category=LineItemCategory.non_associated),
        LineItem(name="Consumables", amount=6000, category=LineItemCategory.excluded),
    ]
    
    policy_rules = PolicyRules(
        sum_insured=500000,
        room_rent_limit_per_day=5000,
        has_proportionate_clause=True,
        deductible=0,
        copay_percentage=0.0,
        sub_limits={},
        exclusions=["consumables"],
        waiting_period_conditions=[],
    )
    
    result = engine.calculate(line_items, policy_rules, room_rent_days=10)
    
    print(f"Total Hospital Bill: INR {result.total_bill:,.2f}")
    print(f"Proportionate Deduction Ratio: {result.proportionate_ratio:.4f}")
    print(f"Non-associated Covered (100%): INR {result.non_associated_covered:,.2f}")
    print(f"Excluded Consumables: INR {result.excluded_amount:,.2f}")
    print(f"Potential Claim Approved: INR {result.potential_claim_amount:,.2f}")
    print(f"Potential Gap to Arrange: INR {result.potential_gap:,.2f}")
    
    # 1. Total Bill should be exactly ₹1,84,600
    assert result.total_bill == 184600.0, f"Expected 184600, got {result.total_bill}"
    
    # 2. Proportionate ratio should be 5000 / 7000 ~= 0.7143
    assert abs(result.proportionate_ratio - (5000 / 7000)) < 0.0001, "Ratio error"
    
    # 3. Non-associated expenses should be covered 100% (18600 + 12000 + 8000 = 38600)
    assert result.non_associated_covered == 38600.0, "Non-associated error"
    
    # 4. Consumables should be 100% excluded (deduction = 6000)
    assert result.excluded_amount == 6000.0, "Consumables exclusion error"
    
    # 5. Potential claim amount should be approximately ₹1,38,599 to ₹1,38,600
    assert 138000 <= result.potential_claim_amount <= 139000, "Claim calculation error"
    
    # 6. Potential gap should be approximately ₹46,000
    assert 45500 <= result.potential_gap <= 46500, "Gap calculation error"
    
    print("\nSUCCESS: All deterministic gap engine assertions verified successfully!")

if __name__ == "__main__":
    test_proportionate_deduction_and_isolated_charges()
