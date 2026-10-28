import React, { useState } from 'react';
import { api } from '../api.ts';
import { User, Company } from '../types.ts';
import { Language, translations } from '../i18n.ts';
import { Lock, UserCheck, AlertCircle, Sparkles, Building2, Shield, X } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: User, company: Company | null) => void;
  onClose: () => void;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose, lang = 'en' }) => {
  const t = translations[lang];
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [category, setCategory] = useState('retail');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.request<{ token: string; user: User; company: Company | null }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          emailOrPhone: customEmail || emailOrPhone,
          password: customPass || password
        })
      });
      api.setToken(res.token);
      onSuccess(res.user, res.company);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.request<{ token: string; user: User; company: Company | null; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          requestedBusinessCategory: category
        })
      });
      api.setToken(res.token);
      alert(res.message);
      onSuccess(res.user, res.company);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs text-slate-200">
        {/* Header & Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/file_000000009b788211997a7f36ab55b035_f2adea2a.png"
              alt="Data & Code"
              className="h-9 w-auto object-contain"
            />
            <div>
              <h2 className="text-sm font-bold text-white">{t.platformName} — {lang === 'bn' ? 'পোর্টাল' : 'BAS Portal'}</h2>
              <p className="text-[11px] text-slate-400">{t.platformTagline}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/80">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition-colors text-xs ${
              tab === 'login' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'ওয়ার্কস্পেসে লগইন' : 'Sign In to Workspace'}
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-1.5 rounded-md font-semibold transition-colors text-xs ${
              tab === 'register' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'নতুন নিবন্ধন (গেস্ট/ডেমো)' : 'Public Registration (Guest/Demo)'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab: Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Mobile Number'}
              </label>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: owner@apexretail.bd অথবা admin@datancode.com' : 'e.g. owner@apexretail.bd or admin@datancode.com'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm transition-colors text-xs"
            >
              {loading ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...') : (lang === 'bn' ? 'লগইন করুন' : 'Sign In')}
            </button>

            {/* Super Admin Credentials for Recording/Notes */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lang === 'bn' ? 'সুপার অ্যাডমিন লগইন তথ্য (নোট রাখার জন্য):' : 'Super Admin Credentials (For Your Notes):'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                    SUPER_ADMIN
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-lg border border-purple-900/40">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'লগইন আইডি / ইমেইল:' : 'User ID / Email:'}</span>
                    <span className="text-white font-mono font-bold select-all">admin@datancode.com</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}</span>
                    <span className="text-amber-400 font-mono font-bold select-all">admin123</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'bn'
                    ? 'নিরাপত্তার স্বার্থে ১-ক্লিকে সরাসরি প্রবেশের সুবিধা বন্ধ রাখা হয়েছে যাতে কেউ অননুমোদিতভাবে ডাটা পরিবর্তন করতে না পারে। উপরের আইডি ও পাসওয়ার্ড লিখে বা মনে রেখে ম্যানুয়ালি লগইন করুন।'
                    : 'Instant 1-click automatic access has been disabled to prevent unauthorized data tampering. Please type or paste your credentials above to sign in.'}
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Tab: Public Registration Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-lg text-[11px] text-blue-200">
              <strong>{lang === 'bn' ? 'নিবন্ধন নীতিমালা:' : 'Registration Policy:'}</strong> {lang === 'bn' ? 'নতুন তৈরি অ্যাকাউন্ট তাৎক্ষণিকভাবে ডেমো স্যান্ডবক্সে (৫টি এন্ট্রি কোটা) প্রবেশাধিকার পাবে। সম্পূর্ণ বাণিজ্যিক কোম্পানির জন্য সুপার অ্যাডমিন অনুমোদনের প্রয়োজন।' : 'New accounts are granted immediate access to the restricted Demo Sandbox (5-record quota). Real company workspace access requires Super Admin authorization.'}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'আপনার পুরো নাম *' : 'Your Full Name *'}
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: তারিকুল ইসলাম' : 'e.g. Tariqul Islam'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.email} *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.bd"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.phone} *</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড নির্ধারণ করুন *' : 'Choose Password *'}
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder={lang === 'bn' ? 'নিরাপদ পাসওয়ার্ড তৈরি করুন' : 'Create a secure password'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'আবেদিত ব্যবসার ধরন' : 'Requested Business Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              >
                <option value="retail">{t.catRetail}</option>
                <option value="dealership">{t.catDealership}</option>
                <option value="restaurant">{t.catRestaurant}</option>
                <option value="hotel">{t.catHotel}</option>
                <option value="vehicle">{t.catVehicle}</option>
                <option value="manufacturing">{t.catManufacturing}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm transition-colors text-xs"
            >
              {loading ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...') : (lang === 'bn' ? 'নিবন্ধন করুন ও ডেমো স্যান্ডবক্সে প্রবেশ করুন' : 'Register & Enter Demo Sandbox')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
