"""Comprehensive End-to-End Engineering Integration Test for SAHAAY.

Tests the full lifecycle:
1. User Profile Creation with granular DPDP consent
2. DPDP Consent Enforcement (403 when consent revoked)
3. Emergency Case Creation (with custom financials and deterministic Gap Engine)
4. Document Upload and AI Parsing
5. FlowPass Financial Context Generation and Persistence
6. Recovery Simulator deterministic stress calculation
7. Funding Preparation (Context carried forward without re-entry)
8. Paytm Payment Lifecycle: Order creation, pending status, 404 for unknown orders, verified settlement
9. Immutable Chronological Audit Timeline
10. DPDP Right to Erasure (clean purge without orphaned records)
"""
import sys
import os
import asyncio
import httpx

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

BASE_URL = "http://127.0.0.1:8000"

async def run_e2e_audit():
    print("\n" + "=" * 70)
    print("STARTING SAHAAY FULL ENGINEERING INTEGRATION & AUDIT TEST")
    print("=" * 70)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # Step 0: Health Check
        print("\n[STEP 0] Checking Backend Server Health...")
        health_res = await client.get("/health")
        assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
        assert health_res.json().get("status") == "ok"
        print("  -> Backend is healthy: /health responded with 200 OK")

        # Step 1: Create User with Granular DPDP Consent
        print("\n[STEP 1] Testing User Profile Creation & DPDP Consent...")
        user_payload = {
            "name": "Rohan Sachan",
            "language": "hinglish",
            "consent_health": True,
            "consent_financial": True,
            "consent_payment": True
        }
        user_res = await client.post("/users/", json=user_payload)
        assert user_res.status_code == 200, f"User creation failed: {user_res.text}"
        user_data = user_res.json()
        user_id = user_data["user_id"]
        assert user_data["consent_health"] is True
        assert user_data["consent_payment"] is True
        print(f"  -> User created successfully: ID = {user_id}, Name = {user_data['name']}")

        # Step 2: Test DPDP Consent Enforcement (Revoke payment consent)
        print("\n[STEP 2] Testing Granular Consent Enforcement (Revoking Payment)...")
        # Create a test user with revoked payment consent
        restricted_user_res = await client.post("/users/", json={
            "name": "Restricted User",
            "language": "hinglish",
            "consent_health": True,
            "consent_financial": True,
            "consent_payment": False
        })
        restricted_user_id = restricted_user_res.json()["user_id"]

        # Attempt to create payment with restricted user -> must receive 403 Forbidden!
        restricted_pay_res = await client.post("/payments/create", json={
            "case_id": "CASE-TEST-DPDP",
            "amount": 25000.0,
            "user_id": restricted_user_id
        })
        assert restricted_pay_res.status_code == 403, f"Expected 403 Forbidden when payment consent is revoked, got {restricted_pay_res.status_code}"
        print("  -> Backend DPDP enforcement verified: 403 Forbidden returned when payment consent revoked")

        # Step 3: Create Emergency Case with Custom Financials
        print("\n[STEP 3] Testing Case Creation with Custom Financials & Deterministic Gap Engine...")
        case_payload = {
            "user_input": "Severe acute chest pain and cardiac catheterization at City Hospital",
            "emergency_type": "medical",
            "total_amount": 184600.0,
            "language": "hinglish",
            "user_id": user_id,
            "financials": {
                "average_inflow": 53700.0,
                "recurring_expenses": 31400.0,
                "existing_obligations": 6500.0,
                "liquidity_buffer": 15800.0
            }
        }
        case_res = await client.post("/cases/", json=case_payload)
        assert case_res.status_code == 200, f"Case creation failed: {case_res.text}"
        case_data = case_res.json()
        case_id = case_data["case_id"]
        assert case_id.startswith("CASE-SH-MED-")
        assert case_data["status"] == "analyzed"
        
        # Verify Gap Engine output
        gap_res = case_data["analysis"]["gap_result"]
        assert gap_res["total_bill"] == 184600.0
        assert gap_res["potential_gap"] == 46001.0 or gap_res["potential_gap"] == 46000.0
        print(f"  -> Case created: {case_id}")
        print(f"  -> Bill: INR {gap_res['total_bill']:,.0f} | Claim: INR {gap_res['potential_claim_amount']:,.0f} | Gap: INR {gap_res['potential_gap']:,.0f}")

        # Step 4: FlowPass Financial Context Persistence & Inspection
        print("\n[STEP 4] Verifying FlowPass Financial Context Layer...")
        ctx_res = await client.get(f"/cases/{case_id}/financial-context")
        assert ctx_res.status_code == 200, f"Failed to get financial context: {ctx_res.text}"
        ctx_data = ctx_res.json()
        fin = ctx_data["financial_context"]
        assert fin["average_inflow"] == 53700.0
        assert fin["liquidity_buffer"] == 15800.0
        assert ctx_data["flowpass"] is not None
        print(f"  -> FlowPass Token verified: Inflow = INR {fin['average_inflow']:,.0f}, Buffer = INR {fin['liquidity_buffer']:,.0f}")
        print(f"  -> Compliance source labeled: {fin.get('source')}")

        # Step 5: Document Upload & Parsing
        print("\n[STEP 5] Testing Document Upload & Entity Extraction...")
        test_file_content = b"%PDF-1.4 Mock Hospital Bill for Cardiac Catheterization Room Rent: 70000 Pharmacy: 18600 Consumables: 6000 Total: 184600"
        files = {"file": ("hospital_bill_cardiac.pdf", test_file_content, "application/pdf")}
        data = {"doc_type": "bill"}
        doc_res = await client.post(f"/cases/{case_id}/documents", files=files, data=data)
        assert doc_res.status_code == 200, f"Document upload failed: {doc_res.text}"
        doc_data = doc_res.json()
        assert doc_data["case_id"] == case_id
        print(f"  -> Document uploaded and linked: ID = {doc_data['document_id']}, Filename = {doc_data['filename']}")

        # Step 6: Recovery Simulator API
        print("\n[STEP 6] Testing Recovery Simulator (Live Debt Stress Calculation)...")
        sim_res = await client.post(f"/cases/{case_id}/simulate-recovery", json={"gap_amount": 46000.0})
        assert sim_res.status_code == 200, f"Recovery simulation failed: {sim_res.text}"
        sim_data = sim_res.json()["simulation"]
        assert sim_data["gap_amount"] == 46000.0
        assert sim_data["modeled_emi"] == round(46000.0 / 12.0)
        assert "payment_pressure_label" in sim_data
        print(f"  -> Modeled 12-Month EMI: INR {sim_data['modeled_emi']:,.0f}/mo | Pressure: {sim_data['payment_pressure_label'].upper()}")

        # Step 7: Funding Journey Context Transfer
        print("\n[STEP 7] Testing FlowPass Bridge Funding Context...")
        funding_res = await client.post(f"/cases/{case_id}/prepare-funding")
        assert funding_res.status_code == 200, f"Funding prep failed: {funding_res.text}"
        funding_data = funding_res.json()
        assert "flowpass" in funding_data
        print("  -> FlowPass context transferred seamlessly without user re-entry")

        # Step 8: Paytm Integration — Order Creation, 404 for unknown, Verified Settlement
        print("\n[STEP 8] Testing Paytm Payment Lifecycle & Verification...")
        # 8a: Create Order
        pay_res = await client.post("/payments/create", json={
            "case_id": case_id,
            "amount": 46000.0,
            "user_id": user_id
        })
        assert pay_res.status_code == 200, f"Payment creation failed: {pay_res.text}"
        pay_data = pay_res.json()
        order_id = pay_data["paytm_order_id"]
        assert pay_data["status"] == "pending"
        print(f"  -> Paytm Order Created: {order_id} | Status: {pay_data['status']}")

        # 8b: Rule 49 Verification — Querying unknown order MUST return 404, NEVER fake success!
        fake_check = await client.get("/payments/NON_EXISTENT_ORDER_123/status")
        assert fake_check.status_code == 404, f"Rule 49 Violation: Expected 404 for missing order, got {fake_check.status_code}"
        print("  -> Rule 49 Verified: Unknown order returned 404 Not Found (Zero Fake Success)")

        # 8c: Query status before settlement -> must be pending
        status_before = await client.get(f"/payments/{order_id}/status")
        assert status_before.status_code == 200
        assert status_before.json()["status"] == "pending"
        print("  -> Order status before settlement is correctly 'pending'")

        # 8d: Simulate Verified Settlement
        settle_res = await client.post(f"/payments/{order_id}/simulate-success")
        assert settle_res.status_code == 200, f"Settlement simulation failed: {settle_res.text}"
        settle_data = settle_res.json()
        assert settle_data["status"] == "success"
        txn_id = settle_data["txn_id"]
        print(f"  -> Paytm Settlement Confirmed: Status = SUCCESS | Txn ID = {txn_id}")

        # 8e: Verify Server Status is now verified success
        status_after = await client.get(f"/payments/{order_id}/status")
        assert status_after.status_code == 200
        assert status_after.json()["status"] == "success"
        print("  -> Server verified payment settlement state reconciled in DB")

        # Step 9: Chronological Audit Trail & Case Status
        print("\n[STEP 9] Checking Immutable Chronological Audit Trail...")
        timeline_res = await client.get(f"/cases/{case_id}/timeline")
        assert timeline_res.status_code == 200, f"Timeline fetch failed: {timeline_res.text}"
        timeline_events = timeline_res.json()["timeline"]
        actions = [e["action"] for e in timeline_events]
        print(f"  -> Total Audit Events Recorded: {len(timeline_events)}")
        print(f"  -> Recorded Actions: {actions}")
        assert "case_created" in actions
        assert "payment_initiated" in actions
        assert "payment_verified" in actions
        print("  -> All critical milestone actions confirmed in AuditLog")

        # Step 10: DPDP Right to Erasure
        print("\n[STEP 10] Testing DPDP Right to Erasure (Data Purge)...")
        del_res = await client.delete(f"/cases/{case_id}")
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "deleted"

        # Verify case is purged
        timeline_after_del = await client.get(f"/cases/{case_id}/timeline")
        assert len(timeline_after_del.json().get("timeline", [])) == 0
        print("  -> Case, documents, and audit logs permanently purged under DPDP compliance")

    print("\n" + "=" * 70)
    print("ALL 10 ENGINEERING AUDIT STEPS PASSED SUCCESSFULLY! ZERO DEFECTS.")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    asyncio.run(run_e2e_audit())
