import React from 'react';
import { User, Company } from '../types.ts';
import { Language, translations } from '../i18n.ts';
import { ShieldCheck, LogOut, Globe, Sparkles, Building2, UserCheck } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  company: Company | null;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onSwitchWorkspace?: (email: string) => void;
  onRequestAccess: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  company,
  lang,
  onLanguageChange,
  onLogout,
  onOpenAuth,
  onSwitchWorkspace,
  onRequestAccess
}) => {
  const t = translations[lang];
  const isDemo = user?.role === 'GUEST' || user?.companyId === 'demo_tenant';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top Banner for Demo Sandbox if active */}
      {isDemo && user && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="font-semibold">{lang === 'bn' ? 'ডেমো স্যান্ডবক্স পরিবেশ' : 'Demo Sandbox Environment'}</span>
            <span className="text-blue-100">·</span>
            <span>
              <strong>{user.demoRemaining}</strong> {lang === 'bn' ? `টি (মোট ${user.maxDemoRecords} টি) ${t.demoRemainingMsg}` : `of ${user.maxDemoRecords} ${t.demoRemainingMsg}`}
            </span>
          </div>
          <button
            onClick={onRequestAccess}
            className="px-3 py-1 bg-white text-blue-900 font-semibold rounded text-xs hover:bg-blue-50 transition-colors shadow-sm"
          >
            {t.requestAccess}
          </button>
        </div>
      )}

      {/* Main Top Bar Contract: Brand Zone, Links/Switchers, Primary Profile Action */}
      <div className="flex items-center justify-between gap-8 px-6 py-3">
        {/* Zone 1: Platform Brand (Using official DC logo asset) */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/aistudio/file_000000009b788211997a7f36ab55b035_f2adea2a.png"
            alt="Data & Code Business Automation System"
            className="h-10 w-auto object-contain drop-shadow"
            onError={(e) => {
              // Graceful styled fallback
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="hidden sm:block">
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{t.platformName}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                BAS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {t.platformTagline}
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links & Rapid Workspace Switcher */}
        <div className="flex items-center gap-4 text-xs">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                lang === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Zone 3: Active User & Session Control */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                <div className="text-[11px] text-slate-400 capitalize">
                  {isSuperAdmin
                    ? (lang === 'bn' ? 'সুপার অ্যাডমিনিস্ট্রেটর' : 'Platform Administrator')
                    : (lang === 'bn'
                        ? (user.role === 'COMPANY_ADMIN' ? 'কোম্পানি অ্যাডমিন' : 'অপারেশনাল স্টাফ')
                        : user.role.replace('_', ' ').toLowerCase())}
                </div>
              </div>
              <button
                onClick={onLogout}
                title={lang === 'bn' ? 'লগআউট' : 'Logout'}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
            >
              {lang === 'bn' ? 'লগইন / নিবন্ধন' : 'Sign In / Register'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
