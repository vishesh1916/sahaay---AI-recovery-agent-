"""Communication Agent — Produces human-language responses.

Supports English, Hindi, and Hinglish.
Uses the fast model for natural language generation.
"""
import json
from groq import AsyncGroq
from config import settings
from agents.state import SahaayState


COMM_SYSTEM_PROMPT = """You are the Communication Agent for SAHAAY, a compassionate AI Financial Recovery assistant.

Your role is to translate structured data and system messages into warm, clear, human language.

RULES:
1. Be empathetic — the user is going through a financial emergency.
2. Be clear — no jargon. Explain insurance terms simply.
3. Be honest — say "potential" and "estimated", never "guaranteed" or "confirmed".
4. Never show raw numbers without context.
5. When showing monetary amounts, use Indian formatting (₹1,84,600 not ₹184,600).
6. Match the user's language preference:
   - "english": Pure English
   - "hindi": Pure Hindi (Devanagari script)
   - "hinglish": Mixed Hindi-English (Roman script)
7. Keep responses concise but informative.
8. Always end with a clear next action.

You are NOT a chatbot. You are a case-aware recovery agent speaking on behalf of SAHAAY's analysis.
"""


class CommunicationAgent:
    """Generates human-friendly responses from structured data.

    Multilingual: English, Hindi, Hinglish.
    Context-aware: Uses case state for personalized responses.
    """

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"

    async def generate_response(
        self, state: SahaayState, context: str, query: str | None = None
    ) -> str:
        """Generate a human-language response.

        Args:
            state: Current case state
            context: Structured context to communicate
            query: Optional user question to answer
        """
        language = state.get("language", "english")

        language_instruction = {
            "english": "Respond in clear, simple English.",
            "hindi": "पूरी तरह हिंदी में जवाब दें, देवनागरी लिपि में।",
            "hinglish": "Respond in Hinglish (mixed Hindi-English, Roman script). Example: 'Aapka hospital bill 1.84 lakh hai aur insurance se lagbhag 1.48 lakh cover ho sakta hai.'",
        }.get(language, "Respond in clear, simple English.")

        user_message = f"""
Language: {language_instruction}

Case context:
{context}

{"User's question: " + query if query else "Provide a summary of the current situation and next steps."}
"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": COMM_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=800,
        )

        return response.choices[0].message.content

    async def explain_gap(self, state: SahaayState) -> str:
        """Explain the financial gap in the user's language."""
        gap_result = state.get("gap_result", {}) or {}
        context = f"""
Financial Gap Analysis:
- Total hospital bill: ₹{gap_result.get('total_bill', 0):,.0f}
- Potential insurance coverage: ₹{gap_result.get('potential_claim_amount', 0):,.0f}
- Potential gap: ₹{gap_result.get('potential_gap', 0):,.0f}

Key reasons for the gap:
- Room rent: ₹{gap_result.get('room_rent_actual_per_day', 0):,.0f}/day actual vs ₹{gap_result.get('room_rent_allowed_per_day', 0):,.0f}/day limit
- Proportionate ratio: {gap_result.get('proportionate_ratio', 1.0):.1%}
- Excluded items: ₹{gap_result.get('excluded_amount', 0):,.0f}
"""
        return await self.generate_response(state, context)

    async def explain_next_steps(self, state: SahaayState) -> str:
        """Explain what the user should do next."""
        journey_state = state.get("journey_state", "intake")
        insurance = state.get("insurance_analysis", {}) or {}
        missing = insurance.get("missing_documents", [])

        context = f"""
Journey state: {journey_state}
Missing documents: {', '.join(missing) if missing else 'None'}
Current step: The user needs guidance on what to do next.
"""
        return await self.generate_response(
            state, context, "What should I do next?"
        )
