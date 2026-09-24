# SAHAAY — AI Financial Recovery & Journey Agent
> **Track 2 — AI-Powered Financial Journeys**  
> **Core Technology:** FlowPass — Persistent Financial Context Engine  
> **Product Tagline:** *One financial context. One guided journey. No starting over.*

---

## 1. The Core Differentiator: FlowPass vs. Traditional Fintech

```
TRADITIONAL FINTECH                          SAHAAY WITH FLOWPASS
-------------------                          --------------------
Real-World Medical Emergency                 Real-World Medical Emergency
         ↓                                             ↓
Insurance Application (18 forms)                   ONE CASE ID
         ↓ new application                             ↓
Personal Loan (re-enter KYC/income)          ONE FINANCIAL CONTEXT (FlowPass)
         ↓ new context                                 ↓
Hospital Billing (payment shock)             ┌─────────┼─────────┐
                                             ↓         ↓         ↓
                                         Insurance  Funding   Paytm
                                             └─────────┼─────────┘
                                                       ↓
                                             FULL RECOVERY COMPLETED
```

When a user moves from insurance claim analysis to funding the uncovered gap, **FlowPass carries the verified financial context forward**. The user never starts over.

---

## 2. Key Technical Innovations

1. **Deterministic Financial Gap Engine (`services/gap_engine.py`)**:
   - LLMs interpret documents; the rule engine calculates the math.
   - Applies Indian insurance proportionate deduction **only** to associated room-rent linked expenses (Surgeon, Doctor, OT, Nursing).
   - Fully protects non-associated expenses (Pharmacy, Diagnostics, Implants) from blanket cuts.

2. **Evidence-First AI (`components/sahaay/EvidenceBadge.tsx`)**:
   - Rejects deceptive consumer percentage confidence scores (e.g. "94% confidence").
   - Implements 7 deterministic states: `Verified`, `Extracted`, `User Provided`, `Estimated`, `Conflicting`, `Needs Review`, `Missing`.
   - Every financial conclusion links directly to Policy clauses (e.g., Section 4.2) and Hospital Bill lines.

3. **LangGraph State Orchestrator (`agents/orchestrator.py`)**:
   - Multi-agent state machine coordinating: Intent Agent, Document Agent, Policy Agent, Financial Context Agent, Gap Agent, Recovery Agent, Funding Agent, Communication Agent.
   - Automatic Human Escalation routing if conflicting policy clauses are detected.

4. **Paytm Execution Layer (`services/paytm_service.py` & `app/case/[id]/payment`)**:
   - Sahaay doesn't stop at advice. It executes the final hospital settlement via Paytm JS Checkout.

---

## 3. Quick Start Guide

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or SQLite local mode)

### Running Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

### Running Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 4. 3-Minute Hackathon Demo Walkthrough

| Time | Screen | Action / Narration |
|------|--------|---------------------|
| **0:00 - 0:25** | Landing & Intake | *"A medical emergency creates an insurance problem, a liquidity shock, and a hospital payment problem simultaneously."* Show Rohan's ₹1,84,600 bill. |
| **0:25 - 0:50** | Processing Timeline | Watch 6-step animated pipeline parse Star Health policy and City Hospital bill without generic spinners. |
| **0:50 - 1:25** | Case Overview & Bill Intelligence | Show ₹1,38,599 covered vs ₹46,001 gap. Open **Bill Intelligence** to demonstrate proportionate deduction isolation. |
| **1:25 - 1:50** | Evidence Map | Show that ₹1.38L isn't an AI hallucination — it links to **Policy Section 4.2** & **Hospital Bill Pg 1**. |
| **1:50 - 2:20** | FlowPass & Recovery Simulator | Slide gap amount to show Rohan's ₹15.8K buffer resilience. |
| **2:20 - 2:45** | **The Wow Moment: Funding** | Click **"Explore Funding"**. Watch verified income, obligations, and documents populate automatically. *"Because FlowPass carries the verified context, you don't start over."* |
| **2:45 - 3:00** | Paytm Execution | Complete checkout and land on the Recovery Timeline. |
