import React, { useState, useEffect } from 'react';
import { Company, User, SubscriptionPlan, AuditLog } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Settings,
  Sparkles,
  ExternalLink,
  Search,
  Lock,
  Trash2
} from 'lucide-react';

interface SuperAdminViewProps {
  lang?: Language;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ lang = 'en' }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'companies' | 'new-company' | 'approvals' | 'plans' | 'audit'>('companies');
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirmCompany, setDeleteConfirmCompany] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);

  // New Company 15-field Form State
  const [newCompany, setNewCompany] = useState({
    name: '',
    slogan: '',
    proprietor: '',
    address: '',
    phone: '',
    email: '',
    facebook: '',
    whatsapp: '',
    website: '',
    logo: '',
    businessCategory: 'retail' as const,
    subscriptionPlan: 'medium',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approvedEmails: '',
    approvedPhones: '',
    status: 'ACTIVE' as const
  });

  // Approval modal state
  const [approvalTargetUser, setApprovalTargetUser] = useState<User | null>(null);
  const [approvalCompanyId, setApprovalCompanyId] = useState<string>('');
  const [approvalRole, setApprovalRole] = useState<string>('COMPANY_OWNER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [st, comps, usrs, plns, auds] = await Promise.all([
        api.request<any>('/api/admin/stats'),
        api.request<Company[]>('/api/admin/companies'),
        api.request<User[]>('/api/admin/users'),
        api.request<SubscriptionPlan[]>('/api/admin/plans'),
        api.request<AuditLog[]>('/api/admin/audit-logs')
      ]);
      setStats(st);
      setCompanies(comps);
      setUsers(usrs);
      setPlans(plns);
      setAuditLogs(auds);
      if (comps.length > 0 && !approvalCompanyId) {
        setApprovalCompanyId(comps[0].id);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load Super Admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      const created = await api.request<Company>('/api/admin/companies', {
        method: 'POST',
        body: JSON.stringify({
          ...newCompany,
          socialLinks: {
            facebook: newCompany.facebook,
            whatsapp: newCompany.whatsapp,
            website: newCompany.website
          }
        })
      });
      setActionSuccess(`Company "${created.name}" created and provisioned successfully!`);
      // Reset form
      setNewCompany({
        name: '',
        slogan: '',
        proprietor: '',
        address: '',
        phone: '',
        email: '',
        facebook: '',
        whatsapp: '',
        website: '',
        logo: '',
        businessCategory: 'retail',
        subscriptionPlan: 'medium',
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        approvedEmails: '',
        approvedPhones: '',
        status: 'ACTIVE'
      });
      setActiveTab('companies');
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create company.');
    }
  };

  const handleUpdateCompanyStatus = async (companyId: string, status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED') => {
    try {
      await api.request(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setActionSuccess(lang === 'bn' ? `কোম্পানির অবস্থা পরিবর্তন করে ${status === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।` : `Company status updated to ${status}.`);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || (lang === 'bn' ? 'কোম্পানি আপডেট করতে ব্যর্থ হয়েছে।' : 'Failed to update company.'));
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    if (company.id === 'demo_tenant') {
      setActionError(t.cannotDeleteDemo);
      return;
    }
    try {
      setDeleting(true);
      await api.request(`/api/admin/companies/${company.id}`, {
        method: 'DELETE'
      });
      setActionSuccess(lang === 'bn' ? `"${company.name}" কোম্পানি এবং এর সমস্ত তথ্য স্থায়ীভাবে মুছে ফেলা হয়েছে।` : `Company "${company.name}" and all associated records permanently deleted.`);
      setDeleteConfirmCompany(null);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || (lang === 'bn' ? 'কোম্পানি মুছে ফেলতে ব্যর্থ হয়েছে।' : 'Failed to delete company.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleApproveUser = async () => {
    if (!approvalTargetUser || !approvalCompanyId) return;
    try {
      await api.request(`/api/admin/users/${approvalTargetUser.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          companyId: approvalCompanyId,
          role: approvalRole
        })
      });
      setActionSuccess(`Approved ${approvalTargetUser.name} and linked to workspace.`);
      setApprovalTargetUser(null);
      fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve user.');
    }
  };

  const pendingUsers = users.filter(u => u.status === 'DEMO_PENDING' || u.role === 'GUEST');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Platform Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-950/80 border border-purple-800 text-purple-300 rounded-xl">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">{t.superAdmin}</h1>
              <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase">
                {t.ownerPortal}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.superAdminDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('new-company')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {t.registerNewCompany}
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Platform Executive Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t.activeTenants}</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats?.activeCompanies ?? 0}
            <span className="text-xs text-slate-500 font-sans font-normal ml-2">/ {stats?.totalCompanies ?? 0}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t.platformMRR}</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatBDT(stats?.totalMRR ?? 0)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t.pendingApprovals}</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {stats?.pendingRequests ?? 0}
            <span className="text-xs text-slate-500 font-sans font-normal ml-2">{lang === 'bn' ? 'টি অনুরোধ' : 'requests'}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t.demoQuotaLimit}</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {stats?.platformSettings?.maxDemoRecords ?? 5}
            <span className="text-xs text-slate-500 font-sans font-normal ml-2">{lang === 'bn' ? 'টি এন্ট্রি' : 'creations'}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'companies' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? `সকল কোম্পানি (${companies.length})` : `All Companies (${companies.length})`}
        </button>
        <button
          onClick={() => setActiveTab('new-company')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'new-company' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? '+ নতুন কোম্পানি ফরম' : '+ New Company Form'}
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors relative ${
            activeTab === 'approvals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.approvalQueue}
          {pendingUsers.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'plans' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'bn' ? `প্যাকেজ প্ল্যান (${plans.length})` : `Subscription Plans (${plans.length})`}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.auditLogs}
        </button>
      </div>

      {/* TAB 1: Companies Directory */}
      {activeTab === 'companies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">{t.registeredWorkspaces}</h2>
            <span className="text-xs text-slate-400">{lang === 'bn' ? `মোট: ${companies.length} টি কোম্পানি` : `Total: ${companies.length} companies`}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t.companyName} &amp; {t.category}</th>
                  <th className="py-3 px-4">{t.proprietor} &amp; {t.phone}</th>
                  <th className="py-3 px-4">{t.plan}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'অনুমোদিত লগইন' : 'Approved Logins'}</th>
                  <th className="py-3 px-4">{t.status}</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} className="w-8 h-8 rounded object-cover bg-white p-0.5" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-blue-600 text-white font-bold flex items-center justify-center">
                            {comp.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{comp.name}</div>
                          <div className="text-[11px] text-slate-400 capitalize">
                            Category: {comp.businessCategory} · {comp.slogan || 'No slogan'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{comp.proprietor}</div>
                      <div className="text-[11px] text-slate-400">{comp.phone} · {comp.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-400">{comp.subscription?.planName}</div>
                      <div className="text-[11px] text-slate-400">
                        Until {formatDate(comp.subscription?.endDate)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-300 max-w-xs truncate">
                        {comp.approvedEmails.join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          comp.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : comp.status === 'SUSPENDED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {comp.id !== 'demo_tenant' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {comp.status !== 'ACTIVE' ? (
                            <button
                              onClick={() => handleUpdateCompanyStatus(comp.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                            >
                              {t.activate}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateCompanyStatus(comp.id, 'SUSPENDED')}
                              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-[11px] font-medium"
                            >
                              {t.suspend}
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirmCompany(comp)}
                            title={t.deleteCompany}
                            className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-[11px] font-medium flex items-center gap-1 shadow-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t.delete}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {lang === 'bn' ? 'ডিফল্ট স্যান্ডবক্স' : 'Default Sandbox'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Complete 15-Field New Company Registration Form */}
      {activeTab === 'new-company' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-base font-bold text-white">
              {lang === 'bn' ? 'নতুন কোম্পানি ওয়ার্কস্পেস তৈরি (১৫টি আবশ্যক ক্ষেত্র)' : 'Create New Tenant Company (15 Required Fields)'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'শুধুমাত্র সুপার অ্যাডমিন কোম্পানি সক্রিয় করতে পারেন। সংরক্ষিত প্রোফাইলটি সকল চালান, ভাউচার ও রসিদে স্বয়ংক্রিয়ভাবে যুক্ত হবে।'
                : 'Only the Super Admin can authorize initial company activation. The saved profile will automatically populate all invoices, receipts, and memos.'}
            </p>
          </div>

          <form onSubmit={handleCreateCompany} className="space-y-6 text-xs text-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Field 1: Company Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১. প্রতিষ্ঠানের নাম *' : '1. Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'যেমন: পদ্মা এগ্রো অ্যান্ড মেশিনারি লিমিটেড' : 'e.g. Padma Agro & Machinery Ltd.'}
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 2: Slogan */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '২. স্লোগান / নীতিবাক্য' : '2. Slogan (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: আস্থার বিশ্বস্ত প্রতীক' : 'e.g. Quality You Can Trust'}
                  value={newCompany.slogan}
                  onChange={(e) => setNewCompany({ ...newCompany, slogan: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 3: Proprietor Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৩. স্বত্বাধিকারী / মালিকের নাম *' : '3. Proprietor / Owner Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'যেমন: মো: শহীদুল আলম' : 'e.g. Md. Shahidul Alam'}
                  value={newCompany.proprietor}
                  onChange={(e) => setNewCompany({ ...newCompany, proprietor: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 4: Business Address */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৪. ব্যবসার ঠিকানা *' : '4. Business Address *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'যেমন: হোল্ডিং ১২, জি.টি. রোড, বগুড়া, বাংলাদেশ' : 'e.g. Holding 12, G.T. Road, Bogura, Bangladesh'}
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 5: Mobile Number */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৫. মোবাইল নম্বর *' : '5. Mobile Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="+880 1700 000000"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 6: Email Address */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৬. ইমেইল ঠিকানা *' : '6. Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="office@padmaagro.bd"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 7: Social Media Links */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৭. হোয়াটসঅ্যাপ / ফেসবুক' : '7. WhatsApp / Social Links'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর বা ওয়েবসাইট' : 'WhatsApp number / website link'}
                  value={newCompany.whatsapp}
                  onChange={(e) => setNewCompany({ ...newCompany, whatsapp: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 8: Company Logo */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৮. কোম্পানির লোগো ইউআরএল' : '8. Company Logo URL (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'ছবি ইউআরএল বা পরে আপলোড করুন' : 'Image URL or upload via branding later'}
                  value={newCompany.logo}
                  onChange={(e) => setNewCompany({ ...newCompany, logo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 9: Business Category */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '৯. ব্যবসার ক্যাটাগরি *' : '9. Business Category *'}
                </label>
                <select
                  value={newCompany.businessCategory}
                  onChange={(e) => setNewCompany({ ...newCompany, businessCategory: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="retail">{lang === 'bn' ? 'খুচরা ও পাইকারি দোকান' : 'Retail & Wholesale Shop'}</option>
                  <option value="dealership">{lang === 'bn' ? 'ডিলার ও পরিবেশক ব্যবসা' : 'Dealer & Dealership Business'}</option>
                  <option value="restaurant">{lang === 'bn' ? 'রেস্তোরাঁ ও খাদ্য ব্যবসা' : 'Restaurant & Food Business'}</option>
                  <option value="hotel">{lang === 'bn' ? 'হোটেল ও আবাসিক সুবিধা' : 'Hotel & Residential Accommodation'}</option>
                  <option value="vehicle">{lang === 'bn' ? 'যানবাহন বিক্রয় ও ভাড়া' : 'Vehicle Sales & Rental'}</option>
                  <option value="manufacturing">{lang === 'bn' ? 'উৎপাদন ও শিল্প কারখানা' : 'Manufacturing & Production'}</option>
                </select>
              </div>

              {/* Field 10: Subscription Plan */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১০. সাবস্ক্রিপশন প্ল্যান *' : '10. Subscription Plan *'}
                </label>
                <select
                  value={newCompany.subscriptionPlan}
                  onChange={(e) => setNewCompany({ ...newCompany, subscriptionPlan: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (৳{p.monthlyPrice}{lang === 'bn' ? '/মাস' : '/mo'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 11: Subscription Start Date */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১১. সাবস্ক্রিপশন শুরুর তারিখ *' : '11. Subscription Start Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={newCompany.subscriptionStartDate}
                  onChange={(e) => setNewCompany({ ...newCompany, subscriptionStartDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 12: Subscription End Date */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১২. সাবস্ক্রিপশন সমাপ্তির তারিখ *' : '12. Subscription End Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={newCompany.subscriptionEndDate}
                  onChange={(e) => setNewCompany({ ...newCompany, subscriptionEndDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 13: Approved Login Email Address(es) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১৩. অনুমোদিত লগইন ইমেইলসমূহ *' : '13. Approved Login Email(s) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="owner@padmaagro.bd, manager@padmaagro.bd"
                  value={newCompany.approvedEmails}
                  onChange={(e) => setNewCompany({ ...newCompany, approvedEmails: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 14: Approved Login Mobile Number(s) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১৪. অনুমোদিত মোবাইল নম্বরসমূহ *' : '14. Approved Mobile Number(s) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="+8801700000000"
                  value={newCompany.approvedPhones}
                  onChange={(e) => setNewCompany({ ...newCompany, approvedPhones: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Field 15: Company Status */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {lang === 'bn' ? '১৫. প্রাথমিক সক্রিয় অবস্থা *' : '15. Initial Company Status *'}
                </label>
                <select
                  value={newCompany.status}
                  onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">{lang === 'bn' ? 'সক্রিয় (তাৎক্ষণিক প্রবেশাধিকার)' : 'Active (Immediate Access)'}</option>
                  <option value="PENDING">{lang === 'bn' ? 'যাচাই অপেক্ষমাণ' : 'Pending Verification'}</option>
                  <option value="SUSPENDED">{lang === 'bn' ? 'স্থগিত' : 'Suspended'}</option>
                  <option value="EXPIRED">{lang === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired'}</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('companies')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-sm transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'কোম্পানি সক্রিয় ও তৈরি করুন' : 'Provision & Activate Company Workspace'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Access Approval Queue */}
      {activeTab === 'approvals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'গেস্ট নিবন্ধন ও অ্যাক্সেস অনুমোদন সারি' : 'Guest Registration & Access Approval Queue'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'পাবলিক রেজিস্ট্রেশনকারী ব্যবহারকারীদের ডেমো অ্যাকাউন্ট বরাদ্দ হয়। কাঙ্ক্ষিত কোম্পানি ও পদবী নির্ধারণ করে অনুমোদন দিন।'
                  : 'Public registrations create GUEST/DEMO accounts. Review and link approved users to their authorized company workspace.'}
              </p>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              {pendingUsers.length} {lang === 'bn' ? 'টি অপেক্ষমাণ' : 'Pending'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{lang === 'bn' ? 'ব্যবহারকারীর নাম ও যোগাযোগ' : 'User Name & Contact'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'নিবন্ধনের তারিখ' : 'Registration Date'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'বর্তমান অবস্থা' : 'Current Status'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'ডেমো ব্যবহার' : 'Demo Sandbox Usage'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'bn' ? 'অনুমোদন পদক্ষেপ' : 'Approval Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{usr.name}</div>
                      <div className="text-[11px] text-slate-400">{usr.email} · {usr.phone}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {formatDate(usr.createdAt || '')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          usr.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : usr.status === 'DEMO_PENDING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {usr.status === 'ACTIVE' ? (lang === 'bn' ? 'সক্রিয়' : 'ACTIVE') : (lang === 'bn' ? 'অপেক্ষমাণ' : usr.status)} ({usr.role})
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {usr.demoUsageCount} / 5 {lang === 'bn' ? 'টি রেকর্ড ব্যবহৃত' : 'records used'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {usr.role !== 'SUPER_ADMIN' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setApprovalTargetUser(usr);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs shadow-xs cursor-pointer"
                          >
                            {lang === 'bn' ? 'কোম্পানি বরাদ্দ ও অনুমোদন' : 'Assign & Approve'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval Assignment Modal */}
      {approvalTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              {lang === 'bn' ? `${approvalTargetUser.name}-এর অ্যাক্সেস অনুমোদন করুন` : `Approve Access for ${approvalTargetUser.name}`}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? `এই অনুমোদিত পরিচয় (${approvalTargetUser.email}) কে একটি সক্রিয় কোম্পানির ওয়ার্কস্পেস বরাদ্দ দিন এবং দায়িত্ব নির্ধারণ করুন।`
                : `Assign this approved identity (${approvalTargetUser.email}) to an active company workspace and select their operational role.`}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'কাঙ্ক্ষিত কোম্পানির ওয়ার্কস্পেস' : 'Target Company Workspace'}</label>
                <select
                  value={approvalCompanyId}
                  onChange={(e) => setApprovalCompanyId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {companies
                    .filter((c) => c.id !== 'demo_tenant')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.businessCategory})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'নির্ধারিত অপারেশনাল পদবী' : 'Assigned Operational Role'}</label>
                <select
                  value={approvalRole}
                  onChange={(e) => setApprovalRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="COMPANY_OWNER">{lang === 'bn' ? 'কোম্পানি মালিক (সম্পূর্ণ ওয়ার্কস্পেস নিয়ন্ত্রণ)' : 'Company Owner (Full Workspace Access)'}</option>
                  <option value="COMPANY_ADMIN">{lang === 'bn' ? 'কোম্পানি অ্যাডমিনিস্ট্রেটর' : 'Company Administrator'}</option>
                  <option value="ACCOUNTANT">{lang === 'bn' ? 'হিসাবরক্ষক (খতিয়ান ও ক্যাশবহি)' : 'Accountant (Ledgers & Cashbook)'}</option>
                  <option value="SALES">{lang === 'bn' ? 'বিক্রয় কর্মকর্তা (ইনভয়েসিং ও চালান)' : 'Sales Officer (Invoicing & Dues)'}</option>
                  <option value="PURCHASE">{lang === 'bn' ? 'ক্রয় কর্মকর্তা (সরবরাহকারী ও স্টক)' : 'Purchase Officer (Suppliers & Stock)'}</option>
                  <option value="INVENTORY">{lang === 'bn' ? 'ইনভেন্টরি ম্যানেজার (স্টক সমন্বয়)' : 'Inventory Manager (Stock Adjustments)'}</option>
                  <option value="CASHIER">{lang === 'bn' ? 'ক্যাশিয়ার (কাউন্টার নগদ গ্রহণ)' : 'Cashier (Daily Counter)'}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setApprovalTargetUser(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium text-xs hover:bg-slate-700 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleApproveUser}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs cursor-pointer"
              >
                {lang === 'bn' ? 'অনুমোদন নিশ্চিত করুন' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {lang === 'bn' ? 'প্যাকেজ স্তর' : 'Tier'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{p.tagline}</p>

                <div className="mt-4 mb-5">
                  <div className="text-2xl font-extrabold font-mono text-white">
                    {formatBDT(p.monthlyPrice)}
                    <span className="text-xs text-slate-400 font-sans font-normal ml-1">{lang === 'bn' ? '/ মাস' : '/ month'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lang === 'bn' ? 'বার্ষিক: ' : 'Annual: '}{formatBDT(p.annualPrice)} {lang === 'bn' ? '/ বছর' : '/ year'}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-2">
                    {lang === 'bn' ? 'নির্ধারিত কোটা ও সীমা:' : 'Configured Limits:'}
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'কর্মী অ্যাকাউন্ট:' : 'Staff Accounts:'}</span>
                    <strong className="text-white font-mono">{p.employeeLimit} {lang === 'bn' ? 'জন' : 'users'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'ব্যবসায়িক শাখা:' : 'Business Branches:'}</span>
                    <strong className="text-white font-mono">{p.businessUnitLimit} {lang === 'bn' ? 'টি' : 'units'}</strong>
                  </div>
                  <ul className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">{lang === 'bn' ? 'প্ল্যাটফর্ম নিরাপত্তা ও অডিট লগ' : 'Platform Security & Audit Trail'}</h2>
            <span className="text-xs text-slate-400">{lang === 'bn' ? 'সর্বশেষ ৫০০টি কার্যকলাপ সংরক্ষিত' : 'Latest 500 actions recorded'}</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-blue-400 border border-slate-700">
                      {log.action}
                    </span>
                    <span>{log.details}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn' ? 'কর্তা: ' : 'Actor: '}{log.userEmail} · {lang === 'bn' ? 'কোম্পানি আইডি: ' : 'Company ID: '}{log.companyId || 'Global Platform'}
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Company Confirmation Modal */}
      {deleteConfirmCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 no-print">
          <div className="bg-slate-900 border border-rose-800/80 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs text-slate-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950 border border-rose-800 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t.confirmDeleteTitle}
                </h3>
                <p className="text-[11px] text-rose-300 font-mono">
                  {deleteConfirmCompany.name}
                </p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {t.confirmDeleteDesc}
            </p>

            <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-800/60 text-rose-300 space-y-1.5 text-[11px]">
              <div>⚠️ {lang === 'bn' ? 'সকল পণ্য, বিক্রয় চালান, ক্রয় হিসাব ও ভাউচার মুছে যাবে' : 'All products, sales invoices, purchase bills & vouchers will be wiped'}</div>
              <div>⚠️ {lang === 'bn' ? 'গ্রাহক ও মহাজনদের বকেয়া খতিয়ান নিশ্চিহ্ন হবে' : 'All customer dues & supplier ledgers will be permanently destroyed'}</div>
              <div>⚠️ {lang === 'bn' ? 'সংযুক্ত ব্যবহারকারী অ্যাকাউন্টগুলো স্থগিত হবে' : 'Associated employee user accounts will be suspended'}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmCompany(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteCompany(deleteConfirmCompany)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? t.loading : t.permanentlyDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
