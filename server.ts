import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, User, Company, Product, SalesInvoice, PurchaseInvoice, Expense, Customer, Supplier, StockMovement, LedgerEntry, JournalEntry } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple in-memory session token mapping for seamless authentication
const SESSIONS = new Map<string, { userId: string; createdAt: number }>();

// Helper to resolve user from authorization header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return null;

  const session = SESSIONS.get(token);
  if (session) {
    const user = db.get().users.find(u => u.id === session.userId);
    if (user) return user;
  }

  // Recover token across server restarts if token matches tok_<userId>_<timestamp>
  if (token.startsWith('tok_')) {
    const database = db.get();
    for (const u of database.users) {
      if (token.startsWith(`tok_${u.id}_`) || token === `tok_${u.id}`) {
        SESSIONS.set(token, { userId: u.id, createdAt: Date.now() });
        return u;
      }
    }
  }

  // Also allow direct user_id as token for convenience/dev
  const userById = db.get().users.find(u => u.id === token);
  return userById || null;
}

// Super admin middleware
function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied. Super Admin privileges required.' });
  }
  (req as any).user = user;
  next();
}

// Tenant authentication middleware
function requireTenantAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  if (!user.companyId && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'No company workspace assigned. Account status: ' + user.status });
  }
  (req as any).user = user;
  next();
}

// Check demo limit for guest users creating records
function checkDemoLimit(user: User): { allowed: boolean; remaining: number; message?: string } {
  const maxLimit = db.get().platformSettings.maxDemoRecords || 5;
  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    const remaining = Math.max(0, maxLimit - user.demoUsageCount);
    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        message: `Demo creation limit of ${maxLimit} records reached. Please request Super Admin access approval or a commercial subscription to continue creating records.`
      };
    }
    return { allowed: true, remaining };
  }
  return { allowed: true, remaining: 9999 };
}

/* ========================================================================== */
/* AUTHENTICATION ROUTES                                                      */
/* ========================================================================== */

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/Phone and password are required.' });
  }

  const database = db.get();
  const query = emailOrPhone.trim().toLowerCase();
  const user = database.users.find(u => 
    (u.email.toLowerCase() === query || u.phone === query) &&
    u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid login credentials. Please check your email/mobile or password.' });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'Your account has been suspended. Please contact platform support.' });
  }

  if (user.status === 'REJECTED') {
    return res.status(403).json({ error: 'Your registration request was rejected by platform administrator.' });
  }

  const token = `tok_${user.id}_${Date.now()}`;
  SESSIONS.set(token, { userId: user.id, createdAt: Date.now() });

  let company: Company | null = null;
  if (user.companyId) {
    company = database.companies.find(c => c.id === user.companyId) || null;
  }

  db.logAudit(user.companyId, user.id, user.email, 'USER_LOGIN', `User ${user.name} logged in`);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      companyId: user.companyId,
      status: user.status,
      demoUsageCount: user.demoUsageCount,
      maxDemoRecords: database.platformSettings.maxDemoRecords,
      demoRemaining: Math.max(0, database.platformSettings.maxDemoRecords - user.demoUsageCount),
      createdAt: user.createdAt
    },
    company
  });
});

