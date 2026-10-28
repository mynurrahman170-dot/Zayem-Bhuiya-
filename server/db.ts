import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'COMPANY_OWNER' | 'COMPANY_ADMIN' | 'ACCOUNTANT' | 'SALES' | 'PURCHASE' | 'INVENTORY' | 'CASHIER' | 'GUEST';
  companyId?: string | null;
  status: 'ACTIVE' | 'DEMO_PENDING' | 'SUSPENDED' | 'REJECTED';
  demoUsageCount: number; // tracks creations in demo sandbox (max 5)
  createdAt: string;
  passwordHash: string; // simulated hash
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
  businessCategory: 'retail' | 'dealership' | 'restaurant' | 'hotel' | 'vehicle' | 'manufacturing';
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
  currency: string; // e.g. BDT
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
  expiryDate?: string;
  image?: string;
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
  currentBalance: number; // positive = customer owes company (receivable)
  creditLimit: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  companyName: string;
  address?: string;
  openingBalance: number;
  currentBalance: number; // positive = company owes supplier (payable)
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

export interface RestaurantTable {
  id: string;
  companyId: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  currentOrderId?: string;
  guestCount?: number;
}

export interface HotelRoom {
  id: string;
  companyId: string;
  roomNumber: string;
  type: 'DELUXE' | 'SUITE' | 'STANDARD' | 'EXECUTIVE';
  ratePerNight: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
  currentGuestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface VehicleRecord {
  id: string;
  companyId: string;
  regNumber: string;
  model: string;
  make: string;
  year: number;
  type: 'RENTAL' | 'FOR_SALE' | 'LOGISTICS';
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_SERVICE' | 'SOLD';
  dailyRateOrPrice: number;
  mileage: number;
}

export interface ManufacturingOrder {
  id: string;
  companyId: string;
  batchNumber: string;
  productName: string;
  targetQuantity: number;
  producedQuantity: number;
  rawMaterialsSummary: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: string;
  endDate?: string;
}

export interface DatabaseSchema {
  users: User[];
  companies: Company[];
  subscriptionPlans: SubscriptionPlan[];
  products: Product[];
  stockMovements: StockMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  ledgerEntries: LedgerEntry[];
  expenses: Expense[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  employees: Employee[];
  dealers: Dealer[];
  restaurantTables: RestaurantTable[];
  hotelRooms: HotelRoom[];
  vehicleRecords: VehicleRecord[];
  manufacturingOrders: ManufacturingOrder[];
  auditLogs: AuditLog[];
  platformSettings: {
    maxDemoRecords: number;
    platformName: string;
    platformTagline: string;
    supportEmail: string;
    supportPhone: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialData(): DatabaseSchema {
  return {
    platformSettings: {
      maxDemoRecords: 5,
      platformName: "Data & Code — Business Automation System",
      platformTagline: "Precision Data & Software Solutions",
      supportEmail: "support@datancode.com",
      supportPhone: "+880 1800 000000"
    },
    subscriptionPlans: [
      {
        id: 'small',
        name: 'Starter Business',
        tagline: 'Ideal for single proprietor retail shops and independent stores',
        monthlyPrice: 1999,
        annualPrice: 19990,
        employeeLimit: 3,
        businessUnitLimit: 1,
        features: [
          'Single Business Unit',
          'Up to 3 Staff Logins',
          'Sales, Purchases & Stock Tracking',
          'Customer Dues & Supplier Payables',
          'Daily Cashbook & Expense Logging',
          'Printable Memos & A4 Invoices'
        ]
      },
      {
        id: 'medium',
        name: 'Growth Enterprise',
        tagline: 'For multi-branch dealerships, distributors, and growing teams',
        monthlyPrice: 4999,
        annualPrice: 49990,
        employeeLimit: 15,
        businessUnitLimit: 3,
        features: [
          'Up to 3 Business Branches',
          'Up to 15 Staff with Role-Based Access',
          'Dealer Pricing & Commission Engine',
          'Customer & Supplier Detailed Ledgers',
          'Double-Entry Accounting & P&L Statements',
          'Low-Stock Automated Alerts & Barcode',
          'Custom Logo Branding on Invoices & Receipts'
        ]
      },
      {
        id: 'large',
        name: 'Corporate Scale',
        tagline: 'For large conglomerates, restaurants, hotels, vehicles & manufacturing',
        monthlyPrice: 9999,
        annualPrice: 99990,
        employeeLimit: 60,
        businessUnitLimit: 10,
        features: [
          'Up to 10 Branches / Business Units',
          '60+ Employees with Audit Trail',
          'Specialized Modules: Restaurant (KOT), Hotel (Rooms), Vehicle Fleet, Manufacturing (BOM)',
          'Comprehensive Balance Sheet & Trial Balance',
          'Priority Dedicated SLA & Data Backup'
        ]
      }
    ],
    companies: [
      {
        id: 'comp_apex_retail',
        name: 'Apex Smart Electronics Ltd.',
        slogan: 'Precision Gadgets & Home Appliances',
        proprietor: 'Engr. Tanvir Ahmed',
        address: 'House #42, Road #11, Block-D, Banani, Dhaka-1213, Bangladesh',
        phone: '+880 1711 234567',
        email: 'billing@apexsmart.bd',
        socialLinks: {
          facebook: 'https://facebook.com/apexsmart',
          whatsapp: '+8801711234567',
          website: 'https://apexsmart.bd'
        },
        businessCategory: 'retail',
        subscription: {
          planId: 'medium',
          planName: 'Growth Enterprise',
          startDate: '2026-01-01',
          endDate: '2027-01-01',
          status: 'ACTIVE',
          employeeLimit: 15,
          businessUnitLimit: 3
        },
        approvedEmails: ['owner@apexretail.bd', 'manager@apexretail.bd', 'sales@apexretail.bd'],
        approvedPhones: ['+8801711234567'],
        status: 'ACTIVE',
        currency: 'BDT',
        taxVatPercent: 5,
        createdAt: '2026-01-01T10:00:00Z'
      },
      {
        id: 'comp_bengal_dealers',
        name: 'Bengal Agro & Motor Distributing',
        slogan: 'Trusted Farm Machinery & Commercial Vehicles',
        proprietor: 'Md. Rafiqul Islam',
        address: 'Plot 18, Commercial Zone, Station Road, Bogura-5800, Bangladesh',
        phone: '+880 1819 876543',
        email: 'info@bengalagro.bd',
        socialLinks: {
          facebook: 'https://facebook.com/bengalagro',
          whatsapp: '+8801819876543',
          website: 'https://bengalagro.bd'
        },
        businessCategory: 'dealership',
        subscription: {
          planId: 'large',
          planName: 'Corporate Scale',
          startDate: '2026-02-15',
          endDate: '2027-02-15',
          status: 'ACTIVE',
          employeeLimit: 60,
          businessUnitLimit: 10
        },
        approvedEmails: ['owner@bengaldealers.bd'],
        approvedPhones: ['+8801819876543'],
        status: 'ACTIVE',
        currency: 'BDT',
        taxVatPercent: 0,
        createdAt: '2026-02-15T12:00:00Z'
      },
      {
        id: 'demo_tenant',
        name: 'Demo Enterprises Ltd.',
        slogan: 'Interactive Sandbox Environment',
        proprietor: 'Demo Explorer',
        address: 'Data & Code Sandbox Suite, Tech Park, Dhaka',
        phone: '+880 1900 112233',
        email: 'demo@sandbox.datancode.com',
        businessCategory: 'retail',
        subscription: {
          planId: 'small',
          planName: 'Sandbox Trial',
          startDate: '2026-10-01',
          endDate: '2026-11-01',
          status: 'TRIAL',
          employeeLimit: 3,
          businessUnitLimit: 1
        },
        approvedEmails: ['guest@demo.com'],
        approvedPhones: ['+8801900112233'],
        status: 'ACTIVE',
        currency: 'BDT',
        taxVatPercent: 5,
        createdAt: '2026-10-01T00:00:00Z'
      }
    ],
    users: [
      {
        id: 'user_super_admin',
        name: 'Platform Super Admin',
        email: 'admin@datancode.com',
        phone: '+880 1800 000000',
        role: 'SUPER_ADMIN',
        companyId: null,
        status: 'ACTIVE',
        demoUsageCount: 0,
        createdAt: '2026-01-01T00:00:00Z',
        passwordHash: 'admin123'
      },
      {
        id: 'user_apex_owner',
        name: 'Tanvir Ahmed',
        email: 'owner@apexretail.bd',
        phone: '+880 1711 234567',
        role: 'COMPANY_OWNER',
        companyId: 'comp_apex_retail',
        status: 'ACTIVE',
        demoUsageCount: 0,
        createdAt: '2026-01-01T10:00:00Z',
        passwordHash: 'apex123'
      },
      {
        id: 'user_apex_sales',
        name: 'Kamrul Hasan',
        email: 'sales@apexretail.bd',
        phone: '+880 1711 998877',
        role: 'SALES',
        companyId: 'comp_apex_retail',
        status: 'ACTIVE',
        demoUsageCount: 0,
        createdAt: '2026-01-10T10:00:00Z',
        passwordHash: 'sales123'
      },
      {
        id: 'user_bengal_owner',
        name: 'Md. Rafiqul Islam',
        email: 'owner@bengaldealers.bd',
        phone: '+880 1819 876543',
        role: 'COMPANY_OWNER',
        companyId: 'comp_bengal_dealers',
        status: 'ACTIVE',
        demoUsageCount: 0,
        createdAt: '2026-02-15T12:00:00Z',
        passwordHash: 'bengal123'
      },
      {
        id: 'user_demo_guest',
        name: 'Guest Explorer',
        email: 'demo@datancode.com',
        phone: '+880 1900 999888',
        role: 'GUEST',
        companyId: 'demo_tenant',
        status: 'DEMO_PENDING',
        demoUsageCount: 1, // 1 used out of 5
        createdAt: '2026-10-26T00:00:00Z',
        passwordHash: 'demo123'
      }
    ],
    products: [
      {
        id: 'prod_101',
        companyId: 'comp_apex_retail',
        name: 'Smart 4K UHD LED TV 55"',
        sku: 'APX-TV-55-4K',
        barcode: '8901234567891',
        category: 'Electronics',
        brand: 'ApexVision',
        unit: 'Pcs',
        purchasePrice: 42000,
        sellingPrice: 56000,
        wholesalePrice: 50000,
        dealerPrice: 48000,
        currentStock: 14,
        minStockThreshold: 5,
        supplierId: 'sup_1',
        supplierName: 'Global Tech Components Ltd',
        status: 'ACTIVE',
        createdAt: '2026-01-05T00:00:00Z'
      },
      {
        id: 'prod_102',
        companyId: 'comp_apex_retail',
        name: 'Inverter Refrigerator 380L',
        sku: 'APX-REF-380',
        barcode: '8901234567892',
        category: 'Appliances',
        brand: 'FrostMaster',
        unit: 'Pcs',
        purchasePrice: 38000,
        sellingPrice: 49500,
        wholesalePrice: 45000,
        dealerPrice: 43000,
        currentStock: 4, // low stock alert!
        minStockThreshold: 6,
        supplierId: 'sup_1',
        supplierName: 'Global Tech Components Ltd',
        status: 'ACTIVE',
        createdAt: '2026-01-06T00:00:00Z'
      },
      {
        id: 'prod_103',
        companyId: 'comp_apex_retail',
        name: 'Split AC 1.5 Ton Dual Inverter',
        sku: 'APX-AC-15TON',
        barcode: '8901234567893',
        category: 'Appliances',
        brand: 'CoolWave',
        unit: 'Pcs',
        purchasePrice: 45000,
        sellingPrice: 58000,
        wholesalePrice: 52000,
        dealerPrice: 50000,
        currentStock: 9,
        minStockThreshold: 3,
        supplierId: 'sup_2',
        supplierName: 'Cooling Systems BD',
        status: 'ACTIVE',
        createdAt: '2026-01-07T00:00:00Z'
      },
      {
        id: 'prod_demo_1',
        companyId: 'demo_tenant',
        name: 'Demo Wireless Barcode Scanner',
        sku: 'DEMO-SCAN-01',
        barcode: '778899001122',
        category: 'Demo Hardware',
        brand: 'FastScan',
        unit: 'Pcs',
        purchasePrice: 2500,
        sellingPrice: 3900,
        wholesalePrice: 3200,
        dealerPrice: 3000,
        currentStock: 10,
        minStockThreshold: 3,
        supplierId: 'sup_demo_1',
        supplierName: 'Demo Supplier Co.',
        status: 'ACTIVE',
        createdAt: '2026-10-26T00:00:00Z'
      }
    ],
    stockMovements: [
      {
        id: 'mov_1',
        companyId: 'comp_apex_retail',
        productId: 'prod_101',
        productName: 'Smart 4K UHD LED TV 55"',
        type: 'PURCHASE',
        quantity: 15,
        date: '2026-10-15',
        referenceId: 'po_1',
        referenceNumber: 'PUR-2026-001',
        balanceAfter: 15,
        notes: 'Initial batch received'
      },
      {
        id: 'mov_2',
        companyId: 'comp_apex_retail',
        productId: 'prod_101',
        productName: 'Smart 4K UHD LED TV 55"',
        type: 'SALE',
        quantity: -1,
        date: '2026-10-25',
        referenceId: 'inv_1',
        referenceNumber: 'INV-2026-1001',
        balanceAfter: 14,
        notes: 'Sold to Rahim Enterprise'
      }
    ],
    customers: [
      {
        id: 'cust_1',
        companyId: 'comp_apex_retail',
        name: 'Rahim Electronics Store',
        phone: '+880 1712 345678',
        email: 'rahim@retailer.bd',
        address: 'Shop 14, Stadium Market, Dhaka',
        openingBalance: 0,
        currentBalance: 20000, // Due receivable
        creditLimit: 100000,
        createdAt: '2026-01-10T00:00:00Z'
      },
      {
        id: 'cust_2',
        companyId: 'comp_apex_retail',
        name: 'Karim Ahmed (Retail Cash)',
        phone: '+880 1819 123456',
        email: 'karim@gmail.com',
        address: 'Dhanmondi 27, Dhaka',
        openingBalance: 0,
        currentBalance: 0,
        creditLimit: 0,
        createdAt: '2026-01-15T00:00:00Z'
      },
      {
        id: 'cust_demo_1',
        companyId: 'demo_tenant',
        name: 'Sample Demo Customer',
        phone: '+880 1700 000001',
        email: 'customer@demosample.com',
        address: 'Demo Road, Dhaka',
        openingBalance: 0,
        currentBalance: 1500,
        creditLimit: 50000,
        createdAt: '2026-10-26T00:00:00Z'
      }
    ],
    suppliers: [
      {
        id: 'sup_1',
        companyId: 'comp_apex_retail',
        name: 'Engr. Masud Karim',
        phone: '+880 1730 001122',
        email: 'orders@globaltech.bd',
        companyName: 'Global Tech Components Ltd',
        address: 'Tejgaon Industrial Area, Dhaka',
        openingBalance: 0,
        currentBalance: 140000, // Payable balance
        createdAt: '2026-01-05T00:00:00Z'
      },
      {
        id: 'sup_2',
        companyId: 'comp_apex_retail',
        name: 'Saiful Islam',
        phone: '+880 1811 556677',
        email: 'cooling@bangla.net',
        companyName: 'Cooling Systems BD',
        address: 'Chittagong Port Zone',
        openingBalance: 0,
        currentBalance: 55000,
        createdAt: '2026-01-06T00:00:00Z'
      },
      {
        id: 'sup_demo_1',
        companyId: 'demo_tenant',
        name: 'Demo Wholesale Partner',
        phone: '+880 1800 112244',
        companyName: 'Demo Supplier Co.',
        address: 'Demo Wholesale Market',
        openingBalance: 0,
        currentBalance: 5000,
        createdAt: '2026-10-26T00:00:00Z'
      }
    ],
    salesInvoices: [
      {
        id: 'inv_1',
        companyId: 'comp_apex_retail',
        invoiceNumber: 'INV-2026-1001',
        date: '2026-10-25',
        customerId: 'cust_1',
        customerName: 'Rahim Electronics Store',
        customerPhone: '+880 1712 345678',
        customerAddress: 'Shop 14, Stadium Market, Dhaka',
        items: [
          {
            productId: 'prod_101',
            productName: 'Smart 4K UHD LED TV 55"',
            sku: 'APX-TV-55-4K',
            quantity: 1,
            unitPrice: 56000,
            discount: 1000,
            subtotal: 55000
          }
        ],
        subtotal: 55000,
        discount: 0,
        tax: 2750, // 5% VAT
        grandTotal: 57750,
        amountPaid: 37750,
        outstandingBalance: 20000,
        paymentMethod: 'BKASH',
        salesperson: 'Kamrul Hasan',
        notes: 'Partial payment received via Bkash. Remaining due in 7 days.',
        status: 'PARTIAL',
        createdAt: '2026-10-25T14:30:00Z'
      }
    ],
    purchaseInvoices: [
      {
        id: 'po_1',
        companyId: 'comp_apex_retail',
        invoiceNumber: 'PUR-2026-001',
        date: '2026-10-15',
        supplierId: 'sup_1',
        supplierName: 'Global Tech Components Ltd',
        supplierPhone: '+880 1730 001122',
        items: [
          {
            productId: 'prod_101',
            productName: 'Smart 4K UHD LED TV 55"',
            quantity: 10,
            unitCost: 42000,
            subtotal: 420000
          }
        ],
        subtotal: 420000,
        discount: 10000,
        tax: 0,
        additionalCharges: 2000,
        grandTotal: 412000,
        amountPaid: 272000,
        outstandingBalance: 140000,
        paymentMethod: 'BANK',
        notes: 'Commercial consignment cleared.',
        status: 'PARTIAL',
        createdAt: '2026-10-15T11:00:00Z'
      }
    ],
    ledgerEntries: [
      {
        id: 'led_1',
        companyId: 'comp_apex_retail',
        partyType: 'CUSTOMER',
        partyId: 'cust_1',
        partyName: 'Rahim Electronics Store',
        date: '2026-10-25',
        type: 'INVOICE',
        referenceNumber: 'INV-2026-1001',
        description: 'Sales Invoice INV-2026-1001 (Smart 4K UHD LED TV 55")',
        debit: 57750,
        credit: 0,
        runningBalance: 57750
      },
      {
        id: 'led_2',
        companyId: 'comp_apex_retail',
        partyType: 'CUSTOMER',
        partyId: 'cust_1',
        partyName: 'Rahim Electronics Store',
        date: '2026-10-25',
        type: 'PAYMENT',
        referenceNumber: 'REC-BKASH-891',
        description: 'Bkash payment received against INV-2026-1001',
        debit: 0,
        credit: 37750,
        runningBalance: 20000
      },
      {
        id: 'led_3',
        companyId: 'comp_apex_retail',
        partyType: 'SUPPLIER',
        partyId: 'sup_1',
        partyName: 'Global Tech Components Ltd',
        date: '2026-10-15',
        type: 'INVOICE',
        referenceNumber: 'PUR-2026-001',
        description: 'Purchase consignment 10x 55" LED TV',
        debit: 0,
        credit: 412000,
        runningBalance: 412000
      },
      {
        id: 'led_4',
        companyId: 'comp_apex_retail',
        partyType: 'SUPPLIER',
        partyId: 'sup_1',
        partyName: 'Global Tech Components Ltd',
        date: '2026-10-15',
        type: 'PAYMENT',
        referenceNumber: 'CHQ-BRAC-778',
        description: 'Bank payment via Brac Bank Cheque',
        debit: 272000,
        credit: 0,
        runningBalance: 140000
      }
    ],
    expenses: [
      {
        id: 'exp_1',
        companyId: 'comp_apex_retail',
        category: 'Showroom Rent',
        date: '2026-10-01',
        description: 'Banani Showroom monthly lease rent',
        amount: 45000,
        paymentAccount: 'acc_bank_brac',
        payee: 'Haji Shamsul Huda (Landlord)',
        referenceNumber: 'RENT-OCT-26',
        notes: 'Monthly lease voucher #104',
        createdAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'exp_2',
        companyId: 'comp_apex_retail',
        category: 'Electricity & Utilities',
        date: '2026-10-10',
        description: 'DESCO Commercial Power Bill',
        amount: 14200,
        paymentAccount: 'acc_cash',
        payee: 'DESCO Counter',
        referenceNumber: 'DESCO-99812',
        notes: 'Paid via Cash',
        createdAt: '2026-10-10T12:30:00Z'
      },
      {
        id: 'exp_3',
        companyId: 'comp_apex_retail',
        category: 'Staff Tea & Snacks',
        date: '2026-10-24',
        description: 'Showroom daily refreshments & drinking water',
        amount: 1850,
        paymentAccount: 'acc_cash',
        payee: 'Corner Store',
        referenceNumber: 'SNACK-OCT-24',
        notes: 'Petty cash expense',
        createdAt: '2026-10-24T17:00:00Z'
      }
    ],
    accounts: [
      { id: 'acc_cash', companyId: 'comp_apex_retail', code: '1001', name: 'Cash in Hand (Main Drawer)', type: 'ASSET', balance: 48950 },
      { id: 'acc_bank_brac', companyId: 'comp_apex_retail', code: '1002', name: 'BRAC Bank Current A/C #1509', type: 'ASSET', balance: 385000 },
      { id: 'acc_bkash', companyId: 'comp_apex_retail', code: '1003', name: 'bKash Merchant Account', type: 'ASSET', balance: 64250 },
      { id: 'acc_ar', companyId: 'comp_apex_retail', code: '1100', name: 'Accounts Receivable (Customer Dues)', type: 'ASSET', balance: 20000 },
      { id: 'acc_inv', companyId: 'comp_apex_retail', code: '1200', name: 'Inventory Asset', type: 'ASSET', balance: 1341000 },
      { id: 'acc_ap', companyId: 'comp_apex_retail', code: '2001', name: 'Accounts Payable (Supplier Dues)', type: 'LIABILITY', balance: 195000 },
      { id: 'acc_capital', companyId: 'comp_apex_retail', code: '3001', name: 'Proprietor Capital', type: 'EQUITY', balance: 1603150 },
      { id: 'acc_sales', companyId: 'comp_apex_retail', code: '4001', name: 'Sales Revenue', type: 'REVENUE', balance: 57750 },
      { id: 'acc_cogs', companyId: 'comp_apex_retail', code: '5001', name: 'Cost of Goods Sold', type: 'EXPENSE', balance: 42000 },
      { id: 'acc_operating_exp', companyId: 'comp_apex_retail', code: '5100', name: 'Operating & Admin Expenses', type: 'EXPENSE', balance: 61050 }
    ],
    journalEntries: [
      {
        id: 'je_1',
        companyId: 'comp_apex_retail',
        date: '2026-10-25',
        reference: 'INV-2026-1001',
        description: 'Sales Invoice INV-2026-1001 with partial Bkash collection',
        debits: [
          { accountId: 'acc_bkash', accountName: 'bKash Merchant Account', amount: 37750 },
          { accountId: 'acc_ar', accountName: 'Accounts Receivable (Customer Dues)', amount: 20000 }
        ],
        credits: [
          { accountId: 'acc_sales', accountName: 'Sales Revenue', amount: 57750 }
        ],
        totalAmount: 57750
      }
    ],
    employees: [
      {
        id: 'emp_1',
        companyId: 'comp_apex_retail',
        name: 'Kamrul Hasan',
        email: 'sales@apexretail.bd',
        phone: '+880 1711 998877',
        role: 'SALES',
        designation: 'Senior Sales Executive',
        department: 'Showroom Sales',
        salary: 28000,
        status: 'ACTIVE',
        joinedDate: '2026-01-10'
      },
      {
        id: 'emp_2',
        companyId: 'comp_apex_retail',
        name: 'Nayeem Chowdhury',
        email: 'accounts@apexretail.bd',
        phone: '+880 1711 334455',
        role: 'ACCOUNTANT',
        designation: 'Accounts Officer',
        department: 'Finance & Accounts',
        salary: 35000,
        status: 'ACTIVE',
        joinedDate: '2026-02-01'
      }
    ],
    dealers: [
      {
        id: 'dlr_1',
        companyId: 'comp_bengal_dealers',
        dealerName: 'Haji Aslam Enterprise',
        businessName: 'Aslam Machinery & Spares',
        phone: '+880 1715 678901',
        email: 'aslam@machinery.bd',
        territory: 'Rajshahi Division',
        creditLimit: 500000,
        currentBalance: 125000,
        commissionRate: 4.5,
        priceTier: 'DEALER'
      }
    ],
    restaurantTables: [
      { id: 'tbl_1', companyId: 'comp_apex_retail', tableNumber: 'T-01', capacity: 4, status: 'AVAILABLE' },
      { id: 'tbl_2', companyId: 'comp_apex_retail', tableNumber: 'T-02', capacity: 2, status: 'OCCUPIED', guestCount: 2, currentOrderId: 'KOT-101' },
      { id: 'tbl_3', companyId: 'comp_apex_retail', tableNumber: 'T-VIP', capacity: 8, status: 'RESERVED' }
    ],
    hotelRooms: [
      { id: 'rm_101', companyId: 'comp_apex_retail', roomNumber: '101', type: 'DELUXE', ratePerNight: 5500, status: 'AVAILABLE' },
      { id: 'rm_102', companyId: 'comp_apex_retail', roomNumber: '102', type: 'SUITE', ratePerNight: 9500, status: 'OCCUPIED', currentGuestName: 'Dr. Tariqul Islam', checkInDate: '2026-10-25', checkOutDate: '2026-10-28' },
      { id: 'rm_103', companyId: 'comp_apex_retail', roomNumber: '103', type: 'STANDARD', ratePerNight: 3500, status: 'CLEANING' }
    ],
    vehicleRecords: [
      { id: 'vh_1', companyId: 'comp_bengal_dealers', regNumber: 'DHAKA-METRO-GA-11-2345', make: 'Toyota', model: 'HiAce Commuter Van', year: 2024, type: 'RENTAL', status: 'AVAILABLE', dailyRateOrPrice: 6500, mileage: 18400 },
      { id: 'vh_2', companyId: 'comp_bengal_dealers', regNumber: 'CHATTA-METRO-DHA-45-9876', make: 'Mahindra', model: 'PowerPlus Agro Tractor 575', year: 2025, type: 'FOR_SALE', status: 'AVAILABLE', dailyRateOrPrice: 1150000, mileage: 120 }
    ],
    manufacturingOrders: [
      {
        id: 'mfg_1',
        companyId: 'comp_bengal_dealers',
        batchNumber: 'BATCH-2026-88',
        productName: 'Automatic Seed Sowing Unit 4-Row',
        targetQuantity: 20,
        producedQuantity: 14,
        rawMaterialsSummary: 'Steel Tubing (400kg), Roller Bearings (80pcs), Fasteners (300pcs)',
        status: 'IN_PROGRESS',
        startDate: '2026-10-20'
      }
    ],
    auditLogs: [
      {
        id: 'aud_1',
        companyId: 'comp_apex_retail',
        userId: 'user_apex_owner',
        userEmail: 'owner@apexretail.bd',
        action: 'INVOICE_GENERATED',
        details: 'Generated Sales Invoice INV-2026-1001 for Rahim Electronics Store (BDT 57,750)',
        timestamp: '2026-10-25T14:30:00Z'
      },
      {
        id: 'aud_2',
        companyId: null,
        userId: 'user_super_admin',
        userEmail: 'admin@datancode.com',
        action: 'COMPANY_ACTIVATED',
        details: 'Activated Apex Smart Electronics Ltd. subscription under Growth Enterprise plan',
        timestamp: '2026-01-01T10:00:00Z'
      }
    ]
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database file, resetting to initial seed:', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  public save(dataToSave?: DatabaseSchema) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error('Failed to save database file atomically:', e);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public logAudit(companyId: string | null | undefined, userId: string, userEmail: string, action: string, details: string) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      companyId: companyId || null,
      userId,
      userEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // keep latest 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }
}

export const db = new DatabaseManager();
