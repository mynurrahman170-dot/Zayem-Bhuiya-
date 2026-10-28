import React, { useState, useEffect } from 'react';
import { User, Company, SalesInvoice } from './types.ts';
import { api } from './api.ts';
import { Language, translations } from './i18n.ts';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { InvoicePrintModal } from './components/InvoicePrintModal.tsx';
import { CompanyProfileModal } from './components/CompanyProfileModal.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { ProductsView } from './views/ProductsView.tsx';
import { SalesView } from './views/SalesView.tsx';
import { PurchasesView } from './views/PurchasesView.tsx';
import { LedgersView } from './views/LedgersView.tsx';
import { AccountingView } from './views/AccountingView.tsx';
import { ExpensesView } from './views/ExpensesView.tsx';
import { EmployeesView } from './views/EmployeesView.tsx';
import { DealersView } from './views/DealersView.tsx';
import { ExtensionsView } from './views/ExtensionsView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { SuperAdminView } from './views/SuperAdminView.tsx';
import { AuthModal } from './views/AuthModal.tsx';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [lang, setLang] = useState<Language>('bn');
  const t = translations[lang];
  const [activePrintInvoice, setActivePrintInvoice] = useState<SalesInvoice | null>(null);
  const [showBrandingModal, setShowBrandingModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showRequestAccessModal, setShowRequestAccessModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.request<{ user: User; company: Company | null }>('/api/auth/me');
        setUser(res.user);
        setCompany(res.company);
      } catch {
        // If not authenticated, login by default as Apex Retail owner to provide an immediate live workspace
        try {
          const loginRes = await api.request<{ token: string; user: User; company: Company | null }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ emailOrPhone: 'owner@apexretail.bd', password: 'apex123' })
          });
          api.setToken(loginRes.token);
          setUser(loginRes.user);
          setCompany(loginRes.company);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleSwitchWorkspace = async (email: string) => {
    const passMap: Record<string, string> = {
      'admin@datancode.com': 'admin123',
      'owner@apexretail.bd': 'apex123',
      'owner@bengaldealers.bd': 'bengal123',
      'demo@datancode.com': 'demo123'
    };

    try {
      setLoading(true);
      const res = await api.request<{ token: string; user: User; company: Company | null }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          emailOrPhone: email,
          password: passMap[email] || 'apex123'
        })
      });
      api.setToken(res.token);
      setUser(res.user);
      setCompany(res.company);
      if (res.user.role === 'SUPER_ADMIN') {
        setCurrentView('superadmin');
      } else {
        setCurrentView('dashboard');
      }
    } catch (e) {
      console.error('Failed to switch workspace', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    api.removeToken();
    setUser(null);
    setCompany(null);
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <img
          src="/assets/aistudio/file_000000009b788211997a7f36ab55b035_f2adea2a.png"
          alt="Data & Code"
          className="h-16 w-auto object-contain animate-pulse"
        />
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Initializing Business Automation System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${lang === 'bn' ? 'font-bangla' : ''}`}>
      {/* Top Application Header */}
      <Header
        user={user}
        company={company}
        lang={lang}
        onLanguageChange={setLang}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        onSwitchWorkspace={handleSwitchWorkspace}
        onRequestAccess={() => setShowRequestAccessModal(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tenant Navigation Sidebar */}
        {user && (
          <Sidebar
            currentView={currentView}
            onSelectView={setCurrentView}
            company={company}
            user={user}
            lang={lang}
            onOpenBranding={() => setShowBrandingModal(true)}
          />
        )}

        {/* Viewport Content Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {!user ? (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-4">
              <img
                src="/assets/aistudio/file_000000009b788211997a7f36ab55b035_f2adea2a.png"
                alt="Data & Code"
                className="h-20 w-auto object-contain drop-shadow-lg mx-auto"
              />
              <h1 className="text-2xl font-extrabold text-white">{t.platformTagline}</h1>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {lang === 'bn'
                  ? 'ডাটা অ্যান্ড কোড বিজনেস অটোমেশন সিস্টেমে স্বাগতম। অনুমোদিত কোম্পানির অ্যাকাউন্ট দিয়ে লগইন করুন অথবা সরাসরি ডেমো স্যান্ডবক্সে পরীক্ষা করুন।'
                  : 'Welcome to the Business Automation System. Sign in with an authorized company identity or try the instant Demo Sandbox.'}
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
              >
                {lang === 'bn' ? 'লগইন করুন / ওয়ার্কস্পেস খুলুন' : 'Sign In / Open Workspace'}
              </button>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  company={company}
                  user={user}
                  lang={lang}
                  onOpenInvoice={(inv) => setActivePrintInvoice(inv)}
                  onNavigate={(v) => setCurrentView(v)}
                />
              )}

          {currentView === 'products' && (
            <ProductsView company={company} lang={lang} />
          )}

          {currentView === 'sales' && (
            <SalesView
              company={company}
              lang={lang}
              onOpenInvoiceModal={(inv) => setActivePrintInvoice(inv)}
            />
          )}

          {currentView === 'purchases' && (
            <PurchasesView company={company} lang={lang} />
          )}

          {(currentView === 'customers' || currentView === 'suppliers') && (
            <LedgersView company={company} lang={lang} />
          )}

          {currentView === 'accounting' && (
            <AccountingView company={company} lang={lang} />
          )}

          {currentView === 'expenses' && (
            <ExpensesView company={company} lang={lang} />
          )}

          {currentView === 'employees' && (
            <EmployeesView company={company} lang={lang} />
          )}

          {currentView === 'dealers' && (
            <DealersView company={company} lang={lang} />
          )}

          {currentView === 'extensions' && (
            <ExtensionsView company={company} lang={lang} />
          )}

          {currentView === 'reports' && (
            <ReportsView company={company} lang={lang} />
          )}

          {currentView === 'superadmin' && (
            <SuperAdminView lang={lang} />
          )}
            </>
          )}
        </main>
      </div>

      {/* Company-Branded Printable Invoice / Thermal Receipt Modal */}
      <InvoicePrintModal
        invoice={activePrintInvoice}
        company={company}
        lang={lang}
        onClose={() => setActivePrintInvoice(null)}
      />

      {/* Company Branding & Logo Upload Modal */}
      {showBrandingModal && (
        <CompanyProfileModal
          company={company}
          lang={lang}
          onClose={() => setShowBrandingModal(false)}
          onUpdated={(updatedComp) => setCompany(updatedComp)}
        />
      )}

      {/* Auth / Register Modal */}
      {showAuthModal && (
        <AuthModal
          lang={lang}
          onSuccess={(u, c) => {
            setUser(u);
            setCompany(c);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Request Access Info Modal */}
      {showRequestAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-slate-200">
            <h3 className="text-sm font-bold text-white">
              {lang === 'bn' ? 'বাণিজ্যিক ওয়ার্কস্পেস অনুমোদন' : 'Commercial Workspace Authorization'}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'আপনি বর্তমানে ডেমো স্যান্ডবক্স পরিবেশে আছেন এবং ৫টি এন্ট্রি পর্যন্ত তৈরির সুবিধা পাচ্ছেন।'
                : 'You are currently testing in the Demo Sandbox Environment with a 5-record creation limit.'}
            </p>
            <p className="text-slate-400">
              {lang === 'bn'
                ? 'আপনার প্রতিষ্ঠানের জন্য সম্পূর্ণ আনলিমিটেড লেনদেন, নিজস্ব ব্র্যান্ডেড মেমো এবং ডেডিকেটেড খতিয়ান চালু করতে ডাটা অ্যান্ড কোড অ্যাকাউন্ট ম্যানেজার অথবা সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'
                : 'To obtain an isolated company workspace with unlimited transaction processing, custom branding, and dedicated ledgers, please contact your Data & Code account manager or platform Super Admin.'}
            </p>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
              <div><strong>{lang === 'bn' ? 'প্ল্যাটফর্ম হটলাইন:' : 'Platform Hotline:'}</strong> +880 1800 000000</div>
              <div><strong>{lang === 'bn' ? 'সাপোর্ট ইমেইল:' : 'Support Email:'}</strong> support@datancode.com</div>
              <div><strong>{lang === 'bn' ? 'অনুমোদন অবস্থা:' : 'Super Admin Review:'}</strong> {lang === 'bn' ? `আপনার ইমেইল (${user?.email}) সুপার অ্যাডমিন অনুমোদন তালিকায় অপেক্ষমাণ আছে।` : `Your email (${user?.email}) is pending in the Super Admin Approval Queue.`}</div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRequestAccessModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
              >
                {lang === 'bn' ? 'বুঝেছি' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
