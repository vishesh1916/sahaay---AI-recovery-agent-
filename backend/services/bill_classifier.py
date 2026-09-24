"""Deterministic bill line-item classifier for Indian health insurance."""
from schemas.insurance_state import LineItem, LineItemCategory

# Deterministic classification rules based on Indian health insurance standards
ASSOCIATED_EXPENSES = {
    "room rent", "room charges", "bed charges", "room & board",
    "surgeon fees", "surgeon charges", "surgery charges",
    "doctor fees", "doctor charges", "consultant fees", "specialist fees",
    "ot charges", "operation theatre", "operation theater", "ot",
    "nursing charges", "nursing", "nurse charges",
    "anesthesia", "anaesthesia", "anesthetist",
    "icu charges", "icu", "intensive care",
}

NON_ASSOCIATED_EXPENSES = {
    "pharmacy", "medicines", "drugs", "medication",
    "diagnostics", "diagnostic", "lab", "laboratory", "pathology",
    "radiology", "x-ray", "xray", "mri", "ct scan", "ultrasound", "usg",
    "implants", "implant", "stent", "prosthesis",
    "blood", "blood transfusion", "blood products",
    "oxygen", "oxygen charges",
    "ambulance", "ambulance charges",
}

POSSIBLE_EXCLUSIONS = {
    "consumables", "surgical consumables",
    "non-medical items", "non medical",
    "attendant charges", "attendant",
    "registration", "admission charges",
    "documentation charges", "service charges",
    "telephone", "tv", "television",
    "food", "diet charges", "meals",
    "toiletries", "personal items",
}

class BillClassifier:
    """Classifies hospital bill line items into insurance categories.
    
    Categories:
    - Associated: Expenses proportionally linked to room rent (surgeon, doctor, OT, nursing)
    - Non-associated: Independent expenses covered at full value (pharmacy, diagnostics, implants)
    - Excluded: Items typically excluded from coverage (consumables, non-medical)
    - Needs Review: Items that don't fit known categories
    """
    
    def classify(self, line_items: list[dict]) -> list[LineItem]:
        """Classify a list of bill line items."""
        classified = []
        for item in line_items:
            name = item.get("name", item.get("description", ""))
            amount = float(item.get("amount", 0))
            category = self._determine_category(name)
            
            classified.append(LineItem(
                name=name,
                amount=amount,
                category=category,
                reason=self._get_reason(category, name)
            ))
        return classified
    
    def _determine_category(self, name: str) -> LineItemCategory:
        """Determine the category of a line item based on its name."""
        name_lower = name.lower().strip()
        
        # Check associated expenses
        for keyword in ASSOCIATED_EXPENSES:
            if keyword in name_lower:
                return LineItemCategory.associated
        
        # Check non-associated expenses
        for keyword in NON_ASSOCIATED_EXPENSES:
            if keyword in name_lower:
                return LineItemCategory.non_associated
        
        # Check possible exclusions
        for keyword in POSSIBLE_EXCLUSIONS:
            if keyword in name_lower:
                return LineItemCategory.excluded
        
        # Default: needs review
        return LineItemCategory.needs_review
    
    def _get_reason(self, category: LineItemCategory, name: str) -> str:
        """Get a human-readable reason for the classification."""
        reasons = {
            LineItemCategory.associated: f"'{name}' is classified as an associated expense. If room rent exceeds policy limits, proportionate deduction may apply.",
            LineItemCategory.non_associated: f"'{name}' is classified as a non-associated expense. Covered at actual amount (up to sum insured), not subject to proportionate deduction.",
            LineItemCategory.excluded: f"'{name}' is classified as a potential exclusion. Coverage depends on specific policy terms and riders.",
            LineItemCategory.needs_review: f"'{name}' could not be automatically classified. Manual review against policy terms is recommended.",
        }
        return reasons[category]
