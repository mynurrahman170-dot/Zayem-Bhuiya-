export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COMPANY_OWNER' 
  | 'COMPANY_ADMIN' 
  | 'ACCOUNTANT' 
  | 'SALES' 
  | 'PURCHASE' 
  | 'INVENTORY' 
  | 'CASHIER' 
  | 'GUEST';

export type UserStatus = 'ACTIVE' | 'DEMO_PENDING' | 'SUSPENDED' | 'REJECTED';

export type BusinessCategory = 
  | 'retail' 
  | 'dealership' 
  | 'restaurant' 
  | 'hotel' 
  | 'vehicle' 
  | 'manufacturing';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  companyId?: string | null;
  status: UserStatus;
  demoUsageCount: number;
  maxDemoRecords: number;
  demoRemaining: number;
  createdAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  employeeLimit: number;
  businessUnitLimit: number;
  features: string[];
}

export interface Company {
  id: string;
  name: string;
  slogan?: string;
  proprietor: string;
  address: string;
  phone: string;
  email: string;
  socialLinks?: {
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
  logo?: string;
  businessCategory: BusinessCategory;
  subscription: {
    planId: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
    employeeLimit: number;
    businessUnitLimit: number;
  };
  approvedEmails: string[];
  approvedPhones: string[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  currency: string;
  taxVatPercent: number;
  createdAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  dealerPrice: number;
  currentStock: number;
  minStockThreshold: number;
  supplierId: string;
  supplierName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  type: 'PURCHASE' | 'SALE' | 'PURCHASE_RETURN' | 'SALES_RETURN' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  referenceId: string;
  referenceNumber: string;
  balanceAfter: number;
  notes?: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number; // positive = customer owes company
  creditLimit: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number; // positive = company owes supplier
  createdAt: string;
}

export interface SalesItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface SalesInvoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: SalesItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentMethod: 'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'CREDIT';
  salesperson: string;
  notes?: string;
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'CANCELLED';
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseInvoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  grandTotal: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentMethod: 'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'CREDIT';
  notes?: string;
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'CANCELLED';
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  companyId: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  partyId: string;
  partyName: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT' | 'OPENING';
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface Expense {
  id: string;
  companyId: string;
  category: string;
  date: string;
  description: string;
  amount: number;
  paymentAccount: string;
  payee: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  date: string;
  reference: string;
  description: string;
  debits: { accountId: string; accountName: string; amount: number }[];
  credits: { accountId: string; accountName: string; amount: number }[];
  totalAmount: number;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  salary: number;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

export interface Dealer {
  id: string;
  companyId: string;
  dealerName: string;
  businessName: string;
  phone: string;
  email: string;
  territory: string;
  creditLimit: number;
  currentBalance: number;
  commissionRate: number;
  priceTier: 'DEALER' | 'WHOLESALE';
}

export interface AuditLog {
  id: string;
  companyId?: string | null;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DashboardKPIs {
  todaySalesAmount: number;
  todayPurchasesAmount: number;
  periodSalesTotal: number;
  cashReceived: number;
  cashPaid: number;
  totalCustomerReceivables: number;
  totalSupplierPayables: number;
  currentStockValue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  daysRemaining: number;
  subscriptionStatus: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  lowStockProducts: Product[];
  recentSales: SalesInvoice[];
  recentPurchases: PurchaseInvoice[];
}