// POST /api/auth/register (Public Registration -> GUEST / DEMO_PENDING)
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, requestedBusinessCategory, notes } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Name, email, phone number, and password are required.' });
  }

  const database = db.get();
  const existing = database.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() || u.phone === phone.trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email or mobile number already exists.' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: 'GUEST',
    companyId: 'demo_tenant', // Assigned to sandbox demo environment
    status: 'DEMO_PENDING',
    demoUsageCount: 0,
    createdAt: new Date().toISOString(),
    passwordHash: password
  };

  database.users.push(newUser);
  db.save();

  db.logAudit(null, newUser.id, newUser.email, 'USER_REGISTRATION', `New guest registration: ${newUser.name} (${newUser.email}). Pending Super Admin review.`);

  const token = `tok_${newUser.id}_${Date.now()}`;
  SESSIONS.set(token, { userId: newUser.id, createdAt: Date.now() });

  const demoCompany = database.companies.find(c => c.id === 'demo_tenant');

  res.status(201).json({
    message: 'Account created successfully! You now have Guest Demo access with a 5-record sandbox limit while awaiting Super Admin approval for a real company workspace.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      companyId: newUser.companyId,
      status: newUser.status,
      demoUsageCount: newUser.demoUsageCount,
      maxDemoRecords: database.platformSettings.maxDemoRecords,
      demoRemaining: database.platformSettings.maxDemoRecords,
      createdAt: newUser.createdAt
    },
    company: demoCompany
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const database = db.get();
  let company: Company | null = null;
  if (user.companyId) {
    company = database.companies.find(c => c.id === user.companyId) || null;
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      companyId: user.companyId,
      status: user.status,
      demoUsageCount: user.demoUsageCount,
      maxDemoRecords: database.platformSettings.maxDemoRecords,
      demoRemaining: Math.max(0, database.platformSettings.maxDemoRecords - user.demoUsageCount),
      createdAt: user.createdAt
    },
    company
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    SESSIONS.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

/* ========================================================================== */
/* SUPER ADMIN PLATFORM ROUTES                                                */
/* ========================================================================== */

// GET /api/admin/stats
app.get('/api/admin/stats', requireSuperAdmin, (req, res) => {
  const database = db.get();
  const totalCompanies = database.companies.filter(c => c.id !== 'demo_tenant').length;
  const activeCompanies = database.companies.filter(c => c.id !== 'demo_tenant' && c.status === 'ACTIVE').length;
  const pendingRequests = database.users.filter(u => u.status === 'DEMO_PENDING').length;
  const totalUsers = database.users.length;
  
  // Calculate simulated platform ARR/MRR from subscriptions
  const totalMRR = database.companies
    .filter(c => c.id !== 'demo_tenant' && c.status === 'ACTIVE')
    .reduce((sum, c) => {
      const plan = database.subscriptionPlans.find(p => p.id === c.subscription.planId);
      return sum + (plan ? plan.monthlyPrice : 1999);
    }, 0);

  res.json({
    totalCompanies,
    activeCompanies,
    pendingRequests,
    totalUsers,
    totalMRR,
    platformSettings: database.platformSettings
  });
});

// GET /api/admin/companies
app.get('/api/admin/companies', requireSuperAdmin, (req, res) => {
  const database = db.get();
  res.json(database.companies);
});

// POST /api/admin/companies (Full 15-field Company Creation Form)
app.post('/api/admin/companies', requireSuperAdmin, (req, res) => {
  const {
    name,
    slogan,
    proprietor,
    address,
    phone,
    email,
    socialLinks,
    logo,
    businessCategory,
    subscriptionPlan,
    subscriptionStartDate,
    subscriptionEndDate,
    approvedEmails,
    approvedPhones,
    status
  } = req.body;

  if (!name || !proprietor || !address || !phone || !email || !businessCategory || !subscriptionPlan || !subscriptionStartDate || !subscriptionEndDate) {
    return res.status(400).json({ error: 'Please fill all mandatory company profile and subscription fields.' });
  }

  const database = db.get();
  const plan = database.subscriptionPlans.find(p => p.id === subscriptionPlan) || database.subscriptionPlans[0];

  const companyId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const approvedEmailList = Array.isArray(approvedEmails) 
    ? approvedEmails 
    : (approvedEmails ? approvedEmails.split(',').map((s: string) => s.trim().toLowerCase()) : [email.trim().toLowerCase()]);
  const approvedPhoneList = Array.isArray(approvedPhones) 
    ? approvedPhones 
    : (approvedPhones ? approvedPhones.split(',').map((s: string) => s.trim()) : [phone.trim()]);

  const newCompany: Company = {
    id: companyId,
    name: name.trim(),
    slogan: slogan ? slogan.trim() : '',
    proprietor: proprietor.trim(),
    address: address.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    socialLinks: socialLinks || {},
    logo: logo || '',
    businessCategory,
    subscription: {
      planId: plan.id,
      planName: plan.name,
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate,
      status: status || 'ACTIVE',
      employeeLimit: plan.employeeLimit,
      businessUnitLimit: plan.businessUnitLimit
    },
    approvedEmails: approvedEmailList,
    approvedPhones: approvedPhoneList,
    status: status || 'ACTIVE',
    currency: 'BDT',
    taxVatPercent: 5,
    createdAt: new Date().toISOString()
  };

  database.companies.push(newCompany);

  // Setup default chart of accounts for the new company
  const defaultAccounts = [
    { id: `acc_cash_${companyId}`, companyId, code: '1001', name: 'Cash in Hand (Counter)', type: 'ASSET' as const, balance: 0 },
    { id: `acc_bank_${companyId}`, companyId, code: '1002', name: 'Main Commercial Bank A/C', type: 'ASSET' as const, balance: 0 },
    { id: `acc_mfs_${companyId}`, companyId, code: '1003', name: 'bKash / Nagad Merchant A/C', type: 'ASSET' as const, balance: 0 },
    { id: `acc_ar_${companyId}`, companyId, code: '1100', name: 'Accounts Receivable (Customer Dues)', type: 'ASSET' as const, balance: 0 },
    { id: `acc_inv_${companyId}`, companyId, code: '1200', name: 'Inventory Asset', type: 'ASSET' as const, balance: 0 },
    { id: `acc_ap_${companyId}`, companyId, code: '2001', name: 'Accounts Payable (Supplier Dues)', type: 'LIABILITY' as const, balance: 0 },
    { id: `acc_cap_${companyId}`, companyId, code: '3001', name: 'Proprietor Capital', type: 'EQUITY' as const, balance: 0 },
    { id: `acc_sales_${companyId}`, companyId, code: '4001', name: 'Sales Revenue', type: 'REVENUE' as const, balance: 0 },
    { id: `acc_cogs_${companyId}`, companyId, code: '5001', name: 'Cost of Goods Sold', type: 'EXPENSE' as const, balance: 0 },
    { id: `acc_exp_${companyId}`, companyId, code: '5100', name: 'Operating Expenses', type: 'EXPENSE' as const, balance: 0 }
  ];
  database.accounts.push(...defaultAccounts);

  db.save();
  db.logAudit(companyId, (req as any).user.id, (req as any).user.email, 'CREATE_COMPANY', `Super Admin created company: ${newCompany.name}`);

  res.status(201).json(newCompany);
});

// PUT /api/admin/companies/:id
app.put('/api/admin/companies/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const companyIndex = database.companies.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const existing = database.companies[companyIndex];
  const updated: Company = {
    ...existing,
    ...req.body,
    subscription: {
      ...existing.subscription,
      ...(req.body.subscription || {})
    }
  };

  database.companies[companyIndex] = updated;
  db.save();
  db.logAudit(id, (req as any).user.id, (req as any).user.email, 'UPDATE_COMPANY', `Super Admin updated company: ${updated.name}`);

  res.json(updated);
});

