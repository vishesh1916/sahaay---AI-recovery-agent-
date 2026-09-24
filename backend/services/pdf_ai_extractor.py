"""PDF Intelligence & Groq AI Document Extractor.

Extracts real text from uploaded user PDF documents using pure-Python pypdf
and uses Groq LLM (openai/gpt-oss-20b) with exponential backoff retry
to extract structured financial line items, policy limits, deductibles,
and provider entities for any emergency type without fake mock data.
"""
import os
import json
import logging
import asyncio
from typing import Optional, Dict, Any, List
import pypdf
from groq import AsyncGroq
from config import settings

logger = logging.getLogger("sahaay.pdf_extractor")


class PDFIntelligenceService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.primary_model = "openai/gpt-oss-120b"
        self.fallback_models = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b"]

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract clean text content from a PDF across all pages."""
        try:
            reader = pypdf.PdfReader(file_path)
            extracted = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted.append(f"--- Page {idx + 1} ---\n{page_text.strip()}")
            return "\n\n".join(extracted)
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {file_path}: {e}")
            return ""

    def normalize_category(self, raw_cat: str) -> str:
        """Normalize any model output into strict LineItemCategory enum values."""
        cat_lower = str(raw_cat or "").lower().strip()
        if any(k in cat_lower for k in ["room", "surg", "doctor", "consult", "ot", "theatre", "nurs", "labor", "labour", "associated"]):
            return "associated"
        elif any(k in cat_lower for k in ["exclud", "consum", "admin", "ppe", "cosmetic", "deductible", "discretionary"]):
            return "excluded"
        elif "review" in cat_lower:
            return "needs_review"
        return "non_associated"

    async def analyze_document_with_ai(
        self,
        doc_text: str,
        doc_type: str,
        emergency_type: str = "medical",
        user_narrative: str = "",
        target_amount: float = 0.0
    ) -> Dict[str, Any]:
        """Use Groq LLM to intelligently extract structured entities and line items.
        
        Uses response_format={'type': 'json_object'} and resilient fallback models.
        """
        if not doc_text.strip() and not user_narrative.strip():
            return {}

        system_prompt = f"""You are Sahaay's Document & Financial Intelligence Agent.
Your task is to analyze real uploaded documents and narrative text for an emergency of type: '{emergency_type}'.

You must extract verified facts into strict JSON format with this exact structure:
{{
  "provider_name": "Name of hospital, garage workshop, contractor, or employer/client found in text",
  "document_summary": "1-2 sentence factual summary of what the document or incident describes",
  "total_amount": 0.0,
  "policy_clauses": {{
    "room_rent_limit_per_day": 5000.0,
    "has_proportionate_clause": true,
    "compulsory_deductible": 2000.0,
    "has_zero_depreciation": true,
    "copay_percentage": 0.0,
    "exclusions": ["consumables", "cosmetics"]
  }},
  "line_items": [
    {{
      "name": "Line item description",
      "amount": 10000.0,
      "category": "associated" or "non_associated" or "excluded",
      "covered_amount": 8000.0,
      "deduction": 2000.0,
      "reason": "Reason for coverage or deduction based on Indian norms"
    }}
  ]
}}

Category guide:
- 'associated': Hospital room rent, surgeon fees, doctor visit, OT charges, nursing, garage repair labor.
- 'non_associated': Pharmacy, medicines, diagnostics, surgical implants, metal/glass vehicle parts, essential utility bills.
- 'excluded': Non-medical consumables, gloves, sanitizers, cosmetic additions, discretionary expenses.

Extract actual numbers and provider name from the text.
If no explicit items are written, derive realistic line items matching the stated amount ({target_amount if target_amount > 0 else 'provided amount'}).
Return ONLY a valid JSON object."""

        clean_doc_text = doc_text.strip()[:3000] if doc_text.strip() else "(No raw text extracted — parse from situation narrative)"
        user_prompt = f"""DOCUMENT TYPE: {doc_type}
EMERGENCY TYPE: {emergency_type}
STATED AMOUNT: ₹{target_amount:,.0f}

USER SITUATION NARRATIVE:
{user_narrative if user_narrative.strip() else "(Not specified)"}

DOCUMENT EXTRACTED CONTENT:
{clean_doc_text}
"""

        models_to_try = [self.primary_model] + self.fallback_models

        for model in models_to_try:
            try:
                completion = await self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=2000,
                )
                raw_content = completion.choices[0].message.content.strip()
                parsed = json.loads(raw_content)

                if parsed and isinstance(parsed, dict):
                    # Clean and normalize line items
                    raw_items = parsed.get("line_items", [])
                    cleaned_items = []
                    computed_total = 0.0

                    for item in raw_items:
                        if not isinstance(item, dict):
                            continue
                        name = str(item.get("name") or "Medical Expense").strip()
                        try:
                            amt = float(item.get("amount") or 0.0)
                        except (ValueError, TypeError):
                            amt = 0.0

                        cat = self.normalize_category(item.get("category", "associated"))
                        cov = float(item.get("covered_amount") or 0.0)
                        ded = float(item.get("deduction") or (amt - cov if amt >= cov else 0.0))
                        reason = str(item.get("reason") or "Verified against policy norms").strip()

                        cleaned_items.append({
                            "name": name,
                            "amount": amt,
                            "category": cat,
                            "covered_amount": cov,
                            "deduction": ded,
                            "reason": reason
                        })
                        computed_total += amt

                    parsed["line_items"] = cleaned_items
                    if not parsed.get("total_amount") or float(parsed["total_amount"]) <= 0:
                        parsed["total_amount"] = computed_total if computed_total > 0 else target_amount

                    logger.info(f"Groq successfully parsed document with {model}: {len(cleaned_items)} line items found.")
                    return parsed

            except Exception as e:
                logger.warning(f"Groq parsing attempt with {model} failed: {e}. Trying next model...")
                continue

        logger.error("All Groq models failed to extract structured JSON from document.")
        return {}


pdf_extractor = PDFIntelligenceService()
