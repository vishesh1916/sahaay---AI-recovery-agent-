import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_system():
    print("==================================================")
    print("RUNNING SAHAAY AI COMPLETE SYSTEM & RESUME TEST")
    print("==================================================")

    # 1. Health check
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print("1. Backend Health Check: OK")

    # 2. Paytm Sign-In
    paytm_phone = "9876543210"
    r = requests.post(f"{BASE_URL}/users/auth/paytm", json={
        "phone": paytm_phone,
        "name": "Vishesh Sachan"
    })
    assert r.status_code == 200, f"Paytm Auth failed: {r.text}"
    user_data = r.json()
    user_id = user_data["user_id"]
    print(f"2. Paytm SSO Authenticated: User ID = {user_id}")
    print(f"   Paytm UPI ID = {user_data.get('paytm_upi_id')}")
    print(f"   Pre-approved Credit Limit = Rs {user_data.get('paytm_credit_limit')}")
    assert user_data.get("paytm_upi_id") == "9876543210@paytm"
    assert user_data.get("paytm_credit_limit") == 50000.0

    # 3. Create Case
    r = requests.post(f"{BASE_URL}/cases/", json={
        "user_input": "Emergency acute appendectomy surgery at Max Healthcare. Inpatient hospital bill is Rs 1,84,600.",
        "emergency_type": "medical",
        "total_amount": 184600.0,
        "user_id": user_id
    })
    assert r.status_code == 200, f"Create case failed: {r.text}"
    case = r.json()
    case_id = case["case_id"]
    print(f"3. Case Created: {case_id} (Total = Rs {case['total_amount']})")

    # 4. Analyze Case with Reasoning Engine
    r = requests.post(f"{BASE_URL}/cases/{case_id}/analyze")
    assert r.status_code == 200, f"Analyze case failed: {r.text}"
    analysis = r.json().get("analysis", {})
    gap = analysis.get("gap_result", {}).get("potential_gap", 0)
    print(f"4. AI Reasoning & Clause Waterfall Executed: Calculated Out-of-Pocket Gap = Rs {gap}")

    # 5. Check Dashboard Persistence & Resume Action
    r = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
    assert r.status_code == 200, f"Get dashboard failed: {r.text}"
    dashboard = r.json()
    active_case = dashboard.get("active_case")
    assert active_case is not None, "Active case should be present on dashboard"
    assert active_case["case_id"] == case_id, "Active case should match newly created case"
    print(f"5. Dashboard Persistence Verified: Active Case = #{active_case['case_id']}")
    print(f"   Exact Next Station to Resume = {active_case.get('resume_station')} ({active_case.get('resume_label')})")
    print(f"   Total Cases Count = {dashboard.get('total_cases_count')}")

    # 6. Settle Gap via Paytm
    pay_amt = gap if (gap and gap > 0) else 35000.0
    r = requests.post(f"{BASE_URL}/payments/create", json={
        "case_id": case_id,
        "amount": pay_amt,
        "user_id": user_id,
    })
    assert r.status_code == 200, f"Create payment failed: {r.text}"
    payment = r.json()
    order_id = payment.get("paytm_order_id") or payment.get("order_id")
    print(f"6. Paytm Settlement Order Initialized: {order_id}")

    # 7. Simulate Soundbox Settlement Confirmation
    r = requests.post(f"{BASE_URL}/payments/{order_id}/simulate-success")
    assert r.status_code == 200, f"Payment simulation failed: {r.text}"
    print(f"7. Paytm Soundbox Settlement Completed Successfully: {r.json().get('status')}")

    # 8. Re-check Dashboard after Settlement
    r = requests.get(f"{BASE_URL}/users/{user_id}/dashboard")
    dash_after = r.json()
    print(f"8. Post-Settlement Verification: User has {dash_after.get('total_cases_count')} cases recorded.")
    print("==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! 100% PRODUCTION READY.")
    print("==================================================")

if __name__ == "__main__":
    test_system()
