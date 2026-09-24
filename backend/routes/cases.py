"""Case management API routes with full database persistence and multi-emergency support."""
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from groq import AsyncGroq

from config import settings
from database import get_db
from models.case import Case
from models.document import Document
from models.insurance_state import InsuranceState
from models.financial_context import FinancialContext
from models.recovery_scenario import RecoveryScenario as RecoveryScenarioModel
from models.audit_log import AuditLog
from models.user import User
from agents.orchestrator import run_full_analysis
from services.document_parser import DocumentParser
from services.evidence_extractor import EvidenceExtractor
from services.analysis_engine import AnalysisEngine
from services.pdf_ai_extractor import pdf_extractor

router = APIRouter()
cases_store: dict[str, dict] = {}
case_states: dict[str, dict] = {}
doc_parser = DocumentParser()
evidence_extractor = EvidenceExtractor()
analysis_engine = AnalysisEngine()

class CaseCreateRequest(BaseModel):
    user_input: str
    emergency_type: str = "medical"
    total_amount: float = 0.0
    language: str = "hinglish"
    user_id: Optional[str] = "user-default"
    monthly_inflow: Optional[float] = 53700.0
    monthly_expenses: Optional[float] = 31400.0
    existing_obligations: Optional[float] = 6500.0
    liquid_buffer: Optional[float] = 15800.0
    financials: Optional[dict] = None

class ChatRequest(BaseModel):
    query: str
    language: str = "hinglish"

class SimulateRequest(BaseModel):
    gap_amount: float

async def verify_consent(user_id: str, consent_type: str, db: AsyncSession):
    """Enforce granular DPDP consent check before processing."""
    if not user_id or user_id in ("user-default", "demo_user"):
        return True
    try:
        stmt = select(User).where(User.user_id == user_id)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            return True
        if consent_type == "health" and not user.consent_health:
            raise HTTPException(
                status_code=403,
                detail="Health document processing blocked: Health consent revoked under DPDP preferences."
            )
        elif consent_type == "financial" and not user.consent_financial:
            raise HTTPException(
                status_code=403,
                detail="Financial context processing blocked: Financial consent revoked under DPDP preferences."
            )
        elif consent_type == "payment" and not user.consent_payment:
            raise HTTPException(
                status_code=403,
                detail="Payment processing blocked: Payment consent revoked under DPDP preferences."
            )
    except HTTPException:
        raise
    except Exception:
        pass
    return True

