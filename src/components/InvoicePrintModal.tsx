import React, { useState } from 'react';
import { SalesInvoice, Company } from '../types.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import { Printer, Download, X, FileText, CheckCircle2 } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: SalesInvoice | null;
  company: Company | null;
  onClose: () => void;
  lang?: Language;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  company,
  onClose,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert number to words helper (simplified for BDT)
  const numberInWords = (num: number) => {
    return `${num.toLocaleString('en-IN')} Taka Only`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">{t.memoPreview}</h3>
              <p className="text-xs text-slate-400">{lang === 'bn' ? `চালান নং #${invoice.invoiceNumber} · ${company?.name}` : `Invoice #${invoice.invoiceNumber} · ${company?.name}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  printFormat === 'a4' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.a4Format}
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  printFormat === 'thermal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.thermalFormat}
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              {t.printInvoice}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="p-6 bg-slate-950 flex justify-center overflow-x-auto">
          {printFormat === 'a4' ? (
            /* A4 Document Layout */
            <div
              id="printable-document"
              className="w-[210mm] min-h-[280mm] bg-white text-slate-900 p-10 shadow-lg text-[13px] leading-normal flex flex-col justify-between"
            >
              <div>
                {/* Header: Company Profile */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
                  <div className="flex items-start gap-4">
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 object-contain rounded border border-slate-200 p-1"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl rounded">
                        {company?.name ? company.name.charAt(0) : 'D'}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {company?.name || 'Business Automation System'}
                      </h1>
                      {company?.slogan && (
                        <p className="text-xs font-medium text-slate-600 italic">
                          {company.slogan}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-1">
                        {lang === 'bn' ? 'স্বত্বাধিকারী:' : 'Proprietor:'} <strong>{company?.proprietor}</strong>
                      </p>
                      <p className="text-xs text-slate-600 max-w-sm">
                        {company?.address}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {lang === 'bn' ? 'ফোন:' : 'Phone:'} {company?.phone} · {lang === 'bn' ? 'ইমেইল:' : 'Email:'} {company?.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm tracking-wider uppercase rounded-xs">
                      {lang === 'bn' ? 'বিক্রয় চালান / মেমো' : 'Sales Invoice'}
                    </div>
                    <div className="mt-3 text-xs space-y-1">
                      <p>{t.invoiceNo}: <strong className="font-mono">{invoice.invoiceNumber}</strong></p>
                      <p>{t.date}: <strong>{formatDate(invoice.date)}</strong></p>
                      <p>{t.paymentMethod}: <strong className="uppercase">{lang === 'bn' ? (invoice.paymentMethod === 'CASH' ? 'নগদ' : invoice.paymentMethod === 'BANK' ? 'ব্যাংক' : invoice.paymentMethod === 'BKASH' ? 'বিকাশ' : invoice.paymentMethod === 'NAGAD' ? 'নগদ ওয়ালেট' : 'বাকি') : invoice.paymentMethod}</strong></p>
                      <p>
                        {t.status}:{' '}
                        <span
                          className={`font-bold ${
                            invoice.status === 'PAID'
                              ? 'text-emerald-700'
                              : invoice.status === 'DUE'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {invoice.status === 'PAID' ? t.paid : invoice.status === 'DUE' ? t.due : t.partial}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {lang === 'bn' ? 'ক্রেতা / গ্রাহকের বিবরণ' : 'Bill To Customer'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{invoice.customerName}</h4>
                    {invoice.customerPhone && (
                      <p className="text-slate-700 mt-0.5">{lang === 'bn' ? 'মোবাইল:' : 'Phone:'} {invoice.customerPhone}</p>
                    )}
                    {invoice.customerAddress && (
                      <p className="text-slate-600 mt-0.5">{invoice.customerAddress}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {lang === 'bn' ? 'চালান প্রদানকারী' : 'Issued By'}
                    </span>
                    <p className="font-semibold text-slate-800 mt-1">{lang === 'bn' ? 'বিক্রয় কর্মকর্তা:' : 'Sales Officer:'} {invoice.salesperson}</p>
                    {company?.socialLinks?.website && (
                      <p className="text-slate-600 mt-0.5">{company.socialLinks.website}</p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse border border-slate-300 mb-6">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold text-xs uppercase border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">{lang === 'bn' ? 'পণ্যের বিবরণ' : 'Item Description'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-center">{t.skuBarcode}</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-24 text-right">{t.rate}</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-16 text-center">{t.qty}</th>
                      <th className="py-2.5 px-3 w-28 text-right">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono">{index + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-medium text-slate-900">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono text-[11px] text-slate-600">
                          {item.sku || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-right font-mono tabular-nums">
                          {formatBDT(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {formatBDT(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary Calculation */}
                <div className="flex justify-between items-start gap-8">
                  <div className="max-w-xs text-xs text-slate-600 space-y-2">
                    <p>
                      <strong>{lang === 'bn' ? 'কথায়:' : 'In Words:'}</strong> {lang === 'bn' ? `${invoice.grandTotal.toLocaleString('en-IN')} টাকা মাত্র` : numberInWords(invoice.grandTotal)}
                    </p>
                    {invoice.notes && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                        <strong>{t.notes}:</strong> {invoice.notes}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500">
                      <strong>{lang === 'bn' ? 'শর্তাবলী:' : 'Terms & Conditions:'}</strong> {t.goodsSoldNotice}
                    </div>
                  </div>

                  <div className="w-72 border border-slate-300 divide-y divide-slate-200 text-xs">
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-slate-600">{t.subtotal}:</span>
                      <span className="font-mono tabular-nums">{formatBDT(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between px-3 py-1.5 text-rose-600">
                        <span>{t.discount}:</span>
                        <span className="font-mono tabular-nums">- {formatBDT(invoice.discount)}</span>
                      </div>
                    )}
                    {invoice.tax > 0 && (
                      <div className="flex justify-between px-3 py-1.5">
                        <span className="text-slate-600">{t.vatTax}:</span>
                        <span className="font-mono tabular-nums">+ {formatBDT(invoice.tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-3 py-2 bg-slate-100 font-bold text-sm text-slate-900">
                      <span>{t.grandTotal}:</span>
                      <span className="font-mono tabular-nums">{formatBDT(invoice.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5 text-emerald-700 font-medium">
                      <span>{t.amountPaid}:</span>
                      <span className="font-mono tabular-nums">{formatBDT(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5 font-bold text-rose-700">
                      <span>{t.dueBalance}:</span>
                      <span className="font-mono tabular-nums">{formatBDT(invoice.outstandingBalance)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Signatures & Seal Footer */}
              <div className="mt-16 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1"></div>
                  <p className="text-slate-600 font-medium">{t.customerSignature}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                    {lang === 'bn' ? 'সিল' : 'Seal'}
                  </div>
                  <p className="text-slate-500 text-[10px]">{lang === 'bn' ? 'প্রতিষ্ঠানের অফিসিয়াল সিল' : 'Company Official Seal'}</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1"></div>
                  <p className="text-slate-600 font-medium">{t.authorizedSignature}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Thermal 80mm POS Receipt Layout */
            <div
              id="printable-document"
              className="w-[80mm] bg-white text-slate-900 p-4 shadow-lg text-[11px] leading-tight font-mono"
            >
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h2 className="font-bold text-sm tracking-tight">{company?.name}</h2>
                {company?.slogan && <p className="text-[10px] text-slate-600">{company.slogan}</p>}
                <p className="text-[10px] text-slate-600 mt-1">{company?.address}</p>
                <p className="text-[10px] text-slate-600">{lang === 'bn' ? 'মোবাইল:' : 'Mob:'} {company?.phone}</p>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider">
                  *** {lang === 'bn' ? 'ক্যাশ মেমো' : 'CASH MEMO'} ***
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>{t.invoiceNo}: {invoice.invoiceNumber}</span>
                  <span>{invoice.date}</span>
                </div>
                <div>{t.customer}: {invoice.customerName}</div>
                {invoice.customerPhone && <div>{lang === 'bn' ? 'মোবাইল:' : 'Phone:'} {invoice.customerPhone}</div>}
                <div>{lang === 'bn' ? 'বিক্রয়কর্মী:' : 'Salesperson:'} {invoice.salesperson}</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold pb-1 text-[10px]">
                  <span>{lang === 'bn' ? 'পণ্য / পরিমাণ' : 'ITEM / QTY'}</span>
                  <span>{lang === 'bn' ? 'মোট' : 'TOTAL'}</span>
                </div>
                {invoice.items.map((item, i) => (
                  <div key={i} className="py-0.5">
                    <div className="font-semibold text-[10px]">{item.productName}</div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>{item.quantity} x {item.unitPrice}</span>
                      <span>{formatBDT(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>{t.subtotal}:</span>
                  <span>{formatBDT(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>{t.discount}:</span>
                    <span>- {formatBDT(invoice.discount)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span>{t.vatTax}:</span>
                    <span>+ {formatBDT(invoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>{t.grandTotal}:</span>
                  <span>{formatBDT(invoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>{t.amountPaid}:</span>
                  <span>{formatBDT(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-700">
                  <span>{t.dueBalance}:</span>
                  <span>{formatBDT(invoice.outstandingBalance)}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-600">
                <p>{lang === 'bn' ? 'আমাদের সাথে ব্যবসার জন্য ধন্যবাদ!' : 'Thank you for your business!'}</p>
                <p className="text-[9px] mt-0.5">{t.softwareBy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
