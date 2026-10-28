import React, { useState, useEffect } from 'react';
import { PurchaseInvoice, Product, Supplier, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import {
  Truck,
  PlusCircle,
  Search,
  DollarSign,
  Trash2,
  Package,
  CheckCircle2,
  X
} from 'lucide-react';

interface PurchasesViewProps {
  company: Company | null;
  lang: Language;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Purchase State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [items, setItems] = useState<{ productId: string; productName: string; quantity: number; unitCost: number }[]>([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'CREDIT'>('BANK');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    if (!company?.id) return;
    try {
      const [pos, prods, sups] = await Promise.all([
        api.request<PurchaseInvoice[]>('/api/company/purchases'),
        api.request<Product[]>('/api/company/products'),
        api.request<Supplier[]>('/api/company/suppliers')
      ]);
      setPurchases(pos);
      setProducts(prods);
      setSuppliers(sups);
    } catch (e) {
      console.error(e);
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
        unitCost: prod.purchasePrice
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

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const grandTotal = subtotal;
  const due = Math.max(0, grandTotal - amountPaid);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setStatusMsg({ type: 'error', text: 'Select at least one product item.' });
      return;
    }

    try {
      const po = await api.request<PurchaseInvoice>('/api/company/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplierId: selectedSupplierId || undefined,
          supplierName: supplierName || 'General Supplier',
          supplierPhone,
          items,
          discount: 0,
          tax: 0,
          additionalCharges: 0,
          amountPaid,
          paymentMethod,
          notes
        })
      });

      setStatusMsg({ type: 'success', text: `Purchase invoice ${po.invoiceNumber} recorded successfully!` });
      setShowModal(false);
      setItems([]);
      fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to record purchase.' });
    }
  };

  const filtered = purchases.filter(p =>
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            {t.purchases}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'মহাজন বা সরবরাহকারী থেকে পণ্য চালান এন্ট্রি, বকেয়া পরিশোধ এবং স্বয়ংক্রিয় স্টক আপডেট।'
              : 'Log inventory consignments from suppliers, manage commercial payables, and update product stocks automatically.'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setAmountPaid(0);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t.createPurchase}
        </button>
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
          placeholder={lang === 'bn' ? 'ক্রয় বিল নং, মহাজনের নাম দিয়ে খুঁজুন...' : 'Search by purchase bill #, supplier...'}
          className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Purchases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.billNo}</th>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{t.supplier}</th>
                <th className="py-3 px-4 text-right">{t.grandTotal}</th>
                <th className="py-3 px-4 text-right">{t.paidAmount}</th>
                <th className="py-3 px-4 text-right">{t.payableBalance}</th>
                <th className="py-3 px-4 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">{po.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-300">{formatDate(po.date)}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{po.supplierName}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-white">
                    {formatBDT(po.grandTotal)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                    {formatBDT(po.amountPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-400 font-bold">
                    {formatBDT(po.outstandingBalance)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl my-6 text-xs text-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                {lang === 'bn' ? 'সরবরাহকারী থেকে নতুন ক্রয় ভাউচার' : 'Record Supplier Purchase Consignment'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700/80">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'মহাজন / সরবরাহকারী নির্বাচন' : 'Select Supplier'}</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => {
                      setSelectedSupplierId(e.target.value);
                      const sup = suppliers.find(s => s.id === e.target.value);
                      if (sup) {
                        setSupplierName(sup.companyName || sup.name);
                        setSupplierPhone(sup.phone || '');
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="">{lang === 'bn' ? '-- পূর্বের মহাজন নির্বাচন বা নিচে লিখুন --' : '-- Choose Existing Supplier or Enter Below --'}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName || s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.supplierName}</label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'যেমন: ঢাকা ইলেক্ট্রনিক্স ডিস্ট্রিবিউটর' : 'e.g. Dhaka Electronics Distributor'}
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Add item */}
              <div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-medium"
                >
                  <option value="">{lang === 'bn' ? '+ চালানভুক্ত পণ্য নির্বাচন করুন...' : '+ Add product received from supplier...'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({lang === 'bn' ? 'বর্তমান মজুদ:' : 'Current:'} {p.currentStock} {p.unit}) — {lang === 'bn' ? 'ক্রয়মূল্য:' : 'Cost:'} ৳{p.purchasePrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">{t.productName}</th>
                      <th className="py-2 px-3 w-20 text-center">{lang === 'bn' ? 'প্রাপ্ত সংখ্যা' : 'Qty Received'}</th>
                      <th className="py-2 px-3 w-28 text-right">{lang === 'bn' ? 'একক ক্রয়মূল্য (৳)' : 'Unit Cost (৳)'}</th>
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
                            value={it.unitCost}
                            onChange={(e) => handleUpdateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-right font-mono"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-white">
                          {formatBDT(it.quantity * it.unitCost)}
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
                  </tbody>
                </table>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700 font-mono">
                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1 text-xs">{lang === 'bn' ? 'পরিশোধের মাধ্যম / অ্যাকাউন্ট' : 'Payment Account / Channel'}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="BANK">{lang === 'bn' ? 'ব্র্যাক ব্যাংক চলতি হিসাব' : 'BRAC Bank Current A/C'}</option>
                    <option value="CASH">{lang === 'bn' ? 'নগদ ড্রয়ার' : 'Cash in Hand'}</option>
                    <option value="BKASH">{lang === 'bn' ? 'বিকাশ মার্চেন্ট' : 'bKash Merchant'}</option>
                    <option value="CREDIT">{lang === 'bn' ? 'বকেয়া হিসাব (পরবর্তীতে প্রদেয়)' : 'Pay Later (Payable Due)'}</option>
                  </select>
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{lang === 'bn' ? 'মোট বিল:' : 'Total Bill:'}</span>
                    <span className="text-white font-bold">{formatBDT(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{lang === 'bn' ? 'প্রদত্ত অর্থ:' : 'Paid Now:'}</span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-emerald-400 font-bold"
                    />
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold border-t border-slate-700 pt-1">
                    <span>{t.payableBalance}:</span>
                    <span>{formatBDT(due)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-sm"
                >
                  {lang === 'bn' ? 'ক্রয় নিশ্চিত করুন ও স্টক যুক্ত করুন' : 'Confirm Purchase & Receive Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