@router.post("/")
async def create_case(request: CaseCreateRequest, db: AsyncSession = Depends(get_db)):
    """Create a new emergency case across any of the 4 emergency types."""
    short_uuid = uuid.uuid4().hex[:4].upper()
    prefix = {
        "medical": "SH-MED",
        "vehicle": "SH-VEH",
        "income": "SH-INC",
        "unexpected": "SH-UNX",
    }.get(request.emergency_type.lower(), "SH-GEN")
    case_id = f"CASE-{prefix}-{short_uuid}"

    # Auto-assign typical default amounts if 0.0
    amount = request.total_amount
    if amount == 0.0:
        amount = {
            "medical": 184600.0,
            "vehicle": 85000.0,
            "income": 120000.0,
            "unexpected": 65000.0,
        }.get(request.emergency_type.lower(), 184600.0)

    inflow = request.monthly_inflow or 53700.0
    expenses = request.monthly_expenses or 31400.0
    obligations = request.existing_obligations or 6500.0
    buffer = request.liquid_buffer or 15800.0

    if request.financials and isinstance(request.financials, dict):
        if "average_inflow" in request.financials and request.financials["average_inflow"] is not None:
            inflow = float(request.financials["average_inflow"])
        if "recurring_expenses" in request.financials and request.financials["recurring_expenses"] is not None:
            expenses = float(request.financials["recurring_expenses"])
        if "existing_obligations" in request.financials and request.financials["existing_obligations"] is not None:
            obligations = float(request.financials["existing_obligations"])
        if "liquidity_buffer" in request.financials and request.financials["liquidity_buffer"] is not None:
            buffer = float(request.financials["liquidity_buffer"])

    # Initial case record
    case_dict = {
        "case_id": case_id,
        "user_id": request.user_id,
        "emergency_type": request.emergency_type.lower(),
        "type": request.emergency_type.lower(),
        "status": "created",
        "user_input": request.user_input,
        "language": request.language,
        "total_amount": amount,
        "documents": [],
        "financial_context": {
            "average_inflow": inflow,
            "recurring_expenses": expenses,
            "existing_obligations": obligations,
            "liquidity_buffer": buffer,
            "source": "SIMULATED_FINANCIAL_DATA",
            "field_sources": {
                "average_inflow": "user_provided",
                "recurring_expenses": "user_provided",
                "existing_obligations": "user_provided",
                "liquidity_buffer": "derived",
            }
        },
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    # Persist to database
    try:
        db_case = Case(
            case_id=case_id,
            user_id=request.user_id,
            emergency_type=request.emergency_type.lower(),
            type=request.emergency_type.lower(),
            status="created",
            user_input=request.user_input,
            language=request.language,
            total_amount=amount,
        )
        db.add(db_case)

        # Audit log
        db_audit = AuditLog(
            case_id=case_id,
            actor="user",
            action="case_created",
            metadata_json={
                "emergency_type": request.emergency_type,
                "total_amount": amount,
                "user_id": request.user_id,
                "language": request.language
            }
        )
        db.add(db_audit)
        await db.commit()
    except Exception as e:
        await db.rollback()

    cases_store[case_id] = case_dict

    # Automatically run initial analysis pipeline so case is ready
    analyzed_state = await run_full_analysis(case_dict)
    case_states[case_id] = analyzed_state
    case_dict["status"] = "analyzed"
    case_dict["analysis"] = {
        "insurance_analysis": analyzed_state.get("insurance_analysis"),
        "financial_context": analyzed_state.get("financial_context"),
        "gap_result": analyzed_state.get("gap_result"),
        "recovery_scenarios": analyzed_state.get("recovery_scenarios", []),
        "flowpass": analyzed_state.get("flowpass"),
        "journey_state": analyzed_state.get("journey_state", "funding_prepared"),
        "summary": analyzed_state.get("summary"),
    }

    return case_dict


@router.get("/{case_id}")
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    """Get case details and analysis state."""
    # Check memory cache first
    case = cases_store.get(case_id)
    if not case:
        try:
            stmt = select(Case).where(Case.case_id == case_id)
            result = await db.execute(stmt)
            db_case = result.scalar_one_or_none()
            if db_case:
                # Load associated documents from database
                doc_stmt = select(Document).where(Document.case_id == case_id)
                doc_res = await db.execute(doc_stmt)
                db_docs = doc_res.scalars().all()
                docs_list = [
                    {
                        "document_id": d.document_id,
                        "case_id": d.case_id,
                        "type": d.type,
                        "filename": d.filename,
                        "status": d.status,
                    }
                    for d in db_docs
                ]

                case = {
                    "case_id": db_case.case_id,
                    "user_id": db_case.user_id,
                    "emergency_type": db_case.emergency_type,
                    "type": db_case.type,
                    "status": db_case.status,
                    "user_input": db_case.user_input,
                    "language": db_case.language,
                    "total_amount": db_case.total_amount,
                    "documents": docs_list,
                    "created_at": db_case.created_at.isoformat() if db_case.created_at else None,
                    "updated_at": db_case.updated_at.isoformat() if db_case.updated_at else None,
                }
                cases_store[case_id] = case
        except Exception as db_err:
            print(f"Error retrieving case {case_id} from DB: {db_err}")

    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    # Ensure analysis exists
    state = case_states.get(case_id)
    if not state:
        state = await run_full_analysis(case)
        case_states[case_id] = state

    case["analysis"] = {
        "insurance_analysis": state.get("insurance_analysis"),
        "financial_context": state.get("financial_context"),
        "gap_result": state.get("gap_result"),
        "recovery_scenarios": state.get("recovery_scenarios", []),
        "flowpass": state.get("flowpass"),
        "journey_state": state.get("journey_state", "funding_prepared"),
        "summary": state.get("summary"),
    }

    return case


@router.post("/{case_id}/documents")
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form("bill"),
    db: AsyncSession = Depends(get_db),
):
    """Upload and parse a document after validating DPDP health consent."""
    case = cases_store.get(case_id)
    if not case:
        try:
            stmt = select(Case).where(Case.case_id == case_id)
            res = await db.execute(stmt)
            db_case = res.scalar_one_or_none()
            if db_case:
                case = {
                    "case_id": db_case.case_id,
                    "user_id": db_case.user_id,
                    "emergency_type": db_case.emergency_type,
                    "type": db_case.type,
                    "status": db_case.status,
                    "user_input": db_case.user_input,
                    "language": db_case.language,
                    "total_amount": db_case.total_amount,
                    "documents": [],
                }
                cases_store[case_id] = case
        except Exception:
            case = None

    if not case:
        case = {"case_id": case_id, "user_id": "user-default", "emergency_type": "medical", "type": "medical"}
        cases_store[case_id] = case

    user_id = case.get("user_id") or "user-default"
    await verify_consent(user_id, "health", db)

    upload_dir = os.path.join(settings.UPLOAD_DIR, case_id)
    os.makedirs(upload_dir, exist_ok=True)
    filename = file.filename or f"{doc_type}_{uuid.uuid4().hex[:6]}.pdf"
    file_path = os.path.join(upload_dir, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # 1. Extract text from file (PDF or text)
    extracted_text = ""
    if filename.lower().endswith(".pdf"):
        extracted_text = pdf_extractor.extract_text_from_pdf(file_path)
    else:
        try:
            extracted_text = content.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = ""

    emergency_type = case.get("emergency_type") or case.get("type", "medical")
    user_narrative = case.get("user_input", "")
    target_amount = float(case.get("total_amount") or 0.0)

    # 2. Analyze document with Groq LLM
    ai_result = {}
    if extracted_text.strip():
        ai_result = await pdf_extractor.analyze_document_with_ai(
            doc_text=extracted_text,
            doc_type=doc_type,
            emergency_type=emergency_type,
            user_narrative=user_narrative,
            target_amount=target_amount
        )

    doc_id = str(uuid.uuid4())
    doc_record = {
        "document_id": doc_id,
        "case_id": case_id,
        "type": doc_type,
        "filename": filename,
        "file_path": file_path,
        "status": "parsed" if extracted_text else "uploaded",
        "parsed_content": extracted_text[:1000] if extracted_text else None,
        "ai_result": ai_result,
        "created_at": datetime.now().isoformat(),
    }

    # 3. Dynamically update case state with AI extracted data
    if case_id in cases_store:
        active_case = cases_store[case_id]
        active_case.setdefault("documents", []).append(doc_record)

        if ai_result.get("provider_name"):
            active_case["provider_name"] = ai_result["provider_name"]

        if ai_result.get("total_amount") and float(ai_result["total_amount"]) > 0:
            active_case["total_amount"] = float(ai_result["total_amount"])

        if ai_result.get("line_items"):
            active_case.setdefault("custom_line_items", []).extend(ai_result["line_items"])

        if ai_result.get("policy_clauses"):
            active_case.setdefault("custom_policy_rules", {}).update(ai_result["policy_clauses"])

        # Re-run full reasoning pipeline with new evidence
        analyzed_state = await run_full_analysis(active_case)
        case_states[case_id] = analyzed_state
        active_case["status"] = "analyzed"
        active_case["analysis"] = {
            "insurance_analysis": analyzed_state.get("insurance_analysis"),
            "financial_context": analyzed_state.get("financial_context"),
            "gap_result": analyzed_state.get("gap_result"),
            "recovery_scenarios": analyzed_state.get("recovery_scenarios", []),
            "flowpass": analyzed_state.get("flowpass"),
            "journey_state": analyzed_state.get("journey_state", "funding_prepared"),
            "summary": analyzed_state.get("summary"),
        }

    # Persist in DB with audit logs
    try:
        db_doc = Document(
            document_id=doc_id,
            case_id=case_id,
            type=doc_type,
            filename=filename,
            file_path=file_path,
            status="parsed" if extracted_text else "uploaded",
        )
        db.add(db_doc)

        db_audit = AuditLog(
            case_id=case_id,
            actor="user",
            action="document_uploaded",
            metadata_json={"filename": filename, "doc_type": doc_type}
        )
        db.add(db_audit)

        if ai_result:
            db_audit_parse = AuditLog(
                case_id=case_id,
                actor="document_agent",
                action="document_parsed",
                metadata_json={
                    "provider": ai_result.get("provider_name", "Identified"),
                    "lines_extracted": len(ai_result.get("line_items", [])),
                    "summary": ai_result.get("document_summary", "")
                }
            )
            db.add(db_audit_parse)

        await db.commit()
    except Exception:
        await db.rollback()

    return doc_record


@router.post("/{case_id}/analyze")
async def analyze_case(case_id: str, db: AsyncSession = Depends(get_db)):
    """Run full multi-emergency analysis pipeline."""
    case = cases_store.get(case_id)
    if not case:
        case = await get_case(case_id, db)

    analyzed = await run_full_analysis(case)
    case_states[case_id] = analyzed
    case["status"] = "analyzed"
    case["analysis"] = {
        "insurance_analysis": analyzed.get("insurance_analysis"),
        "financial_context": analyzed.get("financial_context"),
        "gap_result": analyzed.get("gap_result"),
        "recovery_scenarios": analyzed.get("recovery_scenarios", []),
        "flowpass": analyzed.get("flowpass"),
        "journey_state": analyzed.get("journey_state", "funding_prepared"),
        "summary": analyzed.get("summary"),
    }

    # Persist analysis state and audit logs in DB
    try:
        gap_res = analyzed.get("gap_result", {})
        ins_analysis = analyzed.get("insurance_analysis", {})
        ins_state = InsuranceState(
            id=str(uuid.uuid4()),
            case_id=case_id,
            potential_coverage=gap_res.get("potential_claim_amount", 0.0),
            potential_gap=gap_res.get("potential_gap", 0.0),
            missing_documents=ins_analysis.get("missing_documents", []),
            claim_readiness=ins_analysis.get("claim_readiness", 75.0),
            line_items=ins_analysis.get("line_items", []),
        )
        db.add(ins_state)

        db_audit_gap = AuditLog(
            case_id=case_id,
            actor="gap_engine",
            action="gap_calculated",
            metadata_json={
                "total_bill": gap_res.get("total_bill", 0),
                "potential_claim": gap_res.get("potential_claim_amount", 0),
                "potential_gap": gap_res.get("potential_gap", 0),
            }
        )
        db.add(db_audit_gap)

        db_audit_flowpass = AuditLog(
            case_id=case_id,
            actor="flowpass_engine",
            action="flowpass_generated",
            metadata_json={"journey_state": analyzed.get("journey_state", "funding_prepared")}
        )
        db.add(db_audit_flowpass)

        await db.commit()
    except Exception:
        await db.rollback()

    return case["analysis"]


@router.get("/{case_id}/evidence")
async def get_evidence(case_id: str):
    """Get verified evidence items for a case."""
    state = case_states.get(case_id, {})
    flowpass = state.get("flowpass", {})
    evidence = flowpass.get("verified_evidence", [])
    return {"case_id": case_id, "evidence": evidence}


@router.get("/{case_id}/financial-context")
async def get_financial_context(case_id: str, db: AsyncSession = Depends(get_db)):
    """Get FlowPass financial profile after validating DPDP financial consent."""
    case = cases_store.get(case_id, {})
    user_id = case.get("user_id") or "user-default"
    await verify_consent(user_id, "financial", db)

    financial = case.get("financial_context") or case_states.get(case_id, {}).get("financial_context")
    flowpass = case_states.get(case_id, {}).get("flowpass")
    return {
        "case_id": case_id,
        "financial_context": financial,
        "flowpass": flowpass,
    }


@router.post("/{case_id}/simulate-recovery")
async def simulate_recovery(case_id: str, request: SimulateRequest, db: AsyncSession = Depends(get_db)):
    """Simulate debt-to-income and cash buffer impact for a simulated gap amount."""
    case = cases_store.get(case_id, {})
    financial = case.get("financial_context") or {
        "average_inflow": 53700.0,
        "recurring_expenses": 31400.0,
        "existing_obligations": 6500.0,
        "liquidity_buffer": 15800.0,
    }

    inflow = financial["average_inflow"]
    expenses = financial["recurring_expenses"]
    obligations = financial["existing_obligations"]
    buffer = financial["liquidity_buffer"]

    gap = request.gap_amount
    remaining_buffer = max(buffer - gap, 0.0)
    modeled_emi = round(gap / 12.0)
    new_obligations = obligations + modeled_emi
    ratio = new_obligations / (inflow - expenses) if (inflow - expenses) > 0 else 1.0
    pressure = "low" if ratio < 0.4 else "medium" if ratio < 0.7 else "high"

    # Audit log
    try:
        db_audit = AuditLog(
            case_id=case_id,
            actor="recovery_agent",
            action="recovery_simulated",
            metadata_json={"gap_amount": gap, "modeled_emi": modeled_emi, "pressure": pressure}
        )
        db.add(db_audit)
        await db.commit()
    except Exception:
        await db.rollback()

    return {
        "case_id": case_id,
        "simulation": {
            "gap_amount": gap,
            "current_buffer": buffer,
            "remaining_buffer": remaining_buffer,
            "modeled_emi": modeled_emi,
            "new_total_obligations": new_obligations,
            "payment_pressure_label": pressure,
            "can_absorb": gap <= buffer,
        },
    }


@router.post("/{case_id}/prepare-funding")
async def prepare_funding(case_id: str, db: AsyncSession = Depends(get_db)):
    """Get the FlowPass funding context with verified vs confirmation fields."""
    case = cases_store.get(case_id, {})
    user_id = case.get("user_id") or "user-default"
    await verify_consent(user_id, "financial", db)

    state = case_states.get(case_id, {})
    flowpass = state.get("flowpass", {})
    funding_ctx = flowpass.get("funding_context")

    try:
        db_audit = AuditLog(
            case_id=case_id,
            actor="funding_agent",
            action="funding_prepared",
            metadata_json={"ready": True}
        )
        db.add(db_audit)
        await db.commit()
    except Exception:
        await db.rollback()

    return {
        "case_id": case_id,
        "funding_context": funding_ctx,
        "flowpass": flowpass,
    }


@router.get("/{case_id}/timeline")
async def get_case_timeline(case_id: str, db: AsyncSession = Depends(get_db)):
    """Get chronological audit trail for the case from real database events."""
    try:
        stmt = select(AuditLog).where(AuditLog.case_id == case_id).order_by(AuditLog.timestamp.asc())
        res = await db.execute(stmt)
        logs = res.scalars().all()
        events = []
        for log in logs:
            events.append({
                "log_id": log.log_id,
                "case_id": log.case_id,
                "actor": log.actor,
                "action": log.action,
                "timestamp": log.timestamp.isoformat() if log.timestamp else datetime.now().isoformat(),
                "metadata": log.metadata_json or {},
            })
        return {"case_id": case_id, "timeline": events}
    except Exception as e:
        return {"case_id": case_id, "timeline": []}


@router.post("/{case_id}/chat")
async def chat_with_sahaay(case_id: str, request: ChatRequest):
    """Direct Groq AI chat answering user queries grounded in case evidence."""
    case = cases_store.get(case_id, {})
    state = case_states.get(case_id, {})
    gap_info = state.get("gap_result", {})
    summary = state.get("summary", "Emergency case active")

    context_prompt = f"""You are Sahaay, an empathetic AI financial recovery agent assisting an Indian user in a financial crisis.
Case Reference: {case_id}
Emergency Type: {case.get('emergency_type', 'medical')}
Summary: {summary}
Total Amount: ₹{gap_info.get('total_bill', 0):,.0f}
Claim / Covered Amount: ₹{gap_info.get('potential_claim_amount', 0):,.0f}
Uncovered Gap to Arrange: ₹{gap_info.get('potential_gap', 0):,.0f}

Language requested: {request.language} (English, Hindi, or Hinglish as requested).
Keep answers concise, clear, and reassuring. Always reference the exact amounts and explain why FlowPass ensures they don't have to start over.
"""
    try:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        completion = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": context_prompt},
                {"role": "user", "content": request.query},
            ],
            temperature=0.3,
            max_tokens=250,
        )
        reply = completion.choices[0].message.content
    except Exception:
        fallback_tot = gap_info.get('total_bill') or case.get('total_amount', 0)
        fallback_gap = gap_info.get('potential_gap') or (case.get('total_amount', 0) * 0.3)
        reply = f"Sahaay: Aapka case {case_id} verified hai. Total amount ₹{fallback_tot:,.0f} hai aur estimated gap ₹{fallback_gap:,.0f} hai. FlowPass se aap direct payment ya funding explore kar sakte hain bina kisi re-entry ke."

    return {"case_id": case_id, "response": reply}


