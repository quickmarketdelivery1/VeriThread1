import { useState, useEffect } from 'react';
import { 
  Layers, Smartphone, Folder, QrCode, BarChart3, Settings, 
  LogOut, Menu, X, Users, Sparkles, Mail, ShieldCheck, Globe, Eye 
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AuthCallback from './components/AuthCallback';
import DemoBanner from './components/DemoBanner';
import DashboardOverview from './components/DashboardOverview';
import ProductsListPage from './components/ProductsListPage';
import ProductCreationFlow from './components/ProductCreationFlow';
import CollectionsPage from './components/CollectionsPage';
import DigitalPassport from './components/DigitalPassport';
import QrCodeManagement from './components/QrCodeManagement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import BrandSettings from './components/BrandSettings';
import CustomerTimelinePage from './components/CustomerTimelinePage';
import CampaignCenterPage from './components/CampaignCenterPage';
import AIPremiumHelp from './components/AIPremiumHelp';
import DeveloperAdminPage from './components/DeveloperAdminPage';
import OnboardingGuide from './components/OnboardingGuide';
import ProBadge from './components/ProBadge';
import DemoDashboard from './components/DemoDashboard';

import { getBrand, initStorage, resetAllData, clearStorage, getHasDevAccess, setHasDevAccess, recordBrandSignup } from './lib/storage';
import { 
  auth, 
  onAuthStateChanged, 
  signOutUser, 
  syncBrandInFirestore,
  getUserFirestoreDoc,
  fetchProductsFirestore,
  fetchCollectionsFirestore,
  fetchQRCodesFirestore,
  fetchCustomersFirestore,
  fetchOwnershipsFirestore,
  fetchAnalyticsEventsFirestore
} from './lib/firebase';

export default function App() {
  // Initialize storage on first load
  useEffect(() => {
    initStorage();
  }, []);

  const [brand, setBrand] = useState(getBrand);
  const [isFreshBrand, setIsFreshBrand] = useState(() => {
    return localStorage.getItem('vt_fresh_slate') === 'true';
  });

  const [user, setUser] = useState<{ email: string; name: string; hasDevAccess?: boolean; isPreview?: boolean; isReadOnly?: boolean } | null>(() => {
    const stored = localStorage.getItem('vt_auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const hasDevAccess = getHasDevAccess();

  // Simple reactive navigation state
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Firebase Authentication Listener & Session Management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Force reload to get updated emailVerified status from Firebase backend
        try {
          await firebaseUser.reload();
        } catch (e) {
          console.warn('Reload firebaseUser error:', e);
        }

        if (!firebaseUser.emailVerified) {
          await signOutUser();
          localStorage.removeItem('vt_auth_user');
          setUser(null);
          setAuthError('Please verify your email before logging in. A confirmation link has been sent to your email.');
          setCurrentRoute('login');
          return;
        }

        const email = firebaseUser.email || '';
        let storedMetaStr = localStorage.getItem('vt_signup_metadata');
        let metadata: any;
        if (storedMetaStr) {
          try { metadata = JSON.parse(storedMetaStr); } catch (e) { console.warn('Meta parse err:', e); }
        }

        // Sync brand doc in Firestore linked to user's UID
        const userBrand = await syncBrandInFirestore(firebaseUser, metadata);
        const userDoc = await getUserFirestoreDoc(firebaseUser.uid);

        // Fetch user's data from Firestore (returns [] for new users)
        const [
          fsProducts,
          fsCollections,
          fsQRCodes,
          fsCustomers,
          fsOwnerships,
          fsAnalytics
        ] = await Promise.all([
          fetchProductsFirestore(userBrand.id),
          fetchCollectionsFirestore(userBrand.id),
          fetchQRCodesFirestore(userBrand.id),
          fetchCustomersFirestore(userBrand.id),
          fetchOwnershipsFirestore(userBrand.id),
          fetchAnalyticsEventsFirestore(userBrand.id)
        ]);

        // Save real user data in localStorage session
        localStorage.setItem('vt_brand', JSON.stringify(userBrand));
        localStorage.setItem('vt_products', JSON.stringify(fsProducts));
        localStorage.setItem('vt_collections', JSON.stringify(fsCollections));
        localStorage.setItem('vt_qrcodes', JSON.stringify(fsQRCodes));
        localStorage.setItem('vt_customers', JSON.stringify(fsCustomers));
        localStorage.setItem('vt_ownerships', JSON.stringify(fsOwnerships));
        localStorage.setItem('vt_analytics', JSON.stringify(fsAnalytics));

        setBrand(userBrand);

        const userHasDevAccess = Boolean(metadata?.hasDevAccess || userBrand.hasDevAccess || getHasDevAccess());
        if (userHasDevAccess) setHasDevAccess(true);

        const fullName = userDoc?.fullName || metadata?.fullName || firebaseUser.displayName || 'Brand Owner';
        const authedUser = { 
          email, 
          fullName, 
          name: fullName, 
          brandName: userBrand.name || metadata?.brandName || '', 
          brandType: userBrand.type || metadata?.brandType || '',
          brandDescription: userBrand.description || metadata?.brandDescription || '',
          brandLocation: userBrand.location || metadata?.brandLocation || '',
          plan: userBrand.plan || metadata?.plan || 'starter',
          hasDevAccess: userHasDevAccess 
        };
        localStorage.setItem('vt_auth_user', JSON.stringify(authedUser));
        setUser(authedUser);

        recordBrandSignup({
          name: userBrand.name,
          email: email,
          plan: userBrand.plan,
          hasDevAccess: userHasDevAccess,
          status: 'Active'
        });

        // Auto redirect to dashboard when authenticated
        const rawHash = window.location.hash;
        const cleanHash = rawHash.split('?')[0];
        if (cleanHash === '' || cleanHash === '#/login' || cleanHash === '#/signup' || cleanHash === '#/landing') {
          window.location.hash = '/dashboard';
          setCurrentRoute('dashboard');
        }
      } else {
        localStorage.removeItem('vt_auth_user');
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Hash-based routing listener
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      const cleanHash = rawHash.split('?')[0];
      const canAccessDev = getHasDevAccess();

      if (cleanHash.startsWith('#/passport/')) {
        setCurrentRoute(cleanHash.slice(2)); // 'passport/:id'
      } else if (cleanHash === '#/dashboard' && user) {
        setCurrentRoute('dashboard');
      } else if (cleanHash === '#/products' && user) {
        setCurrentRoute('products');
      } else if (cleanHash === '#/products/new' && user) {
        setCurrentRoute('products/new');
      } else if (cleanHash === '#/collections' && user) {
        setCurrentRoute('collections');
      } else if (cleanHash === '#/qr-codes' && user) {
        setCurrentRoute('qr-codes');
      } else if (cleanHash === '#/customers' && user) {
        setCurrentRoute('customers');
      } else if (cleanHash === '#/campaigns' && user) {
        setCurrentRoute('campaigns');
      } else if (cleanHash === '#/analytics' && user) {
        setCurrentRoute('analytics');
      } else if (cleanHash === '#/settings' && user) {
        setCurrentRoute('settings');
      } else if (cleanHash === '#/ai-help' && user) {
        setCurrentRoute('ai-help');
      } else if ((cleanHash === '#/admin' || cleanHash === '#/developer-admin') && user) {
        if (canAccessDev) {
          setCurrentRoute('admin');
        } else {
          // Protected route: unauthorized users redirected to dashboard
          window.location.hash = '/dashboard';
          setCurrentRoute('dashboard');
        }
      } else if (cleanHash === '#/login') {
        setCurrentRoute('login');
      } else if (cleanHash === '#/signup') {
        setCurrentRoute('signup');
      } else if (cleanHash === '#/demo' || cleanHash === '#/demo-dashboard') {
        setCurrentRoute('demo');
      } else if (cleanHash === '#/landing' || cleanHash === '#/' || cleanHash === '' || cleanHash === '#') {
        setCurrentRoute('landing');
      } else {
        // Fallback
        if (user) {
          setCurrentRoute('dashboard');
        } else {
          setCurrentRoute('landing');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, authError]);

  const navigateTo = (route: string) => {
    setAuthError(null);
    setIsAuthenticating(false);
    if ((route === 'admin' || route === 'developer-admin') && !getHasDevAccess()) {
      window.location.hash = '/dashboard';
      setCurrentRoute('dashboard');
      return;
    }
    window.location.hash = `/${route}`;
    setCurrentRoute(route);
    setMobileMenuOpen(false);
  };


  const handleLoginSuccess = (email: string) => {
    const isDev = getHasDevAccess();
    const authedUser = { email, name: email.split('@')[0].toUpperCase(), hasDevAccess: isDev };
    localStorage.setItem('vt_auth_user', JSON.stringify(authedUser));
    setUser(authedUser);
    navigateTo('dashboard');
  };

  const handleSignupSuccess = (name: string, email: string, plan: 'starter' | 'professional' | 'enterprise', userHasDevAccess?: boolean, brandName?: string, brandType?: string, brandDescription?: string, brandLocation?: string) => {
  const isDev = Boolean(userHasDevAccess);
  setHasDevAccess(isDev);

  const authedUser = { 
    email, 
    fullName: name || 'Brand Owner', 
    name: name || 'Brand Owner',
    brandName: brandName || '',
    brandType: brandType || '',
    brandDescription: brandDescription || '',
    brandLocation: brandLocation || '',
    plan: plan || 'starter',
    hasDevAccess: isDev 
  };
  localStorage.setItem('vt_auth_user', JSON.stringify(authedUser));
  setUser(authedUser);

    recordBrandSignup({
      name: name || `${email.split('@')[0].toUpperCase()} ATELIER`,
      email: email,
      plan: plan,
      hasDevAccess: isDev,
      status: 'Active'
    });

    const newBrand = {
      id: `brand-${Date.now()}`,
      userId: `user-${Date.now()}`,
      name: `${name.toUpperCase()} ATELIER`,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      logoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=150',
      coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
      primaryColor: '#0F5132',
      secondaryColor: '#145A32',
      supportEmail: email,
      plan: plan,
      hasDevAccess: isDev,
      qrUsedThisMonth: 0,
      aiUsedThisMonth: 0,
      lastResetDate: new Date().toISOString(),
      billingHistory: plan === 'professional' ? [
        { id: `inv-${Date.now()}`, date: new Date().toISOString().split('T')[0], amount: isDev ? 0 : 25000, planName: 'Professional', status: 'Paid' }
      ] : []
    };
    
    localStorage.setItem('vt_brand', JSON.stringify(newBrand));
    localStorage.setItem('vt_collections', JSON.stringify([]));
    localStorage.setItem('vt_products', JSON.stringify([]));
    localStorage.setItem('vt_qrcodes', JSON.stringify([]));
    localStorage.setItem('vt_customers', JSON.stringify([]));
    localStorage.setItem('vt_ownerships', JSON.stringify([]));
    localStorage.setItem('vt_analytics', JSON.stringify([]));
    localStorage.setItem('vt_campaigns', JSON.stringify([]));
    localStorage.setItem('vt_fresh_slate', 'true');
    setIsFreshBrand(true);
    setBrand(newBrand);

    navigateTo('dashboard');
  };

  // Demo / Guest mode bypass
  const handleBypassLogin = () => {
    setHasDevAccess(false);
    const guestUser = { email: 'guest@verithread.net', name: 'GUEST ATELIER', hasDevAccess: false };
    localStorage.setItem('vt_auth_user', JSON.stringify(guestUser));
    setUser(guestUser);
    navigateTo('dashboard');
  };

  // Preview Mode bypass (View-Only)
  const handlePreviewLogin = () => {
    if (!localStorage.getItem('vt_products') || JSON.parse(localStorage.getItem('vt_products') || '[]').length === 0) {
      resetAllData();
    }
    setHasDevAccess(true);
    const currentBrand = getBrand();
    const previewUser = { 
      email: 'preview@verithread.demo', 
      name: 'PREVIEW USER', 
      brandName: currentBrand.name || '',
      hasDevAccess: true,
      isPreview: true,
      isReadOnly: true 
    };
    localStorage.setItem('vt_auth_user', JSON.stringify(previewUser));
    setUser(previewUser);
    navigateTo('dashboard');
  };

  const handleLogout = async () => {
    setHasDevAccess(false);
    localStorage.removeItem('vt_auth_user');
    setUser(null);
    await signOutUser();
    navigateTo('landing');
  };

  const handleToggleBrandMode = (isFresh: boolean) => {
    localStorage.setItem('vt_fresh_slate', isFresh ? 'true' : 'false');
    setIsFreshBrand(isFresh);
    if (isFresh) {
      clearStorage();
    } else {
      resetAllData();
    }
    setBrand(getBrand());
  };

  const handleRefresh = () => {
    setBrand(getBrand());
  };

  // 1. PUBLIC PASSPORT ROUTE DETECT
  if (currentRoute.startsWith('passport/')) {
    const productId = currentRoute.split('/')[1];
    return <DigitalPassport productId={productId} onNavigate={navigateTo} />;
  }

  // 1b. PUBLIC DEMO DASHBOARD ROUTE
  if (currentRoute === 'demo') {
    return <DemoDashboard onNavigate={navigateTo} />;
  }

  // 2. AUTH CALLBACK & MAGIC LINK PROCESSING
  if (currentRoute === 'auth-callback' || isAuthenticating || (authError && !user)) {
    return (
      <AuthCallback 
        isAuthenticating={isAuthenticating} 
        error={authError} 
        onNavigate={navigateTo} 
      />
    );
  }

  // 3. MARKETING & AUTH PAGES
  if (currentRoute === 'landing') {
    return (
      <LandingPage 
        onNavigate={navigateTo} 
        onBypassLogin={handleBypassLogin} 
        isLoggedIn={Boolean(user)}
      />
    );
  }

  if (!user) {
    if (currentRoute === 'login') {
      return (
        <LoginPage 
          onNavigate={navigateTo} 
          onLoginSuccess={handleLoginSuccess} 
          onPreviewLogin={handlePreviewLogin}
        />
      );
    }
    if (currentRoute === 'signup') {
      return (
        <SignupPage 
          onNavigate={navigateTo} 
          onSignupSuccess={(name, email, plan, hasDevAccess, brandName, brandType, brandDescription, brandLocation) =>
  handleSignupSuccess(name, email, plan, hasDevAccess, brandName, brandType, brandDescription, brandLocation)
} 
        />
      );
    }
    return (
      <LandingPage 
        onNavigate={navigateTo} 
        onBypassLogin={handleBypassLogin} 
        isLoggedIn={false}
      />
    );
  }

  // 3. AUTHENTICATED BRAND DASHBOARD LAYOUT
  return (
    <div className="bg-[#F8F9FA] h-screen text-[#1C1C1C] flex flex-row font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0F5132] text-white p-5 hidden md:flex flex-col justify-between shrink-0 h-full shadow-xl">
          <div className="flex flex-col gap-8">
            
            {/* Atelier Brand Identity Header */}
            <div className="flex items-center gap-3">
              <img 
                className="w-10 h-10 rounded-lg object-cover border border-white/20 shadow-sm" 
                src={brand.logoUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=150"} 
                alt="" 
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h1 className="font-display font-bold text-sm text-white truncate uppercase tracking-tight leading-none">
                  {brand.name}
                </h1>
                <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase mt-0.5 block truncate">
                  {brand.slogan || 'Verified Atelier'}
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1 text-xs sm:text-[13px] md:text-sm">
              {[
                { route: 'dashboard', label: 'Brand Studio', icon: Layers },
                { route: 'products', label: 'Product Passports', icon: Smartphone },
                { route: 'collections', label: 'Product Collections', icon: Folder },
                { route: 'qr-codes', label: 'QR Code Hub', icon: QrCode },
                { route: 'customers', label: 'Customer CRM', icon: Users },
                { route: 'campaigns', label: 'Customer Campaigns', icon: Mail },
                { route: 'analytics', label: 'Growth Insights', icon: BarChart3 },
                { route: 'ai-help', label: 'AI Premium Help', icon: Sparkles },
                { route: 'demo', label: 'Interactive Plan Demo', icon: Smartphone },
                ...(hasDevAccess ? [{ route: 'admin', label: 'Developer Admin', icon: ShieldCheck }] : []),
                { route: 'settings', label: 'Brand Settings', icon: Settings },
                { route: 'landing', label: 'Public Homepage', icon: Globe },
              ].map(item => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route || (item.route === 'products' && currentRoute === 'products/new');
                return (
                  <button
                    key={item.route}
                    onClick={() => navigateTo(item.route)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] md:text-sm font-medium cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-white/15 text-white font-semibold shadow-sm border-l-2 border-white' 
                        : 'text-white/75 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile / account details card */}
          <div className="mt-auto p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#145A32] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs font-semibold text-white truncate uppercase leading-tight">{user.name}</p>
                  <ProBadge plan={brand.plan} size="sm" />
                </div>
                <p className="text-[9px] text-white/50 tracking-wider uppercase block truncate">{user.email}</p>
              </div>
            </div>
            {brand.description && (
              <p className="text-[10px] text-emerald-200/70 line-clamp-2 mb-3 italic font-sans leading-tight">
                "{brand.description}"
              </p>
            )}
            <button 
              onClick={handleLogout}
              className="w-full py-2 bg-white hover:bg-gray-100 text-[#0F5132] rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Workspace Frame (Right side) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* Preview Mode Banner */}
          {Boolean(user?.isPreview || user?.isReadOnly) && (
            <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-3 shadow-sm shrink-0 border-b border-amber-600 z-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-950 shrink-0" />
                <span>
                  <strong>PREVIEW MODE (VIEW-ONLY):</strong> You are inspecting the VeriThread studio. Creating, editing, or deleting data is disabled.
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-950 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0"
              >
                Exit Preview
              </button>
            </div>
          )}

          {/* Mobile Header Bar */}
          <header className="md:hidden bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2.5">
            <img className="w-8 h-8 rounded-full object-cover" src={brand.logoUrl} alt="" referrerPolicy="no-referrer" />
            <span className="font-display font-semibold text-sm text-gray-900 uppercase tracking-tight">{brand.name}</span>
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden animate-fade-in">
            <div className="w-64 bg-white h-full p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-[#0F5132] tracking-tight text-lg">VeriThread</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1 text-xs sm:text-sm">
                  {[
                    { route: 'dashboard', label: 'Brand Studio', icon: Layers },
                    { route: 'products', label: 'Product Passports', icon: Smartphone },
                    { route: 'collections', label: 'Product Collections', icon: Folder },
                    { route: 'qr-codes', label: 'QR Code Hub', icon: QrCode },
                    { route: 'customers', label: 'Customer CRM', icon: Users },
                    { route: 'campaigns', label: 'Customer Campaigns', icon: Mail },
                    { route: 'analytics', label: 'Growth Insights', icon: BarChart3 },
                    { route: 'ai-help', label: 'AI Premium Help', icon: Sparkles },
                    ...(hasDevAccess ? [{ route: 'admin', label: 'Developer Admin', icon: ShieldCheck }] : []),
                    { route: 'settings', label: 'Brand Settings', icon: Settings },
                    { route: 'landing', label: 'Public Homepage', icon: Globe },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        onClick={() => navigateTo(item.route)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left w-full ${
                          isActive 
                            ? 'bg-[#0F5132] text-white' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl cursor-pointer w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Central Panel */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8F9FA]">
          
          {/* Scrollable Sub-View container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto">
            {currentRoute === 'dashboard' && (
              <DashboardOverview brandName={brand.name} onNavigate={navigateTo} isDemo={false} />
            )}

            {currentRoute === 'products' && (
              <ProductsListPage onNavigate={navigateTo} onRefresh={handleRefresh} />
            )}

            {currentRoute === 'products/new' && (
              <ProductCreationFlow onNavigate={navigateTo} onRefresh={handleRefresh} />
            )}

            {currentRoute === 'collections' && (
              <CollectionsPage onRefresh={handleRefresh} />
            )}

            {currentRoute === 'qr-codes' && (
              <QrCodeManagement onNavigate={navigateTo} />
            )}

            {currentRoute === 'customers' && (
              <CustomerTimelinePage />
            )}

            {currentRoute === 'campaigns' && (
              <CampaignCenterPage />
            )}

            {currentRoute === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {currentRoute === 'settings' && (
              <BrandSettings onRefresh={handleRefresh} />
            )}

            {currentRoute === 'ai-help' && (
              <AIPremiumHelp onRefresh={handleRefresh} onNavigate={navigateTo} />
            )}

            {currentRoute === 'admin' && (
              hasDevAccess ? (
                <DeveloperAdminPage onRefresh={handleRefresh} />
              ) : (
                <DashboardOverview brandName={brand.name} onNavigate={navigateTo} isDemo={!isFreshBrand} />
              )
            )}
          </div>
        </main>

        {/* Floating Success/Onboarding Guide */}
        <OnboardingGuide onNavigate={navigateTo} onRefresh={handleRefresh} />

      </div>
    </div>
  );
}