// DELETE /api/admin/companies/:id
app.delete('/api/admin/companies/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  if (id === 'demo_tenant') {
    return res.status(400).json({ error: 'Cannot delete default Demo Sandbox environment.' });
  }

  const database = db.get();
  const companyIndex = database.companies.findIndex(c => c.id === id);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const deletedCompany = database.companies[companyIndex];
  database.companies.splice(companyIndex, 1);

  // Cascade clean-up for this tenant
  database.products = database.products.filter(p => p.companyId !== id);
  database.salesInvoices = database.salesInvoices.filter(s => s.companyId !== id);
  database.purchaseInvoices = database.purchaseInvoices.filter(p => p.companyId !== id);
  database.customers = database.customers.filter(c => c.companyId !== id);
  database.suppliers = database.suppliers.filter(s => s.companyId !== id);
  database.expenses = database.expenses.filter(e => e.companyId !== id);
  database.accounts = database.accounts.filter(a => a.companyId !== id);
  database.employees = database.employees.filter(emp => emp.companyId !== id);
  database.dealers = database.dealers.filter(d => d.companyId !== id);
  database.restaurantTables = database.restaurantTables.filter(t => t.companyId !== id);
  database.hotelRooms = database.hotelRooms.filter(r => r.companyId !== id);
  database.vehicleRecords = database.vehicleRecords.filter(v => v.companyId !== id);
  database.manufacturingOrders = database.manufacturingOrders.filter(m => m.companyId !== id);

  // Reset users linked to this company
  database.users.forEach(u => {
    if (u.companyId === id) {
      u.companyId = null;
      u.status = 'SUSPENDED';
    }
  });

  db.save();
  db.logAudit(null, (req as any).user.id, (req as any).user.email, 'DELETE_COMPANY', `Super Admin permanently deleted company: ${deletedCompany.name} (ID: ${id})`);

  res.json({ message: `Company "${deletedCompany.name}" and all its records were permanently deleted.` });
});

// GET /api/admin/users
app.get('/api/admin/users', requireSuperAdmin, (req, res) => {
  const database = db.get();
  res.json(database.users);
});

// POST /api/admin/users/:id/approve
app.post('/api/admin/users/:id/approve', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { companyId, role } = req.body;

  if (!companyId || !role) {
    return res.status(400).json({ error: 'Please specify the target company and assigned role.' });
  }

  const database = db.get();
  const user = database.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const company = database.companies.find(c => c.id === companyId);
  if (!company) {
    return res.status(404).json({ error: 'Target company not found.' });
  }

  user.companyId = companyId;
  user.role = role;
  user.status = 'ACTIVE';

  if (!company.approvedEmails.includes(user.email.toLowerCase())) {
    company.approvedEmails.push(user.email.toLowerCase());
  }
  if (!company.approvedPhones.includes(user.phone)) {
    company.approvedPhones.push(user.phone);
  }

  db.save();
  db.logAudit(companyId, (req as any).user.id, (req as any).user.email, 'APPROVE_USER', `Approved ${user.name} (${user.email}) into ${company.name} as ${role}`);

  res.json({ message: 'User successfully approved and linked to workspace.', user });
});

// POST /api/admin/users/:id/status
app.post('/api/admin/users/:id/status', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const database = db.get();
  const user = database.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = status;
  db.save();
  res.json(user);
});

// GET /api/admin/plans & PUT /api/admin/plans/:id
app.get('/api/admin/plans', (req, res) => {
  res.json(db.get().subscriptionPlans);
});

app.put('/api/admin/plans/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const database = db.get();
  const planIndex = database.subscriptionPlans.findIndex(p => p.id === id);
  if (planIndex === -1) return res.status(404).json({ error: 'Plan not found' });
  database.subscriptionPlans[planIndex] = { ...database.subscriptionPlans[planIndex], ...req.body };
  db.save();
  res.json(database.subscriptionPlans[planIndex]);
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', requireSuperAdmin, (req, res) => {
  res.json(db.get().auditLogs);
});

// Settings
app.get('/api/admin/settings', requireSuperAdmin, (req, res) => {
  res.json(db.get().platformSettings);
});

app.put('/api/admin/settings', requireSuperAdmin, (req, res) => {
  const database = db.get();
  database.platformSettings = { ...database.platformSettings, ...req.body };
  db.save();
  res.json(database.platformSettings);
});

/* ========================================================================== */
/* TENANT COMPANY WORKSPACE ROUTES (Strict Tenant Isolation)                   */
/* ========================================================================== */

// Company Profile & Branding
app.get('/api/company/profile', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const database = db.get();
  const company = database.companies.find(c => c.id === user.companyId);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json(company);
});

app.put('/api/company/profile', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const database = db.get();
  const companyIndex = database.companies.findIndex(c => c.id === user.companyId);
  if (companyIndex === -1) return res.status(404).json({ error: 'Company not found' });

  // Disallow modifying tenant ID or subscription tier directly from company side
  const current = database.companies[companyIndex];
  const { name, slogan, proprietor, address, phone, email, socialLinks, logo, taxVatPercent } = req.body;

  const updated: Company = {
    ...current,
    name: name !== undefined ? name : current.name,
    slogan: slogan !== undefined ? slogan : current.slogan,
    proprietor: proprietor !== undefined ? proprietor : current.proprietor,
    address: address !== undefined ? address : current.address,
    phone: phone !== undefined ? phone : current.phone,
    email: email !== undefined ? email : current.email,
    socialLinks: socialLinks !== undefined ? socialLinks : current.socialLinks,
    logo: logo !== undefined ? logo : current.logo,
    taxVatPercent: taxVatPercent !== undefined ? Number(taxVatPercent) : current.taxVatPercent
  };

  database.companies[companyIndex] = updated;
  db.save();
  db.logAudit(user.companyId, user.id, user.email, 'UPDATE_PROFILE', `Updated company profile & branding for ${updated.name}`);

  res.json(updated);
});

