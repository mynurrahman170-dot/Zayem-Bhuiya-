import React, { useState, useEffect } from 'react';
import { Expense, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import { DollarSign, PlusCircle, Search, Tag, X } from 'lucide-react';

interface ExpensesViewProps {
  company: Company | null;
  lang: Language;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [payee, setPayee] = useState('');
  const [account, setAccount] = useState('Cash in Hand');
  const [reference, setReference] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchExpenses = async () => {
    if (!company?.id) return;
    try {
      const data = await api.request<Expense[]>('/api/company/expenses');
      setExpenses(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchExpenses();
    }
  }, [company?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    try {
      await api.request('/api/company/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category,
          amount,
          description,
          payee,
          paymentAccount: account,
          referenceNumber: reference
        })
      });
      setStatusMsg({ type: 'success', text: 'Expense voucher recorded successfully!' });
      setShowModal(false);
      setAmount(0);
      setDescription('');
      setPayee('');
      setReference('');
      fetchExpenses();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to record expense.' });
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const filtered = expenses.filter(e =>
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.payee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            {t.expenses}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'দোকান বা শোরুম ভাড়া, বিদ্যুৎ বিল, নাস্তা, পরিবহন ও দৈনন্দিন পরিচালনা খরচের ভাউচার।'
              : 'Log showroom rents, utility bills, staff tea, transport, and petty cash operating vouchers.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'bn' ? 'মোট পরিচালন ব্যয়' : 'Total Operating Costs'}</span>
            <div className="text-lg font-bold font-mono text-rose-400">{formatBDT(totalExpense)}</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {t.logExpense}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg flex items-center justify-between text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="font-bold text-sm ml-2">&times;</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2 max-w-md text-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'bn' ? 'ক্যাটাগরি, বিবরণ বা প্রাপক দিয়ে খুঁজুন...' : 'Search by category, description, payee...'}
          className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'ব্যয়ের খাত' : 'Category'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'প্রাপক / ব্যক্তি' : 'Payee / Recipient'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'পরিশোধের অ্যাকাউন্ট' : 'Payment Account'}</th>
                <th className="py-3 px-4 text-right">{t.amount} (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-300 font-sans">{formatDate(exp.date)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{exp.description}</td>
                  <td className="py-3 px-4 text-slate-300">{exp.payee}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{exp.paymentAccount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 tabular-nums">
                    {formatBDT(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-400" />
                {lang === 'bn' ? 'নতুন খরচ / ব্যয় ভাউচার এন্ট্রি' : 'Record Business Operating Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ব্যয়ের খাত নির্বাচন *' : 'Expense Category *'}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                >
                  <option value="Rent">{lang === 'bn' ? 'শোরুম / গুদাম ভাড়া' : 'Showroom / Warehouse Rent'}</option>
                  <option value="Utilities">{lang === 'bn' ? 'বিদ্যুৎ, পানি ও ইন্টারনেট বিল' : 'Electricity & Power Bill'}</option>
                  <option value="Salaries">{lang === 'bn' ? 'কর্মচারীদের বেতন ও মজুরি' : 'Staff Salaries & Wages'}</option>
                  <option value="Tea & Snacks">{lang === 'bn' ? 'চা, নাস্তা ও আপ্যায়ন খরচ' : 'Office Tea & Refreshments'}</option>
                  <option value="Transport">{lang === 'bn' ? 'পরিবহন ও জ্বালানি খরচ' : 'Delivery & Fuel Transport'}</option>
                  <option value="Marketing">{lang === 'bn' ? 'বিজ্ঞাপন ও বিপণন' : 'Advertising & Social Marketing'}</option>
                  <option value="Office Supplies">{lang === 'bn' ? 'স্টেশনারি ও অফিস সামগ্রী' : 'Stationery & Supplies'}</option>
                  <option value="Maintenance">{lang === 'bn' ? 'মেরামত ও রক্ষণাবেক্ষণ' : 'Repair & Equipment Maintenance'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'খরচের পরিমাণ (৳) *' : 'Expense Amount (৳) *'}</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'বিবরণ / উদ্দেশ্য *' : 'Particulars / Description *'}</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: অক্টোবর মাসের দোকান ভাড়া' : 'e.g. October monthly showroom lease'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'প্রাপক (যার কাছে প্রদান করা হলো)' : 'Paid To (Payee)'}</label>
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: বাড়ির মালিক / ভেন্ডর' : 'e.g. Building Landlord / Vendor'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'যে অ্যাকাউন্ট থেকে প্রদান করা হলো' : 'Paid From Account'}</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                >
                  <option value="Cash in Hand">{lang === 'bn' ? 'নগদ ড্রয়ার (কাউন্টার ক্যাশ)' : 'Cash in Hand (Counter Drawer)'}</option>
                  <option value="BRAC Bank Current A/C">{lang === 'bn' ? 'ব্র্যাক ব্যাংক চলতি হিসাব' : 'BRAC Bank Current A/C'}</option>
                  <option value="bKash Merchant">{lang === 'bn' ? 'বিকাশ মার্চেন্ট অ্যাকাউন্ট' : 'bKash Merchant Account'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-sm"
                >
                  {lang === 'bn' ? 'ভাউচার সংরক্ষণ করুন' : 'Save Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
