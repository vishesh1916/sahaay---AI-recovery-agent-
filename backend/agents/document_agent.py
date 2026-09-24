"""Document Agent — Intelligent document parsing and entity extraction.

Uses Groq LLM (openai/gpt-oss-20b) and pypdf to parse real user documents
and extract line items, policy rules, and evidence without fake mock data.
"""
import json
import os
import uuid
from groq import AsyncGroq
from config import settings
from services.pdf_ai_extractor import pdf_extractor
from services.document_parser import DocumentParser


class DocumentAgent:
    """Parses real uploaded user documents and extracts structured evidence."""

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"
        self.parser = DocumentParser()

    async def process(self, state_or_docs, evidence_param=None) -> dict:
        """Process all uploaded documents and extract structured facts.
        
        Flexible signature to support both LangGraph state dict or (documents, evidence).
        """
        if isinstance(state_or_docs, dict):
            documents = state_or_docs.get("documents", [])
            evidence = list(state_or_docs.get("evidence", []))
            messages = list(state_or_docs.get("messages", []))
            emergency_type = state_or_docs.get("emergency_type") or state_or_docs.get("type", "medical")
            user_narrative = state_or_docs.get("user_input", "")
        else:
            documents = state_or_docs or []
            evidence = list(evidence_param or [])
            messages = []
            emergency_type = "medical"
            user_narrative = ""

        if not documents:
            return {
                "current_node": "verify_evidence",
                "documents": [],
                "evidence": evidence,
                "line_items": [],
                "policy_rules": {},
                "messages": messages,
            }

        extracted_line_items: list[dict] = []
        policy_rules: dict = {}
        discharge_info: dict = {}
        provider_name: str = ""

        for doc in documents:
            doc_type = doc.get("type", "bill")
            file_path = doc.get("file_path", "")
            document_id = doc.get("document_id", str(uuid.uuid4()))

            # Parse the real document text
            extracted_text = ""
            if file_path and os.path.exists(file_path):
                parsed = await self.parser.parse(file_path, doc_type)
                extracted_text = parsed.content

            if not extracted_text.strip():
                continue

            # Run Groq AI extraction on the genuine document text
            ai_data = await pdf_extractor.analyze_document_with_ai(
                doc_text=extracted_text,
                doc_type=doc_type,
                emergency_type=emergency_type,
                user_narrative=user_narrative
            )

            if ai_data:
                if ai_data.get("provider_name"):
                    provider_name = ai_data["provider_name"]

                if ai_data.get("line_items"):
                    for item in ai_data["line_items"]:
                        extracted_line_items.append(item)
                        evidence.append({
                            "evidence_id": str(uuid.uuid4()),
                            "document_id": document_id,
                            "field": item.get("name", "Expense Item"),
                            "value": f"₹{item.get('amount', 0):,.0f}",
                            "status": "verified",
                            "source_ref": f"{doc_type.capitalize()} Extraction",
                        })

                if ai_data.get("policy_clauses"):
                    policy_rules.update(ai_data["policy_clauses"])
                    for k, v in ai_data["policy_clauses"].items():
                        evidence.append({
                            "evidence_id": str(uuid.uuid4()),
                            "document_id": document_id,
                            "field": k.replace("_", " ").title(),
                            "value": str(v),
                            "status": "verified",
                            "source_ref": "Policy Clause",
                        })

                doc["status"] = "parsed"
                doc["parsed_content"] = extracted_text[:500]

        doc_types = {d.get("type") for d in documents}
        readiness = self._calculate_readiness(doc_types, extracted_line_items, policy_rules)

        insurance_analysis = {
            "line_items": extracted_line_items,
            "policy_rules": policy_rules,
            "discharge_info": discharge_info,
            "provider_name": provider_name,
            "claim_readiness": readiness,
        }

        return {
            "current_node": "verify_evidence",
            "documents": documents,
            "evidence": evidence,
            "line_items": extracted_line_items,
            "policy_rules": policy_rules,
            "provider_name": provider_name,
            "insurance_analysis": insurance_analysis,
            "messages": messages,
        }

    def _calculate_readiness(self, doc_types: set, classified_items: list, policy_rules: dict) -> float:
        """Calculate readiness percentage dynamically based on uploaded documents."""
        score = 50.0
        if "bill" in doc_types or "policy" in doc_types:
            score += 20.0
        if classified_items:
            score += 20.0
        if policy_rules:
            score += 10.0
        return min(round(score, 1), 100.0)
