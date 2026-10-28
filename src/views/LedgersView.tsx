import React, { useState, useEffect } from 'react';
import { Customer, Supplier, LedgerEntry, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import {
  Users,
  Contact,
  PlusCircle,
  Search,
  Printer,
  FileText,
  DollarSign,
  ArrowRight,
  X
} from 'lucide-react';

interface LedgersViewProps {
  company: Company | null;
  lang: Language;
}

export const LedgersView: React.FC<LedgersViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [tab, setTab] = useState<'customers' | 'suppliers'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedParty, setSelectedParty] = useState<{ id: string; name: string; type: 'CUSTOMER' | 'SUPPLIER'; balance: number } | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [search, setSearch] = useState('');
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);

  // New party form
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyEmail, setPartyEmail] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyOpeningBal, setPartyOpeningBal] = useState(0);

  const fetchData = async () => {
    if (!company?.id) return;
    try {
      const [custs, sups] = await Promise.all([
        api.request<Customer[]>('/api/company/customers'),
        api.request<Supplier[]>('/api/company/suppliers')
      ]);
      setCustomers(custs);
      setSuppliers(sups);

      if (!selectedParty) {
        if (tab === 'customers' && custs.length > 0) {
          fetchLedger('CUSTOMER', custs[0].id, custs[0].name, custs[0].currentBalance);
        } else if (tab === 'suppliers' && sups.length > 0) {
          fetchLedger('SUPPLIER', sups[0].id, sups[0].companyName || sups[0].name, sups[0].currentBalance);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchData();
    }
  }, [tab, company?.id]);

  const fetchLedger = async (partyType: 'CUSTOMER' | 'SUPPLIER', partyId: string, name: string, balance: number) => {
    setSelectedParty({ id: partyId, name, type: partyType, balance });
    try {
      const entries = await api.request<LedgerEntry[]>(`/api/company/ledgers?partyType=${partyType}&partyId=${partyId}`);
      setLedgerEntries(entries);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === 'customers') {
        await api.request('/api/company/customers', {
          method: 'POST',
          body: JSON.stringify({
            name: partyName,
            phone: partyPhone,
            email: partyEmail,
            address: partyAddress,
            openingBalance: partyOpeningBal
          })
        });
      } else {
        await api.request('/api/company/suppliers', {
          method: 'POST',
          body: JSON.stringify({
            name: partyName,
            companyName: partyName,
            phone: partyPhone,
            email: partyEmail,
            address: partyAddress,
            openingBalance: partyOpeningBal
          })
        });
      }

      setShowAddPartyModal(false);
      setPartyName('');
      setPartyPhone('');
      setPartyEmail('');
      setPartyAddress('');
      setPartyOpeningBal(0);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add party');
    }
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            {lang === 'bn' ? 'গ্রাহক ও মহাজনদের খতিয়ান (লেজার)' : 'Customer & Supplier Ledgers'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'ব্যক্তিগত ডেবিট-ক্রেডিট খতিয়ান, চলমান বকেয়া হিসাব এবং প্রিন্টযোগ্য স্টেটমেন্ট।'
              : 'Individual debit & credit ledger statements with running balance tracking and statement printing.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => {
                setTab('customers');
                setSelectedParty(null);
              }}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                tab === 'customers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? `গ্রাহক খতিয়ান (${customers.length})` : `Customer Ledgers (${customers.length})`}
            </button>
            <button
              onClick={() => {
                setTab('suppliers');
                setSelectedParty(null);
              }}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                tab === 'suppliers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? `মহাজন খতিয়ান (${suppliers.length})` : `Supplier Ledgers (${suppliers.length})`}
            </button>
          </div>

          <button
            onClick={() => setShowAddPartyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {tab === 'customers' ? t.addCustomer : t.addSupplier}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Party List on Left, Active Running Statement on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parties List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          <div className="p-3 border-b border-slate-800 bg-slate-800/40">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'bn' ? `${tab === 'customers' ? 'গ্রাহক' : 'মহাজন'} খুঁজুন...` : `Search ${tab}...`}
                className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800 text-xs">
            {tab === 'customers' ? (
              customers
                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
                .map((cust) => {
                  const isSelected = selectedParty?.id === cust.id;
                  return (
                    <button
                      key={cust.id}
                      onClick={() => fetchLedger('CUSTOMER', cust.id, cust.name, cust.currentBalance)}
                      className={`w-full text-left p-3.5 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white">{cust.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{cust.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono tabular-nums font-bold text-rose-400">
                          {formatBDT(cust.currentBalance)}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'বকেয়া পাওনা' : 'Due Receivable'}</div>
                      </div>
                    </button>
                  );
                })
            ) : (
              suppliers
                .filter(s => (s.companyName || s.name).toLowerCase().includes(search.toLowerCase()))
                .map((sup) => {
                  const isSelected = selectedParty?.id === sup.id;
                  return (
                    <button
                      key={sup.id}
                      onClick={() => fetchLedger('SUPPLIER', sup.id, sup.companyName || sup.name, sup.currentBalance)}
                      className={`w-full text-left p-3.5 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white">{sup.companyName || sup.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{sup.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono tabular-nums font-bold text-orange-400">
                          {formatBDT(sup.currentBalance)}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'প্রদেয় দেনা' : 'Payable Balance'}</div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Selected Party Ledger Statement */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          {selectedParty ? (
            <>
              {/* Ledger Statement Header */}
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-800/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">{selectedParty.name}</h2>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                      {lang === 'bn' ? `${selectedParty.type === 'CUSTOMER' ? 'গ্রাহক' : 'মহাজন'} খতিয়ান` : `${selectedParty.type} LEDGER`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'বর্তমান মোট বকেয়া স্থিতি:' : 'Current Outstanding Balance:'}{' '}
                    <strong className="font-mono text-rose-400">{formatBDT(selectedParty.balance)}</strong>
                  </p>
                </div>

                <button
                  onClick={printStatement}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  {lang === 'bn' ? 'স্টেটমেন্ট প্রিন্ট' : 'Print Statement'}
                </button>
              </div>

              {/* Running Ledger Entries Table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">{t.date}</th>
                      <th className="py-2.5 px-3">{lang === 'bn' ? 'রেফারেন্স / ভাউচার' : 'Ref No'}</th>
                      <th className="py-2.5 px-3">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                      <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'ডেবিট (+)' : 'Debit (+)'}</th>
                      <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'ক্রেডিট (-)' : 'Credit (-)'}</th>
                      <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'জের / অবশিষ্ট স্থিতি' : 'Running Balance'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                        <td className="py-2.5 px-3 font-sans text-slate-300">{formatDate(entry.date)}</td>
                        <td className="py-2.5 px-3 text-blue-400 font-bold">{entry.referenceNumber}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-200">{entry.description}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums">
                          {entry.debit > 0 ? formatBDT(entry.debit) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400 tabular-nums">
                          {entry.credit > 0 ? formatBDT(entry.credit) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                          {formatBDT(entry.runningBalance)}
                        </td>
                      </tr>
                    ))}
                    {ledgerEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 italic font-sans">
                          {lang === 'bn' ? 'এই খতিয়ানে এখনো কোনো লেনদেনের তথ্য নেই।' : 'No transaction records logged in this ledger yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileText className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs">
                {lang === 'bn' ? 'বিস্তারিত রানিং খতিয়ান দেখতে বাম পাশ থেকে গ্রাহক বা মহাজন সিলেক্ট করুন।' : 'Select a customer or supplier on the left to view their detailed running ledger.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {lang === 'bn'
                  ? `নতুন ${tab === 'customers' ? 'গ্রাহক' : 'মহাজন / সরবরাহকারী'} নিবন্ধন`
                  : `Register New ${tab === 'customers' ? 'Customer' : 'Supplier'}`}
              </h3>
              <button onClick={() => setShowAddPartyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {tab === 'customers' ? (lang === 'bn' ? 'গ্রাহকের নাম *' : 'Customer Name *') : (lang === 'bn' ? 'মহাজন / প্রতিষ্ঠানের নাম *' : 'Supplier / Company Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: রহিম এন্টারপ্রাইজ' : 'e.g. Rahim Enterprises'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.phone} *</label>
                <input
                  type="text"
                  required
                  value={partyPhone}
                  onChange={(e) => setPartyPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.email}</label>
                <input
                  type="email"
                  value={partyEmail}
                  onChange={(e) => setPartyEmail(e.target.value)}
                  placeholder="contact@email.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.address}</label>
                <input
                  type="text"
                  value={partyAddress}
                  onChange={(e) => setPartyAddress(e.target.value)}
                  placeholder={lang === 'bn' ? 'বাজার / এলাকা / থানা / জেলা' : 'Market / Area / District'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'প্রারম্ভিক বকেয়া ব্যালেন্স (৳)' : 'Opening Balance (৳)'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={partyOpeningBal}
                  onChange={(e) => setPartyOpeningBal(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-sm"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
