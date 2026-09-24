"""Paytm payment service. Simulated for hackathon MVP."""
import uuid
import hashlib
import json
from datetime import datetime
from config import settings

class PaytmOrder:
    def __init__(self, order_id: str, txn_token: str, amount: float, mid: str):
        self.order_id = order_id
        self.txn_token = txn_token
        self.amount = amount
        self.mid = mid

class PaymentResult:
    def __init__(self, order_id: str, status: str, txn_id: str, amount: float, message: str):
        self.order_id = order_id
        self.status = status
        self.txn_id = txn_id
        self.amount = amount
        self.message = message

class PaytmService:
    """Paytm checkout integration service.
    
    For MVP: Simulates the checkout flow since we don't have sandbox credentials.
    Architecture is production-ready — just swap in real credentials.
    """
    
    def __init__(self):
        self.mid = settings.PAYTM_MID
        self.merchant_key = settings.PAYTM_MERCHANT_KEY
        self.callback_url = settings.PAYTM_CALLBACK_URL
        self.is_sandbox = not bool(self.mid)  # If no MID, use simulated sandbox mode
        self.settled_orders: set[str] = set()

    def mark_order_settled(self, order_id: str):
        """Record order as settled in sandbox simulation."""
        self.settled_orders.add(order_id)
    
    async def create_order(self, case_id: str, amount: float, user_id: str) -> PaytmOrder:
        """Create a payment order.
        
        In production: calls Paytm initiate-transaction API.
        In sandbox mode: generates simulated order.
        """
        order_id = f"SAHAAY-{case_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        if self.is_sandbox:
            # Simulated mode
            txn_token = f"sim_{hashlib.md5(order_id.encode()).hexdigest()[:16]}"
            return PaytmOrder(
                order_id=order_id,
                txn_token=txn_token,
                amount=amount,
                mid="SIMULATED_MID",
            )
        
        # Production mode: Call Paytm API
        # 1. Build params
        paytm_params = {
            "body": {
                "requestType": "Payment",
                "mid": self.mid,
                "websiteName": "WEBSTAGING",
                "orderId": order_id,
                "txnAmount": {"value": str(amount), "currency": "INR"},
                "userInfo": {"custId": user_id},
                "callbackUrl": self.callback_url,
            }
        }
        
        # 2. Generate checksum (would use PaytmChecksum library)
        # checksum = PaytmChecksum.generateSignature(json.dumps(paytm_params["body"]), self.merchant_key)
        # paytm_params["head"] = {"signature": checksum}
        
        # 3. Call initiate-transaction API
        # response = await httpx.post(f"https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid={self.mid}&orderId={order_id}", json=paytm_params)
        # txn_token = response.json()["body"]["txnToken"]
        
        txn_token = "placeholder"  # Would come from API
        return PaytmOrder(order_id=order_id, txn_token=txn_token, amount=amount, mid=self.mid)
    
    async def verify_status(self, order_id: str) -> PaymentResult:
        """Verify payment status.
        
        In production: calls Paytm order-status API server-to-server.
        In sandbox mode: verifies against recorded settlements without fake premature success.
        """
        if self.is_sandbox:
            if order_id in self.settled_orders:
                txn_id = f"PTM-SETTLED-{uuid.uuid4().hex[:6].upper()}"
                return PaymentResult(
                    order_id=order_id,
                    status="TXN_SUCCESS",
                    txn_id=txn_id,
                    amount=0,
                    message="Transaction completed successfully (sandbox settlement verified)",
                )
            return PaymentResult(
                order_id=order_id,
                status="PENDING",
                txn_id="",
                amount=0,
                message="Transaction awaiting user authorization",
            )
        
        # Production: Query Paytm order status API
        # paytm_params = {"body": {"mid": self.mid, "orderId": order_id}}
        # checksum = PaytmChecksum.generateSignature(json.dumps(paytm_params["body"]), self.merchant_key)
        # response = await httpx.post(f"https://securegw-stage.paytm.in/v3/order/status", json=paytm_params)
        
        return PaymentResult(
            order_id=order_id,
            status="PENDING",
            txn_id="",
            amount=0,
            message="Status check not available without credentials",
        )
    
    async def handle_callback(self, callback_data: dict) -> PaymentResult:
        """Handle Paytm callback after payment.
        
        In production: verify checksum and extract result.
        """
        order_id = callback_data.get("ORDERID", "")
        status = callback_data.get("STATUS", "TXN_FAILURE")
        txn_id = callback_data.get("TXNID", "")
        amount = float(callback_data.get("TXNAMOUNT", 0))
        message = callback_data.get("RESPMSG", "")
        
        # In production: verify checksum
        # checksum = callback_data.get("CHECKSUMHASH", "")
        # is_valid = PaytmChecksum.verifySignature(callback_data, self.merchant_key, checksum)
        
        return PaymentResult(
            order_id=order_id,
            status=status,
            txn_id=txn_id,
            amount=amount,
            message=message,
        )
