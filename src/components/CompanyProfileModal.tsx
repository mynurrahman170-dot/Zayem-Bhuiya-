import React, { useState, useRef } from 'react';
import { Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations } from '../i18n.ts';
import { X, Upload, Trash2, Building, Check, Image as ImageIcon, AlertCircle, AlertTriangle } from 'lucide-react';

interface CompanyProfileModalProps {
  company: Company | null;
  onClose: () => void;
  onUpdated: (company: Company) => void;
  lang?: Language;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  company,
  onClose,
  onUpdated,
  lang = 'en'
}) => {
  const t = translations[lang];
  if (!company) return null;

  const [name, setName] = useState(company.name || '');
  const [slogan, setSlogan] = useState(company.slogan || '');
  const [proprietor, setProprietor] = useState(company.proprietor || '');
  const [address, setAddress] = useState(company.address || '');
  const [phone, setPhone] = useState(company.phone || '');
  const [email, setEmail] = useState(company.email || '');
  const [facebook, setFacebook] = useState(company.socialLinks?.facebook || '');
  const [whatsapp, setWhatsapp] = useState(company.socialLinks?.whatsapp || '');
  const [website, setWebsite] = useState(company.socialLinks?.website || '');
  const [taxVatPercent, setTaxVatPercent] = useState(company.taxVatPercent || 5);
  const [logo, setLogo] = useState(company.logo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteCompany = async () => {
    try {
      setDeleting(true);
      setError(null);
      await api.request('/api/company', { method: 'DELETE' });
      setShowDeleteConfirm(false);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || (lang === 'bn' ? 'কোম্পানি মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete company.'));
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await api.request<Company>('/api/company/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          slogan,
          proprietor,
          address,
          phone,
          email,
          taxVatPercent,
          logo,
          socialLinks: {
            facebook,
            whatsapp,
            website
          }
        })
      });

      setSuccess('Company profile and branding saved successfully!');
      onUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update company branding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">{t.brandingSettings}</h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'আপনার প্রতিষ্ঠানের পরিচয়, কাস্টম লোগো এবং বিক্রয় চালানের বিবরণ কনফিগার করুন'
                  : 'Configure your company identity, custom logo, and invoice details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-200">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Logo Upload Section */}
          <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80">
            <label className="block font-semibold text-slate-300 mb-2">
              {lang === 'bn' ? 'প্রতিষ্ঠানের অফিসিয়াল লোগো' : 'Company Official Logo'}
            </label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {logo ? (
                  <img src={logo} alt="Company Logo" className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'লোগো বাছাই / আপলোড' : 'Browse / Upload Logo'}
                  </button>

                  {logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 rounded font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'লোগো সরান' : 'Remove'}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn'
                    ? 'সমর্থিত ফরম্যাট: PNG, JPG, SVG, WebP (সর্বোচ্চ ২MB)। এই লোগোটি প্রতিটি চালান, রসিদ এবং মেমোতে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                    : 'Supported formats: PNG, JPG, SVG, WebP. Maximum size: 2MB. This logo automatically appears on invoices, receipts, and memos.'}
                </p>
              </div>
            </div>
          </div>

          {/* Core Profile Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.companyName} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'bn' ? 'স্লোগান / ট্যাগলাইন' : 'Slogan / Tagline'}</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: আস্থা ও সেবায় বিশ্বস্ত' : 'e.g. Precision Gadgets & Solutions'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.proprietor} *</label>
              <input
                type="text"
                value={proprietor}
                onChange={(e) => setProprietor(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'bn' ? 'অফিসিয়াল মোবাইল নম্বর *' : 'Official Mobile Number *'}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">{t.address} *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{t.email} *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'bn' ? 'ডিফল্ট ভ্যাট / ট্যাক্স শতকরা (%)' : 'Default Tax / VAT %'}</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={taxVatPercent}
                onChange={(e) => setTaxVatPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'bn' ? 'হোয়াটসঅ্যাপ বিজনেস' : 'WhatsApp Business'}</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+8801700000000"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{lang === 'bn' ? 'ওয়েবসাইট লিংক' : 'Website URL'}</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Danger Zone: Delete Company Workspace */}
          {company.id !== 'demo_tenant' && (
            <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {lang === 'bn' ? 'বিপজ্জনক এলাকা: প্রতিষ্ঠান স্থায়ীভাবে মুছে ফেলা' : 'Danger Zone: Permanently Delete Company'}
                  </h4>
                  <p className="text-[11px] text-rose-400/80 mt-0.5">
                    {lang === 'bn'
                      ? 'এই প্রতিষ্ঠান ও এর সকল ইনভেন্টরি, বিক্রয় চালান, কর্মচারী ও খতিয়ান স্থায়ীভাবে মুছে যাবে।'
                      : 'Permanently remove this company, all products, invoices, staff accounts, and financial records.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'কোম্পানি মুছে ফেলুন' : 'Delete Company'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              {loading ? t.loading : (lang === 'bn' ? 'ব্র্যান্ডিং সংরক্ষণ করুন' : 'Save Branding Changes')}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-rose-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-slate-200">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 bg-rose-950 border border-rose-800 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'প্রতিষ্ঠান মুছে ফেলা নিশ্চিত করুন' : 'Confirm Company Deletion'}
                  </h3>
                  <p className="text-[11px] text-rose-300 font-mono">{company.name}</p>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? 'আপনি কি নিশ্চিত যে আপনি এই প্রতিষ্ঠানটি এবং এর সমস্ত বাণিজ্যিক হিসাব ও ডেটা স্থায়ীভাবে মুছে ফেলতে চান? এই প্রক্রিয়াটি পরিবর্তন করা সম্ভব নয়।'
                  : 'Are you sure you want to permanently delete this company workspace? All business data will be lost.'}
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteCompany}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? t.loading : (lang === 'bn' ? 'স্থায়ীভাবে মুছে ফেলুন' : 'Permanently Delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