@router.post("/{case_id}/escalate")
async def escalate_case(case_id: str, reason: str = "User requested expert review", db: AsyncSession = Depends(get_db)):
    """Flag case for human ombudsman review."""
    if case_id in cases_store:
        cases_store[case_id]["status"] = "escalated"
    if case_id in case_states:
        case_states[case_id]["journey_state"] = "escalated"

    try:
        stmt = select(Case).where(Case.case_id == case_id)
        res = await db.execute(stmt)
        c = res.scalar_one_or_none()
        if c:
            c.status = "escalated"

        db_audit = AuditLog(
            case_id=case_id,
            actor="user",
            action="case_escalated",
            metadata_json={"reason": reason}
        )
        db.add(db_audit)
        await db.commit()
    except Exception:
        await db.rollback()

    return {"case_id": case_id, "status": "escalated", "reason": reason}


@router.delete("/{case_id}")
async def delete_case(case_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an emergency case from memory and database under DPDP right to erasure."""
    if case_id in cases_store:
        del cases_store[case_id]
    if case_id in case_states:
        del case_states[case_id]

    try:
        from sqlalchemy import delete
        from models.document import Document
        from models.insurance_state import InsuranceState
        from models.financial_context import FinancialContext
        from models.audit_log import AuditLog
        from models.payment import Payment
        from models.case import Case

        await db.execute(delete(AuditLog).where(AuditLog.case_id == case_id))
        await db.execute(delete(Payment).where(Payment.case_id == case_id))
        await db.execute(delete(Document).where(Document.case_id == case_id))
        await db.execute(delete(InsuranceState).where(InsuranceState.case_id == case_id))
        await db.execute(delete(FinancialContext).where(FinancialContext.case_id == case_id))
        await db.execute(delete(Case).where(Case.case_id == case_id))
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"Error deleting case {case_id}: {e}")

    return {"status": "deleted", "case_id": case_id}