// DELETE /api/company (Workspace self-deletion by company owner/admin)
app.delete('/api/company', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const companyId = user.companyId;

  if (!companyId || companyId === 'demo_tenant') {
    return res.status(400).json({ error: 'Cannot delete the default demo environment.' });
  }

  const database = db.get();
  const companyIndex = database.companies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) {
    return res.status(404).json({ error: 'Company not found.' });
  }

  const deletedComp = database.companies[companyIndex];
  database.companies.splice(companyIndex, 1);

  // Cascade clean-up
  database.products = database.products.filter(p => p.companyId !== companyId);
  database.salesInvoices = database.salesInvoices.filter(s => s.companyId !== companyId);
  database.purchaseInvoices = database.purchaseInvoices.filter(p => p.companyId !== companyId);
  database.customers = database.customers.filter(c => c.companyId !== companyId);
  database.suppliers = database.suppliers.filter(s => s.companyId !== companyId);
  database.expenses = database.expenses.filter(e => e.companyId !== companyId);
  database.accounts = database.accounts.filter(a => a.companyId !== companyId);
  database.employees = database.employees.filter(emp => emp.companyId !== companyId);
  database.dealers = database.dealers.filter(d => d.companyId !== companyId);
  database.restaurantTables = database.restaurantTables.filter(t => t.companyId !== companyId);
  database.hotelRooms = database.hotelRooms.filter(r => r.companyId !== companyId);
  database.vehicleRecords = database.vehicleRecords.filter(v => v.companyId !== companyId);
  database.manufacturingOrders = database.manufacturingOrders.filter(m => m.companyId !== companyId);

  // Set users of this company to demo tenant or reset
  database.users.forEach(u => {
    if (u.companyId === companyId) {
      u.companyId = 'demo_tenant';
      u.role = 'GUEST';
    }
  });

  db.save();
  db.logAudit(null, user.id, user.email, 'DELETE_COMPANY', `Company deleted: ${deletedComp.name}`);

  res.json({ message: `Company "${deletedComp.name}" was permanently deleted.` });
});

// Dashboard Aggregations (Today sales, purchases, cash, dues, payables, stock value, gross/net profit)
app.get('/api/company/dashboard', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const companyId = user.companyId!;
  const database = db.get();
  const company = database.companies.find(c => c.id === companyId);

  const filter = (req.query.period as string) || 'today';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const sales = database.salesInvoices.filter(s => s.companyId === companyId);
  const purchases = database.purchaseInvoices.filter(p => p.companyId === companyId);
  const expenses = database.expenses.filter(e => e.companyId === companyId);
  const products = database.products.filter(p => p.companyId === companyId && p.status === 'ACTIVE');
  const customers = database.customers.filter(c => c.companyId === companyId);
  const suppliers = database.suppliers.filter(s => s.companyId === companyId);

  // Period filtering for sales/purchases/expenses
  let filteredSales = sales;
  let filteredPurchases = purchases;
  let filteredExpenses = expenses;

  if (filter === 'today') {
    filteredSales = sales.filter(s => s.date === todayStr);
    filteredPurchases = purchases.filter(p => p.date === todayStr);
    filteredExpenses = expenses.filter(e => e.date === todayStr);
  } else if (filter === 'this_month') {
    const currentMonth = todayStr.substring(0, 7);
    filteredSales = sales.filter(s => s.date.startsWith(currentMonth));
    filteredPurchases = purchases.filter(p => p.date.startsWith(currentMonth));
    filteredExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  }

  const todaySalesAmount = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.grandTotal, 0);
  const todayPurchasesAmount = purchases.filter(p => p.date === todayStr).reduce((sum, p) => sum + p.grandTotal, 0);
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const cashReceived = filteredSales.reduce((sum, s) => sum + s.amountPaid, 0);
  const cashPaid = filteredPurchases.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalCustomerReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const totalSupplierPayables = suppliers.reduce((sum, s) => sum + Math.max(0, s.currentBalance), 0);
  const currentStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Estimate COGS from sold items in period
  let totalCOGS = 0;
  for (const sale of filteredSales) {
    for (const item of sale.items) {
      const prod = products.find(p => p.id === item.productId);
      const cost = prod ? prod.purchasePrice : item.unitPrice * 0.7;
      totalCOGS += cost * item.quantity;
    }
  }

  const grossProfit = totalSalesRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockThreshold);

  // Expiry calculation
  let daysRemaining = 365;
  if (company?.subscription?.endDate) {
    const end = new Date(company.subscription.endDate).getTime();
    const diff = end - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  res.json({
    kpis: {
      todaySalesAmount,
      todayPurchasesAmount,
      periodSalesTotal: totalSalesRevenue,
      cashReceived,
      cashPaid,
      totalCustomerReceivables,
      totalSupplierPayables,
      currentStockValue,
      totalExpenses,
      grossProfit,
      netProfit,
      daysRemaining,
      subscriptionStatus: company?.subscription?.status || 'ACTIVE'
    },
    lowStockProducts,
    recentSales: sales.slice(-5).reverse(),
    recentPurchases: purchases.slice(-5).reverse()
  });
});

// Products & Inventory
app.get('/api/company/products', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const list = db.get().products.filter(p => p.companyId === user.companyId);
  res.json(list);
});

app.post('/api/company/products', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const limitCheck = checkDemoLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.message });
  }

  const { name, sku, barcode, category, brand, unit, purchasePrice, sellingPrice, wholesalePrice, dealerPrice, openingStock, minStockThreshold, supplierId } = req.body;
  if (!name || purchasePrice === undefined || sellingPrice === undefined) {
    return res.status(400).json({ error: 'Product name, purchase price, and selling price are required.' });
  }

  const database = db.get();
  const product: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: user.companyId!,
    name: name.trim(),
    sku: sku ? sku.trim() : '',
    barcode: barcode ? barcode.trim() : '',
    category: category || 'General',
    brand: brand || '',
    unit: unit || 'Pcs',
    purchasePrice: Number(purchasePrice) || 0,
    sellingPrice: Number(sellingPrice) || 0,
    wholesalePrice: wholesalePrice ? Number(wholesalePrice) : Number(sellingPrice) * 0.9,
    dealerPrice: dealerPrice ? Number(dealerPrice) : Number(sellingPrice) * 0.85,
    currentStock: Number(openingStock) || 0,
    minStockThreshold: Number(minStockThreshold) || 5,
    supplierId: supplierId || '',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  database.products.push(product);

  // If opening stock > 0, log movement and update inventory asset account
  if (product.currentStock > 0) {
    database.stockMovements.push({
      id: `mov_${Date.now()}`,
      companyId: user.companyId!,
      productId: product.id,
      productName: product.name,
      type: 'ADJUSTMENT',
      quantity: product.currentStock,
      date: new Date().toISOString().split('T')[0],
      referenceId: 'OPENING',
      referenceNumber: 'OPN-STOCK',
      balanceAfter: product.currentStock,
      notes: 'Opening stock balance'
    });
  }

  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    user.demoUsageCount += 1;
  }

  db.save();
  db.logAudit(user.companyId, user.id, user.email, 'CREATE_PRODUCT', `Added product ${product.name} (SKU: ${product.sku})`);

  res.status(201).json(product);
});

