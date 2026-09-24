"""Payment API routes — Paytm checkout integration with DB persistence and audit trail."""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from database import get_db
from models.payment import Payment as PaymentModel
from models.case import Case as CaseModel
from models.audit_log import AuditLog
from models.user import User as UserModel
from services.paytm_service import PaytmService

router = APIRouter()
paytm_service = PaytmService()
payments_store: dict[str, dict] = {}

class PaymentCreateRequest(BaseModel):
    case_id: str
    amount: float
    user_id: str = "user-default"

@router.post("/create")
async def create_payment(request: PaymentCreateRequest, db: AsyncSession = Depends(get_db)):
    """Create a payment order after verifying DPDP payment consent."""
    # DPDP Consent Validation
    if request.user_id and request.user_id != "user-default":
        stmt_user = select(UserModel).where(UserModel.user_id == request.user_id)
        res_user = await db.execute(stmt_user)
        user = res_user.scalar_one_or_none()
        if user and not user.consent_payment:
            raise HTTPException(
                status_code=403,
                detail="Payment processing blocked: Payment consent has been revoked under DPDP preferences."
            )

    order = await paytm_service.create_order(
        case_id=request.case_id,
        amount=request.amount,
        user_id=request.user_id,
    )

    txn_id = str(uuid.uuid4())
    payment = {
        "transaction_id": txn_id,
        "case_id": request.case_id,
        "provider": "paytm",
        "amount": request.amount,
        "status": "pending",
        "paytm_order_id": order.order_id,
        "paytm_txn_token": order.txn_token,
        "mid": order.mid,
        "created_at": datetime.now().isoformat(),
    }
    payments_store[order.order_id] = payment

    try:
        db_payment = PaymentModel(
            transaction_id=txn_id,
            case_id=request.case_id,
            provider="paytm",
            amount=request.amount,
            status="pending",
            paytm_order_id=order.order_id,
            paytm_txn_token=order.txn_token,
        )
        db.add(db_payment)

        # Audit log for payment initiation
        db_audit = AuditLog(
            case_id=request.case_id,
            actor="user",
            action="payment_initiated",
            metadata_json={
                "order_id": order.order_id,
                "amount": request.amount,
                "provider": "paytm",
                "timestamp": datetime.now().isoformat(),
            }
        )
        db.add(db_audit)
        await db.commit()
    except Exception as e:
        await db.rollback()

    return payment

