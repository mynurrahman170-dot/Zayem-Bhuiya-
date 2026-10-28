import React, { useState, useEffect } from 'react';
import { Company, SalesInvoice, PurchaseInvoice, Product, Expense, Customer, Supplier } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import { FileBarChart2, Download, Printer, Filter, Calendar } from 'lucide-react';

interface ReportsViewProps {
  company: Company | null;
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [reportType, setReportType] = useState<'sales' | 'purchases' | 'stock' | 'expenses' | 'dues'>('sales');
  const [sales, setSales] = useState<SalesInvoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?.id) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [s, p, pr, e, c] = await Promise.all([
          api.request<SalesInvoice[]>('/api/company/sales'),
          api.request<PurchaseInvoice[]>('/api/company/purchases'),
          api.request<Product[]>('/api/company/products'),
          api.request<Expense[]>('/api/company/expenses'),
          api.request<Customer[]>('/api/company/customers')
        ]);
        setSales(s);
        setPurchases(p);
        setProducts(pr);
        setExpenses(e);
        setCustomers(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [company?.id]);

  const exportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'sales') {
      headers = ['Invoice Number', 'Date', 'Customer Name', 'Grand Total (BDT)', 'Amount Paid (BDT)', 'Due (BDT)', 'Status'];
      rows = sales.map(s => [s.invoiceNumber, s.date, s.customerName, s.grandTotal, s.amountPaid, s.outstandingBalance, s.status]);
    } else if (reportType === 'purchases') {
      headers = ['Bill Number', 'Date', 'Supplier Name', 'Grand Total (BDT)', 'Amount Paid (BDT)', 'Outstanding Due (BDT)', 'Status'];
      rows = purchases.map(p => [p.invoiceNumber, p.date, p.supplierName, p.grandTotal, p.amountPaid, p.outstandingBalance, p.status]);
    } else if (reportType === 'stock') {
      headers = ['Product Name', 'SKU', 'Category', 'Purchase Price (BDT)', 'Selling Price (BDT)', 'Current Stock', 'Stock Valuation (BDT)'];
      rows = products.map(p => [p.name, p.sku, p.category, p.purchasePrice, p.sellingPrice, p.currentStock, p.currentStock * p.purchasePrice]);
    } else if (reportType === 'expenses') {
      headers = ['Date', 'Category', 'Description', 'Payee', 'Amount (BDT)'];
      rows = expenses.map(e => [e.date, e.category, e.description, e.payee, e.amount]);
    } else if (reportType === 'dues') {
      headers = ['Customer Name', 'Phone', 'Address', 'Outstanding Due Receivable (BDT)', 'Credit Limit'];
      rows = customers.filter(c => c.currentBalance > 0).map(c => [c.name, c.phone, c.address || '', c.currentBalance, c.creditLimit]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-blue-400" />
            {t.reports}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'অডিট-মানের ব্যবসায়িক বিশ্লেষণ, স্টক মূল্যায়ন রিপোর্ট, গ্রাহক বকেয়া এবং এক্সেল/সিএসভি ডাউনলোড।'
              : 'Audit-grade business analytics, stock valuation reports, customer dues, and CSV spreadsheet exports.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {lang === 'bn' ? 'এক্সেল/সিএসভি ডাউনলোড' : 'Export CSV Spreadsheet'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {lang === 'bn' ? 'রিপোর্ট প্রিন্ট' : 'Print Report'}
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setReportType('sales')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            reportType === 'sales' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? 'বিক্রয় ও আয় রিপোর্ট' : 'Sales & Revenue Report'}
        </button>
        <button
          onClick={() => setReportType('purchases')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            reportType === 'purchases' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? 'ক্রয় ও চালান রিপোর্ট' : 'Purchase & Consignment Report'}
        </button>
        <button
          onClick={() => setReportType('stock')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            reportType === 'stock' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? 'মজুদ পণ্য ও স্টক মূল্যায়ন' : 'Stock Inventory & Valuation'}
        </button>
        <button
          onClick={() => setReportType('dues')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            reportType === 'dues' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? 'গ্রাহক বকেয়া রিপোর্ট' : 'Customer Dues & Receivables'}
        </button>
        <button
          onClick={() => setReportType('expenses')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            reportType === 'expenses' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? 'পরিচালন ব্যয় বিশ্লেষণ' : 'Operating Expense Breakdown'}
        </button>
      </div>

      {/* Report Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {reportType === 'sales' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'চালান নম্বর' : 'Invoice #'}</th>
                  <th className="py-2.5 px-4">{t.date}</th>
                  <th className="py-2.5 px-4">{t.customer}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'উপমোট' : 'Subtotal'}</th>
                  <th className="py-2.5 px-4 text-right">{t.vat}</th>
                  <th className="py-2.5 px-4 text-right">{t.grandTotal}</th>
                  <th className="py-2.5 px-4 text-right">{t.paidAmount}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'বকেয়া' : 'Outstanding Due'}</th>
                  <th className="py-2.5 px-4 text-center">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                    <td className="py-2.5 px-4 font-bold text-white">{s.invoiceNumber}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">{formatDate(s.date)}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-200">{s.customerName}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">{formatBDT(s.subtotal)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{formatBDT(s.tax)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-white">{formatBDT(s.grandTotal)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-emerald-400">{formatBDT(s.amountPaid)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-rose-400 font-bold">{formatBDT(s.outstandingBalance)}</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : s.status === 'DUE' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {s.status === 'PAID' ? t.paid : s.status === 'DUE' ? t.due : t.partial}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'purchases' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'বিল নম্বর' : 'Bill #'}</th>
                  <th className="py-2.5 px-4">{t.date}</th>
                  <th className="py-2.5 px-4">{t.supplier}</th>
                  <th className="py-2.5 px-4 text-right">{t.grandTotal}</th>
                  <th className="py-2.5 px-4 text-right">{t.paidAmount}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'বকেয়া' : 'Outstanding Due'}</th>
                  <th className="py-2.5 px-4 text-center">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                    <td className="py-2.5 px-4 font-bold text-white">{p.invoiceNumber}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">{formatDate(p.date)}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-200">{p.supplierName}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-white">{formatBDT(p.grandTotal)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-emerald-400">{formatBDT(p.amountPaid)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-rose-400 font-bold">{formatBDT(p.outstandingBalance)}</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : p.status === 'DUE' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {p.status === 'PAID' ? t.paid : p.status === 'DUE' ? t.due : t.partial}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'stock' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'পণ্যের নাম' : 'Item Name'}</th>
                  <th className="py-2.5 px-4 font-mono">{lang === 'bn' ? 'এসকেইউ (SKU)' : 'SKU'}</th>
                  <th className="py-2.5 px-4">{t.category}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'ক্রয় মূল্য (৳)' : 'Cost Price (৳)'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'বিক্রয় মূল্য (৳)' : 'Selling Price (৳)'}</th>
                  <th className="py-2.5 px-4 text-center">{lang === 'bn' ? 'মজুদ' : 'In Stock'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'স্টক মূল্য (৳)' : 'Stock Valuation (৳)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-white">{p.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-2.5 px-4 text-slate-300">{p.category}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-300">{formatBDT(p.purchasePrice)}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-400">{formatBDT(p.sellingPrice)}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-white">{p.currentStock} {p.unit}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-cyan-300">
                      {formatBDT(p.currentStock * p.purchasePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'dues' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}</th>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</th>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'ঠিকানা' : 'Address'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'বাকির সীমা' : 'Credit Limit'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'মোট বকেয়া পাওনা (টাকা)' : 'Total Outstanding Due (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-white">{c.name}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-mono">{c.phone}</td>
                    <td className="py-2.5 px-4 text-slate-400">{c.address || '—'}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-300">{formatBDT(c.creditLimit)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-rose-400">
                      {formatBDT(c.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'expenses' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">{t.date}</th>
                  <th className="py-2.5 px-4">{t.category}</th>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'বিবরণ' : 'Particulars'}</th>
                  <th className="py-2.5 px-4">{lang === 'bn' ? 'গ্রহীতা' : 'Payee'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-300 font-sans">{formatDate(e.date)}</td>
                    <td className="py-2.5 px-4 text-blue-400 font-semibold">{e.category}</td>
                    <td className="py-2.5 px-4 text-white font-medium">{e.description}</td>
                    <td className="py-2.5 px-4 text-slate-300">{e.payee}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-400 tabular-nums">
                      {formatBDT(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
