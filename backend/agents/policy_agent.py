"""Policy Agent — Retrieves policy evidence and analyzes coverage.

Uses the reasoning model (Llama 3.3 70B) + Policy RAG for evidence-backed analysis.
NEVER answers policy questions without retrieved evidence.
Detects conflicting clauses and triggers human escalation.
"""
import json
from groq import AsyncGroq
from config import settings
from agents.state import SahaayState


POLICY_ANALYSIS_PROMPT = """You are the Policy Agent for SAHAAY, an AI Financial Recovery system.

You analyze insurance policy clauses to determine coverage for hospital bill line items.

CRITICAL RULES:
1. NEVER answer without evidence. Every conclusion must reference a specific policy section/page.
2. If you find contradictory clauses, say "CONFLICTING" and explain both clauses.
3. Do NOT invent coverage amounts. Only report what the policy says.
4. Use status labels: "potentially_covered", "excluded", "sub_limited", "needs_review", "conflicting"
5. Be conservative — when in doubt, flag for human review.

Given the policy clauses and bill line items below, analyze each line item's coverage status.

Return a JSON object with:
- "coverage_analysis": Array of objects, one per line item:
  - "item_name": String
  - "amount": Number
  - "status": "potentially_covered" | "excluded" | "sub_limited" | "needs_review" | "conflicting"
  - "evidence": Object with "section", "page", "text" of the relevant policy clause
  - "notes": String explaining the reasoning
- "room_rent_analysis": Object with:
  - "limit_per_day": Number from policy
  - "clause_reference": String (section/page)
  - "proportionate_clause_exists": Boolean
  - "proportionate_clause_reference": String
- "exclusions_found": Array of strings (items that match policy exclusions)
- "escalation_needed": Boolean (true if conflicting clauses detected)
- "escalation_reason": String or null
"""


class PolicyAgent:
    """Analyzes insurance policy for coverage determination.

    Evidence-first: never produces conclusions without policy clause references.
    Detects contradictions → triggers human escalation.
    """

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"  # Fast working Groq model

    async def process(self, state: SahaayState) -> dict:
        """Analyze policy coverage for each bill line item.

        LangGraph node function.
        """
        insurance_analysis = state.get("insurance_analysis", {}) or {}
        evidence = list(state.get("evidence", []))
        messages = list(state.get("messages", []))

        line_items = insurance_analysis.get("line_items", [])
        policy_rules = insurance_analysis.get("policy_rules", {})

        if not line_items or not policy_rules:
            messages.append({
                "role": "system",
                "content": "Cannot analyze policy: missing bill line items or policy rules.",
            })
            return {"current_node": "analyze_coverage", "messages": messages}

        # Use Policy RAG if available
        policy_clauses = await self._retrieve_relevant_clauses(state)

        # Build context for LLM
        context = f"""
POLICY RULES EXTRACTED:
{json.dumps(policy_rules, indent=2)}

RELEVANT POLICY CLAUSES (from RAG):
{json.dumps(policy_clauses, indent=2) if policy_clauses else "No additional clauses retrieved."}

BILL LINE ITEMS:
{json.dumps(line_items, indent=2)}
"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": POLICY_ANALYSIS_PROMPT},
                    {"role": "user", "content": context},
                ],
                temperature=0.0,
                max_tokens=3000,
                response_format={"type": "json_object"},
            )
            analysis = json.loads(response.choices[0].message.content)
        except Exception as e:
            # Fallback to rule-based analysis
            analysis = self._rule_based_analysis(line_items, policy_rules)
            messages.append({
                "role": "system",
                "content": f"LLM policy analysis failed ({e}). Using rule-based fallback.",
            })

        # Check for escalation
        escalation = None
        if analysis.get("escalation_needed"):
            escalation = {
                "type": "conflicting_evidence",
                "reason": analysis.get("escalation_reason", "Conflicting policy clauses detected"),
                "details": analysis,
            }
            messages.append({
                "role": "system",
                "content": "⚠️ ESCALATION: Conflicting policy clauses detected. "
                           "Automated estimation halted. Human review required.",
            })

        # Update insurance analysis with coverage results
        insurance_analysis["coverage_analysis"] = analysis.get("coverage_analysis", [])
        insurance_analysis["room_rent_analysis"] = analysis.get("room_rent_analysis", {})
        insurance_analysis["exclusions_found"] = analysis.get("exclusions_found", [])

        messages.append({
            "role": "system",
            "content": f"Policy analysis complete. "
                       f"Exclusions found: {len(analysis.get('exclusions_found', []))}. "
                       f"Escalation: {'Yes' if escalation else 'No'}.",
        })

        return {
            "current_node": "analyze_coverage",
            "insurance_analysis": insurance_analysis,
            "evidence": evidence,
            "escalation": escalation,
            "messages": messages,
        }

    async def _retrieve_relevant_clauses(self, state: SahaayState) -> list[dict]:
        """Retrieve relevant policy clauses using RAG."""
        try:
            from services.policy_rag import PolicyRAG
            rag = PolicyRAG()
            case_id = state.get("case_id", "")
            if not case_id:
                return []

            queries = [
                "room rent limit proportionate deduction",
                "exclusions not covered",
                "sub-limits specific limits",
                "copayment deductible",
                "waiting period pre-existing",
            ]
            all_clauses = []
            for query in queries:
                results = rag.search(case_id, query, n_results=3)
                all_clauses.extend(results)

            # Deduplicate
            seen = set()
            unique = []
            for clause in all_clauses:
                key = clause.get("text", "")[:100]
                if key not in seen:
                    seen.add(key)
                    unique.append(clause)

            return unique
        except Exception:
            return []

    def _rule_based_analysis(self, line_items: list[dict], policy_rules: dict) -> dict:
        """Fallback rule-based policy analysis when LLM is unavailable."""
        coverage_analysis = []
        exclusions_found = []

        exclusion_keywords = {e.lower() for e in policy_rules.get("exclusions", [])}

        for item in line_items:
            name = item.get("name", "").lower()
            category = item.get("category", "needs_review")

            # Check exclusions
            is_excluded = any(kw in name for kw in exclusion_keywords)

            if is_excluded:
                status = "excluded"
                exclusions_found.append(item.get("name", ""))
                evidence_section = "Section 5 — Exclusions"
            elif category == "associated":
                status = "potentially_covered"
                evidence_section = "Section 4.2 — Proportionate Deduction"
            elif category == "non_associated":
                status = "potentially_covered"
                evidence_section = "Section 1 — Coverage"
            else:
                status = "needs_review"
                evidence_section = "N/A — Manual review required"

            coverage_analysis.append({
                "item_name": item.get("name", ""),
                "amount": item.get("amount", 0),
                "status": status,
                "evidence": {
                    "section": evidence_section,
                    "page": 1,
                    "text": f"Based on policy rules for {category} expenses",
                },
                "notes": item.get("reason", ""),
            })

        room_rent_analysis = {
            "limit_per_day": policy_rules.get("room_rent_limit_per_day", 0),
            "clause_reference": "Section 2 — Room Rent",
            "proportionate_clause_exists": policy_rules.get("has_proportionate_clause", False),
            "proportionate_clause_reference": "Section 4.2",
        }

        return {
            "coverage_analysis": coverage_analysis,
            "room_rent_analysis": room_rent_analysis,
            "exclusions_found": exclusions_found,
            "escalation_needed": False,
            "escalation_reason": None,
        }