@router.get("/{order_id}/status")
async def get_payment_status(order_id: str, db: AsyncSession = Depends(get_db)):
    """Check payment status deterministically. Never returns fake success for missing orders."""
    payment = payments_store.get(order_id)
    if not payment:
        try:
            stmt = select(PaymentModel).where(PaymentModel.paytm_order_id == order_id)
            result = await db.execute(stmt)
            p = result.scalar_one_or_none()
            if p:
                payment = {
                    "transaction_id": p.transaction_id,
                    "case_id": p.case_id,
                    "provider": p.provider,
                    "amount": p.amount,
                    "status": p.status,
                    "paytm_order_id": p.paytm_order_id,
                    "paytm_txn_token": p.paytm_txn_token,
                    "txn_id": p.txn_id,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
                payments_store[order_id] = payment
        except Exception:
            pass

    if not payment:
        # Rule 49: NO FAKE SUCCESS - Return 404 for unknown orders
        raise HTTPException(
            status_code=404,
            detail=f"Payment order '{order_id}' not found. Please initiate checkout first."
        )

    # If already verified as success, return immediately
    if payment.get("status") == "success":
        return payment

    # Verify status with Paytm provider service
    result = await paytm_service.verify_status(order_id)
    if result.status == "TXN_SUCCESS":
        payment["status"] = "success"
        payment["txn_id"] = result.txn_id or f"PTM-{uuid.uuid4().hex[:6].upper()}"

        # Sync DB state
        try:
            stmt = select(PaymentModel).where(PaymentModel.paytm_order_id == order_id)
            db_res = await db.execute(stmt)
            p = db_res.scalar_one_or_none()
            if p:
                p.status = "success"
                p.txn_id = payment["txn_id"]

            case_stmt = select(CaseModel).where(CaseModel.case_id == payment["case_id"])
            case_res = await db.execute(case_stmt)
            c = case_res.scalar_one_or_none()
            if c:
                c.status = "payment_success"

            # Audit log
            db_audit = AuditLog(
                case_id=payment["case_id"],
                actor="paytm_provider",
                action="payment_verified",
                metadata_json={
                    "order_id": order_id,
                    "txn_id": payment["txn_id"],
                    "amount": payment["amount"],
                    "status": "success",
                }
            )
            db.add(db_audit)
            await db.commit()
        except Exception:
            await db.rollback()
    elif result.status == "TXN_FAILURE":
        payment["status"] = "failed"
    else:
        payment["status"] = "pending"

    return payment

@router.post("/callback")
async def payment_callback(data: dict, db: AsyncSession = Depends(get_db)):
    """Handle Paytm webhook callback after payment."""
    result = await paytm_service.handle_callback(data)
    order_id = result.order_id
    payment = payments_store.get(order_id)

    if not payment:
        stmt = select(PaymentModel).where(PaymentModel.paytm_order_id == order_id)
        res = await db.execute(stmt)
        p = res.scalar_one_or_none()
        if p:
            payment = {
                "transaction_id": p.transaction_id,
                "case_id": p.case_id,
                "provider": p.provider,
                "amount": p.amount,
                "status": p.status,
                "paytm_order_id": p.paytm_order_id,
            }
            payments_store[order_id] = payment

    if payment:
        new_status = "success" if result.status == "TXN_SUCCESS" else "failed"
        payment["status"] = new_status
        payment["txn_id"] = result.txn_id or f"PTM-{uuid.uuid4().hex[:6].upper()}"

        try:
            stmt = select(PaymentModel).where(PaymentModel.paytm_order_id == order_id)
            res = await db.execute(stmt)
            p = res.scalar_one_or_none()
            if p:
                p.status = new_status
                p.txn_id = payment["txn_id"]

            if new_status == "success":
                case_stmt = select(CaseModel).where(CaseModel.case_id == payment["case_id"])
                case_res = await db.execute(case_stmt)
                c = case_res.scalar_one_or_none()
                if c:
                    c.status = "payment_success"

                db_audit = AuditLog(
                    case_id=payment["case_id"],
                    actor="paytm_webhook",
                    action="payment_verified",
                    metadata_json={
                        "order_id": order_id,
                        "txn_id": payment["txn_id"],
                        "amount": payment["amount"],
                        "status": "success",
                    }
                )
                db.add(db_audit)
            await db.commit()
        except Exception:
            await db.rollback()

    return {"status": result.status, "order_id": order_id}

@router.post("/{order_id}/simulate-success")
async def simulate_payment_success(order_id: str, db: AsyncSession = Depends(get_db)):
    """Simulate a verified payment settlement in sandbox testing."""
    payment = payments_store.get(order_id)
    if not payment:
        stmt = select(PaymentModel).where(PaymentModel.paytm_order_id == order_id)
        result = await db.execute(stmt)
        p = result.scalar_one_or_none()
        if p:
            payment = {
                "transaction_id": p.transaction_id,
                "case_id": p.case_id,
                "provider": p.provider,
                "amount": p.amount,
                "status": p.status,
                "paytm_order_id": p.paytm_order_id,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            payments_store[order_id] = payment
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Payment order '{order_id}' not found. Cannot simulate success on a non-existent order."
            )

    paytm_service.mark_order_settled(order_id)
    payment["status"] = "success"
    payment["txn_id"] = f"PTM-SETTLED-{uuid.uuid4().hex[:6].upper()}"

    try:
        stmt = select(PaymentModel).where(PaymentModel.paytm_order_id == order_id)
        result = await db.execute(stmt)
        p = result.scalar_one_or_none()
        if p:
            p.status = "success"
            p.txn_id = payment["txn_id"]

        # Also update Case status
        case_id = payment["case_id"]
        from routes.cases import cases_store
        if case_id in cases_store:
            cases_store[case_id]["status"] = "payment_success"

        case_stmt = select(CaseModel).where(CaseModel.case_id == case_id)
        case_res = await db.execute(case_stmt)
        c = case_res.scalar_one_or_none()
        if c:
            c.status = "payment_success"

        # Record AuditLog
        db_audit = AuditLog(
            case_id=case_id,
            actor="paytm_provider",
            action="payment_verified",
            metadata_json={
                "order_id": order_id,
                "txn_id": payment["txn_id"],
                "amount": payment["amount"],
                "status": "success",
                "mode": "sandbox_simulation",
            }
        )
        db.add(db_audit)
        await db.commit()
    except Exception as e:
        await db.rollback()

    return payment
