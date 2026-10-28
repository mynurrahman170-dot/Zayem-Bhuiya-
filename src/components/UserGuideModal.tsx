import React, { useState } from 'react';
import { Language, translations } from '../i18n.ts';
import {
  BookOpen,
  Building2,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Layers,
  Package,
  Receipt,
  Shield,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  X,
  Printer,
  ChevronRight,
  Lightbulb,
  FileText
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeSection, setActiveSection] = useState<'setup' | 'workflow' | 'features' | 'importance'>('setup');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-xs text-slate-200 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                {lang === 'bn' ? 'ডাটা অ্যান্ড কোড বিএএস — ব্যবহার নির্দেশিকা ও সহায়িকা' : 'Data & Code BAS — User Manual & Guide'}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {lang === 'bn' ? 'টিউটোরিয়াল' : 'Guide'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'কোম্পানি তৈরি, দৈনন্দিন কার্যক্রম পরিচালনা, মূল বৈশিষ্ট্য ও ব্যবসায়িক প্রয়োজনীয়তার বিস্তারিত ব্যাখ্যা।'
                  : 'Company provisioning, step-by-step operational workflows, key features, and business value.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 py-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSection('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'setup'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {lang === 'bn' ? '১. কোম্পানি তৈরি ও সেটআপ' : '1. Company Setup'}
          </button>

          <button
            onClick={() => setActiveSection('workflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'workflow'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            {lang === 'bn' ? '২. ব্যবহারের নিয়ম (Workflow)' : '2. Operational Workflow'}
          </button>

          <button
            onClick={() => setActiveSection('features')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'features'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'bn' ? '৩. সফটওয়্যারের বৈশিষ্ট্য' : '3. Core Features'}
          </button>

          <button
            onClick={() => setActiveSection('importance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'importance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {lang === 'bn' ? '৪. প্রয়োজনীয়তা ও গুরুত্ব' : '4. Business Necessity'}
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 leading-relaxed">
          
          {/* SECTION 1: Company Setup */}
          {activeSection === 'setup' && (
            <div className="space-y-5">
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {lang === 'bn' ? 'কোম্পানি ওয়ার্কস্পেস তৈরি ও ব্র্যান্ডিং সেটআপ' : 'Tenant Company Creation & Branding Setup'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'bn'
                      ? 'একটি সম্পূর্ণ কার্যকরী ব্যবসায়িক ওয়ার্কস্পেস চালু করার জন্য নিচে উল্লেখিত সহজ ধাপগুলো অনুসরণ করুন:'
                      : 'Follow these straightforward steps to provision an isolated, branded tenant workspace:'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-xs">১</span>
                    <span>{lang === 'bn' ? 'সুপার অ্যাডমিন দ্বারা কোম্পানি নিবন্ধন' : 'Super Admin Provisioning'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'টপবারে "সুপার অ্যাডমিন" বাটনে ক্লিক করে "নতুন কোম্পানি" ট্যাবে যান। সেখানে প্রতিষ্ঠানের নাম, স্বত্বাধিকারীর নাম, ঠিকানা, ফোন, ইমেইল, ব্যবসার ক্যাটাগরি ও সাবস্ক্রিপশন প্ল্যান পূরণ করে এক ক্লিকে কোম্পানি সক্রিয় করুন।'
                      : 'Switch to Super Admin and open the "Register New Company" tab. Fill in company details, business category, and authorized email to activate.'}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 flex items-center justify-center text-xs">২</span>
                    <span>{lang === 'bn' ? 'গেস্ট রেজিস্ট্রেশন ও অনুমোদন' : 'Public Registration & Approval'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'যেকোনো সাধারণ ব্যবহারকারী লগইন মোডাল থেকে "নতুন নিবন্ধন" করে ডেমো স্যান্ডবক্সে প্রবেশ করতে পারেন। এরপর সুপার অ্যাডমিন "অনুমোদন সারি" থেকে তাকে নির্দিষ্ট কোম্পানিতে ওনার বা স্টাফ হিসেবে দায়িত্ব দিতে পারেন।'
                      : 'Users can register publicly for sandbox access. Super Admin can review the approval queue and link them to authorized company workspaces.'}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-cyan-600/30 flex items-center justify-center text-xs">৩</span>
                    <span>{lang === 'bn' ? 'ব্র্যান্ডিং, লোগো ও মেমো হেডার সেটআপ' : 'Branding & Memo Configuration'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'বামপাশের সাইডবারে কোম্পানির নামের পাশে সেটিংস বাটন থেকে কোম্পানির লোগো, স্লোগান ও নীতিবাক্য যুক্ত করুন। এই তথ্য স্বয়ংক্রিয়ভাবে বিক্রয় চালান ও ক্যাশ মেমোর হেডারে চলে আসবে।'
                      : 'Click the branding settings gear in the sidebar to upload the company logo and tagline. It automatically synchronizes with printable invoices and receipts.'}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-rose-600/30 flex items-center justify-center text-xs">৪</span>
                    <span>{lang === 'bn' ? 'কোম্পানি সক্রিয়/স্থগিত ও স্থায়ী ডিলিট' : 'Active, Suspend & Permanent Delete'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'সুপার অ্যাডমিন প্যানেল থেকে যেকোনো সময় যেকোনো কোম্পানি সাময়িক স্থগিত (Suspend) বা সম্পূর্ণ স্থায়ীভাবে মুছে (Delete) ফেলতে পারবেন। কোম্পানি ওনার নিজেও ব্র্যান্ডিং মোডাল থেকে বিপদজনক এলাকা দিয়ে কোম্পানি ডিলিট করতে পারেন।'
                      : 'Super Admin or company owners can suspend or permanently delete tenant workspaces along with all cascaded financial ledgers and stock.'}
                  </p>
                </div>
              </div>

              {/* Super Admin Credentials Record Card */}
              <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'bn' ? 'সুপার অ্যাডমিন অ্যাকাউন্ট তথ্য (নোট রাখার জন্য):' : 'Super Admin Credentials (For Your Notes):'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                    SUPER_ADMIN
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/90 p-3 rounded-lg border border-purple-900/40">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'bn' ? 'লগইন আইডি / ইমেইল:' : 'Login ID / Email:'}</span>
                    <span className="text-white font-mono font-bold select-all">admin@datancode.com</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}</span>
                    <span className="text-amber-400 font-mono font-bold select-all">admin123</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'bn' ? 'জরুরি হেল্পলাইন:' : 'Helpline:'}</span>
                    <span className="text-slate-300 font-mono select-all">+880 1800 000000</span>
                  </div>
                </div>
                <p className="text-[11px] text-purple-200/80">
                  {lang === 'bn'
                    ? 'নোট: এই আইডি ও পাসওয়ার্ড ব্যবহার করে প্ল্যাটফর্ম সুপার অ্যাডমিন হিসেবে প্রবেশ করে নতুন কোম্পানি তৈরি, কোম্পানি স্থগিত/মুছে ফেলা, প্যাকেজ নির্ধারণ ও সকল হিসাব নিরীক্ষণ করা যায়।'
                    : 'Note: Use these credentials to access the Super Admin control suite to manage companies, plans, audit logs, and authorizations.'}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 2: Daily Workflow */}
          {activeSection === 'workflow' && (
            <div className="space-y-4">
              <div className="bg-blue-950/40 border border-blue-800/60 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-blue-300 mb-1">
                  {lang === 'bn' ? 'দৈনন্দিন ব্যবসা পরিচালনার ক্রমিক কার্যপদ্ধতি (Step-by-Step Workflow)' : 'Step-by-Step Daily Business Workflow'}
                </h3>
                <p className="text-xs text-slate-300">
                  {lang === 'bn'
                    ? 'সর্বোত্তম নির্ভুল হিসাব ও স্বচ্ছতা বজায় রাখতে নিচের ধারাবাহিকতা মেনে চলার পরামর্শ দেওয়া হচ্ছে:'
                    : 'Follow this sequence for airtight inventory and financial tracking:'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{lang === 'bn' ? 'ধাপ ১: পণ্য ও ইনভেন্টরি যুক্ত করা (Products Entry)' : 'Step 1: Product & Inventory Registration'}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {lang === 'bn'
                        ? '"পণ্য তালিকা" মেনু থেকে নতুন পণ্য যুক্ত করুন। পণ্যের নাম, ক্যাটাগরি, ক্রয়মূল্য, খুচরা মূল্য, ডিলার মূল্য এবং নূন্যতম মজুদের সতর্কতা সীমা (Stock Alert Threshold) নির্ধারণ করে সংরক্ষণ করুন।'
                        : 'Register items with SKU, purchase cost, retail/dealer prices, units, and minimum stock alert thresholds.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{lang === 'bn' ? 'ধাপ ২: মালামাল ক্রয় ও সরবরাহকারী বিল (Purchases Recording)' : 'Step 2: Recording Supplier Purchases'}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {lang === 'bn'
                        ? 'মহাজন বা ভেন্ডরের কাছ থেকে মালামাল আনলে "ক্রয় ভাউচার" মেনু থেকে চালান এন্ট্রি দিন। পণ্যের স্টক স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে এবং বকেয়া টাকা মহাজনের খতিয়ানে যুক্ত হবে।'
                        : 'Record purchases from suppliers. Product stock increments automatically and unpaid balances post to supplier payables.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg shrink-0">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{lang === 'bn' ? 'ধাপ ৩: পিওএস বিক্রয় ও চালান প্রিন্ট (POS Sales & Invoicing)' : 'Step 3: Point-of-Sale Billing & Invoice Print'}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {lang === 'bn'
                        ? '"বিক্রয় ও ইনভয়েস" থেকে কাস্টমার সিলেক্ট করে বিক্রয় চালান তৈরি করুন। পেমেন্ট মাধ্যম (নগদ, ব্যাংক, বিকাশ, বা বাকি) নির্ধারণ করুন। তাৎক্ষণিকভাবে A4 সাইজ ইনভয়েস অথবা ৮০ মিমি থার্মাল পিওএস রসিদ প্রিন্ট করুন।'
                        : 'Select customer, add products, apply discounts/VAT, choose payment channel (Cash, Bank, bKash, Credit), and print A4 or thermal receipts.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{lang === 'bn' ? 'ধাপ ৪: গ্রাহক ও মহাজনের খতিয়ান আদায় (Party Ledgers & Due Clearing)' : 'Step 4: Customer Dues Collection & Supplier Payments'}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {lang === 'bn'
                        ? '"কাস্টমার খতিয়ান" এবং "সরবরাহকারী খতিয়ান" থেকে বাজারের বাকি পাওনা ও মহাজনদের দেনা এক ক্লিকে রানিং ব্যালেন্সসহ পর্যবেক্ষণ করুন এবং নগদ প্রাপ্তি/পরিশোধ লিপিবদ্ধ করুন।'
                        : 'Monitor market receivables, enforce credit ceilings, and register counter repayments into running party ledgers.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{lang === 'bn' ? 'ধাপ ৫: দৈনিক দোকান পরিচালন ব্যয় (Operating Expenses)' : 'Step 5: Logging Daily Operating Expenses'}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {lang === 'bn'
                        ? 'দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর বেতন, পরিবহন ও নাস্তা খরচ ইত্যাদি "দৈনিক খরচ" ট্যাবে এন্ট্রি দিন। এটি সরাসরি ক্যাশবুক ও লাভ-ক্ষতির হিসাবে সমন্বয় হবে।'
                        : 'Log rent, utilities, salaries, and entertainment to reflect accurately in the daily cashbook and net profit calculations.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{lang === 'bn' ? 'ধাপ ৬: আর্থিক বিবরণী ও অডিট রিপোর্ট (Reports & Financials)' : 'Step 6: Real-Time Financial Statements & Reports'}</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {lang === 'bn'
                        ? '"হিসাববিজ্ঞান" মেনু থেকে দৈনিক ক্যাশবহি, জাবেদা, লাভ-ক্ষতি হিসাব এবং ব্যালেন্স শিট দেখুন। "রিপোর্ট" থেকে বিক্রয়, ক্রয়, স্টক মূল্যায়ন এবং গ্রাহক বকেয়া রিপোর্ট এক্সেল/সিএসভি আকারে ডাউনলোড করুন।'
                        : 'Access automated double-entry ledger, cashbook, P&L statement, balance sheet, and export audit-ready CSV reports.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Core Features */}
          {activeSection === 'features' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-white mb-1">
                  {lang === 'bn' ? 'সফটওয়্যারটির বিশেষ কারিগরি ও ব্যবসায়িক বৈশিষ্ট্যসমূহ' : 'Specialized Technical & Business Capabilities'}
                </h3>
                <p className="text-xs text-slate-300">
                  {lang === 'bn'
                    ? 'বাংলাদেশের যেকোনো খুচরা, পাইকারি, পরিবেশক ও শিল্প প্রতিষ্ঠানের জন্য আন্তর্জাতিক মানের স্বয়ংক্রিয় ফিচার:'
                    : 'Enterprise-grade features engineered for Bangladeshi and global business operations:'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? '১০০% বাংলা ও দ্বিভাষিক ইন্টারফেস' : '100% Bilingual Localization'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'টপবার থেকে এক ক্লিকে পুরো সিস্টেম বাংলায় রূপান্তর করা যায়। সকল হেডার, স্ট্যাটাস ব্যাজ এবং প্রিন্ট মেমো বাংলায় সহজবোধ্য।'
                      : 'Seamless one-click reactive toggle between English and Bengali across all tables, forms, and printed memos.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'দ্বিমুখী প্রিন্টিং (A4 ও ৮০ মিমি থার্মাল)' : 'Dual-Format Printable Invoices'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'কাস্টমারদের জন্য আকর্ষণীয় A4 সাইজ ইনভয়েস (কথায় টাকার পরিমাণ, শর্তাবলী ও স্বাক্ষরযুক্ত) অথবা দ্রুত কাউন্টার রসিদের জন্য ৮০ মিমি থার্মাল ক্যাশ মেমো প্রিন্ট করার সুবিধা।'
                      : 'Full A4 commercial tax invoice and 80mm compact thermal cash receipts with words conversion and authorization seal.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'ডিলার নেটওয়ার্ক ও কমিশন ব্যবস্থাপনা' : 'Dealer Tier & Commission Schedules'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'ডিলারদের জন্য আলাদা মূল্য তালিকা (Dealer Price / Wholesale Price), অঞ্চলভিত্তিক বিক্রয় এলাকা এবং নির্দিষ্ট কমিশন শতাংশ নির্ধারণের স্বয়ংক্রিয় ব্যবস্থা।'
                      : 'Wholesale tiers, credit limit enforcement, territorial allocation, and automated commission rate computation.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'বিশেষায়িত বিজনেস এক্সটেনশন' : 'Industry Vertical Extensions'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'রেস্তোরাঁর টেবিল ও KOT টিকিট, হোটেল রুম অকুপ্যান্সি, বাণিজ্যিক গাড়ি ও যন্ত্রপাতির ফ্লিট এবং উৎপাদন ব্যাচ (BOM) ট্র্যাকিং মডিউল সংযুক্ত।'
                      : 'Ready-to-use plug-ins for Restaurant KOT, Hotel Rooms, Fleet tracking, and Manufacturing Bill of Materials (BOM).'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'স্বয়ংক্রিয় ডাবল-এন্ট্রি হিসাববিজ্ঞান' : 'Automated General Ledger & Accounting'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'বিক্রয়, ক্রয় ও খরচের সাথে সাথে স্বয়ংক্রিয়ভাবে সম্পদ, দায় ও মালিকানাস্বত্ব হিসাব সমন্বিত হয়; ফলে আলাদা করে কোনো জটিল হিসাববিজ্ঞানের হিসাবের দরকার পড়ে না।'
                      : 'Real-time double-entry ledgering that synchronizes inventory costs and revenues into audit-ready financial statements.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'কর্মী পারমিশন ও রোল-ভিত্তিক অ্যাক্সেস' : 'Role-Based Access Control (RBAC)'}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'কোম্পানি মালিক, অ্যাডমিন, হিসাবরক্ষক, বিক্রয় কর্মকর্তা, ক্রয় কর্মকর্তা ও ক্যাশিয়ারদের জন্য নিরাপদ ও পদবীভিত্তিক অনুমতি নিয়ন্ত্রণ।'
                      : 'Fine-grained permissions for Cashier, Sales, Purchases, Inventory, Accountant, and Admin accounts.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Business Necessity */}
          {activeSection === 'importance' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-300 mb-1">
                  {lang === 'bn' ? 'কেন আপনার ব্যবসার জন্য এই সফটওয়্যারটি অত্যন্ত জরুরি ও প্রয়োজনীয়?' : 'Why is this Automation System Vital for Your Business?'}
                </h3>
                <p className="text-xs text-slate-300">
                  {lang === 'bn'
                    ? 'ম্যানুয়াল খাতা-কলম ও প্রচলিত কাগজের হিসাবের ঝুঁকি দূর করে ব্যবসার স্থায়ী প্রবৃদ্ধি নিশ্চিত করুন:'
                    : 'Eliminate manual accounting leakage and accelerate business growth:'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-rose-600/20 text-rose-400 rounded-lg shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {lang === 'bn' ? '১. নগদ টাকা ও মজুদের তছরুপ এবং গরমিল শতভাগ রোধ' : '1. Prevention of Financial Leakage & Stock Theft'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn'
                        ? 'খাতা-কলমে হিসাবে ভুল বা হিসাবে গড়মিল হওয়া খুব সাধারণ বিষয়। ডিজিটাল ইনভয়েস ও রিয়েল-টাইম স্টক ট্র্যাকিংয়ের ফলে এক পয়সার মালামাল বা টাকার গরমিল হওয়ার কোনো সুযোগ থাকে না।'
                        : 'Eliminate undocumented stock movements and counter cash discrepancies through instant receipts and automated balances.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {lang === 'bn' ? '২. বাজারের বকেয়া টাকা সময়মতো আদায় ও বাকির ঝুঁকি নিয়ন্ত্রণ' : '2. Timely Market Receivables & Credit Limit Control'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn'
                        ? 'কোন কাস্টমারের কাছে কত টাকা বাকি আছে এবং কার বাকির সীমা কতদিন পার হয়েছে তা নিমেষেই দেখা যায়। ফলে সহজে নোটিশ পাঠানো ও বকেয়া আদায় ত্বরান্বিত হয়।'
                        : 'Track outstanding customer balances, enforce maximum credit limits, and prevent bad debts with running ledger statements.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {lang === 'bn' ? '৩. প্রকৃত ব্যবসায়িক নিট লাভ ও আর্থিক স্বাস্থ্য জানা' : '3. Accurate Profit & Loss and Inventory Valuation'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn'
                        ? 'অনেকে মোট বিক্রয়কে লাভ মনে করেন। কিন্তু আমাদের সিস্টেমে পণ্যের ক্রয়মূল্য ও পরিচালন খরচ বাদ দিয়ে প্রতিটি মুহূর্তে নিট মুনাফা (Net Profit) চোখের সামনে দৃশ্যমান থাকে।'
                        : 'Distinguish between turnover and real net profit after accounting for cost of goods sold and operating overheads.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">
                      {lang === 'bn' ? '৪. গ্রাহকের কাছে পেশাদার ইমেজ ও প্রতিষ্ঠানের মর্যাদা বৃদ্ধি' : '4. Professional Customer Trust & Modern Brand Prestige'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn'
                        ? 'হাতে লেখা মেমোর বদলে নিজস্ব ব্র্যান্ডেড লোগোযুক্ত কম্পিউটারাইজড মেমো গ্রাহকের মনে কোম্পানির প্রতি আস্থা বহুগুণ বাড়িয়ে তোলে।'
                        : 'Modernize store branding with automated invoices, official authorization seals, and digital receipts.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{lang === 'bn' ? 'সাপোর্ট বা প্রশিক্ষণের প্রয়োজনে: support@datancode.com' : 'Support & training hotline: support@datancode.com'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Understood / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
