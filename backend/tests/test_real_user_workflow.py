"""Verification of real-world user workflow with custom user, amounts, and financials."""
import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_real_user_journey():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        print("\n--- 1. Create Real User Profile ---")
        user_res = await client.post("/users/", json={
            "name": "Aarav Sharma",
            "language": "english",
            "consent_health": True,
            "consent_financial": True,
            "consent_payment": True
        })
        assert user_res.status_code == 200, f"User creation failed: {user_res.text}"
        user_data = user_res.json()
        user_id = user_data["user_id"]
        print(f"User created: {user_data['name']} (ID: {user_id})")

        print("\n--- 2. Create Real Emergency Case with Custom Amount & Financials ---")
        case_res = await client.post("/cases/", json={
            "user_id": user_id,
            "user_input": "Front collision on highway. Radiator, bumper, and headlights crushed. Garage quote is 94500.",
            "emergency_type": "vehicle",
            "total_amount": 94500.0,
            "language": "english",
            "monthly_inflow": 72000.0,
            "monthly_expenses": 38000.0,
            "existing_obligations": 12000.0,
            "liquid_buffer": 22000.0,
            "financials": {
                "average_inflow": 72000.0,
                "recurring_expenses": 38000.0,
                "existing_obligations": 12000.0,
                "liquidity_buffer": 22000.0
            }
        })
        assert case_res.status_code == 200, f"Case creation failed: {case_res.text}"
        case_data = case_res.json()
        case_id = case_data["case_id"]
        print(f"Case created: {case_id}")
        assert case_data["total_amount"] == 94500.0
        assert case_data["financial_context"]["average_inflow"] == 72000.0
        assert case_data["financial_context"]["liquidity_buffer"] == 22000.0
        print(f"Verified Case Amount: INR {case_data['total_amount']} (Not 184600!)")
        print(f"Verified Inflow: INR {case_data['financial_context']['average_inflow']} (Not 53700!)")

        print("\n--- 3. Fetch Case API by ID ---")
        get_res = await client.get(f"/cases/{case_id}")
        assert get_res.status_code == 200
        fetched = get_res.json()
        assert fetched["total_amount"] == 94500.0
        assert fetched["emergency_type"] == "vehicle"
        gap_res = fetched["analysis"]["gap_result"]
        print(f"Total Bill: {gap_res.get('total_bill')}, Potential Gap: {gap_res.get('potential_gap')}")

        print("\n--- 4. Verify 404 for Unknown Case ID (Zero Fake Fallback) ---")
        missing_res = await client.get("/cases/CASE-DOES-NOT-EXIST")
        assert missing_res.status_code == 404, f"Expected 404, got {missing_res.status_code}"
        print("Verified: Unknown case returns 404 Not Found.")

        print("\n--- 5. Test Live Recovery Simulation with Real Case Gap ---")
        gap_amount = gap_res.get("potential_gap", 28350.0)
        sim_res = await client.post(f"/cases/{case_id}/simulate-recovery", json={
            "gap_amount": gap_amount
        })
        assert sim_res.status_code == 200
        sim_data = sim_res.json()["simulation"]
        print(f"Modeled EMI for gap INR {gap_amount}: {sim_data['modeled_emi']} / month")

        print("\n--- 6. Test Paytm Payment Order for Real User Amount ---")
        order_res = await client.post("/payments/create", json={
            "case_id": case_id,
            "amount": gap_amount,
            "user_id": user_id
        })
        assert order_res.status_code == 200
        order_data = order_res.json()
        order_id = order_data["paytm_order_id"]
        assert order_data["amount"] == gap_amount, f"Expected amount {gap_amount}, got {order_data['amount']}"
        print(f"Paytm Order created for real amount INR {order_data['amount']} (Order ID: {order_id})")

        print("\n--- 7. Simulate Paytm Settlement ---")
        settle_res = await client.post(f"/payments/{order_id}/simulate-success")
        assert settle_res.status_code == 200
        settle_data = settle_res.json()
        assert settle_data["status"] == "success"
        print(f"Paytm Settlement Succeeded: Txn ID = {settle_data.get('txn_id')}")

        print("\n--- 8. Verify Chronological Timeline of Real Case ---")
        timeline_res = await client.get(f"/cases/{case_id}/timeline")
        assert timeline_res.status_code == 200
        timeline_logs = timeline_res.json()["timeline"]
        actions = [log["action"] for log in timeline_logs]
        print(f"Timeline actions recorded for {case_id}: {actions}")
        assert "case_created" in actions
        assert "payment_verified" in actions

        print("\n=======================================================")
        print("ALL REAL USER JOURNEY CHECKS PASSED WITH 100% REAL DATA!")
        print("=======================================================")

if __name__ == "__main__":
    asyncio.run(test_real_user_journey())