app.put('/api/company/products/:id', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const database = db.get();
  const idx = database.products.findIndex(p => p.id === req.params.id && p.companyId === user.companyId);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const existing = database.products[idx];
  database.products[idx] = { ...existing, ...req.body };
  db.save();
  res.json(database.products[idx]);
});

// Stock Adjustment
app.post('/api/company/inventory/adjust', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const { productId, adjustmentQuantity, reason } = req.body;
  const database = db.get();
  const product = database.products.find(p => p.id === productId && p.companyId === user.companyId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const qty = Number(adjustmentQuantity);
  if (isNaN(qty) || qty === 0) return res.status(400).json({ error: 'Valid adjustment quantity required.' });

  product.currentStock += qty;
  database.stockMovements.push({
    id: `mov_${Date.now()}`,
    companyId: user.companyId!,
    productId: product.id,
    productName: product.name,
    type: 'ADJUSTMENT',
    quantity: qty,
    date: new Date().toISOString().split('T')[0],
    referenceId: 'ADJ',
    referenceNumber: `ADJ-${Date.now().toString().slice(-4)}`,
    balanceAfter: product.currentStock,
    notes: reason || 'Manual stock adjustment'
  });

  db.save();
  res.json({ message: 'Stock adjusted successfully', currentStock: product.currentStock });
});

app.get('/api/company/inventory/movements', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const movements = db.get().stockMovements.filter(m => m.companyId === user.companyId);
  res.json(movements.reverse());
});

// Sales & Invoicing
app.get('/api/company/sales', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const list = db.get().salesInvoices.filter(s => s.companyId === user.companyId);
  res.json(list.reverse());
});

