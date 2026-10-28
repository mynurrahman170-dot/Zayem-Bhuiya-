import React, { useState, useEffect } from 'react';
import { Employee, Company } from '../types.ts';
import { api } from '../api.ts';
import { Language, translations, formatBDT, formatDate } from '../i18n.ts';
import { UserCheck, PlusCircle, Search, Shield, X } from 'lucide-react';

interface EmployeesViewProps {
  company: Company | null;
  lang: Language;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ company, lang }) => {
  const t = translations[lang];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('SALES');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Showroom');
  const [salary, setSalary] = useState<number>(25000);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    if (!company?.id) return;
    try {
      const data = await api.request<Employee[]>('/api/company/employees');
      setEmployees(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (company?.id) {
      fetchEmployees();
    }
  }, [company?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.request('/api/company/employees', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone,
          role,
          designation: designation || role,
          department,
          salary
        })
      });
      setShowModal(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member.');
    }
  };

  const limit = company?.subscription?.employeeLimit || 3;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            {t.employees}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'পদবীভিত্তিক কর্মী অ্যাক্সেস: মালিক, অ্যাডমিন, হিসাবরক্ষক, বিক্রয় কর্মকর্তা, ক্রয় কর্মকর্তা, ইনভেন্টরি ম্যানেজার, ক্যাশিয়ার।'
              : 'Role-based staff access: Owner, Admin, Accountant, Sales, Purchase Officer, Inventory Manager, Cashier.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{lang === 'bn' ? 'কর্মী কোটা সীমা' : 'Staff Limit Quota'}</span>
            <div className="text-sm font-bold font-mono text-white">
              {employees.length} / {limit} {lang === 'bn' ? 'জন' : 'Accounts'}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {lang === 'bn' ? 'নতুন কর্মচারী যোগ' : 'Add Employee'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'কর্মচারীর নাম' : 'Employee Name'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'ভূমিকা ও পারমিশন' : 'Role & Permissions'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'বিভাগ ও পদবী' : 'Department & Title'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'মাসিক বেতন' : 'Monthly Salary'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{emp.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {lang === 'bn'
                        ? (emp.role === 'SALES' ? 'বিক্রয় কর্মকর্তা'
                           : emp.role === 'ACCOUNTANT' ? 'হিসাবরক্ষক'
                           : emp.role === 'PURCHASE' ? 'ক্রয় কর্মকর্তা'
                           : emp.role === 'INVENTORY' ? 'ইনভেন্টরি'
                           : emp.role === 'CASHIER' ? 'ক্যাশিয়ার'
                           : emp.role === 'COMPANY_ADMIN' ? 'কোম্পানি অ্যাডমিন'
                           : emp.role === 'OWNER' ? 'মালিক' : emp.role)
                        : emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{emp.designation}</div>
                    <div className="text-[11px] text-slate-500">{emp.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{emp.email}</div>
                    <div className="text-[11px] text-slate-500">{emp.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                    {formatBDT(emp.salary)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {lang === 'bn' ? 'সক্রিয়' : 'ACTIVE'}
                    </span>
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
                <UserCheck className="w-4 h-4 text-blue-400" />
                {lang === 'bn' ? 'নতুন কর্মচারী অ্যাকাউন্ট যোগ' : 'Add Employee Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: কামরুল হাসান' : 'e.g. Kamrul Hasan'}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'অফিসিয়াল ইমেইল ঠিকানা *' : 'Work Email Address *'}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.bd"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'মোবাইল ফোন নম্বর *' : 'Mobile Phone *'}</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'নিযুক্ত পদের ভূমিকা' : 'Assigned Operational Role'}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                >
                  <option value="SALES">{lang === 'bn' ? 'বিক্রয় কর্মকর্তা (বিলিং ও চালান)' : 'Sales Officer (Billing & Invoices)'}</option>
                  <option value="ACCOUNTANT">{lang === 'bn' ? 'হিসাবরক্ষক (খতিয়ান ও হিসাব)' : 'Accountant (Ledgers & Accounting)'}</option>
                  <option value="PURCHASE">{lang === 'bn' ? 'ক্রয় কর্মকর্তা (সরবরাহকারী ও স্টক)' : 'Purchase Officer (Suppliers & Stock)'}</option>
                  <option value="INVENTORY">{lang === 'bn' ? 'ইনভেন্টরি ম্যানেজার (স্টক সমন্বয়)' : 'Inventory Manager (Stock Adjustments)'}</option>
                  <option value="CASHIER">{lang === 'bn' ? 'ক্যাশিয়ার (কাউন্টার নগদ লেনদেন)' : 'Cashier (Daily Counter Cash)'}</option>
                  <option value="COMPANY_ADMIN">{lang === 'bn' ? 'কোম্পানি অ্যাডমিনিস্ট্রেটর' : 'Company Administrator'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'পদবী / উপাধি' : 'Job Designation'}</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: সিনিয়র এক্সিকিউটিভ' : 'e.g. Senior Executive'}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{lang === 'bn' ? 'মাসিক বেতন (৳)' : 'Monthly Salary (৳)'}</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
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
                  {lang === 'bn' ? 'কর্মচারী সংরক্ষণ করুন' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
