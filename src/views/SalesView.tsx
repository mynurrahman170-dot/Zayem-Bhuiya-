import React, { useState, useEffect } from 'react';
import { SalesInvoice, Product, Customer, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import {
  ShoppingCart,
  PlusCircle,
  Search,
  Printer,
  DollarSign,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  X
} from 'lucide-react';

interface SalesViewProps {
  company: Company | null;
  lang: Language;
  onOpenInvoiceModal: (invoice: SalesInvoice) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  company,
  lang,
  onOpenInvoiceModal
}) => {
  const t = translations[lang];
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'DUE'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invoice Creator State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<{ productId: string; productName: string; quantity: number; unitPrice: number; discount: number }[]>([]);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [applyVat, setApplyVat] = useState(true);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'CREDIT'>('CASH');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  const fetchData = async () => {
    if (!company?.id) return;
    try {
      const [invs, prods, custs] = await Promise.all([
        api.request<SalesInvoice[]>('/api/company/sales'),
        api.request<Product[]>('/api/company/products'),
        api.request<Customer[]>('/api/company/customers')
      ]);
      setInvoices(invs);
      setProducts(prods.filter(p => p.status === 'ACTIVE'));
      setCustomers(custs);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchData();
    }
  }, [company?.id]);

  const handleAddItem = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        discount: 0
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: string, val: number) => {
    setItems(prev => {
      const copy = [...prev];
      (copy[index] as any)[field] = val;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice) - item.discount, 0);
  const vatRate = company?.taxVatPercent ? company.taxVatPercent / 100 : 0.05;
  const tax = applyVat ? Math.round(subtotal * vatRate) : 0;
  const grandTotal = Math.max(0, subtotal - overallDiscount + tax);
  const due = Math.max(0, grandTotal - amountPaid);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please add at least one product item to create an invoice.' });
      return;
    }

    setStatusMsg(null);
    try {
      const created = await api.request<SalesInvoice>('/api/company/sales', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId || undefined,
          customerName: customerName || 'Walk-in Customer',
          customerPhone,
          customerAddress,
          items,
          discount: overallDiscount,
          tax,
          amountPaid,
          paymentMethod,
          notes: invoiceNotes
        })
      });

      setStatusMsg({ type: 'success', text: `Invoice ${created.invoiceNumber} generated successfully!` });
      setShowCreateModal(false);
      setItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setSelectedCustomerId('');
      setAmountPaid(0);
      fetchData();
      onOpenInvoiceModal(created);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create sales invoice.' });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerPhone.includes(search);
    if (statusFilter === 'ALL') return matchSearch;
    return matchSearch && inv.status === statusFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            {t.sales}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'পয়েন্ট অব সেল (পিওএস) বিক্রয় চালান তৈরি, আংশিক অর্থ সংগ্রহ এবং মেমো প্রিন্ট করুন।'
              : 'Create Point-of-Sale (POS) customer invoices, track partial collections, and print official memos.'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            setAmountPaid(0);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t.createInvoice}
        </button>
      </div>

      {/* Notifications */}
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

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'চালান নম্বর, গ্রাহকের নাম, মোবাইল নম্বর দিয়ে খুঁজুন...' : 'Search by invoice #, customer name, mobile...'}
            className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          {(['ALL', 'PAID', 'PARTIAL', 'DUE'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'ALL' ? (lang === 'bn' ? 'সকল' : 'ALL') : s === 'PAID' ? t.paid : s === 'PARTIAL' ? t.partial : t.due}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.invoiceNo}</th>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{t.customer}</th>
                <th className="py-3 px-4 text-right">{t.grandTotal}</th>
                <th className="py-3 px-4 text-right">{t.paidAmount}</th>
                <th className="py-3 px-4 text-right">{t.dueBalance}</th>
                <th className="py-3 px-4 text-center">{t.paymentMethod}</th>
                <th className="py-3 px-4 text-center">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.print}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {formatDate(inv.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{inv.customerName}</div>
                    {inv.customerPhone && (
                      <div className="text-[11px] text-slate-400">{inv.customerPhone}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-white">
                    {formatBDT(inv.grandTotal)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                    {formatBDT(inv.amountPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-400 font-bold">
                    {formatBDT(inv.outstandingBalance)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono uppercase text-[10px] text-slate-300">
                    {inv.paymentMethod === 'CASH' ? (lang === 'bn' ? 'নগদ' : 'CASH') : inv.paymentMethod === 'BANK' ? (lang === 'bn' ? 'ব্যাংক' : 'BANK') : inv.paymentMethod === 'BKASH' ? 'বিকাশ' : inv.paymentMethod === 'NAGAD' ? 'নগদ' : (lang === 'bn' ? 'বাকি' : 'CREDIT')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inv.status === 'DUE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inv.status === 'PAID' ? t.paid : inv.status === 'DUE' ? t.due : t.partial}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenInvoiceModal(inv)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white rounded text-[11px] font-medium border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'দেখুন / প্রিন্ট' : 'View / Print'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS / Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl my-6 text-xs text-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-400" />
                {lang === 'bn' ? 'বিক্রয় চালান ও ক্যাশ মেমো তৈরি' : 'Generate Sales Invoice'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Customer Selector */}
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'গ্রাহক নির্বাচন করুন' : 'Select Customer'}</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      const cust = customers.find(c => c.id === e.target.value);
                      if (cust) {
                        setCustomerName(cust.name);
                        setCustomerPhone(cust.phone);
                        setCustomerAddress(cust.address || '');
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="">{lang === 'bn' ? '-- সাধারণ / নতুন ক্রেতা --' : '-- Walk-in / New Customer --'}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.customerName}</label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.phone}</label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile number'}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Product Selector Bar */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-medium"
                >
                  <option value="">{lang === 'bn' ? '+ ইনভেন্টরি থেকে চালানে পণ্য যুক্ত করুন...' : '+ Click to add item to invoice from inventory...'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({lang === 'bn' ? 'মজুদ:' : 'Stock:'} {p.currentStock} {p.unit}) — ৳{p.sellingPrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">{t.productName}</th>
                      <th className="py-2 px-3 w-20 text-center">{t.quantity}</th>
                      <th className="py-2 px-3 w-28 text-right">{t.rate} (৳)</th>
                      <th className="py-2 px-3 w-24 text-right">{t.total}</th>
                      <th className="py-2 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-white">{it.productName}</td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={it.unitPrice}
                            onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-right font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                          {formatBDT((it.quantity * it.unitPrice) - it.discount)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                          {lang === 'bn' ? 'কোনো পণ্য নির্বাচন করা হয়নি। উপরের তালিকা থেকে পণ্য সিলেক্ট করুন।' : 'No products selected yet. Select a product above to add items.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Summary & Payment Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{t.paymentMethod}</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white uppercase font-mono"
                    >
                      <option value="CASH">{lang === 'bn' ? 'কাউন্টার নগদ গ্রহণ' : 'Cash in Hand'}</option>
                      <option value="BANK">{lang === 'bn' ? 'ব্যাংক ট্রান্সফার / চেক' : 'Bank Transfer / Cheque'}</option>
                      <option value="BKASH">{lang === 'bn' ? 'বিকাশ মার্চেন্ট' : 'bKash Merchant'}</option>
                      <option value="NAGAD">{lang === 'bn' ? 'নগদ মার্চেন্ট' : 'Nagad Merchant'}</option>
                      <option value="CREDIT">{lang === 'bn' ? 'সম্পূর্ণ বাকি (খতিয়ান)' : 'Full Credit (Receivable)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'চালানের শর্তাবলী / মেমো নোট' : 'Invoice Notes / Memo Terms'}</label>
                    <textarea
                      rows={2}
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: ৭ দিনের ওয়ারেন্টি প্রযোজ্য' : 'e.g. 7 days warranty, payment due in 10 days'}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>{t.subtotal}:</span>
                    <span>{formatBDT(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>{t.discount} (৳):</span>
                    <input
                      type="number"
                      min="0"
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono"
                    />
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyVat}
                        onChange={(e) => setApplyVat(e.target.checked)}
                      />
                      <span>{t.taxVat} ({company?.taxVatPercent ?? 5}%):</span>
                    </label>
                    <span>{formatBDT(tax)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-700">
                    <span>{t.grandTotal}:</span>
                    <span className="text-emerald-400">{formatBDT(grandTotal)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-700">
                    <span className="text-slate-300">{t.paidAmount} (৳):</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="flex justify-between text-rose-400 font-bold">
                    <span>{t.dueBalance}:</span>
                    <span>{formatBDT(due)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-sm"
                >
                  {lang === 'bn' ? 'চালান সংরক্ষণ ও প্রিন্ট করুন' : 'Save & Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
