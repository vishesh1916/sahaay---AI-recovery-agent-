import { CaseData, FlowPass, GapCalculation, PaymentRecord, RecoveryScenario, User } from './types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://sahaay-backend-h4dw.onrender.com'
    : 'http://localhost:8000');

class SahaayApiClient {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  // --- USER & AUTH API ---

  async registerUser(email: string, password: string, name: string, phone?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name, phone }),
    });
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
    return await res.json();
  }

  async loginUser(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return await res.json();
  }

  async paytmAuth(phone: string, name?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/auth/paytm`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ phone, name: name || 'Paytm Member' }),
    });
    if (!res.ok) throw new Error(`Paytm auth failed: ${res.status}`);
    return await res.json();
  }

  async googleAuth(email: string, name: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/auth/google`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) throw new Error(`Google auth failed: ${res.status}`);
    return await res.json();
  }

  async getUserDashboard(userId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/dashboard`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend getUserDashboard error, falling back:', e);
      return {
        status: 'fallback',
        user: { user_id: userId, name: 'Sahaay Member' },
        active_case: null,
        cases: [],
        total_cases_count: 0,
        total_savings_protected: 0,
        available_credit: 50000.0,
      };
    }
  }

  async createUser(
    name: string,
    language = 'hinglish',
    consents: { consent_health?: boolean; consent_financial?: boolean; consent_payment?: boolean } = {}
  ): Promise<User> {
    const res = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        language,
        consent_health: consents.consent_health ?? true,
        consent_financial: consents.consent_financial ?? true,
        consent_payment: consents.consent_payment ?? true,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async getUser(userId: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async getUserCases(userId: string): Promise<CaseData[]> {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/cases`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend getUserCases unavailable:', e);
      return [];
    }
  }

  async updateUserConsent(
    userId: string,
    consents: { consent_health?: boolean; consent_financial?: boolean; consent_payment?: boolean }
  ): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${userId}/consent`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(consents),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async deleteUserData(userId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${userId}/data`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  // --- CASE API ---

  async createCase(
    userInput: string,
    emergencyType = 'medical',
    totalAmount?: number,
    language = 'hinglish',
    userId?: string,
    financials?: any
  ): Promise<CaseData> {
    const res = await fetch(`${API_BASE}/cases/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        user_input: userInput,
        emergency_type: emergencyType,
        total_amount: totalAmount,
        language,
        user_id: userId,
        financials,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to create case (${res.status}): ${errText}`);
    }
    return await res.json();
  }

  async getCase(caseId: string): Promise<CaseData> {
    const res = await fetch(`${API_BASE}/cases/${caseId}`);
    if (!res.ok) {
      throw new Error(`Case '${caseId}' not found or unreachable (${res.status})`);
    }
    const data = await res.json();
    return data;
  }

  async deleteCase(caseId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to delete case', e);
      return false;
    }
  }

  async uploadDocument(caseId: string, file: File, docType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    const res = await fetch(`${API_BASE}/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to upload document (${res.status}): ${errText}`);
    }
    return await res.json();
  }

  async analyzeCase(caseId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/analyze`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to analyze case (${res.status}): ${errText}`);
    }
    return await res.json();
  }

  async escalateCase(caseId: string, reason = 'User requested independent ombudsman review'): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/escalate?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async getEvidence(caseId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async getFinancialContext(caseId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/financial-context`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async simulateRecovery(caseId: string, gapAmount: number): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/simulate-recovery`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ gap_amount: gapAmount }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  async prepareFunding(caseId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/prepare-funding`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  }

  // --- PAYMENT API ---

  async createPayment(caseId: string, amount: number, userId?: string): Promise<PaymentRecord> {
    const resolvedUserId = userId || (typeof window !== 'undefined' ? localStorage.getItem('sahaay_user_id') || 'user-default' : 'user-default');
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        case_id: caseId,
        amount,
        user_id: resolvedUserId,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Failed to create payment order (${res.status}): ${errText}`);
    }
    return await res.json();
  }

  async getCaseTimeline(caseId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.timeline || [];
    } catch (e) {
      console.warn('Failed to load timeline from backend', e);
      return [];
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE}/payments/${orderId}/status`);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Payment verification failed (${res.status}): ${errText}`);
    }
    return await res.json();
  }

  async simulatePaymentSuccess(orderId: string): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE}/payments/${orderId}/simulate-success`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Payment settlement failed (${res.status}): ${errText}`);
    }
    return await res.json();
  }

  // --- ASSISTANT CHAT API ---

  async chatWithSahaay(caseId: string, query: string, language = 'hinglish'): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query, language }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.response;
    } catch (e) {
      return "Sahaay: Case verified. FlowPass carries your context forward without restarting.";
    }
  }
}

export const api = new SahaayApiClient();
export const apiClient = api;
