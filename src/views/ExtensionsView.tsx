import React, { useState, useEffect } from 'react';
import { Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT } from '../i18n.ts';
import {
  UtensilsCrossed,
  Bed,
  Car,
  Factory,
  CheckCircle,
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';

interface ExtensionsViewProps {
  company: Company | null;
  lang: Language;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [activeModule, setActiveModule] = useState<'restaurant' | 'hotel' | 'vehicle' | 'manufacturing'>('restaurant');
  const [extData, setExtData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Set default module based on company's category if available
  useEffect(() => {
    if (company?.businessCategory === 'restaurant') setActiveModule('restaurant');
    else if (company?.businessCategory === 'hotel') setActiveModule('hotel');
    else if (company?.businessCategory === 'vehicle') setActiveModule('vehicle');
    else if (company?.businessCategory === 'manufacturing') setActiveModule('manufacturing');
  }, [company]);

  const fetchExtensions = async () => {
    if (!company?.id) return;
    try {
      setLoading(true);
      const res = await api.request<any>('/api/company/extensions');
      setExtData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchExtensions();
    }
  }, [company?.id]);

  const handleTableToggle = async (tableId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    try {
      await api.request('/api/company/extensions/restaurant/table-status', {
        method: 'POST',
        body: JSON.stringify({
          tableId,
          status: nextStatus,
          guestCount: nextStatus === 'OCCUPIED' ? 2 : 0
        })
      });
      fetchExtensions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoomToggle = async (roomId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'OCCUPIED' : (currentStatus === 'OCCUPIED' ? 'CLEANING' : 'AVAILABLE');
    try {
      await api.request('/api/company/extensions/hotel/room-status', {
        method: 'POST',
        body: JSON.stringify({
          roomId,
          status: nextStatus,
          guestName: nextStatus === 'OCCUPIED' ? 'Guest Walk-in' : ''
        })
      });
      fetchExtensions();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            {lang === 'bn' ? 'ব্যবসা ক্যাটাগরিভিত্তিক বিশেষায়িত এক্সটেনশন' : 'Specialized Business Category Extensions'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'রেস্তোরাঁ (কেটি ও টেবিল), হোটেল (রুম বুকিং), যানবাহন ফ্লিট ও উৎপাদন (BOM) মডিউল।'
              : 'Pre-integrated vertical extensions for Restaurants (KOT), Hotels (Rooms), Vehicle Fleet, and Manufacturing (BOM).'}
          </p>
        </div>

        {/* Module Picker */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveModule('restaurant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeModule === 'restaurant' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'রেস্তোরাঁ (KOT)' : 'Restaurant (KOT)'}
          </button>
          <button
            onClick={() => setActiveModule('hotel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeModule === 'hotel' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'হোটেল ও রুম' : 'Hotel & Rooms'}
          </button>
          <button
            onClick={() => setActiveModule('vehicle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeModule === 'vehicle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'যানবাহন ফ্লিট' : 'Vehicle Fleet'}
          </button>
          <button
            onClick={() => setActiveModule('manufacturing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              activeModule === 'manufacturing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'উৎপাদন ও ফ্যাক্টরি' : 'Manufacturing'}
          </button>
        </div>
      </div>

      {/* Extension 1: Restaurant Tables & KOT */}
      {activeModule === 'restaurant' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'ফ্লোর টেবিল লেআউট ও কিচেন অর্ডার টিকিট (KOT)' : 'Floor Table Layout & Kitchen Order Tickets (KOT)'}</h2>
              <p className="text-xs text-slate-400">{lang === 'bn' ? 'ফাঁকা বা বুকড অবস্থা পরিবর্তন করতে যেকোনো টেবিলে ক্লিক করুন।' : 'Click any table to switch between Available and Occupied.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(extData?.restaurantTables || []).map((t: any) => (
              <div
                key={t.id}
                onClick={() => handleTableToggle(t.id, t.status)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                  t.status === 'OCCUPIED'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : t.status === 'RESERVED'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-bold font-mono">{t.tableNumber}</span>
                    <div className="text-xs text-slate-400 mt-1">{lang === 'bn' ? `ধারণক্ষমতা: ${t.capacity} জন` : `Capacity: ${t.capacity} Persons`}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'OCCUPIED'
                        ? 'bg-rose-600 text-white'
                        : t.status === 'RESERVED'
                        ? 'bg-amber-600 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {t.status === 'OCCUPIED'
                      ? (lang === 'bn' ? 'বুকড / পূর্ণ' : 'OCCUPIED')
                      : t.status === 'RESERVED'
                      ? (lang === 'bn' ? 'সংরক্ষিত' : 'RESERVED')
                      : (lang === 'bn' ? 'ফাঁকা' : 'AVAILABLE')}
                  </span>
                </div>

                <div className="text-xs border-t border-slate-800/80 pt-2 flex justify-between items-center text-slate-400">
                  <span>
                    {t.status === 'OCCUPIED'
                      ? (lang === 'bn' ? `অতিথি: ${t.guestCount || 2} জন · KOT রানিং` : `Guests: ${t.guestCount || 2} · KOT Active`)
                      : (lang === 'bn' ? 'অতিথি বসাতে ক্লিক করুন' : 'Click to Seat Guests')}
                  </span>
                  <span className="text-[10px] underline">{lang === 'bn' ? 'অবস্থা পরিবর্তন' : 'Change State'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension 2: Hotel & Rooms */}
      {activeModule === 'hotel' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'হোটেল রুম বুকিং ও ফ্রন্ট ডেস্ক ব্যবস্থাপনা' : 'Hotel Room Occupancy & Guest Front Desk'}</h2>
              <p className="text-xs text-slate-400">{lang === 'bn' ? 'রুম চেক-ইন, দৈনিক ভাড়া এবং পরিষ্কারের অবস্থা পর্যবেক্ষণ।' : 'Manage room check-ins, rate tariffs, and housekeeping statuses.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(extData?.hotelRooms || []).map((r: any) => (
              <div
                key={r.id}
                onClick={() => handleRoomToggle(r.id, r.status)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                  r.status === 'OCCUPIED'
                    ? 'bg-indigo-950/40 border-indigo-800 text-indigo-200'
                    : r.status === 'CLEANING'
                    ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-bold font-mono">{lang === 'bn' ? `রুম ${r.roomNumber}` : `Room ${r.roomNumber}`}</span>
                    <div className="text-xs text-slate-400 mt-1">
                      {r.type} · {lang === 'bn' ? 'ভাড়া: ' : 'Tariff: '}<strong className="text-white font-mono">{formatBDT(r.ratePerNight)}{lang === 'bn' ? '/রাত' : '/night'}</strong>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'OCCUPIED'
                        ? 'bg-indigo-600 text-white'
                        : r.status === 'CLEANING'
                        ? 'bg-amber-600 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {r.status === 'OCCUPIED'
                      ? (lang === 'bn' ? 'বুকড' : 'OCCUPIED')
                      : r.status === 'CLEANING'
                      ? (lang === 'bn' ? 'পরিচ্ছন্নতা চলছে' : 'CLEANING')
                      : (lang === 'bn' ? 'ফাঁকা' : 'AVAILABLE')}
                  </span>
                </div>

                <div className="text-xs border-t border-slate-800/80 pt-2 flex justify-between items-center text-slate-400">
                  <span>{r.currentGuestName ? `${lang === 'bn' ? 'অতিথি: ' : 'Guest: '}${r.currentGuestName}` : (lang === 'bn' ? 'চেক-ইন এর জন্য খালি' : 'Available for Check-in')}</span>
                  <span className="text-[10px] underline">{lang === 'bn' ? 'স্ট্যাটাস টগল' : 'Toggle Status'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension 3: Vehicle Fleet */}
      {activeModule === 'vehicle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'বাণিজ্যিক যানবাহন ফ্লিট ও যন্ত্রপাতি রেজিস্টার' : 'Commercial Vehicle Fleet & Machinery Register'}</h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'রেজিস্ট্রেশন নম্বর' : 'Registration #'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'গাড়ির মেক ও মডেল' : 'Vehicle Make & Model'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'ধরণ' : 'Type'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'দৈনিক ভাড়া / মূল্য' : 'Daily Rate / Price'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'মাইলেজ' : 'Mileage'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(extData?.vehicles || []).map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{v.regNumber}</td>
                  <td className="py-3 px-4 text-white font-medium">{v.make} {v.model} ({v.year})</td>
                  <td className="py-3 px-4 text-slate-400 font-semibold">{v.type}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-bold">
                    {formatBDT(v.dailyRateOrPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {v.mileage.toLocaleString()} km
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {v.status === 'AVAILABLE' ? (lang === 'bn' ? 'সক্রিয় / প্রস্তুত' : 'AVAILABLE') : v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Extension 4: Manufacturing BOM */}
      {activeModule === 'manufacturing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'উৎপাদন ব্যাচ ও কাঁচামাল ব্যবহার (BOM)' : 'Manufacturing Production Batches & Material Consumption'}</h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'ব্যাচ নম্বর' : 'Batch Number'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'উৎপাদিত পণ্য' : 'Target Product'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'কাঁচামালের তালিকা (BOM)' : 'Bill of Materials (BOM) Raw Ingredients'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'অগ্রগতি (উৎপাদিত / লক্ষ্য)' : 'Progress (Produced / Target)'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(extData?.manufacturingOrders || []).map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{m.batchNumber}</td>
                  <td className="py-3 px-4 text-white font-semibold">{m.productName}</td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-sm">{m.rawMaterialsSummary}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                    {m.producedQuantity} / {m.targetQuantity} {lang === 'bn' ? 'টি' : 'units'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {m.status === 'IN_PROGRESS'
                        ? (lang === 'bn' ? 'উৎপাদন চলছে' : 'IN_PROGRESS')
                        : m.status === 'COMPLETED'
                        ? (lang === 'bn' ? 'সম্পন্ন' : 'COMPLETED')
                        : m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
