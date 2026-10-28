import React from 'react';
import { Company, User } from '../types.ts';
import { Language, translations } from '../i18n.ts';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Contact,
  BookOpen,
  DollarSign,
  UserCheck,
  Building,
  Layers,
  Settings,
  FileBarChart2,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  company: Company | null;
  user: User | null;
  lang: Language;
  onOpenBranding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  company,
  user,
  lang,
  onOpenBranding
}) => {
  const t = translations[lang];
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'products', label: t.products, icon: Package },
    { id: 'sales', label: t.sales, icon: ShoppingCart },
    { id: 'purchases', label: t.purchases, icon: Truck },
    { id: 'customers', label: t.customers, icon: Users },
    { id: 'suppliers', label: t.suppliers, icon: Contact },
    { id: 'accounting', label: t.accounting, icon: BookOpen },
    { id: 'expenses', label: t.expenses, icon: DollarSign },
    { id: 'employees', label: t.employees, icon: UserCheck },
    { id: 'dealers', label: t.dealers, icon: Building },
    { id: 'extensions', label: t.extensions, icon: Layers },
    { id: 'reports', label: t.reports, icon: FileBarChart2 }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 no-print select-none">
      {/* Company Identity & Branding Box */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-10 h-10 rounded-lg object-cover bg-white p-1 border border-slate-700 shrink-0 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow">
              {company ? company.name.charAt(0) : 'D'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate" title={company?.name}>
              {company ? company.name : (lang === 'bn' ? 'ডাটা অ্যান্ড কোড ওয়ার্কস্পেস' : 'Data & Code Workspace')}
            </h2>
            {company?.slogan && (
              <p className="text-[11px] text-slate-400 truncate" title={company.slogan}>
                {company.slogan}
              </p>
            )}
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                {lang === 'bn'
                  ? (company?.businessCategory === 'retail' ? 'খুচরা দোকান' : company?.businessCategory === 'dealership' ? 'ডিলারশিপ' : company?.businessCategory === 'restaurant' ? 'রেস্তোরাঁ' : company?.businessCategory === 'hotel' ? 'আবাসিক' : company?.businessCategory === 'vehicle' ? 'যানবাহন' : 'ম্যানুফ্যাকচারিং')
                  : (company?.businessCategory || 'SaaS')}
              </span>
              <button
                onClick={onOpenBranding}
                title={lang === 'bn' ? 'কোম্পানি প্রোফাইল ও লোগো পরিবর্তন' : 'Edit Company Branding & Logo'}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 underline transition-colors"
              >
                {lang === 'bn' ? 'ব্র্যান্ডিং' : 'Branding'} <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Status Chip */}
        {company?.subscription && (
          <div className="mt-3 bg-slate-800/80 rounded-md px-2.5 py-1.5 border border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{company.subscription.planName}</span>
            <span
              className={`font-semibold ${
                company.subscription.status === 'ACTIVE'
                  ? 'text-emerald-400'
                  : company.subscription.status === 'TRIAL'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {lang === 'bn'
                ? (company.subscription.status === 'ACTIVE' ? 'সক্রিয়' : company.subscription.status === 'TRIAL' ? 'ট্রায়াল' : 'স্থগিত')
                : company.subscription.status}
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Administration Entry */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        {isSuperAdmin && (
          <button
            onClick={() => onSelectView('superadmin')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
              currentView === 'superadmin'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{t.superAdmin}</span>
          </button>
        )}

        <button
          onClick={onOpenBranding}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>{t.settings}</span>
        </button>
      </div>
    </aside>
  );
};
