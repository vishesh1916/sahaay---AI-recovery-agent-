'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'hinglish';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    nav_home: 'Home',
    nav_how_it_works: 'How It Works',
    nav_flowpass: 'FlowPass',
    nav_recovery: 'Recovery',
    nav_security: 'Security',
    nav_sign_in: 'Sign In',
    nav_start_cta: 'Start With Sahaay',
    lang_selector_label: 'Language',

    // Hero
    hero_eyebrow: 'AI FINANCIAL RECOVERY & JOURNEY AGENT',
    hero_headline_1: 'Financial emergencies',
    hero_headline_2: "shouldn't become",
    hero_headline_3: 'financial chaos.',
    hero_subtitle: 'When insurance, cash flow and out-of-pocket costs collide — Sahaay keeps your entire financial journey connected without starting over.',
    hero_start_btn: 'Start With Sahaay',
    hero_watch_btn: 'Watch How It Works',

    // Section 03
    s3_title: 'An emergency is a chain reaction.',
    s3_subtitle: 'Whether it is a medical crisis, a vehicle accident, or sudden income loss — one event triggers multiple disconnected financial problems. Sahaay connects them into a single, guided journey.',

    // Section 10 (Bill Audit)
    bill_badge: 'DETERMINISTIC BILL & EVIDENCE AUDIT',
    bill_title: 'Uncover deductions before the billing desk does.',
    bill_subtitle: 'Item-by-item parsing cross-referenced against your actual policy clauses. Zero guesswork.',
    bill_col_item: 'Bill Line Item',
    bill_col_amount: 'Amount',
    bill_col_category: 'Classification',
    bill_col_covered: 'Approved',
    bill_col_deduction: 'Out-of-Pocket Gap',

    // Section 14 (Recovery Simulator)
    rec_badge: 'INTERACTIVE RECOVERY SIMULATOR',
    rec_title: 'Explore your recovery options.',
    rec_desc: 'Understand the gap and model how different paths affect your financial context without depleting family emergency reserves.',
    rec_amt_label: 'Amount to Arrange',
    rec_modeled_gap: 'Modeled Gap',
    rec_mode_label: 'Select Recovery Mode',
    rec_opt_available: 'Use Available Funds',
    rec_opt_partial: 'Partial Funding',
    rec_opt_financing: 'Explore Financing',
    rec_opt_payment: 'Payment',
    rec_resilience_title: 'Simulated Financial Resilience',
    rec_buffer_label: 'Remaining Emergency Buffer',
    rec_obligations_label: 'Existing Obligations',
    rec_obligations_sub: 'Home loan EMI + standard utilities',
    rec_pressure_label: 'Modeled Payment Pressure',
    rec_review_btn: 'Review & Continue',

    // Section 15 (Paytm)
    pay_badge: 'Hospital Settlement Execution',
    pay_title: 'From plan to action.',
    pay_desc: "Sahaay doesn't stop at advice. Complete final settlement at the hospital billing desk without delay.",
    pay_required_label: 'Payment Required for Discharge',
    pay_btn: 'Continue with Paytm →',
    pay_sub: 'Instant UPI, NetBanking & FlowPass Pre-Approved Bridge',

    // Security
    sec_badge: 'SECURITY & FAIL-SAFE GUARANTEE',
    sec_title: 'Financial intelligence you can understand.',
    sec_desc: 'Four structural pillars engineered for absolute institutional integrity and zero black-box risk.',

    // Common
    common_active_case: 'Active Case In Progress',
    common_start_new: 'Start New Journey',
  },

  hi: {
    // Nav
    nav_home: 'होम',
    nav_how_it_works: 'यह कैसे काम करता है',
    nav_flowpass: 'फ्लोपास',
    nav_recovery: 'रिकवरी',
    nav_security: 'सुरक्षा',
    nav_sign_in: 'साइन इन',
    nav_start_cta: 'सहाय के साथ शुरू करें',
    lang_selector_label: 'भाषा',

    // Hero
    hero_eyebrow: 'एआई वित्तीय रिकवरी और यात्रा एजेंट',
    hero_headline_1: 'वित्तीय आपातकाल',
    hero_headline_2: 'को कभी न बनने दें',
    hero_headline_3: 'वित्तीय तबाही।',
    hero_subtitle: 'जब बीमा, कैश-फ्लो और जेब से होने वाले खर्च टकराते हैं — सहाय आपकी पूरी वित्तीय यात्रा को बिना दोबारा शुरू किए सुरक्षित जोड़े रखता है।',
    hero_start_btn: 'सहाय के साथ शुरू करें',
    hero_watch_btn: 'देखें यह कैसे काम करता है',

    // Section 03
    s3_title: 'एक आपातकाल एक श्रृंखला प्रतिक्रिया है।',
    s3_subtitle: 'चाहे मेडिकल संकट हो, वाहन दुर्घटना हो या अचानक आय की कमी — एक घटना कई वित्तीय समस्याओं को जन्म देती है। सहाय उन्हें एक सरल यात्रा में जोड़ता है।',

    // Section 10 (Bill Audit)
    bill_badge: 'सटीक बिल और साक्ष्य विश्लेषण',
    bill_title: 'बिलिंग काउंटर पर जाने से पहले कटौतियों को समझें।',
    bill_subtitle: 'आपके वास्तविक पॉलिसी नियमों के साथ हर मद का सीधा मिलान। शून्य अनुमान, पूर्ण पारदर्शिता।',
    bill_col_item: 'बिल का विवरण',
    bill_col_amount: 'राशि',
    bill_col_category: 'श्रेणी',
    bill_col_covered: 'स्वीकृत राशि',
    bill_col_deduction: 'जेब से होने वाला खर्च',

    // Section 14 (Recovery Simulator)
    rec_badge: 'इंटरैक्टिव रिकवरी सिम्युलेटर',
    rec_title: 'अपने रिकवरी विकल्प देखें।',
    rec_desc: 'वित्तीय अंतर (गैप) को समझें और देखें कि परिवार की आपातकालीन बचत को खत्म किए बिना विभिन्न रास्ते आपकी स्थिति को कैसे सुरक्षित रखते हैं।',
    rec_amt_label: 'आवश्यक व्यवस्था राशि',
    rec_modeled_gap: 'मॉडल किया गया गैप',
    rec_mode_label: 'रिकवरी मोड चुनें',
    rec_opt_available: 'उपलब्ध फंड का उपयोग',
    rec_opt_partial: 'आंशिक फंडिंग',
    rec_opt_financing: 'फाइनेंसिंग विकल्प',
    rec_opt_payment: 'सीधा भुगतान',
    rec_resilience_title: 'सिम्युलेटेड वित्तीय सुरक्षा',
    rec_buffer_label: 'शेष आपातकालीन बचत',
    rec_obligations_label: 'मौजूदा मासिक देनदारियां',
    rec_obligations_sub: 'होम लोन ईएमआई + अनिवार्य मासिक बिल',
    rec_pressure_label: 'अनुमानित भुगतान दबाव',
    rec_review_btn: 'समीक्षा करें और आगे बढ़ें',

    // Section 15 (Paytm)
    pay_badge: 'अस्पताल डिस्चार्ज भुगतान',
    pay_title: 'योजना से वास्तविक क्रियान्वयन तक।',
    pay_desc: 'सहाय केवल सलाह पर नहीं रुकता। अस्पताल बिलिंग काउंटर पर तुरंत डिस्चार्ज सेटलमेंट पूरा करें।',
    pay_required_label: 'डिस्चार्ज के लिए आवश्यक भुगतान',
    pay_btn: 'Paytm से भुगतान करें →',
    pay_sub: 'त्वरित यूपीआई, नेटबैंकिंग और फ्लोपास प्री-अप्रूव्ड ब्रिज',

    // Security
    sec_badge: 'सुरक्षा और विश्वसनीयता गारंटी',
    sec_title: 'वित्तीय समझ जो पूरी तरह पारदर्शी है।',
    sec_desc: 'संस्थागत अखंडता और शून्य ब्लैक-बॉक्स जोखिम के लिए निर्मित चार मजबूत स्तंभ।',

    // Common
    common_active_case: 'सक्रिय मामला प्रगति पर है',
    common_start_new: 'नई यात्रा शुरू करें',
  },

  hinglish: {
    // Nav
    nav_home: 'Home',
    nav_how_it_works: 'Kaise Kaam Karta Hai',
    nav_flowpass: 'FlowPass',
    nav_recovery: 'Recovery',
    nav_security: 'Security',
    nav_sign_in: 'Sign In',
    nav_start_cta: 'Sahaay Ke Saath Shuru Karein',
    lang_selector_label: 'Bhasha',

    // Hero
    hero_eyebrow: 'AI FINANCIAL RECOVERY & JOURNEY AGENT',
    hero_headline_1: 'Financial emergencies',
    hero_headline_2: 'ko mat banne do',
    hero_headline_3: 'financial chaos.',
    hero_subtitle: 'Jab insurance, cash flow aur out-of-pocket kharche takraate hain — Sahaay aapki poori financial journey ko bina start over kiye connect rakhta hai.',
    hero_start_btn: 'Sahaay Ke Saath Shuru Karein',
    hero_watch_btn: 'Dekhein Kaise Kaam Karta Hai',

    // Section 03
    s3_title: 'Emergency ek chain reaction hoti hai.',
    s3_subtitle: 'Chahe medical crisis ho, vehicle collision ho ya sudden income shock — ek incident se kayi disconnected financial problems hoti hain. Sahaay unhe ek single guided journey mein connect karta hai.',

    // Section 10 (Bill Audit)
    bill_badge: 'DETERMINISTIC BILL & EVIDENCE AUDIT',
    bill_title: 'Billing counter se pehle deductions ko pakdein.',
    bill_subtitle: 'Aapki policy clauses ke saath item-by-item verification. Zero guesswork, poori clarity.',
    bill_col_item: 'Bill Line Item',
    bill_col_amount: 'Amount',
    bill_col_category: 'Classification',
    bill_col_covered: 'Covered Amount',
    bill_col_deduction: 'Out-of-Pocket Gap',

    // Section 14 (Recovery Simulator)
    rec_badge: 'INTERACTIVE RECOVERY SIMULATOR',
    rec_title: 'Apne recovery options explore karein.',
    rec_desc: 'Gap ko samjhein aur test karein ki family emergency savings ko khatam kiye bina alag-alag recovery paths kaise kaam karte hain.',
    rec_amt_label: 'Kitna Amount Chahiye',
    rec_modeled_gap: 'Modeled Gap',
    rec_mode_label: 'Select Recovery Mode',
    rec_opt_available: 'Apne Funds Use Karein',
    rec_opt_partial: 'Partial Funding',
    rec_opt_financing: 'Financing Options',
    rec_opt_payment: 'Direct Payment',
    rec_resilience_title: 'Simulated Financial Resilience',
    rec_buffer_label: 'Bacha Hua Emergency Buffer',
    rec_obligations_label: 'Ongoing Monthly Kharcha & EMI',
    rec_obligations_sub: 'Home loan EMI + standard utilities',
    rec_pressure_label: 'Modeled Payment Pressure',
    rec_review_btn: 'Review & Continue',

    // Section 15 (Paytm)
    pay_badge: 'Hospital Settlement Execution',
    pay_title: 'Plan se direct counter action.',
    pay_desc: 'Sahaay sirf advice nahi deta. Hospital billing desk par bina delay counter clearance complete karein.',
    pay_required_label: 'Discharge Ke Liye Required Payment',
    pay_btn: 'Paytm Se Continue Karein →',
    pay_sub: 'Instant UPI, NetBanking & FlowPass Pre-Approved Bridge',

    // Security
    sec_badge: 'SECURITY & FAIL-SAFE GUARANTEE',
    sec_title: 'Clear financial intelligence jo samajh aaye.',
    sec_desc: 'Complete institutional safety aur zero black-box risk ke chaar pillars.',

    // Common
    common_active_case: 'Active Case Chalu Hai',
    common_start_new: 'Nayi Journey Shuru Karein',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sahaay_lang') as Language;
      if (stored && ['en', 'hi', 'hinglish'].includes(stored)) {
        setLanguageState(stored);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahaay_lang', lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    return fallback || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
