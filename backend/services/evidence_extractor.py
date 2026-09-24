"""Evidence extraction service using LLM to extract structured data from parsed documents."""
import json
import uuid
from groq import AsyncGroq
from config import settings

class EvidenceExtractor:
    """Extracts structured evidence from parsed document content using LLM."""
    
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"  # Fast working Groq model
    
    async def extract_bill_line_items(self, parsed_content: str) -> list[dict]:
        """Extract line items from a hospital bill."""
        prompt = """You are analyzing a hospital bill. Extract ALL line items with their amounts.
        
Return ONLY a JSON array with objects having these fields:
- "name": The expense name (e.g., "Room Rent", "Surgeon Fees", "Pharmacy")
- "amount": The numeric amount in INR (just the number, no symbols)

Example:
[
  {"name": "Room Rent", "amount": 70000},
  {"name": "Surgeon Fees", "amount": 35000}
]

Hospital Bill Content:
""" + parsed_content

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )
        
        try:
            result = json.loads(response.choices[0].message.content)
            if isinstance(result, dict) and "items" in result:
                return result["items"]
            elif isinstance(result, dict) and "line_items" in result:
                return result["line_items"]
            elif isinstance(result, list):
                return result
            return result.get("data", [])
        except (json.JSONDecodeError, KeyError, IndexError):
            return []
    
    async def extract_policy_rules(self, parsed_content: str) -> dict:
        """Extract insurance policy rules from parsed policy document."""
        prompt = """You are analyzing a health insurance policy document. Extract the key policy rules.

Return ONLY a JSON object with these fields:
- "sum_insured": Total sum insured amount (number)
- "room_rent_limit_per_day": Daily room rent limit in INR (number, 0 if no limit)
- "has_proportionate_clause": Whether proportionate deduction applies when room rent exceeds limit (boolean)
- "deductible": Deductible/excess amount (number, 0 if none)
- "copay_percentage": Copayment percentage as decimal (number, 0.0 if none)
- "sub_limits": Object with sub-limit items and their limits, e.g., {"ambulance": 2000, "icu": 10000}
- "exclusions": Array of excluded items/conditions
- "waiting_period_conditions": Array of conditions under waiting period
- "key_clauses": Array of objects with "section", "page", "content" for important clauses

Policy Content:
""" + parsed_content

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=3000,
            response_format={"type": "json_object"},
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except (json.JSONDecodeError, KeyError):
            return {
                "sum_insured": 500000,
                "room_rent_limit_per_day": 5000,
                "has_proportionate_clause": True,
                "deductible": 0,
                "copay_percentage": 0.0,
                "sub_limits": {},
                "exclusions": [],
                "waiting_period_conditions": [],
                "key_clauses": []
            }
    
    async def extract_discharge_info(self, parsed_content: str) -> dict:
        """Extract key information from discharge summary."""
        prompt = """You are analyzing a hospital discharge summary. Extract the key information.

Return ONLY a JSON object with these fields:
- "patient_name": Patient's name (string)
- "admission_date": Admission date (string)
- "discharge_date": Discharge date (string)
- "days_hospitalized": Number of days (number)
- "diagnosis": Primary diagnosis (string)
- "procedures": Array of procedures performed
- "treating_doctor": Name of treating doctor (string)
- "hospital_name": Name of hospital (string)

Discharge Summary Content:
""" + parsed_content

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except (json.JSONDecodeError, KeyError):
            return {}
    
    def create_evidence_items(self, extracted_data: dict, document_id: str, doc_type: str) -> list[dict]:
        """Convert extracted data into evidence items."""
        evidence_items = []
        
        if doc_type == "bill":
            for item in extracted_data if isinstance(extracted_data, list) else []:
                evidence_items.append({
                    "evidence_id": str(uuid.uuid4()),
                    "document_id": document_id,
                    "page": 1,
                    "section": "Line Items",
                    "source_text": f"{item.get('name', 'Unknown')}: ₹{item.get('amount', 0):,.0f}",
                    "field": "bill_line_item",
                    "value": json.dumps(item),
                    "status": "extracted",
                })
        elif doc_type == "policy":
            if isinstance(extracted_data, dict):
                for key, value in extracted_data.items():
                    if key != "key_clauses":
                        evidence_items.append({
                            "evidence_id": str(uuid.uuid4()),
                            "document_id": document_id,
                            "page": 1,
                            "section": "Policy Terms",
                            "source_text": f"{key}: {value}",
                            "field": f"policy_{key}",
                            "value": json.dumps(value) if not isinstance(value, str) else value,
                            "status": "extracted",
                        })
                for clause in extracted_data.get("key_clauses", []):
                    evidence_items.append({
                        "evidence_id": str(uuid.uuid4()),
                        "document_id": document_id,
                        "page": clause.get("page", 1),
                        "section": clause.get("section", ""),
                        "source_text": clause.get("content", ""),
                        "field": "policy_clause",
                        "value": json.dumps(clause),
                        "status": "extracted",
                    })
        elif doc_type == "discharge":
            if isinstance(extracted_data, dict):
                for key, value in extracted_data.items():
                    evidence_items.append({
                        "evidence_id": str(uuid.uuid4()),
                        "document_id": document_id,
                        "page": 1,
                        "section": "Discharge Summary",
                        "source_text": f"{key}: {value}",
                        "field": f"discharge_{key}",
                        "value": json.dumps(value) if not isinstance(value, str) else value,
                        "status": "extracted",
                    })
        
        return evidence_items
