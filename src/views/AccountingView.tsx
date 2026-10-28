import React, { useState, useEffect } from 'react';
import { Account, JournalEntry, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import {
  BookOpen,
  DollarSign,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Scale
} from 'lucide-react';

interface AccountingViewProps {
  company: Company | null;
  lang: Language;
}

export const AccountingView: React.FC<AccountingViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [subTab, setSubTab] = useState<'cashbook' | 'chart' | 'journals' | 'pnl' | 'balancesheet'>('cashbook');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounting = async () => {
    if (!company?.id) return;
    try {
      setLoading(true);
      const res = await api.request<any>('/api/company/accounting');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchAccounting();
    }
  }, [company?.id]);

  const accounts: Account[] = data?.accounts || [];
  const journals: JournalEntry[] = data?.journals || [];
  const cashbook: any[] = data?.cashbook || [];
  const summary = data?.summary || { totalSales: 0, totalExpenses: 0, totalPurchases: 0, netCashFlow: 0 };

  // Calculate Asset / Liability / Equity totals
  const totalAssets = accounts.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'LIABILITY').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === 'EQUITY').reduce((sum, a) => sum + a.balance, 0);

  const grossProfit = summary.totalSales - (summary.totalPurchases * 0.7);
  const netProfit = grossProfit - summary.totalExpenses;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            {t.accounting}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'ডাবল-এন্ট্রি সাধারণ লেজার, দৈনিক ক্যাশবহি, সমতাযুক্ত জাবেদা এন্ট্রি এবং আর্থিক বিবরণী (টাকায়)।'
              : 'Double-entry general ledger, daily cashbook, balanced journal entries, and financial statements in BDT (৳).'}
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setSubTab('cashbook')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              subTab === 'cashbook' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'দৈনিক ক্যাশবহি' : 'Daily Cashbook'}
          </button>
          <button
            onClick={() => setSubTab('chart')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              subTab === 'chart' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'হিসাবের চার্ট' : 'Chart of Accounts'}
          </button>
          <button
            onClick={() => setSubTab('journals')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              subTab === 'journals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'জাবেদা এন্ট্রি' : 'Journal Entries'}
          </button>
          <button
            onClick={() => setSubTab('pnl')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              subTab === 'pnl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'লাভ ও ক্ষতি' : 'Profit & Loss'}
          </button>
          <button
            onClick={() => setSubTab('balancesheet')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              subTab === 'balancesheet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'উদ্বৃত্তপত্র' : 'Balance Sheet'}
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Daily Cashbook */}
      {subTab === 'cashbook' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium uppercase">{lang === 'bn' ? 'মোট নগদ প্রবাহ' : 'Net Cash Flow'}</span>
              <div className={`text-xl font-bold font-mono mt-1 ${
                summary.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatBDT(summary.netCashFlow)}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium uppercase">{lang === 'bn' ? 'বিক্রয় বাবদ জমা' : 'Sales Receipts'}</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatBDT(summary.totalSales)}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium uppercase">{lang === 'bn' ? 'পরিচালন ব্যয় পরিশোধ' : 'Operating Expenses Paid'}</span>
              <div className="text-xl font-bold font-mono text-slate-300 mt-1">
                {formatBDT(summary.totalExpenses)}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'নগদ ও ব্যাংক দৈনিক রেজিস্টার' : 'Cash & Bank Daily Register'}</h2>
              <span className="text-xs text-slate-400">{lang === 'bn' ? 'লেনদেনের সময়ানুক্রমিক খতিয়ান' : 'Chronological transaction logs'}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">{t.date}</th>
                    <th className="py-2.5 px-4">{lang === 'bn' ? 'ধরণ' : 'Type'}</th>
                    <th className="py-2.5 px-4">{t.category}</th>
                    <th className="py-2.5 px-4">{lang === 'bn' ? 'রেফারেন্স' : 'Reference'}</th>
                    <th className="py-2.5 px-4">{lang === 'bn' ? 'গ্রাহক / সরবরাহকারী' : 'Party'}</th>
                    <th className="py-2.5 px-4 text-center">{lang === 'bn' ? 'মাধ্যম' : 'Channel'}</th>
                    <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'জমা (+)' : 'Inflow (+)'}</th>
                    <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'খরচ (-)' : 'Outflow (-)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cashbook.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 text-slate-300">{formatDate(row.date)}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.type === 'IN'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {row.type === 'IN' ? (lang === 'bn' ? 'জমা' : 'RECEIPT') : (lang === 'bn' ? 'পরিশোধ' : 'PAYMENT')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-white font-medium">{row.category}</td>
                      <td className="py-2.5 px-4 font-mono text-blue-400">{row.ref}</td>
                      <td className="py-2.5 px-4 text-slate-300">{row.party}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-[10px] text-slate-400">
                        {row.method}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                        {row.type === 'IN' ? formatBDT(row.amount) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-400 font-semibold">
                        {row.type === 'OUT' ? formatBDT(row.amount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Chart of Accounts */}
      {subTab === 'chart' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'হিসাবের চার্ট (সাধারণ লেজার কনফিগারেশন)' : 'Chart of Accounts (General Ledger Setup)'}</h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">{lang === 'bn' ? 'হিসাব কোড' : 'Account Code'}</th>
                <th className="py-2.5 px-4">{lang === 'bn' ? 'হিসাবের নাম' : 'Account Title'}</th>
                <th className="py-2.5 px-4">{lang === 'bn' ? 'শ্রেণিবিভাগ' : 'Classification'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-blue-400">{acc.code}</td>
                  <td className="py-2.5 px-4 font-medium text-white">{acc.name}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {acc.type === 'ASSET'
                        ? (lang === 'bn' ? 'সম্পদ (Asset)' : 'ASSET')
                        : acc.type === 'LIABILITY'
                        ? (lang === 'bn' ? 'দায় (Liability)' : 'LIABILITY')
                        : (lang === 'bn' ? 'মালিকানাস্বত্ব (Equity)' : 'EQUITY')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-white">
                    {formatBDT(acc.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-tab 3: Journal Entries */}
      {subTab === 'journals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'ডাবল-এন্ট্রি সমতাযুক্ত সাধারণ জাবেদা' : 'Double-Entry Balanced General Journal'}</h2>
            <span className="text-xs text-slate-400">{lang === 'bn' ? `মোট এন্ট্রি: ${journals.length}` : `Total Entries: ${journals.length}`}</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {journals.map((j) => (
              <div key={j.id} className="p-4 space-y-2 hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="font-mono text-blue-400">{j.reference}</span>
                    <span>·</span>
                    <span>{j.description}</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">{formatDate(j.date)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase">{lang === 'bn' ? 'ডেবিট (Dr)' : 'Debits (Dr)'}</span>
                    {j.debits.map((d, i) => (
                      <div key={i} className="flex justify-between text-slate-300 mt-1">
                        <span>{d.accountName}</span>
                        <span className="text-emerald-400 font-semibold">{formatBDT(d.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="text-[10px] font-sans font-bold text-rose-400 uppercase">{lang === 'bn' ? 'ক্রেডিট (Cr)' : 'Credits (Cr)'}</span>
                    {j.credits.map((c, i) => (
                      <div key={i} className="flex justify-between text-slate-300 mt-1">
                        <span>{c.accountName}</span>
                        <span className="text-rose-400 font-semibold">{formatBDT(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 4: Profit & Loss Statement */}
      {subTab === 'pnl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm max-w-2xl mx-auto space-y-4 text-xs">
          <div className="text-center pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">{company?.name}</h2>
            <h3 className="text-sm font-semibold text-slate-300">{lang === 'bn' ? 'আয় বিবরণী (লাভ ও ক্ষতি হিসাব)' : 'Income Statement (Profit & Loss)'}</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">{lang === 'bn' ? 'মুদ্রা: বাংলাদেশি টাকা (BDT ৳)' : 'Currency: Bangladeshi Taka (BDT)'}</p>
          </div>

          <div className="space-y-3 font-mono">
            <div className="flex justify-between font-bold text-sm text-white pb-2 border-b border-slate-800">
              <span className="font-sans">{lang === 'bn' ? 'মোট বিক্রয় আয় (টার্নওভার)' : 'Revenue / Sales Turnover'}</span>
              <span className="text-emerald-400">{formatBDT(summary.totalSales)}</span>
            </div>

            <div className="flex justify-between text-slate-400 pl-4">
              <span className="font-sans">{lang === 'bn' ? 'বাদ: বিক্রীত পণ্যের আনুমানিক খরচ (COGS)' : 'Less: Estimated Cost of Goods Sold (COGS)'}</span>
              <span>- {formatBDT(summary.totalPurchases * 0.7)}</span>
            </div>

            <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
              <span className="font-sans">{lang === 'bn' ? 'মোট ব্যবসায়িক লাভ (Gross Profit)' : 'Gross Profit'}</span>
              <span className="text-emerald-400">{formatBDT(grossProfit)}</span>
            </div>

            <div className="flex justify-between text-slate-400 pl-4 pt-2">
              <span className="font-sans">{lang === 'bn' ? 'বাদ: পরিচালন ও প্রশাসনিক ব্যয়' : 'Less: Operating & Administrative Expenses'}</span>
              <span>- {formatBDT(summary.totalExpenses)}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold pt-4 border-t-2 border-slate-700">
              <span className="font-sans text-white">{lang === 'bn' ? 'নিট পরিচালন লাভ (Net Profit)' : 'Net Operating Profit'}</span>
              <span className={netProfit >= 0 ? 'text-blue-400' : 'text-rose-400'}>
                {formatBDT(netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 5: Balance Sheet */}
      {subTab === 'balancesheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm max-w-3xl mx-auto space-y-4 text-xs">
          <div className="text-center pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">{company?.name}</h2>
            <h3 className="text-sm font-semibold text-slate-300">{lang === 'bn' ? 'উদ্বৃত্তপত্র বিবরণী (ব্যালেন্স শিট)' : 'Balance Sheet Statement'}</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">{lang === 'bn' ? `তারিখ: ${formatDate(new Date().toISOString())}` : `As of ${formatDate(new Date().toISOString())}`}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 font-mono">
            {/* Assets */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                {lang === 'bn' ? 'সম্পদসমূহ (Assets)' : 'Assets'}
              </h4>
              <div className="space-y-1.5 text-slate-300">
                {accounts.filter(a => a.type === 'ASSET').map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span className="font-sans text-[11px]">{a.name}</span>
                    <span>{formatBDT(a.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-3 border-t border-slate-800">
                <span className="font-sans">{lang === 'bn' ? 'মোট সম্পদ' : 'Total Assets'}</span>
                <span className="text-emerald-400">{formatBDT(totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-sm text-orange-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                {lang === 'bn' ? 'দায় ও মালিকানাস্বত্ব' : 'Liabilities & Equity'}
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="text-[10px] font-sans font-bold text-slate-400 uppercase mt-2">{lang === 'bn' ? 'দায়সমূহ (Liabilities)' : 'Liabilities'}</div>
                {accounts.filter(a => a.type === 'LIABILITY').map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span className="font-sans text-[11px]">{a.name}</span>
                    <span>{formatBDT(a.balance)}</span>
                  </div>
                ))}

                <div className="text-[10px] font-sans font-bold text-slate-400 uppercase mt-3">{lang === 'bn' ? 'মালিকানাস্বত্ব (Equity)' : 'Equity'}</div>
                {accounts.filter(a => a.type === 'EQUITY').map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span className="font-sans text-[11px]">{a.name}</span>
                    <span>{formatBDT(a.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-3 border-t border-slate-800">
                <span className="font-sans">{lang === 'bn' ? 'মোট দায় ও ইকুইটি' : 'Total Liabilities & Equity'}</span>
                <span className="text-orange-400">{formatBDT(totalLiabilities + totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
