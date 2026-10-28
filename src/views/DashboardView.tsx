import React, { useState, useEffect } from 'react';
import { Company, User, DashboardData, SalesInvoice } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Eye,
  Calendar,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { UserGuideModal } from '../components/UserGuideModal.tsx';

interface DashboardViewProps {
  company: Company | null;
  user: User | null;
  lang: Language;
  onOpenInvoice: (invoice: SalesInvoice) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  user,
  lang,
  onOpenInvoice,
  onNavigate
}) => {
  const t = translations[lang];
  const [period, setPeriod] = useState<'today' | 'this_month' | 'all'>('today');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const fetchDashboard = async () => {
    if (!user || !user.companyId) return;
    try {
      setLoading(true);
      const res = await api.request<DashboardData>(`/api/company/dashboard?period=${period}`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchDashboard();
    }
  }, [period, user?.companyId]);

  const kpis = data?.kpis;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Welcome & Period Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            {company?.name} — {t.dashboard}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {company?.slogan || (lang === 'bn' ? 'বিজনেস অটোমেশন ও আর্থিক ব্যবস্থাপনা' : 'Business Automation & Financial Overview')} · {lang === 'bn' ? 'বাংলাদেশি টাকা (৳)' : 'Active in BDT (৳)'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subscription alert banner */}
          {kpis && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700/80 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300">
                {lang === 'bn' ? 'প্যাকেজ:' : 'Plan:'} <strong>{kpis.subscriptionStatus}</strong> ({kpis.daysRemaining} {lang === 'bn' ? 'দিন বাকি' : 'days left'})
              </span>
            </div>
          )}

          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                period === 'today' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.today}
            </button>
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                period === 'this_month' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.thisMonth}
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                period === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.allTime}
            </button>
          </div>

          {/* Quick Guide Trigger Button */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'bn' ? 'ব্যবহার সহায়িকা' : 'User Manual'}</span>
          </button>
        </div>
      </div>

      {/* Quick Guide & Features Announcement Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-900/60 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              {lang === 'bn' ? 'সফটওয়্যার ব্যবহারের সহজ নিয়ম ও ব্যবসায়িক গুরুত্ব নির্দেশিকা' : 'System Operating Guide & Business Impact Manual'}
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                {lang === 'bn' ? 'ব্যবহার সহায়িকা' : 'Help Guide'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'কোম্পানি তৈরি, স্টক এন্ট্রি, পিওএস বিক্রয় চালান, কাস্টমার বাকি আদায় ও আর্থিক হিসাববিজ্ঞান পরিচালনার পূর্ণাঙ্গ নিয়মাবলী।'
                : 'Learn how to create companies, add inventory, issue sales invoices, collect market dues, and analyze financial reports.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuideModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {lang === 'bn' ? 'ব্যবহার বিধি ও বৈশিষ্ট্য দেখুন' : 'Read Operational Guide'}
        </button>
      </div>

      {/* KPI Financial Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Today's Sales */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.todaySales}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {formatBDT(kpis?.todaySalesAmount ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {lang === 'bn' ? 'নির্বাচিত মেয়াদের মোট: ' : 'Period Total: '}{formatBDT(kpis?.periodSalesTotal ?? 0)}
          </div>
        </div>

        {/* Today's Purchases */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.todayPurchases}</span>
            <TrendingDown className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {formatBDT(kpis?.todayPurchasesAmount ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'ক্রয়কৃত মালামালের খরচ' : 'Commercial Goods Cost'}</div>
        </div>

        {/* Cash Received */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.cashReceived}</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {formatBDT(kpis?.cashReceived ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'কাউন্টার ও ব্যাংক গ্রহণ' : 'Direct Counter & Bank'}</div>
        </div>

        {/* Cash Paid */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.cashPaid}</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {formatBDT(kpis?.cashPaid ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'মহাজন ও ভেন্ডর পরিশোধ' : 'Supplier Clearing'}</div>
        </div>

        {/* Customer Receivables (Dues) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.customerReceivables}</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            {formatBDT(kpis?.totalCustomerReceivables ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'বাজারে গ্রাহকদের মোট বকেয়া' : 'Outstanding Market Dues'}</div>
        </div>

        {/* Supplier Payables */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.supplierPayables}</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-orange-400 mt-1">
            {formatBDT(kpis?.totalSupplierPayables ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'সরবরাহকারীদের মোট দেনা' : 'Owed to Suppliers'}</div>
        </div>

        {/* Current Stock Value */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.currentStockValue}</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
            {formatBDT(kpis?.currentStockValue ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'মজুদ পণ্যের সম্পদ মূল্য' : 'Inventory Asset Valuation'}</div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.totalExpenses}</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-200 mt-1">
            {formatBDT(kpis?.totalExpenses ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'দোকান ভাড়া, বিল, বেতন' : 'Rent, Utilities, Salary'}</div>
        </div>

        {/* Gross Profit */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.grossProfit}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {formatBDT(kpis?.grossProfit ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'মোট বিক্রয় - মালামালের খরচ' : 'Revenue - Cost of Goods'}</div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            <span>{t.netProfit}</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${
            (kpis?.netProfit ?? 0) >= 0 ? 'text-blue-400' : 'text-rose-400'
          }`}>
            {formatBDT(kpis?.netProfit ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'সকল পরিচালন খরচ বাদ দিয়ে' : 'After all operating costs'}</div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {data?.lowStockProducts && data.lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-300">
                {lang === 'bn' ? `স্বল্প মজুদের পণ্য সতর্কবার্তা (${data.lowStockProducts.length} ${t.stockAlertsSummary})` : `Low Stock Threshold Alerts (${data.lowStockProducts.length} items need replenishment)`}
              </h3>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {t.stockAlertsDesc}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.lowStockProducts.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/60 border border-amber-700/60 text-amber-200 rounded text-xs font-mono"
                  >
                    <span>{p.name}</span>
                    <strong className="text-rose-300 font-bold">({p.currentStock} {p.unit} {lang === 'bn' ? 'বাকি' : 'remaining'})</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-colors whitespace-nowrap shrink-0"
          >
            {t.manageStock}
          </button>
        </div>
      )}

      {/* Recent Activity Split Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-400" />
              {t.recentSales}
            </h2>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-blue-400 hover:underline"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{t.invoiceNo}</th>
                  <th className="py-2.5 px-4">{t.customer}</th>
                  <th className="py-2.5 px-4 text-right">{t.grandTotal}</th>
                  <th className="py-2.5 px-4 text-center">{t.status}</th>
                  <th className="py-2.5 px-4 text-right">{t.document}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.recentSales.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-4 text-slate-300">{inv.customerName}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-100">
                      {formatBDT(inv.grandTotal)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : inv.status === 'DUE'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {inv.status === 'PAID' ? t.paid : inv.status === 'DUE' ? t.due : t.partial}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onOpenInvoice(inv)}
                        title={lang === 'bn' ? 'চালান প্রিন্ট বা দেখুন' : 'Print / View Invoice'}
                        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t.print}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              {t.recentPurchases}
            </h2>
            <button
              onClick={() => onNavigate('purchases')}
              className="text-xs text-blue-400 hover:underline"
            >
              {t.viewAll}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{t.billNo}</th>
                  <th className="py-2.5 px-4">{t.supplier}</th>
                  <th className="py-2.5 px-4 text-right">{t.amount}</th>
                  <th className="py-2.5 px-4 text-center">{t.status}</th>
                  <th className="py-2.5 px-4 text-right">{t.outstanding}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.recentPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-white">{po.invoiceNumber}</td>
                    <td className="py-2.5 px-4 text-slate-300">{po.supplierName}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-100">
                      {formatBDT(po.grandTotal)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : po.status === 'DUE'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {po.status === 'PAID' ? t.paid : po.status === 'DUE' ? t.due : t.partial}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-400">
                      {formatBDT(po.outstandingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Guide & Operation Manual Modal */}
      <UserGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        lang={lang}
      />
    </div>
  );
};
