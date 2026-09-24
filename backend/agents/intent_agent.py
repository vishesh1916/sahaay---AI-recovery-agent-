"""Intent Agent — Understands the user's objective and extracts entities.

Uses the fast model (Llama 3.1 8B via Groq) for quick intent classification.
Supports English, Hindi, and Hinglish input.
"""
import json
from groq import AsyncGroq
from config import settings
from agents.state import SahaayState


INTENT_SYSTEM_PROMPT = """You are the Intent Agent for SAHAAY, an AI Financial Recovery system.

Your job is to understand what financial emergency the user is describing and extract key entities.

IMPORTANT: Users may speak in English, Hindi, or Hinglish (mixed Hindi-English).

Return a JSON object with:
- "intent": One of: "medical_emergency", "vehicle_accident", "income_interruption", "unexpected_expense", "general_query", "follow_up"
- "entities": Object with extracted information:
  - "bill_amount": Number or null (the total bill/expense amount mentioned)
  - "has_insurance": Boolean or null
  - "patient": String or null (who is affected - "self", "mother", "father", "spouse", "child", etc.)
  - "hospital_name": String or null
  - "condition": String or null (medical condition/diagnosis if mentioned)
- "language": "english", "hindi", or "hinglish" (detected from user input)
- "summary": A brief 1-2 sentence summary of the situation in English
- "emotional_state": "calm", "anxious", "urgent", "confused" (inferred from tone)

Examples:
User: "Meri maa ka hospital bill 1.84 lakh hai aur mere paas insurance hai"
→ intent: "medical_emergency", entities: {bill_amount: 184600, has_insurance: true, patient: "mother"}, language: "hinglish"

User: "My mother's hospital bill is ₹1,84,600 and I have health insurance"
→ intent: "medical_emergency", entities: {bill_amount: 184600, has_insurance: true, patient: "mother"}, language: "english"
"""


class IntentAgent:
    """Classifies user intent and extracts entities from natural language input."""

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"

    async def process(self, state: SahaayState) -> dict:
        """Process user input and return intent classification.

        This is a LangGraph node function — takes state, returns state updates.
        """
        user_input = state.get("user_input", "")

        if not user_input:
            return {
                "current_node": "understand",
                "messages": state.get("messages", []) + [
                    {"role": "system", "content": "No user input provided."}
                ],
            }

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": INTENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_input},
            ],
            temperature=0.0,
            max_tokens=800,
            response_format={"type": "json_object"},
        )

        try:
            result = json.loads(response.choices[0].message.content)
        except (json.JSONDecodeError, IndexError):
            result = {
                "intent": "general_query",
                "entities": {},
                "language": "english",
                "summary": user_input,
                "emotional_state": "calm",
            }

        language = result.get("language", "english")

        return {
            "current_node": "understand",
            "language": language,
            "messages": state.get("messages", []) + [
                {"role": "user", "content": user_input},
                {"role": "system", "content": f"Intent: {json.dumps(result)}"},
            ],
        }
