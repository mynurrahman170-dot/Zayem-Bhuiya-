import React, { useState, useEffect } from 'react';
import { Product, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT } from '../i18n.ts';
import {
  Package,
  PlusCircle,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Barcode,
  Edit,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

interface ProductsViewProps {
  company: Company | null;
  lang: Language;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stock count verification');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Product form
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Electronics',
    brand: '',
    unit: 'Pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    dealerPrice: 0,
    openingStock: 0,
    minStockThreshold: 5
  });

  const fetchProducts = async () => {
    if (!company?.id) return;
    try {
      const data = await api.request<Product[]>('/api/company/products');
      setProducts(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchProducts();
    }
  }, [company?.id]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.request<Product>('/api/company/products', {
        method: 'POST',
        body: JSON.stringify(newProd)
      });
      setStatusMsg({ type: 'success', text: `Product "${newProd.name}" added to inventory.` });
      setShowAddModal(false);
      setNewProd({
        name: '',
        sku: '',
        barcode: '',
        category: 'Electronics',
        brand: '',
        unit: 'Pcs',
        purchasePrice: 0,
        sellingPrice: 0,
        wholesalePrice: 0,
        dealerPrice: 0,
        openingStock: 0,
        minStockThreshold: 5
      });
      fetchProducts();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to add product.' });
    }
  };

  const handleAdjustStock = async () => {
    if (!showAdjustModal || adjustQty === 0) return;
    setStatusMsg(null);
    try {
      await api.request('/api/company/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: showAdjustModal.id,
          adjustmentQuantity: adjustQty,
          reason: adjustReason
        })
      });
      setStatusMsg({ type: 'success', text: `Stock adjusted for "${showAdjustModal.name}".` });
      setShowAdjustModal(null);
      setAdjustQty(0);
      fetchProducts();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to adjust stock.' });
    }
  };

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(s) ||
      (p.sku ? p.sku.toLowerCase().includes(s) : false) ||
      (p.barcode ? p.barcode.toLowerCase().includes(s) : false) ||
      p.category.toLowerCase().includes(s);
    if (filterLowStock) {
      return matchSearch && p.currentStock <= p.minStockThreshold;
    }
    return matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            {t.products}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'পণ্য তালিকা, বারকোড/এসকেইউ, পাইকারি ও ডিলার মূল্য এবং রিয়েল-টাইম স্টক পরিচালনা।'
              : 'Manage product catalog, barcode SKUs, wholesale/dealer pricing tiers, and real-time inventory.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t.addProduct}
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
            placeholder={lang === 'bn' ? 'পণ্যের নাম, এসকেইউ কোড, ক্যাটাগরি দিয়ে খুঁজুন...' : 'Search by product name, SKU code, category...'}
            className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              filterLowStock
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'শুধু স্বল্প মজুদের পণ্য' : 'Low Stock Only'}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'পণ্যের নাম ও বিবরণ' : 'Item & Category'}</th>
                <th className="py-3 px-4 font-mono">{lang === 'bn' ? 'এসকেইউ / বারকোড' : 'SKU / Barcode'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'ক্রয় খরচ' : 'Purchase Cost'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'খুচরা বিক্রয় মূল্য' : 'Retail Price'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'ডিলার মূল্য' : 'Dealer Price'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'স্টক পরিমাণ' : 'Stock Level'}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((prod) => {
                const isLow = prod.currentStock <= prod.minStockThreshold;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {prod.category} · {prod.brand || (lang === 'bn' ? 'সাধারণ' : 'Generic')} ({prod.unit})
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div>
                        {prod.sku ? (
                          <span>{prod.sku}</span>
                        ) : (
                          <span className="text-slate-500 font-sans text-[11px]">{lang === 'bn' ? '— (ঐচ্ছিক)' : '— (None)'}</span>
                        )}
                      </div>
                      {prod.barcode ? (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3 h-3 text-slate-500" /> {prod.barcode}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-600 italic">
                          {lang === 'bn' ? 'বারকোড নেই' : 'No barcode'}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {formatBDT(prod.purchasePrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-400">
                      {formatBDT(prod.sellingPrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-400">
                      {formatBDT(prod.dealerPrice || prod.sellingPrice * 0.9)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {prod.currentStock} {prod.unit}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setShowAdjustModal(prod);
                          setAdjustQty(0);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 transition-colors"
                      >
                        {lang === 'bn' ? 'স্টক সমন্বয়' : 'Adjust Stock'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl my-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-400" />
                {lang === 'bn' ? 'নতুন পণ্য ইনভেন্টরিতে যুক্ত করুন' : 'Add New Inventory Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'পণ্যের নাম *' : 'Product Name *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'যেমন: এলইডি স্মার্ট টিভি ৩২ ইঞ্চি' : 'e.g. Wireless Router 1200Mbps'}
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'এসকেইউ কোড (ঐচ্ছিক)' : 'SKU Code (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'ঐচ্ছিক - খালি রাখতে পারেন' : 'Optional - can be left blank'}
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {lang === 'bn' ? 'বারকোড (ঐচ্ছিক)' : 'Barcode (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'ঐচ্ছিক - স্ক্যান বা খালি রাখুন' : 'Optional - scan or leave blank'}
                    value={newProd.barcode}
                    onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <input
                    type="text"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'পরিমাপের একক' : 'Unit of Measure'}</label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="Pcs">{lang === 'bn' ? 'পিস / সংখ্যা (Pcs)' : 'Pieces (Pcs)'}</option>
                    <option value="Kg">{lang === 'bn' ? 'কেজি (Kg)' : 'Kilogram (Kg)'}</option>
                    <option value="Box">{lang === 'bn' ? 'বক্স / কার্টন' : 'Box / Carton'}</option>
                    <option value="Meter">{lang === 'bn' ? 'মিটার' : 'Meter'}</option>
                    <option value="Litre">{lang === 'bn' ? 'লিটার' : 'Litre'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ক্রয় মূল্য (৳) *' : 'Purchase Cost (৳) *'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newProd.purchasePrice}
                    onChange={(e) => setNewProd({ ...newProd, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'খুচরা বিক্রয় মূল্য (৳) *' : 'Retail Selling Price (৳) *'}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newProd.sellingPrice}
                    onChange={(e) => setNewProd({ ...newProd, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ডিলার মূল্য (৳)' : 'Dealer Price (৳)'}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProd.dealerPrice}
                    onChange={(e) => setNewProd({ ...newProd, dealerPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'পাইকারি মূল্য (৳)' : 'Wholesale Price (৳)'}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProd.wholesalePrice}
                    onChange={(e) => setNewProd({ ...newProd, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'প্রারম্ভিক স্টক সংখ্যা' : 'Opening Stock Quantity'}</label>
                  <input
                    type="number"
                    min="0"
                    value={newProd.openingStock}
                    onChange={(e) => setNewProd({ ...newProd, openingStock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'স্বল্প স্টক সতর্কতা মাত্রা' : 'Low Stock Alert Level'}</label>
                  <input
                    type="number"
                    min="1"
                    value={newProd.minStockThreshold}
                    onChange={(e) => setNewProd({ ...newProd, minStockThreshold: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-sm"
                >
                  {lang === 'bn' ? 'পণ্য সংরক্ষণ করুন' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              {lang === 'bn' ? `স্টক সমন্বয়: ${showAdjustModal.name}` : `Stock Adjustment: ${showAdjustModal.name}`}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'রেকর্ডে বর্তমান স্টক: ' : 'Current stock on record: '}<strong className="text-white font-mono">{showAdjustModal.currentStock} {showAdjustModal.unit}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? 'সমন্বয় পরিমাণ (+ বাড়াতে, - কমাতে)' : 'Quantity (+ to add, - to deduct)'}
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +5 or -2"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'কারণ / মন্তব্য' : 'Reason / Notes'}</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: ফিজিক্যাল স্টক গণনা বা বিনষ্ট' : 'e.g. Physical inventory count correction'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAdjustModal(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAdjustStock}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs"
              >
                {lang === 'bn' ? 'সমন্বয় প্রয়োগ করুন' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
