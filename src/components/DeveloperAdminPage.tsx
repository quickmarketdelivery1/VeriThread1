import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Sparkles, Key, Plus, Trash2, CheckCircle2, 
  RotateCcw, Database, AlertCircle, RefreshCw, BarChart4, 
  QrCode, Users, Layers, TrendingUp, HelpCircle, Building2,
  Search, Mail, Shield, UserPlus, Filter, Clock, ChevronDown
} from 'lucide-react';
import { 
  getCoupons, addCoupon, revokeCoupon, getProducts, 
  getQRCodes, getCustomers, getBrand, resetAllData, 
  clearStorage, getAnalyticsEvents, recordAnalyticsEvent,
  getOrCreateQRCode, CouponItem,
  getBrandSignups, recordBrandSignup, deleteBrandSignup
} from '../lib/storage';
import { BrandSignupRecord } from '../types';

interface DeveloperAdminPageProps {
  onRefresh: () => void;
}

export default function DeveloperAdminPage({ onRefresh }: DeveloperAdminPageProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [brandSignups, setBrandSignups] = useState<BrandSignupRecord[]>([]);
  const [newCoupon, setNewCoupon] = useState('');
  const [couponType, setCouponType] = useState<'bypass' | 'discount'>('bypass');
  const [couponDiscount, setCouponDiscount] = useState<number>(100);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  // Brand signups filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New manual brand signup modal / form state
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandEmail, setNewBrandEmail] = useState('');
  const [newBrandPlan, setNewBrandPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [newBrandDevAccess, setNewBrandDevAccess] = useState(false);
  const [addBrandSuccess, setAddBrandSuccess] = useState('');

  // Real dynamic metrics from storage
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQRs: 0,
    totalCustomers: 0,
    totalScans: 0,
    totalBrandSignups: 0,
    currentPlan: 'Starter',
    aiLimitUsed: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCoupons(getCoupons());
    const signups = getBrandSignups();
    setBrandSignups(signups);

    const products = getProducts();
    const qrs = getQRCodes();
    const customers = getCustomers();
    const brand = getBrand();
    
    const totalScans = qrs.reduce((acc, qr) => acc + (qr.scanCount || 0), 0);
    
    setStats({
      totalProducts: products.length,
      totalQRs: qrs.length,
      totalCustomers: customers.length,
      totalScans: totalScans,
      totalBrandSignups: signups.length,
      currentPlan: brand.plan.toUpperCase(),
      aiLimitUsed: brand.aiUsedThisMonth || 0
    });
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    const cleanCode = newCoupon.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('Coupon code cannot be empty.');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      setCouponError('Codes can only contain uppercase letters, numbers, dashes, or underscores.');
      return;
    }

    const discountValue = couponType === 'bypass' ? 100 : couponDiscount;
    const success = addCoupon(cleanCode, discountValue, couponType);
    if (success) {
      setCouponSuccess(`Coupon "${cleanCode}" (${discountValue}% off) added successfully!`);
      setNewCoupon('');
      setCoupons(getCoupons());
    } else {
      setCouponError('This coupon code already exists.');
    }
  };

  const handleRevokeCoupon = (code: string) => {
    const success = revokeCoupon(code);
    if (success) {
      setCoupons(getCoupons());
      setCouponSuccess(`Coupon "${code}" has been revoked.`);
    } else {
      setCouponError(`Failed to revoke "${code}".`);
    }
  };

  const handleAddManualBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandEmail.trim()) return;

    recordBrandSignup({
      name: newBrandName.trim() || newBrandEmail.split('@')[0].toUpperCase(),
      email: newBrandEmail.trim(),
      plan: newBrandPlan,
      hasDevAccess: newBrandDevAccess,
      status: 'Active'
    });

    setAddBrandSuccess(`Brand "${newBrandName || newBrandEmail}" added successfully!`);
    setNewBrandName('');
    setNewBrandEmail('');
    setNewBrandDevAccess(false);
    setShowAddBrandModal(false);
    loadData();
    addLog(`Manually recorded brand signup: ${newBrandName || newBrandEmail} [${newBrandPlan.toUpperCase()}]`);
  };

  const simulateNewBrandSignup = () => {
    const brandNames = ['Zaria Couture', 'Eko Fusion Lab', 'Naija Weave House', 'Lekki Thread Studio', 'Asoke Modern Atelier', 'Rhomani Haute'];
    const firstNames = ['Tari', 'Amina', 'Damilola', 'Kofi', 'Oluwaseun', 'Chinedu', 'Zainab'];
    const lastNames = ['Balogun', 'Eze', 'Danjuma', 'Bello', 'Adeyemi', 'Okafor', 'Ibrahim'];
    
    const randomBrand = brandNames[Math.floor(Math.random() * brandNames.length)];
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}@${randomBrand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    
    const plans: ('starter' | 'professional' | 'enterprise')[] = ['starter', 'professional', 'enterprise'];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    
    const newRecord = recordBrandSignup({
      name: `${randomBrand} (${randomFirst} ${randomLast})`,
      email: email,
      plan: plan,
      hasDevAccess: plan === 'enterprise' || Math.random() > 0.7,
      status: Math.random() > 0.3 ? 'Active' : 'Magic Link Sent'
    });

    loadData();
    addLog(`Simulated Brand Signup: ${newRecord.name} [${newRecord.plan.toUpperCase()}] (${newRecord.email})`);
  };

  const handleDeleteBrandSignup = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the registered brand signups log?`)) {
      deleteBrandSignup(id);
      loadData();
      addLog(`Deleted brand signup entry: ${name}`);
    }
  };

  const handleResetToSample = () => {
    if (window.confirm('Are you sure you want to reset all data back to a clean slate? Your custom creations will be cleared.')) {
      clearStorage();
      loadData();
      onRefresh();
      addLog('System Database reset to clean state.');
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data and start from a completely clean slate with zero products?')) {
      clearStorage();
      loadData();
      onRefresh();
      addLog('System database cleared. Empty fresh canvas initialized.');
      window.dispatchEvent(new Event('storage'));
    }
  };

  const simulateCustomerScan = () => {
    const products = getProducts();
    if (products.length === 0) {
      addLog('Error: No products available in the database to simulate a scan on. Create a product first!');
      return;
    }

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'London', 'New York'];
    const selectedCity = cities[Math.floor(Math.random() * cities.length)];
    const referrers = ['Instagram', 'WhatsApp Business', 'Direct QR Scan', 'NFC Tag', 'Brand Portal'];
    const selectedReferrer = referrers[Math.floor(Math.random() * referrers.length)];

    // Fetch and increment scan count
    const qrs = getQRCodes();
    const qrIndex = qrs.findIndex(q => q.productId === randomProduct.id);
    if (qrIndex >= 0) {
      qrs[qrIndex].scanCount += 1;
      qrs[qrIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('vt_qrcodes', JSON.stringify(qrs));
    } else {
      getOrCreateQRCode(randomProduct.id);
    }

    // Record dynamic event
    const eventId = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEvent = {
      id: eventId,
      productId: randomProduct.id,
      eventType: 'scan' as const,
      timestamp: new Date().toISOString(),
      metadata: {
        location: `${selectedCity}, Nigeria`,
        referrer: selectedReferrer
      }
    };

    const analyticsList = getAnalyticsEvents();
    analyticsList.unshift(newEvent);
    localStorage.setItem('vt_analytics', JSON.stringify(analyticsList));

    loadData();
    onRefresh();
    addLog(`Simulated QR Scan on "${randomProduct.name}" from ${selectedCity} via ${selectedReferrer}.`);
    window.dispatchEvent(new Event('storage'));
  };

  const simulateCustomerRegistration = () => {
    const products = getProducts();
    if (products.length === 0) {
      addLog('Error: No products available to register. Create a product first!');
      return;
    }

    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const firstNames = ['Chidi', 'Yemi', 'Fola', 'Tari', 'Amara', 'Babatunde', 'Zainab', 'Ngozi'];
    const lastNames = ['Adeleke', 'Okonkwo', 'Balogun', 'Eze', 'Ibrahim', 'Soyinka', 'Danjuma'];
    const selectedFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const selectedLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${selectedFirst.toLowerCase()}.${selectedLast.toLowerCase()}@example.com`;

    const customers = getCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === email);
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        email: email,
        firstName: selectedFirst,
        lastName: selectedLast,
        phone: `+234 80${Math.floor(10000000 + Math.random() * 90000000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      customers.push(customer);
      localStorage.setItem('vt_customers', JSON.stringify(customers));
    }

    const ownerships = JSON.parse(localStorage.getItem('vt_ownerships') || '[]');
    const months = randomProduct.warrantyPeriod || 12;
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);

    const ownership = {
      id: `own-${Date.now()}`,
      productId: randomProduct.id,
      customerId: customer.id,
      registrationDate: new Date().toISOString(),
      warrantyExpiresAt: expDate.toISOString(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    ownerships.push(ownership);
    localStorage.setItem('vt_ownerships', JSON.stringify(ownerships));

    // Also record event
    const newEvent = {
      id: `evt-${Date.now()}`,
      productId: randomProduct.id,
      eventType: 'register' as const,
      timestamp: new Date().toISOString(),
      metadata: {
        location: 'Lagos, Nigeria',
        ownerName: `${selectedFirst} ${selectedLast}`
      }
    };
    const analyticsList = getAnalyticsEvents();
    analyticsList.unshift(newEvent);
    localStorage.setItem('vt_analytics', JSON.stringify(analyticsList));

    loadData();
    onRefresh();
    addLog(`Registered owner: ${selectedFirst} ${selectedLast} (${email}) for "${randomProduct.name}".`);
    window.dispatchEvent(new Event('storage'));
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSimulationLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 9)]);
  };

  // Filter brand signups
  const filteredBrandSignups = brandSignups.filter(b => {
    const matchesSearch = searchQuery === '' || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || b.plan.toLowerCase() === planFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-1.5 border-b border-gray-150 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-700 px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1">
            <Key className="w-3 h-3 text-emerald-600" /> Developer Core
          </span>
        </div>
        <h1 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
          Developer Admin & Brand Telemetry
        </h1>
        <p className="text-gray-500 text-xs md:text-sm">
          Track new brand signups, issue promo coupons, simulate scan events, and manage local sandbox databases.
        </p>
      </div>

      {/* Grid: Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Registered Brands', value: stats.totalBrandSignups, icon: Building2, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Active Plan / Membership', value: stats.currentPlan, icon: Layers, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
          { label: 'Products & Passports', value: stats.totalProducts, icon: BarChart4, color: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Total QR Scans', value: stats.totalScans, icon: QrCode, color: 'text-purple-700 bg-purple-50 border-purple-100' },
          { label: 'Registered Customers', value: stats.totalCustomers, icon: Users, color: 'text-amber-700 bg-amber-50 border-amber-100' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-100 p-3.5 rounded-xl flex items-center gap-3 shadow-sm min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
              <item.icon className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider truncate">{item.label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 leading-tight truncate" title={String(item.value)}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* NEW BRAND SIGNUPS SECTION */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-[#0F5132]" /> Signed Up Brands & Creators
              </h3>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-[#0F5132] border border-emerald-100 font-bold uppercase rounded-full">
                {brandSignups.length} Total Registered
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Real-time log of brands that signed up via Magic Link auth, selected tiers, and dev access state.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={simulateNewBrandSignup}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#0F5132] border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#0F5132]" />
              Simulate Brand Signup
            </button>
            <button
              onClick={() => setShowAddBrandModal(!showAddBrandModal)}
              className="bg-[#0F5132] hover:bg-[#145A32] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Manual Add
            </button>
          </div>
        </div>

        {/* Manual Add Brand Inline Form */}
        {showAddBrandModal && (
          <form onSubmit={handleAddManualBrand} className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#0F5132]" /> Record New Brand Entry
              </h4>
              <button 
                type="button" 
                onClick={() => setShowAddBrandModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Brand / Creator Name</label>
                <input
                  type="text"
                  placeholder="E.G. Rhomani Luxury"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@brand.com"
                  value={newBrandEmail}
                  onChange={(e) => setNewBrandEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0F5132]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Subscription Tier</label>
                <select
                  value={newBrandPlan}
                  onChange={(e) => setNewBrandPlan(e.target.value as any)}
                  className="w-full mt-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0F5132] font-semibold"
                >
                  <option value="starter">Starter Plan (Free)</option>
                  <option value="professional">Professional Plan ($250/mo)</option>
                  <option value="enterprise">Enterprise Custom</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBrandDevAccess}
                  onChange={(e) => setNewBrandDevAccess(e.target.checked)}
                  className="accent-[#0F5132] rounded"
                />
                Grant Developer Admin Privileges (Dev Access)
              </label>

              <button
                type="submit"
                className="bg-[#0F5132] text-white px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90"
              >
                Save Brand
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-150">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#0F5132]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
              <Filter className="w-3 h-3 text-gray-400" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="magic link sent">Magic Link Sent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Brand Signups Table */}
        <div className="border border-gray-150 rounded-xl overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Brand / Creator Name</th>
                <th className="py-2.5 px-3.5">Email Address</th>
                <th className="py-2.5 px-3.5">Plan Tier</th>
                <th className="py-2.5 px-3.5">Auth Status</th>
                <th className="py-2.5 px-3.5">Dev Access</th>
                <th className="py-2.5 px-3.5">Signed Up Date</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredBrandSignups.map((b) => {
                const dateStr = new Date(b.signedUpAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = new Date(b.signedUpAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0F5132] font-bold text-[10px] shrink-0">
                          {b.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[180px]">{b.name}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-gray-600 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{b.email}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      {b.plan === 'enterprise' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-100 tracking-wider">
                          👑 Enterprise
                        </span>
                      ) : b.plan === 'professional' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 tracking-wider">
                          ⭐ Professional
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gray-100 text-gray-700 border border-gray-200 tracking-wider">
                          Starter
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3.5">
                      {b.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          Magic Link Sent
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3.5">
                      {b.hasDevAccess ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase border border-emerald-200">
                          <Shield className="w-2.5 h-2.5 text-emerald-700" /> Admin Access
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">Standard</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3.5 text-gray-500 text-[11px]">
                      <div>{dateStr}</div>
                      <div className="text-[9px] text-gray-400">{timeStr}</div>
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => handleDeleteBrandSignup(b.id, b.name)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex items-center gap-0.5"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredBrandSignups.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400 font-medium">
                    No brand signups match your current filter criteria. Click "Simulate Brand Signup" or "Manual Add" above to test.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Coupon Engine (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-900">Dynamic Coupon Engine</h3>
                <p className="text-xs text-gray-500 mt-0.5">Add, revoke, or view active subscription coupons for free Pro upgrades.</p>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 text-[9px] bg-emerald-50 text-[#0F5132] border border-emerald-100 font-bold uppercase rounded-full tracking-wider">
                {coupons.length} Active
              </span>
            </div>

            {/* Success / Error Banners */}
            {couponSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{couponSuccess}</span>
              </div>
            )}
            {couponError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            {/* Add Coupon Form */}
            <form onSubmit={handleAddCoupon} className="flex flex-col gap-3">
              <div className="flex gap-2.5">
                <input 
                  type="text" 
                  placeholder="E.G. SUMMER_OFFER_100" 
                  value={newCoupon}
                  onChange={(e) => setNewCoupon(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 focus:border-[#0F5132] focus:bg-white rounded-lg text-xs font-mono uppercase tracking-wider focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-[#0F5132] hover:bg-[#145A32] text-white px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer shadow-sm hover:opacity-90 transition-all flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Code
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Coupon Settings</span>
                
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="coupon_type" 
                      checked={couponType === 'bypass'} 
                      onChange={() => {
                        setCouponType('bypass');
                        setCouponDiscount(100);
                      }}
                      className="accent-[#0F5132]"
                    />
                    Free Bypass
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="coupon_type" 
                      checked={couponType === 'discount'} 
                      onChange={() => {
                        setCouponType('discount');
                        setCouponDiscount(15);
                      }}
                      className="accent-[#0F5132]"
                    />
                    Discount %
                  </label>
                </div>

                {couponType === 'discount' && (
                  <div className="flex items-center gap-1.5 sm:ml-auto">
                    <span className="text-[11px] font-medium text-gray-500">Rate:</span>
                    <select 
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(Number(e.target.value))}
                      className="bg-white border border-gray-200 text-[11px] font-semibold px-2 py-1 rounded-md focus:outline-none focus:border-[#0F5132]"
                    >
                      <option value={10}>10% Off</option>
                      <option value={15}>15% Off</option>
                      <option value={20}>20% Off</option>
                      <option value={25}>25% Off</option>
                      <option value={50}>50% Off</option>
                    </select>
                  </div>
                )}
              </div>
            </form>

            {/* Coupons List Table */}
            <div className="border border-gray-150 rounded-xl overflow-x-auto mt-1 max-w-full">
              <table className="w-full text-left border-collapse min-w-[450px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Discount Rate</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => (
                    <tr key={c.code} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-2 px-3">
                        <span className="font-mono text-[10px] font-bold text-gray-700 tracking-wider bg-gray-50 border border-gray-200/60 px-1.5 py-0.5 rounded">
                          {c.code}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] font-medium text-gray-600">
                        {c.code === 'DEV_ACCESS' || c.isDevAdmin ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase border border-emerald-200">
                            🛡️ Dev Admin Access
                          </span>
                        ) : c.type === 'bypass' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[9px] uppercase border border-purple-100">
                            👑 Free Bypass
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[9px] uppercase border border-blue-100">
                            🏷️ Discount
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] font-semibold text-emerald-800">
                        {c.discount === 100 ? '100% Off (Free)' : `${c.discount}% Off`}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button 
                          onClick={() => handleRevokeCoupon(c.code)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                          title="Revoke Coupon"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Revoke</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-gray-400 font-medium">
                        No active coupon codes. Users will have to enter simulated card details.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl flex gap-2.5 mt-1">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-none">Security Note</h4>
                <p className="text-[11px] text-amber-700/90 mt-1 leading-relaxed">
                  These codes bypass payment gates during upgrades. Protect credentials accordingly.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Simulation Suite & Persistence (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Simulation Tools */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-900">Real-Time Simulation Suite</h3>
              <p className="text-xs text-gray-500 mt-0.5">Inject simulated organic events into the CRM & analytics loop to monitor telemetry.</p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={simulateNewBrandSignup}
                className="w-full py-2 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-100/80 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Simulate Brand Signup
              </button>

              <button 
                onClick={simulateCustomerScan}
                className="w-full py-2 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-700 border border-indigo-100/60 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                Simulate Organic Scan
              </button>

              <button 
                onClick={simulateCustomerRegistration}
                className="w-full py-2 bg-purple-50/50 hover:bg-purple-100/70 text-purple-800 border border-purple-100/60 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Simulate Customer Registration
              </button>
            </div>

            {/* Simulation Log Screen */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Console Output</label>
              <div className="bg-[#1C1C1C] text-gray-300 font-mono text-[10px] p-3 rounded-lg h-36 overflow-y-auto flex flex-col gap-1.5 leading-normal border border-gray-800 select-none scrollbar-thin">
                {simulationLog.map((log, idx) => (
                  <p key={idx} className="border-b border-white/5 pb-1 last:border-0 truncate">{log}</p>
                ))}
                {simulationLog.length === 0 && (
                  <p className="text-gray-500 italic">No events simulated in this session.</p>
                )}
              </div>
            </div>
          </div>

          {/* Database Persistence Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-900">Database Utilities</h3>
              <p className="text-xs text-gray-500 mt-0.5">Restore the sandboxed data state or wipe local cache.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={handleResetToSample}
                className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
                Reset Sandbox
              </button>
              
              <button 
                onClick={handleClearAllData}
                className="py-2.5 px-3 border border-red-100 hover:border-red-200 bg-red-50/10 text-red-700 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-red-50/30"
              >
                <Database className="w-4 h-4 text-red-500" />
                Wipe Local DB
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