app.post('/api/company/sales', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const limitCheck = checkDemoLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.message });
  }

  const { customerId, customerName, customerPhone, customerAddress, items, discount, tax, amountPaid, paymentMethod, notes } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'At least one product item is required.' });
  }

  const database = db.get();
  let subtotal = 0;
  const processedItems = [];

  // Deduct stock atomically and validate items
  for (const item of items) {
    const product = database.products.find(p => p.id === item.productId && p.companyId === user.companyId);
    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.productName || item.productId}` });
    }
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) !== undefined ? Number(item.unitPrice) : product.sellingPrice;
    const itemDiscount = Number(item.discount) || 0;
    const lineTotal = (qty * price) - itemDiscount;

    product.currentStock -= qty;
    subtotal += lineTotal;

    processedItems.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      unitPrice: price,
      discount: itemDiscount,
      subtotal: lineTotal
    });
  }

  const totalDiscount = Number(discount) || 0;
  const totalTax = Number(tax) || 0;
  const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);
  const paid = Math.min(grandTotal, Number(amountPaid) || 0);
  const due = Math.max(0, grandTotal - paid);

  const invoiceNumber = `INV-${new Date().getFullYear()}-${(database.salesInvoices.filter(s => s.companyId === user.companyId).length + 1001)}`;

  let finalCustomerId = customerId;
  let finalCustomerName = customerName || 'Walk-in Customer';

  // Find or create customer
  if (finalCustomerId) {
    const existingCust = database.customers.find(c => c.id === finalCustomerId && c.companyId === user.companyId);
    if (existingCust) {
      existingCust.currentBalance += due;
      finalCustomerName = existingCust.name;
    }
  } else if (due > 0 && customerName) {
    // If credit sale to a named customer, auto-register
    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      companyId: user.companyId!,
      name: customerName,
      phone: customerPhone || '',
      address: customerAddress || '',
      openingBalance: 0,
      currentBalance: due,
      creditLimit: 50000,
      createdAt: new Date().toISOString()
    };
    database.customers.push(newCust);
    finalCustomerId = newCust.id;
  }

  const sale: SalesInvoice = {
    id: `inv_${Date.now()}`,
    companyId: user.companyId!,
    invoiceNumber,
    date: new Date().toISOString().split('T')[0],
    customerId: finalCustomerId || '',
    customerName: finalCustomerName,
    customerPhone: customerPhone || '',
    customerAddress: customerAddress || '',
    items: processedItems,
    subtotal,
    discount: totalDiscount,
    tax: totalTax,
    grandTotal,
    amountPaid: paid,
    outstandingBalance: due,
    paymentMethod: paymentMethod || (paid === grandTotal ? 'CASH' : 'CREDIT'),
    salesperson: user.name,
    notes: notes || '',
    status: due === 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'DUE'),
    createdAt: new Date().toISOString()
  };

  database.salesInvoices.push(sale);

  // Stock movement logs
  for (const item of processedItems) {
    const prod = database.products.find(p => p.id === item.productId);
    database.stockMovements.push({
      id: `mov_${Date.now()}_${item.productId}`,
      companyId: user.companyId!,
      productId: item.productId,
      productName: item.productName,
      type: 'SALE',
      quantity: -item.quantity,
      date: sale.date,
      referenceId: sale.id,
      referenceNumber: sale.invoiceNumber,
      balanceAfter: prod ? prod.currentStock : 0,
      notes: `Sold on ${sale.invoiceNumber} to ${sale.customerName}`
    });
  }

  // Ledger entry for customer
  if (finalCustomerId) {
    database.ledgerEntries.push({
      id: `led_${Date.now()}_inv`,
      companyId: user.companyId!,
      partyType: 'CUSTOMER',
      partyId: finalCustomerId,
      partyName: finalCustomerName,
      date: sale.date,
      type: 'INVOICE',
      referenceNumber: sale.invoiceNumber,
      description: `Sales Invoice ${sale.invoiceNumber}`,
      debit: sale.grandTotal,
      credit: 0,
      runningBalance: due
    });

    if (paid > 0) {
      database.ledgerEntries.push({
        id: `led_${Date.now()}_pay`,
        companyId: user.companyId!,
        partyType: 'CUSTOMER',
        partyId: finalCustomerId,
        partyName: finalCustomerName,
        date: sale.date,
        type: 'PAYMENT',
        referenceNumber: `REC-${sale.invoiceNumber}`,
        description: `Payment received via ${sale.paymentMethod}`,
        debit: 0,
        credit: paid,
        runningBalance: due
      });
    }
  }

  // Double entry accounting journal
  database.journalEntries.push({
    id: `je_${Date.now()}`,
    companyId: user.companyId!,
    date: sale.date,
    reference: sale.invoiceNumber,
    description: `Sales revenue for invoice ${sale.invoiceNumber}`,
    debits: [
      ...(paid > 0 ? [{ accountId: 'acc_cash', accountName: `Cash / ${sale.paymentMethod}`, amount: paid }] : []),
      ...(due > 0 ? [{ accountId: 'acc_ar', accountName: 'Accounts Receivable', amount: due }] : [])
    ],
    credits: [
      { accountId: 'acc_sales', accountName: 'Sales Revenue', amount: sale.grandTotal }
    ],
    totalAmount: sale.grandTotal
  });

  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    user.demoUsageCount += 1;
  }

  db.save();
  db.logAudit(user.companyId, user.id, user.email, 'CREATE_INVOICE', `Generated Sales Invoice ${sale.invoiceNumber} for ${sale.customerName} (BDT ${sale.grandTotal})`);

  res.status(201).json(sale);
});

// Purchases & Supplier Payables
app.get('/api/company/purchases', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const list = db.get().purchaseInvoices.filter(p => p.companyId === user.companyId);
  res.json(list.reverse());
});

app.post('/api/company/purchases', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const limitCheck = checkDemoLimit(user);
  if (!limitCheck.allowed) {
    return res.status(403).json({ error: limitCheck.message });
  }

  const { supplierId, supplierName, supplierPhone, items, discount, tax, additionalCharges, amountPaid, paymentMethod, notes } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'At least one item is required.' });
  }

  const database = db.get();
  let subtotal = 0;
  const processedItems: any[] = [];

  for (const item of items) {
    const product = database.products.find(p => p.id === item.productId && p.companyId === user.companyId);
    if (!product) return res.status(400).json({ error: `Product not found: ${item.productId}` });
    const qty = Number(item.quantity) || 1;
    const cost = Number(item.unitCost) !== undefined ? Number(item.unitCost) : product.purchasePrice;
    const lineTotal = qty * cost;

    product.currentStock += qty;
    product.purchasePrice = cost; // update latest purchase cost
    subtotal += lineTotal;

    processedItems.push({
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitCost: cost,
      subtotal: lineTotal
    });
  }

  const disc = Number(discount) || 0;
  const tx = Number(tax) || 0;
  const extra = Number(additionalCharges) || 0;
  const grandTotal = Math.max(0, subtotal - disc + tx + extra);
  const paid = Math.min(grandTotal, Number(amountPaid) || 0);
  const due = Math.max(0, grandTotal - paid);

  const invoiceNumber = `PUR-${new Date().getFullYear()}-${(database.purchaseInvoices.filter(p => p.companyId === user.companyId).length + 101)}`;

  let finalSupplierId = supplierId;
  let finalSupplierName = supplierName || 'General Supplier';

  if (finalSupplierId) {
    const existingSup = database.suppliers.find(s => s.id === finalSupplierId && s.companyId === user.companyId);
    if (existingSup) {
      existingSup.currentBalance += due;
      finalSupplierName = existingSup.companyName || existingSup.name;
    }
  } else if (supplierName) {
    const newSup: Supplier = {
      id: `sup_${Date.now()}`,
      companyId: user.companyId!,
      name: supplierName,
      companyName: supplierName,
      phone: supplierPhone || '',
      openingBalance: 0,
      currentBalance: due,
      createdAt: new Date().toISOString()
    };
    database.suppliers.push(newSup);
    finalSupplierId = newSup.id;
  }

  const purchase: PurchaseInvoice = {
    id: `po_${Date.now()}`,
    companyId: user.companyId!,
    invoiceNumber,
    date: new Date().toISOString().split('T')[0],
    supplierId: finalSupplierId || '',
    supplierName: finalSupplierName,
    supplierPhone: supplierPhone || '',
    items: processedItems,
    subtotal,
    discount: disc,
    tax: tx,
    additionalCharges: extra,
    grandTotal,
    amountPaid: paid,
    outstandingBalance: due,
    paymentMethod: paymentMethod || 'BANK',
    notes: notes || '',
    status: due === 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'DUE'),
    createdAt: new Date().toISOString()
  };

  database.purchaseInvoices.push(purchase);

  // Stock movements
  for (const item of processedItems) {
    const prod = database.products.find(p => p.id === item.productId);
    database.stockMovements.push({
      id: `mov_${Date.now()}_${item.productId}`,
      companyId: user.companyId!,
      productId: item.productId,
      productName: item.productName,
      type: 'PURCHASE',
      quantity: item.quantity,
      date: purchase.date,
      referenceId: purchase.id,
      referenceNumber: purchase.invoiceNumber,
      balanceAfter: prod ? prod.currentStock : 0,
      notes: `Purchased on ${purchase.invoiceNumber} from ${purchase.supplierName}`
    });
  }

  // Supplier Ledger
  if (finalSupplierId) {
    database.ledgerEntries.push({
      id: `led_${Date.now()}_po`,
      companyId: user.companyId!,
      partyType: 'SUPPLIER',
      partyId: finalSupplierId,
      partyName: finalSupplierName,
      date: purchase.date,
      type: 'INVOICE',
      referenceNumber: purchase.invoiceNumber,
      description: `Purchase Invoice ${purchase.invoiceNumber}`,
      debit: 0,
      credit: purchase.grandTotal,
      runningBalance: due
    });

    if (paid > 0) {
      database.ledgerEntries.push({
        id: `led_${Date.now()}_popay`,
        companyId: user.companyId!,
        partyType: 'SUPPLIER',
        partyId: finalSupplierId,
        partyName: finalSupplierName,
        date: purchase.date,
        type: 'PAYMENT',
        referenceNumber: `PMT-${purchase.invoiceNumber}`,
        description: `Payment to supplier via ${purchase.paymentMethod}`,
        debit: paid,
        credit: 0,
        runningBalance: due
      });
    }
  }

  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    user.demoUsageCount += 1;
  }

  db.save();
  db.logAudit(user.companyId, user.id, user.email, 'CREATE_PURCHASE', `Logged Purchase Invoice ${purchase.invoiceNumber} from ${purchase.supplierName} (BDT ${purchase.grandTotal})`);

  res.status(201).json(purchase);
});

// Customers & Suppliers
app.get('/api/company/customers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json(db.get().customers.filter(c => c.companyId === user.companyId));
});

app.post('/api/company/customers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const limitCheck = checkDemoLimit(user);
  if (!limitCheck.allowed) return res.status(403).json({ error: limitCheck.message });

  const { name, phone, email, address, openingBalance, creditLimit } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Customer name and phone number are required.' });

  const opBal = Number(openingBalance) || 0;
  const customer: Customer = {
    id: `cust_${Date.now()}`,
    companyId: user.companyId!,
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    address: address ? address.trim() : '',
    openingBalance: opBal,
    currentBalance: opBal,
    creditLimit: Number(creditLimit) || 50000,
    createdAt: new Date().toISOString()
  };

  const database = db.get();
  database.customers.push(customer);

  if (opBal !== 0) {
    database.ledgerEntries.push({
      id: `led_${Date.now()}_opn`,
      companyId: user.companyId!,
      partyType: 'CUSTOMER',
      partyId: customer.id,
      partyName: customer.name,
      date: new Date().toISOString().split('T')[0],
      type: 'OPENING',
      referenceNumber: 'OPN-BAL',
      description: 'Customer opening receivable balance',
      debit: opBal > 0 ? opBal : 0,
      credit: opBal < 0 ? Math.abs(opBal) : 0,
      runningBalance: opBal
    });
  }

  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    user.demoUsageCount += 1;
  }

  db.save();
  res.status(201).json(customer);
});

app.get('/api/company/suppliers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json(db.get().suppliers.filter(s => s.companyId === user.companyId));
});

app.post('/api/company/suppliers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const limitCheck = checkDemoLimit(user);
  if (!limitCheck.allowed) return res.status(403).json({ error: limitCheck.message });

  const { name, companyName, phone, email, address, openingBalance } = req.body;
  if (!name && !companyName) return res.status(400).json({ error: 'Supplier or company name is required.' });

  const opBal = Number(openingBalance) || 0;
  const supplier: Supplier = {
    id: `sup_${Date.now()}`,
    companyId: user.companyId!,
    name: (name || companyName).trim(),
    companyName: (companyName || name).trim(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim() : '',
    address: address ? address.trim() : '',
    openingBalance: opBal,
    currentBalance: opBal,
    createdAt: new Date().toISOString()
  };

  const database = db.get();
  database.suppliers.push(supplier);

  if (opBal !== 0) {
    database.ledgerEntries.push({
      id: `led_${Date.now()}_opn`,
      companyId: user.companyId!,
      partyType: 'SUPPLIER',
      partyId: supplier.id,
      partyName: supplier.companyName,
      date: new Date().toISOString().split('T')[0],
      type: 'OPENING',
      referenceNumber: 'OPN-BAL',
      description: 'Supplier opening payable balance',
      debit: 0,
      credit: opBal,
      runningBalance: opBal
    });
  }

  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    user.demoUsageCount += 1;
  }

  db.save();
  res.status(201).json(supplier);
});

// Ledgers
app.get('/api/company/ledgers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const { partyType, partyId } = req.query;
  const database = db.get();
  let entries = database.ledgerEntries.filter(l => l.companyId === user.companyId);

  if (partyType) entries = entries.filter(l => l.partyType === partyType);
  if (partyId) entries = entries.filter(l => l.partyId === partyId);

  res.json(entries);
});

// Accounting & Cashbook
app.get('/api/company/accounting', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const companyId = user.companyId!;
  const database = db.get();

  const accounts = database.accounts.filter(a => a.companyId === companyId);
  const journals = database.journalEntries.filter(j => j.companyId === companyId);
  const sales = database.salesInvoices.filter(s => s.companyId === companyId);
  const purchases = database.purchaseInvoices.filter(p => p.companyId === companyId);
  const expenses = database.expenses.filter(e => e.companyId === companyId);

  const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0);

  // Daily cashbook
  const cashbook = [
    ...sales.map(s => ({
      date: s.date,
      type: 'IN',
      category: 'Sales Invoice',
      ref: s.invoiceNumber,
      party: s.customerName,
      amount: s.amountPaid,
      method: s.paymentMethod
    })),
    ...purchases.map(p => ({
      date: p.date,
      type: 'OUT',
      category: 'Supplier Purchase',
      ref: p.invoiceNumber,
      party: p.supplierName,
      amount: p.amountPaid,
      method: p.paymentMethod
    })),
    ...expenses.map(e => ({
      date: e.date,
      type: 'OUT',
      category: e.category,
      ref: e.referenceNumber || 'EXP',
      party: e.payee,
      amount: e.amount,
      method: 'CASH'
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));

  res.json({
    accounts,
    journals: journals.reverse(),
    cashbook,
    summary: {
      totalSales,
      totalExpenses,
      totalPurchases,
      netCashFlow: cashbook.reduce((sum, item) => sum + (item.type === 'IN' ? item.amount : -item.amount), 0)
    }
  });
});

// Expenses
app.get('/api/company/expenses', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json(db.get().expenses.filter(e => e.companyId === user.companyId).reverse());
});

app.post('/api/company/expenses', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const limitCheck = checkDemoLimit(user);
  if (!limitCheck.allowed) return res.status(403).json({ error: limitCheck.message });

  const { category, amount, description, payee, paymentAccount, referenceNumber, notes } = req.body;
  if (!category || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Expense category and valid amount are required.' });
  }

  const database = db.get();
  const expense: Expense = {
    id: `exp_${Date.now()}`,
    companyId: user.companyId!,
    category: category.trim(),
    date: new Date().toISOString().split('T')[0],
    description: (description || category).trim(),
    amount: Number(amount),
    paymentAccount: paymentAccount || 'Cash in Hand',
    payee: (payee || 'Direct Expense').trim(),
    referenceNumber: referenceNumber || `EXP-${Date.now().toString().slice(-4)}`,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  database.expenses.push(expense);

  // Journal entry
  database.journalEntries.push({
    id: `je_${Date.now()}`,
    companyId: user.companyId!,
    date: expense.date,
    reference: expense.referenceNumber || 'EXP',
    description: `Expense: ${expense.category} - ${expense.payee}`,
    debits: [{ accountId: 'acc_operating_exp', accountName: `Expense (${expense.category})`, amount: expense.amount }],
    credits: [{ accountId: 'acc_cash', accountName: 'Cash / Bank', amount: expense.amount }],
    totalAmount: expense.amount
  });

  if (user.role === 'GUEST' || user.companyId === 'demo_tenant') {
    user.demoUsageCount += 1;
  }

  db.save();
  db.logAudit(user.companyId, user.id, user.email, 'LOG_EXPENSE', `Logged expense: ${expense.category} (BDT ${expense.amount})`);

  res.status(201).json(expense);
});

// Employees
app.get('/api/company/employees', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json(db.get().employees.filter(e => e.companyId === user.companyId));
});

app.post('/api/company/employees', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const database = db.get();
  const company = database.companies.find(c => c.id === user.companyId);
  const currentCount = database.employees.filter(e => e.companyId === user.companyId).length;
  const limit = company?.subscription?.employeeLimit || 3;

  if (currentCount >= limit) {
    return res.status(400).json({ error: `Employee limit of ${limit} reached under your current subscription plan (${company?.subscription?.planName}). Please upgrade to add more staff.` });
  }

  const { name, email, phone, role, designation, department, salary } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Employee name, email, and phone number are required.' });
  }

  const employee: any = {
    id: `emp_${Date.now()}`,
    companyId: user.companyId!,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: role || 'STAFF',
    designation: designation || 'Staff Member',
    department: department || 'Operations',
    salary: Number(salary) || 0,
    status: 'ACTIVE',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  database.employees.push(employee);
  db.save();
  res.status(201).json(employee);
});

// Dealers & Distribution
app.get('/api/company/dealers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  res.json(db.get().dealers.filter(d => d.companyId === user.companyId));
});

app.post('/api/company/dealers', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const { dealerName, businessName, phone, email, territory, creditLimit, commissionRate, priceTier } = req.body;
  if (!dealerName || !businessName || !phone) {
    return res.status(400).json({ error: 'Dealer name, business name, and phone are required.' });
  }

  const dealer: any = {
    id: `dlr_${Date.now()}`,
    companyId: user.companyId!,
    dealerName: dealerName.trim(),
    businessName: businessName.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    territory: territory || 'National',
    creditLimit: Number(creditLimit) || 100000,
    currentBalance: 0,
    commissionRate: Number(commissionRate) || 5,
    priceTier: priceTier || 'DEALER'
  };

  const database = db.get();
  database.dealers.push(dealer);
  db.save();
  res.status(201).json(dealer);
});

// Specialized Business Category Extensions (Restaurant, Hotel, Vehicle, Manufacturing)
app.get('/api/company/extensions', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const companyId = user.companyId!;
  const database = db.get();

  res.json({
    restaurantTables: database.restaurantTables.filter(t => t.companyId === companyId),
    hotelRooms: database.hotelRooms.filter(r => r.companyId === companyId),
    vehicles: database.vehicleRecords.filter(v => v.companyId === companyId),
    manufacturingOrders: database.manufacturingOrders.filter(m => m.companyId === companyId)
  });
});

app.post('/api/company/extensions/restaurant/table-status', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const { tableId, status, guestCount } = req.body;
  const database = db.get();
  const table = database.restaurantTables.find(t => t.id === tableId && t.companyId === user.companyId);
  if (!table) return res.status(404).json({ error: 'Table not found' });
  table.status = status;
  if (guestCount !== undefined) table.guestCount = guestCount;
  db.save();
  res.json(table);
});

app.post('/api/company/extensions/hotel/room-status', requireTenantAuth, (req, res) => {
  const user = (req as any).user as User;
  const { roomId, status, guestName, checkInDate, checkOutDate } = req.body;
  const database = db.get();
  const room = database.hotelRooms.find(r => r.id === roomId && r.companyId === user.companyId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  room.status = status;
  if (guestName !== undefined) room.currentGuestName = guestName;
  if (checkInDate !== undefined) room.checkInDate = checkInDate;
  if (checkOutDate !== undefined) room.checkOutDate = checkOutDate;
  db.save();
  res.json(room);
});

/* ========================================================================== */
/* VITE DEV / PRODUCTION MIDDLEWARE INTEGRATION                               */
/* ========================================================================== */

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Data & Code BAS] Server running on port ${PORT}`);
  });
}

startServer();
