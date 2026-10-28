import React, { useState, useEffect } from 'react';
import { Dealer, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT } from '../i18n.ts';
import { Building, PlusCircle, Search, Percent, ShieldCheck, X } from 'lucide-react';

interface DealersViewProps {
  company: Company | null;
  lang: Language;
}

export const DealersView: React.FC<DealersViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [territory, setTerritory] = useState('Dhaka Division');
  const [creditLimit, setCreditLimit] = useState(500000);
  const [commissionRate, setCommissionRate] = useState(5);
  const [priceTier, setPriceTier] = useState<'DEALER' | 'WHOLESALE'>('DEALER');

  const fetchDealers = async () => {
    if (!company?.id) return;
    try {
      const data = await api.request<Dealer[]>('/api/company/dealers');
      setDealers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchDealers();
    }
  }, [company?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/api/company/dealers', {
        method: 'POST',
        body: JSON.stringify({
          dealerName,
          businessName,
          phone,
          email,
          territory,
          creditLimit,
          commissionRate,
          priceTier
        })
      });
      setShowModal(false);
      setDealerName('');
      setBusinessName('');
      setPhone('');
      fetchDealers();
    } catch (err: any) {
      alert(err.message || 'Failed to add dealer');
    }
  };

  const filtered = dealers.filter(d =>
    d.dealerName.toLowerCase().includes(search.toLowerCase()) ||
    d.businessName.toLowerCase().includes(search.toLowerCase()) ||
    d.territory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            {t.dealers}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'পাইকারি পরিবেশক, ডিলার বাকির সীমা, এলাকাভিত্তিক বিক্রয় অঞ্চল ও কমিশন ব্যবস্থাপনা।'
              : 'Manage wholesale distributors, dealer credit ceilings, regional sales territories, and commission schedules.'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {lang === 'bn' ? 'নতুন ডিলার নিবন্ধন' : 'Register New Dealer'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2 max-w-md text-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'bn' ? 'ডিলারের নাম, এজেন্সি, এলাকা দিয়ে খুঁজুন...' : 'Search by dealer name, agency, territory...'}
          className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Dealers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'ডিলার ও প্রতিষ্ঠানের নাম' : 'Dealer & Firm Name'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'অঞ্চল / এলাকা' : 'Territory'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'মূল্য স্তর' : 'Price Tier'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'বাকির সীমা' : 'Credit Limit'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'বর্তমান বকেয়া' : 'Current Due'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'কমিশন হার' : 'Commission Rate'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((dlr) => (
                <tr key={dlr.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{dlr.businessName}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'bn' ? 'স্বত্বাধিকারী: ' : 'Proprietor: '}{dlr.dealerName}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{dlr.territory}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{dlr.phone}</div>
                    {dlr.email && <div className="text-[11px] text-slate-500">{dlr.email}</div>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {dlr.priceTier === 'DEALER' ? (lang === 'bn' ? 'ডিলার রেট' : 'DEALER') : (lang === 'bn' ? 'পাইকারি রেট' : 'WHOLESALE')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                    {formatBDT(dlr.creditLimit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-rose-400">
                    {formatBDT(dlr.currentBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-400">
                    {dlr.commissionRate}%
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
                <Building className="w-4 h-4 text-blue-400" />
                {lang === 'bn' ? 'নতুন ডিলার এজেন্সি নিবন্ধন' : 'Register New Dealer Agency'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ব্যবসা / প্রতিষ্ঠানের নাম *' : 'Business / Firm Name *'}</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: আসলাম মেশিনারি অ্যান্ড স্পেয়ার্স' : 'e.g. Aslam Machinery & Spares'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ডিলার স্বত্বাধিকারীর নাম *' : 'Dealer Proprietor Name *'}</label>
                <input
                  type="text"
                  required
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: হাজী আসলাম হোসেন' : 'e.g. Haji Aslam Hossain'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'নির্ধারিত অঞ্চল / এলাকা' : 'Assigned Territory'}</label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: রাজশাহী বিভাগ' : 'e.g. Rajshahi Division'}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'মূল্য স্তর' : 'Price Tier'}</label>
                  <select
                    value={priceTier}
                    onChange={(e) => setPriceTier(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="DEALER">{lang === 'bn' ? 'ডিলার রেট' : 'Dealer Pricing Tier'}</option>
                    <option value="WHOLESALE">{lang === 'bn' ? 'পাইকারি রেট' : 'Wholesale Volume Tier'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'বাকির সর্বোচ্চ সীমা (৳)' : 'Credit Limit Ceiling (৳)'}</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'কমিশন হার (%)' : 'Commission Rate (%)'}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-sm cursor-pointer"
                >
                  {lang === 'bn' ? 'ডিলার সংরক্ষণ করুন' : 'Save Dealer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
