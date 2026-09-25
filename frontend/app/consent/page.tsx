'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  FileText,
  BarChart3,
  CreditCard,
  ArrowRight,
  Lock,
  Eye,
  Trash2,
  User,
  Loader2,
  CheckCircle2,
  Smartphone,
  Mail,
  KeyRound,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ConsentToggle } from '@/components/common/ConsentToggle';
import { api } from '@/lib/api';

export default function SahaayAuthScreen() {
  const router = useRouter();

  // Active Auth Tab: 'paytm' | 'google' | 'email'
  const [authMethod, setAuthMethod] = useState<'paytm' | 'google' | 'email'>('paytm');

  // Google OAuth inputs & client config
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [showManualGoogle, setShowManualGoogle] = useState(false);
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '678996638926-8rt9reo8rir38qusndihsrrf2fdf1ev7.apps.googleusercontent.com';

  // Paytm SSO inputs
  const [paytmPhone, setPaytmPhone] = useState('9876543210');
  const [paytmName, setPaytmName] = useState('Aarav Sharma');
  const [paytmOtp, setPaytmOtp] = useState('123456');

  // Email inputs
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Granular DPDP Consents
  const [healthConsent, setHealthConsent] = useState(true);
  const [finConsent, setFinConsent] = useState(true);
  const [payConsent, setPayConsent] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const saveSessionAndProceed = (userData: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahaay_user_id', userData.user_id);
      localStorage.setItem('sahaay_user_name', userData.name);
      localStorage.setItem('sahaay_auth_provider', userData.auth_provider || 'paytm');
      if (userData.paytm_upi_id) localStorage.setItem('sahaay_paytm_upi', userData.paytm_upi_id);
      if (userData.paytm_credit_limit) localStorage.setItem('sahaay_paytm_credit', String(userData.paytm_credit_limit));
      if (userData.phone) localStorage.setItem('sahaay_user_phone', userData.phone);
      if (userData.email) localStorage.setItem('sahaay_user_email', userData.email);
      localStorage.setItem('sahaay_consent_health', String(healthConsent));
      localStorage.setItem('sahaay_consent_fin', String(finConsent));
      localStorage.setItem('sahaay_consent_pay', String(payConsent));
    }
    router.push('/home');
  };

  const handlePaytmSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.paytmAuth(paytmPhone, paytmName);
      saveSessionAndProceed(res);
    } catch (err: any) {
      console.error('Paytm auth failed, using direct session:', err);
      // Fallback local session if backend offline
      const fallbackUser = {
        user_id: 'ptm_' + paytmPhone.slice(-4),
        name: paytmName || 'Paytm User',
        phone: paytmPhone,
        auth_provider: 'paytm',
        paytm_upi_id: `${paytmPhone}@paytm`,
        paytm_credit_limit: 50000.0,
      };
      saveSessionAndProceed(fallbackUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    const setupGoogle = () => {
      try {
        if (typeof window === 'undefined' || !(window as any).google?.accounts) return;

        // 1. Initialize Google Identity Services (One-Tap / ID Token)
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response?.credential) {
              try {
                setIsSubmitting(true);
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                const userEmail = payload.email || 'user.google@gmail.com';
                const userName = payload.name || 'Google User';
                const res = await api.googleAuth(userEmail, userName);
                saveSessionAndProceed(res);
              } catch (e: any) {
                setAuthError('Google sign-in error: ' + (e?.message || 'Authentication failed'));
              } finally {
                setIsSubmitting(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // 2. Initialize OAuth 2.0 Token Client for standard Google account popup picker
        if ((window as any).google.accounts.oauth2) {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse?.error) {
                console.warn('Google OAuth token error:', tokenResponse);
                setAuthError('Google sign-in cancelled or rejected (' + tokenResponse.error + ').');
                setIsSubmitting(false);
                return;
              }
              if (tokenResponse?.access_token) {
                try {
                  setIsSubmitting(true);
                  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  });
                  const userInfo = await userInfoRes.json();
                  const email = userInfo.email || 'user.google@gmail.com';
                  const name = userInfo.name || 'Google User';
                  const res = await api.googleAuth(email, name);
                  saveSessionAndProceed(res);
                } catch (err: any) {
                  console.error('Failed to fetch Google profile info:', err);
                  setAuthError('Failed to fetch Google profile. Please try direct email sign-in.');
                  setShowManualGoogle(true);
                } finally {
                  setIsSubmitting(false);
                }
              }
            },
          });
          setTokenClient(client);
        }

        // 3. Render official button into container if container exists
        const container = document.getElementById('google-btn-container');
        if (container && (window as any).google?.accounts?.id) {
          container.innerHTML = '';
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        console.warn('Google GSI init warning:', err);
      }
    };

    if ((window as any).google?.accounts) {
      const timer = setTimeout(setupGoogle, 50);
      return () => clearTimeout(timer);
    } else {
      let script = document.getElementById('google-gsi-client') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
      const onLoad = () => {
        setTimeout(setupGoogle, 50);
      };
      script.addEventListener('load', onLoad);
      return () => {
        script.removeEventListener('load', onLoad);
      };
    }
  }, [googleClientId, authMethod]);

  const proceedWithGoogleEmail = async (emailToUse: string, nameToUse: string) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.googleAuth(emailToUse, nameToUse);
      saveSessionAndProceed(res);
    } catch (err: any) {
      console.error('Google backend auth error, fallback session:', err);
      const fallbackUser = {
        user_id: 'goog_' + Math.random().toString(36).substring(2, 8),
        name: nameToUse,
        email: emailToUse,
        auth_provider: 'google',
        paytm_credit_limit: 50000.0,
      };
      saveSessionAndProceed(fallbackUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setAuthError(null);

    // 1. Try Token Client popup account selector
    if (tokenClient) {
      try {
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('tokenClient.requestAccessToken failed:', e);
      }
    }

    // 2. Try Google One-Tap Prompt
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.warn('Google prompt not displayed/skipped:', notification);
            setIsSubmitting(false);
            setShowManualGoogle(true);
          }
        });
        return;
      } catch (e) {
        console.warn('google.accounts.id.prompt error:', e);
      }
    }

    // 3. Direct sign in fallback
    const emailToUse = googleEmail.trim() || 'user.google@gmail.com';
    const nameToUse = googleName.trim() || (emailToUse.split('@')[0] + ' (Google)');
    await proceedWithGoogleEmail(emailToUse, nameToUse);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);
    try {
      if (isRegistering) {
        const res = await api.registerUser(email, password, fullName || email.split('@')[0]);
        saveSessionAndProceed(res);
      } else {
        const res = await api.loginUser(email, password);
        saveSessionAndProceed(res);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#9BB0D8] text-[#0D1C34] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#D9FF32] selection:text-[#0D1C34]">
      <div className="mx-auto max-w-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative h-10 w-44 mb-4">
            <Image
              src="/images/sahaay_logo_white.png"
              alt="Sahaay AI"
              fill
              priority
              className="object-contain"
            />
          </Link>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-normal text-white tracking-tight">
            Sign In &amp; Restore Your Context
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/85 max-w-md mx-auto">
            Log in to automatically extract verified KYC, connect zero-friction Paytm settlement, and resume your active emergency case.
          </p>
        </div>

        {/* Main Auth Container Card */}
        <div className="rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-white/80">
          
          {/* Method Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMethod('paytm'); setAuthError(null); }}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'paytm'
                  ? 'bg-[#002E6E] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#002E6E]'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-[#00BAF2]" />
              <span>Paytm SSO</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('google'); setAuthError(null); }}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'google'
                  ? 'bg-[#0D1C34] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0D1C34]'
              }`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setAuthError(null); }}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-[#2464A4] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#2464A4]'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email</span>
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {authError}
            </div>
          )}

          {/* TAB 1: PAYTM SSO */}
          {authMethod === 'paytm' && (
            <form onSubmit={handlePaytmSignIn} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#002E6E]/5 border border-[#002E6E]/15">
                <div className="flex items-center gap-2 text-xs font-bold text-[#002E6E] mb-1">
                  <Zap className="h-4 w-4 text-[#00BAF2]" />
                  <span>Paytm Auto-Extraction Protocol</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Signing in with Paytm automatically binds your verified KYC, linked UPI ID, and unlocks a pre-approved ₹50,000 FlowPass bridge credit line without manual form entry.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Paytm Registered Mobile Number
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#002E6E] focus-within:bg-white transition-all">
                  <span className="text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    value={paytmPhone}
                    onChange={(e) => setPaytmPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="bg-transparent text-sm font-semibold text-[#0D1C34] focus:outline-none w-full font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Account Holder / Patient Name
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#002E6E] focus-within:bg-white transition-all">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={paytmName}
                    onChange={(e) => setPaytmName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="bg-transparent text-sm font-semibold text-[#0D1C34] focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !healthConsent}
                  className="w-full py-3.5 px-6 rounded-full bg-[#002E6E] hover:bg-[#001D47] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#00BAF2]" />
                      <span>Extracting KYC &amp; Paytm UPI...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In with Paytm</span>
                      <ArrowRight className="h-4 w-4 text-[#00BAF2]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: GOOGLE OAUTH */}
          {authMethod === 'google' && (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0D1C34]">
                    <Shield className="h-4 w-4 text-[#2464A4]" />
                    <span>Google Identity Assertion</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    OAuth 2.0 Linked
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Authorize with your Google account to automatically secure your case documents and access historical claims across devices.
                </p>
              </div>

              {/* Primary Google Auth Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || !healthConsent}
                  className="w-full py-3.5 px-6 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-[#0D1C34] font-bold text-xs sm:text-sm tracking-wide shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#2464A4]" />
                      <span>Connecting Google Profile...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </button>

                {/* Optional GSI Embedded iframe container */}
                <div id="google-btn-container" className="flex items-center justify-center w-full min-h-[0px]" />

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Google Identity Services 2.0 (Official Account Picker)</span>
                </div>
              </div>

              {/* Toggle for manual email entry */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualGoogle(!showManualGoogle)}
                  className="text-[11px] text-[#2464A4] hover:underline font-semibold cursor-pointer"
                >
                  {showManualGoogle ? 'Hide direct email entry' : 'Or enter Google email directly'}
                </button>

                {showManualGoogle && (
                  <div className="mt-3 space-y-3 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Google Account Email
                      </label>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#2464A4] transition-all">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={googleEmail}
                          onChange={(e) => setGoogleEmail(e.target.value)}
                          placeholder="e.g. rahul.sharma@gmail.com"
                          className="bg-transparent text-xs font-semibold text-[#0D1C34] focus:outline-none w-full placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Display Name (Optional)
                      </label>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#2464A4] transition-all">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={googleName}
                          onChange={(e) => setGoogleName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="bg-transparent text-xs font-semibold text-[#0D1C34] focus:outline-none w-full placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => proceedWithGoogleEmail(googleEmail || 'user.google@gmail.com', googleName || 'Google User')}
                      disabled={isSubmitting || !healthConsent}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#0D1C34] hover:bg-[#1a2d4f] text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>Proceed with this Google Account</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#00BAF2]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL + PASSWORD */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2464A4] focus-within:bg-white transition-all">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vishesh Sachan"
                      className="bg-transparent text-sm font-semibold text-[#0D1C34] focus:outline-none w-full"
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2464A4] focus-within:bg-white transition-all">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-transparent text-sm font-semibold text-[#0D1C34] focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2464A4] focus-within:bg-white transition-all">
                  <KeyRound className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-transparent text-sm font-semibold text-[#0D1C34] focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-[#2464A4] font-bold hover:underline"
                >
                  {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !healthConsent}
                  className="w-full py-3.5 px-6 rounded-full bg-[#2464A4] hover:bg-[#1a4a7a] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{isRegistering ? 'Create Account & Proceed' : 'Sign In with Email'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Granular DPDP Consent Checkboxes */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2464A4] mb-3">
              DPDP Compliance &amp; Permissioned Scopes
            </span>
            <div className="space-y-3">
              <ConsentToggle
                id="health-consent"
                title="1. Emergency & Medical Records"
                description="Allows deterministic analysis of policy documents, hospital invoices & repair estimates."
                icon={<FileText className="h-4 w-4" />}
                checked={healthConsent}
                onChange={setHealthConsent}
                required
              />

              <ConsentToggle
                id="fin-consent"
                title="2. FlowPass Financial Profile"
                description="Permission to derive monthly inflow & buffer via Account Aggregator. Raw data purged."
                icon={<BarChart3 className="h-4 w-4" />}
                checked={finConsent}
                onChange={setFinConsent}
                required
              />

              <ConsentToggle
                id="pay-consent"
                title="3. Paytm Direct Gap Settlement"
                description="Authorizes seamless transmission of audited deficit to Paytm Soundbox & UPI checkout."
                icon={<CreditCard className="h-4 w-4" />}
                checked={payConsent}
                onChange={setPayConsent}
              />
            </div>
          </div>

          {/* Cryptographic Privacy Guarantee */}
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D1C34] mb-2">
              <Shield className="h-4 w-4 text-[#2464A4]" />
              <span>Right to Erasure &amp; DPDP Safeguard</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your data is bound to your persistent account for uninterrupted emergency handling. You may exercise full Right to Erasure anytime with one tap.
            </p>
          </div>

        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-bold text-white/90 hover:text-white transition-colors">
            ← Back to Sahaay Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
