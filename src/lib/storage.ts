import { Brand, Collection, Product, QRCode, Customer, Ownership, AnalyticsEvent, Campaign, BrandSignupRecord } from '../types';
import {
  saveBrandFirestore,
  saveProductFirestore,
  deleteProductFirestore,
  saveCollectionFirestore,
  saveQRCodeFirestore,
  saveCustomerFirestore,
  saveOwnershipFirestore,
  saveAnalyticsEventFirestore
} from './firebase';
import {
  sampleBrand,
  sampleCollections,
  sampleProducts,
  sampleQRCodes,
  sampleCustomers,
  sampleOwnerships,
  sampleAnalyticsEvents
} from '../data/sampleData';

const KEYS = {
  BRAND: 'vt_brand',
  COLLECTIONS: 'vt_collections',
  PRODUCTS: 'vt_products',
  QRCODES: 'vt_qrcodes',
  CUSTOMERS: 'vt_customers',
  OWNERSHIPS: 'vt_ownerships',
  ANALYTICS: 'vt_analytics',
  CAMPAIGNS: 'vt_campaigns',
  BRAND_SIGNUPS: 'vt_brand_signups'
};

export const sampleBrandSignups: BrandSignupRecord[] = [];

export const defaultCampaigns: Campaign[] = [];

// Initialize localStorage with empty slate
export function initStorage() {
  if (typeof window === 'undefined') return;

  const authUser = localStorage.getItem('vt_auth_user');

  if (!localStorage.getItem(KEYS.BRAND)) {
    let brandName = '';
    let brandType = '';
    let brandDesc = '';
    let brandLocation = '';
    let supportEmail = '';
    let plan = 'starter';
    let hasDevAccess = false;

    const signupMeta = localStorage.getItem('vt_signup_metadata');
    if (signupMeta) {
      try {
        const sm = JSON.parse(signupMeta);
        if (sm.brandName) brandName = sm.brandName;
        if (sm.brandType) brandType = sm.brandType;
        if (sm.brandDescription) brandDesc = sm.brandDescription;
        if (sm.brandLocation) brandLocation = sm.brandLocation;
        if (sm.email) supportEmail = sm.email;
        if (sm.plan) plan = sm.plan.toLowerCase();
        if (sm.hasDevAccess) hasDevAccess = true;
      } catch (e) {}
    }

    if (authUser) {
      try {
        const u = JSON.parse(authUser);
        if (u.brandName) brandName = u.brandName;
        else if (u.name && !brandName) brandName = u.name;
        if (u.brandType) brandType = u.brandType;
        if (u.brandDescription) brandDesc = u.brandDescription;
        if (u.brandLocation) brandLocation = u.brandLocation;
        if (u.email) supportEmail = u.email;
        if (u.plan) plan = u.plan.toLowerCase();
        if (u.hasDevAccess) hasDevAccess = true;
      } catch (e) {}
    }

    localStorage.setItem(KEYS.BRAND, JSON.stringify({
      id: 'brand-' + Date.now(),
      userId: 'user-' + Date.now(),
      name: brandName,
      slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      type: brandType,
      description: brandDesc,
      location: brandLocation,
      logoUrl: '',
      primaryColor: '#0F5132',
      secondaryColor: '#145A32',
      supportEmail: supportEmail,
      defaultBuyNowType: 'whatsapp',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slogan: 'Digital Product Passport Atelier',
      plan: plan,
      hasDevAccess: hasDevAccess,
      qrUsedThisMonth: 0,
      aiUsedThisMonth: 0,
      lastResetDate: new Date().toISOString(),
      billingHistory: []
    }));
  }

  if (!localStorage.getItem(KEYS.COLLECTIONS)) {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.QRCODES)) {
    localStorage.setItem(KEYS.QRCODES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.OWNERSHIPS)) {
    localStorage.setItem(KEYS.OWNERSHIPS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ANALYTICS)) {
    localStorage.setItem(KEYS.ANALYTICS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.CAMPAIGNS)) {
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.BRAND_SIGNUPS)) {
    localStorage.setItem(KEYS.BRAND_SIGNUPS, JSON.stringify([]));
  }
}

// Brand Signup Tracker functions
export function getBrandSignups(): BrandSignupRecord[] {
  initStorage();
  const data = localStorage.getItem(KEYS.BRAND_SIGNUPS);
  if (!data) return sampleBrandSignups;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : sampleBrandSignups;
  } catch {
    return sampleBrandSignups;
  }
}

export function recordBrandSignup(brandData: {
  name: string;
  email: string;
  plan?: 'starter' | 'professional' | 'enterprise';
  hasDevAccess?: boolean;
  status?: 'Active' | 'Pending Verification' | 'Magic Link Sent';
}): BrandSignupRecord {
  const signups = getBrandSignups();
  const cleanEmail = brandData.email.trim().toLowerCase();
  const existingIndex = signups.findIndex(s => s.email.toLowerCase() === cleanEmail);

  const newRecord: BrandSignupRecord = {
    id: existingIndex >= 0 ? signups[existingIndex].id : `bs-${Date.now()}`,
    name: brandData.name?.trim() || cleanEmail.split('@')[0].toUpperCase(),
    email: cleanEmail,
    plan: brandData.plan || 'starter',
    signedUpAt: existingIndex >= 0 ? signups[existingIndex].signedUpAt : new Date().toISOString(),
    status: brandData.status || 'Active',
    hasDevAccess: brandData.hasDevAccess ?? false
  };

  if (existingIndex >= 0) {
    // preserve or update status
    signups[existingIndex] = {
      ...signups[existingIndex],
      ...newRecord,
      status: brandData.status || signups[existingIndex].status || 'Active'
    };
  } else {
    signups.unshift(newRecord);
  }

  localStorage.setItem(KEYS.BRAND_SIGNUPS, JSON.stringify(signups));
  return newRecord;
}

export function deleteBrandSignup(id: string) {
  const signups = getBrandSignups();
  const filtered = signups.filter(s => s.id !== id);
  localStorage.setItem(KEYS.BRAND_SIGNUPS, JSON.stringify(filtered));
}


// Brand functions
export function isPreviewModeReadOnly(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const authUser = localStorage.getItem('vt_auth_user');
    if (authUser) {
      const u = JSON.parse(authUser);
      return Boolean(u?.isPreview || u?.isReadOnly);
    }
  } catch (e) {}
  return false;
}

export function getBrand(): Brand {
  initStorage();
  const data = localStorage.getItem(KEYS.BRAND);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return {
          ...parsed,
          logoUrl: typeof parsed.logoUrl === 'string' ? parsed.logoUrl : ''
        };
      }
    } catch (e) {}
  }
  return {
    ...sampleBrand,
    logoUrl: ''
  };
}

export function saveBrand(brand: Brand) {
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return;
  }
  const cleanBrand: Brand = {
    ...brand,
    logoUrl: typeof brand.logoUrl === 'string' ? brand.logoUrl : ''
  };
  localStorage.setItem(KEYS.BRAND, JSON.stringify(cleanBrand));
  saveBrandFirestore(cleanBrand).catch(err => console.warn('Firestore sync brand warning:', err));
}

function isUserRegisteredSession(): boolean {
  if (typeof window === 'undefined') return false;
  const authUser = localStorage.getItem('vt_auth_user');
  if (authUser) return true;
  const brandStr = localStorage.getItem(KEYS.BRAND);
  if (brandStr) {
    try {
      const b = JSON.parse(brandStr);
      if (b && b.id !== sampleBrand.id && b.id !== 'brand-sample' && b.name !== 'RHOMANI LUXURY HOUSE') {
        return true;
      }
    } catch {}
  }
  return false;
}

// Collection functions
export function getCollections(): Collection[] {
  initStorage();
  const data = localStorage.getItem(KEYS.COLLECTIONS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return isUserRegisteredSession() ? [] : sampleCollections;
}

export function saveCollection(collection: Collection) {
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return getCollections();
  }
  const list = getCollections();
  const index = list.findIndex(c => c.id === collection.id);
  if (index >= 0) {
    list[index] = collection;
  } else {
    list.push(collection);
  }
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(list));
  saveCollectionFirestore(collection).catch(err => console.warn('Firestore sync collection warning:', err));
  return list;
}

export function deleteCollection(id: string) {
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return;
  }
  const list = getCollections();
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(filtered));
  
  // Clean products that reference this collection
  const products = getProducts();
  const updatedProducts = products.map(p => {
    if (p.collectionId === id) {
      return { ...p, collectionId: undefined };
    }
    return p;
  });
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updatedProducts));
}

// Product functions
export function getProducts(): Product[] {
  initStorage();
  const data = localStorage.getItem(KEYS.PRODUCTS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('[Storage] Error parsing vt_products:', e);
    }
  }
  return isUserRegisteredSession() ? [] : sampleProducts;
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function saveProduct(product: Product): Product[] {
  console.log('[Storage] saveProduct called for product:', product.name, 'ID:', product.id);
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return getProducts();
  }
  const brand = getBrand();
  const productWithBrand: Product = { 
    ...product, 
    brandId: product.brandId || brand.id || 'brand-1',
    updatedAt: new Date().toISOString()
  };
  const list = getProducts();
  const index = list.findIndex(p => p.id === productWithBrand.id);
  if (index >= 0) {
    list[index] = productWithBrand;
  } else {
    list.unshift(productWithBrand);
  }
  try {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(list));
    console.log('[Storage] Product successfully saved to localStorage. Total products:', list.length);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('[Storage] Error writing product to localStorage:', e);
  }

  saveProductFirestore(productWithBrand).catch(err => console.warn('[Storage] Firestore sync product warning:', err));

  // Also ensure a QR Code exists for this product
  try {
    getOrCreateQRCode(productWithBrand.id);
  } catch (e) {
    console.warn('[Storage] Error creating QR code:', e);
  }
  
  return list;
}

export function deleteProduct(id: string) {
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return;
  }
  const list = getProducts();
  const filtered = list.filter(p => p.id !== id);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  deleteProductFirestore(id).catch(err => console.warn('Firestore delete product warning:', err));
}


// QR Code functions
export function getQRCodes(): QRCode[] {
  initStorage();
  const data = localStorage.getItem(KEYS.QRCODES);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return isUserRegisteredSession() ? [] : sampleQRCodes;
}

export function getOrCreateQRCode(productId: string): QRCode {
  const brand = getBrand();
  const codes = getQRCodes();
  let code = codes.find(q => q.productId === productId);
  if (!code) {
    code = {
      id: `qr-${productId}`,
      productId: productId,
      code: `https://verithread.net/passport/${productId}`,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    codes.push(code);
    localStorage.setItem(KEYS.QRCODES, JSON.stringify(codes));
    saveQRCodeFirestore(code, brand.id).catch(err => console.warn('Firestore sync qrcode warning:', err));
  }
  return code;
}

export function recordQRCodeScan(productId: string) {
  const brand = getBrand();
  const codes = getQRCodes();
  const code = codes.find(q => q.productId === productId);
  if (code) {
    code.scanCount += 1;
    code.updatedAt = new Date().toISOString();
    localStorage.setItem(KEYS.QRCODES, JSON.stringify(codes));
    saveQRCodeFirestore(code, brand.id).catch(err => console.warn('Firestore sync qrcode scan warning:', err));

    // Also record in analytics events
    recordAnalyticsEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      eventType: 'scan',
      timestamp: new Date().toISOString(),
      metadata: {
        location: getRandomNigerianCity(),
        referrer: Math.random() > 0.5 ? 'WhatsApp' : 'Instagram'
      }
    });
  }
}

// Customer & Ownership functions
export function getCustomers(): Customer[] {
  initStorage();
  const data = localStorage.getItem(KEYS.CUSTOMERS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return isUserRegisteredSession() ? [] : sampleCustomers;
}

export function getOwnerships(): Ownership[] {
  initStorage();
  const data = localStorage.getItem(KEYS.OWNERSHIPS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return isUserRegisteredSession() ? [] : sampleOwnerships;
}

export function registerWarranty(productId: string, customerData: { email: string; firstName: string; lastName: string; phone?: string }) {
  const brand = getBrand();
  const customers = getCustomers();
  const ownerships = getOwnerships();
  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) return { success: false, message: 'Product not found' };

  // Find or create customer
  let customer = customers.find(c => c.email.toLowerCase() === customerData.email.toLowerCase());
  if (!customer) {
    customer = {
      id: `cust-${Date.now()}`,
      email: customerData.email.toLowerCase(),
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    customers.push(customer);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
    saveCustomerFirestore(customer, brand.id).catch(err => console.warn('Firestore sync customer warning:', err));
  }

  // Check if already registered
  const existingOwnership = ownerships.find(o => o.productId === productId && o.customerId === customer!.id);
  if (existingOwnership) {
    return { success: true, message: 'Already registered', ownership: existingOwnership, customer };
  }

  // Create ownership
  const months = product.warrantyPeriod || 12;
  const expDate = new Date();
  expDate.setMonth(expDate.getMonth() + months);

  const ownership: Ownership = {
    id: `own-${Date.now()}`,
    productId,
    customerId: customer.id,
    registrationDate: new Date().toISOString(),
    warrantyExpiresAt: expDate.toISOString(),
    isActive: true,
    createdAt: new Date().toISOString()
  };

  ownerships.push(ownership);
  localStorage.setItem(KEYS.OWNERSHIPS, JSON.stringify(ownerships));
  saveOwnershipFirestore(ownership, brand.id).catch(err => console.warn('Firestore sync ownership warning:', err));

  // Log in analytics
  recordAnalyticsEvent({
    id: `evt-${Date.now()}`,
    productId,
    eventType: 'register',
    timestamp: new Date().toISOString(),
    metadata: {
      location: getRandomNigerianCity(),
      ownerName: `${customer.firstName} ${customer.lastName}`
    }
  });

  return { success: true, message: 'Successfully registered warranty!', ownership, customer };
}

// Analytics functions
export function getAnalyticsEvents(): AnalyticsEvent[] {
  initStorage();
  const data = localStorage.getItem(KEYS.ANALYTICS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return isUserRegisteredSession() ? [] : sampleAnalyticsEvents;
}

export function recordAnalyticsEvent(event: AnalyticsEvent) {
  const brand = getBrand();
  const list = getAnalyticsEvents();
  list.unshift(event); // Put newest first
  localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(list));
  saveAnalyticsEventFirestore(event, brand.id).catch(err => console.warn('Firestore sync analytics warning:', err));
}

// Campaign functions
export function getCampaigns(): Campaign[] {
  initStorage();
  const data = localStorage.getItem(KEYS.CAMPAIGNS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return isUserRegisteredSession() ? [] : defaultCampaigns;
}

export function saveCampaign(campaign: Campaign) {
  const list = getCampaigns();
  const index = list.findIndex(c => c.id === campaign.id);
  if (index >= 0) {
    list[index] = campaign;
  } else {
    list.push(campaign);
  }
  localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(list));
  return list;
}

export function deleteCampaign(id: string) {
  const list = getCampaigns();
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(filtered));
}

// Helper utilities
function getRandomNigerianCity(): string {
  const cities = ['Lagos, Nigeria', 'Abuja, Nigeria', 'Ibadan, Nigeria', 'Port Harcourt, Nigeria', 'Kano, Nigeria'];
  return cities[Math.floor(Math.random() * cities.length)];
}

// Product Likes Management
const LIKED_PRODUCTS_KEY = 'vt_liked_products';

export function getLikedProductIds(): string[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LIKED_PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function isProductLiked(productId: string): boolean {
  return getLikedProductIds().includes(productId);
}

export function toggleProductLike(productId: string): { product: Product | undefined; isLiked: boolean; likeCount: number } {
  const likedIds = getLikedProductIds();
  const isLiked = likedIds.includes(productId);
  let newLikedIds: string[];
  let isNowLiked = false;

  if (isLiked) {
    newLikedIds = likedIds.filter(id => id !== productId);
    isNowLiked = false;
  } else {
    newLikedIds = [...likedIds, productId];
    isNowLiked = true;
  }
  localStorage.setItem(LIKED_PRODUCTS_KEY, JSON.stringify(newLikedIds));

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  let currentLikes = product?.likeCount || 0;

  if (product) {
    if (isNowLiked) {
      currentLikes += 1;
    } else {
      currentLikes = Math.max(0, currentLikes - 1);
    }
    product.likeCount = currentLikes;
    saveProduct(product);

    if (isNowLiked) {
      recordAnalyticsEvent({
        id: `evt-like-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId,
        eventType: 'like',
        timestamp: new Date().toISOString(),
        metadata: {
          location: getRandomNigerianCity(),
          referrer: 'Digital Passport'
        }
      });
    }
  }

  return { product, isLiked: isNowLiked, likeCount: currentLikes };
}

export function resetToSampleData() {
  resetAllData();
}

export function clearStorage() {
  localStorage.removeItem(KEYS.BRAND);
  localStorage.removeItem(KEYS.COLLECTIONS);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.QRCODES);
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.OWNERSHIPS);
  localStorage.removeItem(KEYS.ANALYTICS);
  localStorage.removeItem(KEYS.CAMPAIGNS);
  
  // Set empty states instead of nulls so we don't seed them automatically
  localStorage.setItem(KEYS.BRAND, JSON.stringify({
    id: 'custom-brand-id',
    name: 'My Luxury Brand',
    logoUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
    primaryColor: '#0F5132',
    secondaryColor: '#145A32',
    supportEmail: 'contact@mybrand.com',
    plan: 'starter',
    qrUsedThisMonth: 0,
    aiUsedThisMonth: 0,
    lastResetDate: new Date().toISOString(),
    billingHistory: []
  }));
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(KEYS.QRCODES, JSON.stringify([]));
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
  localStorage.setItem(KEYS.OWNERSHIPS, JSON.stringify([]));
  localStorage.setItem(KEYS.ANALYTICS, JSON.stringify([]));
  localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify([]));
  localStorage.setItem(KEYS.BRAND_SIGNUPS, JSON.stringify([]));
}

export function resetAllData() {
  localStorage.removeItem(KEYS.BRAND);
  localStorage.removeItem(KEYS.COLLECTIONS);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.QRCODES);
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.OWNERSHIPS);
  localStorage.removeItem(KEYS.ANALYTICS);
  localStorage.removeItem(KEYS.CAMPAIGNS);
  localStorage.removeItem(KEYS.BRAND_SIGNUPS);
  initStorage();
}

export function checkAndResetMonthlyLimits(brand: Brand): Brand {
  const now = new Date();
  const lastReset = new Date(brand.lastResetDate || brand.createdAt || now.toISOString());
  
  // Calculate if 30 days have passed (approximate by milliseconds or date compare)
  const diffTime = Math.abs(now.getTime() - lastReset.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 30) {
    const updatedBrand: Brand = {
      ...brand,
      qrUsedThisMonth: 0,
      aiUsedThisMonth: 0,
      lastResetDate: now.toISOString()
    };
    saveBrand(updatedBrand);
    return updatedBrand;
  }
  return brand;
}

export function incrementQRCount(): { allowed: boolean; brand: Brand; message?: string } {
  const brand = getBrand();
  const resetBrand = checkAndResetMonthlyLimits(brand);
  
  const limits = {
    starter: 25,
    professional: 250,
    enterprise: Infinity
  };
  
  const limit = limits[resetBrand.plan] || 25;
  if (resetBrand.qrUsedThisMonth >= limit) {
    return { 
      allowed: false, 
      brand: resetBrand, 
      message: `You've reached your monthly QR limit of ${limit} QRs. Please upgrade your plan to continue or wait until your monthly reset.` 
    };
  }
  
  const updatedBrand = {
    ...resetBrand,
    qrUsedThisMonth: resetBrand.qrUsedThisMonth + 1
  };
  saveBrand(updatedBrand);
  return { allowed: true, brand: updatedBrand };
}

export function incrementAICount(): { allowed: boolean; brand: Brand; message?: string } {
  const brand = getBrand();
  const resetBrand = checkAndResetMonthlyLimits(brand);
  
  if (resetBrand.plan === 'starter') {
    return {
      allowed: false,
      brand: resetBrand,
      message: "AI generators are Professional & Enterprise features. Please upgrade to unlock premium AI tools."
    };
  }
  
  const limits = {
    starter: 0,
    professional: 50,
    enterprise: Infinity
  };
  
  const limit = limits[resetBrand.plan] || 0;
  if (resetBrand.aiUsedThisMonth >= limit) {
    const message = resetBrand.plan === 'professional' 
      ? "You've reached your monthly limit of 50 AI generations. Upgrade to Enterprise or wait until next month to use premium AI features."
      : "Limit reached.";
    return { allowed: false, brand: resetBrand, message };
  }
  
  const updatedBrand = {
    ...resetBrand,
    aiUsedThisMonth: resetBrand.aiUsedThisMonth + 1
  };
  saveBrand(updatedBrand);
  return { allowed: true, brand: updatedBrand };
}

// Developer Admin Access Helpers
const DEV_ACCESS_KEY = 'vt_has_dev_access';

export function getHasDevAccess(): boolean {
  if (typeof window === 'undefined') return false;
  const flag = localStorage.getItem(DEV_ACCESS_KEY);
  if (flag === 'true') return true;
  
  // Check auth user
  const authUser = localStorage.getItem('vt_auth_user');
  if (authUser) {
    try {
      const parsed = JSON.parse(authUser);
      if (parsed.hasDevAccess) return true;
    } catch (e) {
      // ignore
    }
  }

  // Check brand
  const brand = localStorage.getItem(KEYS.BRAND);
  if (brand) {
    try {
      const parsed = JSON.parse(brand);
      if (parsed.hasDevAccess) return true;
    } catch (e) {
      // ignore
    }
  }

  return false;
}

export function setHasDevAccess(enabled: boolean) {
  if (typeof window === 'undefined') return;
  if (enabled) {
    localStorage.setItem(DEV_ACCESS_KEY, 'true');
    // Update auth user
    const authUser = localStorage.getItem('vt_auth_user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        parsed.hasDevAccess = true;
        localStorage.setItem('vt_auth_user', JSON.stringify(parsed));
      } catch (e) {}
    }
    // Update brand
    const brandStr = localStorage.getItem(KEYS.BRAND);
    if (brandStr) {
      try {
        const parsed = JSON.parse(brandStr);
        parsed.hasDevAccess = true;
        localStorage.setItem(KEYS.BRAND, JSON.stringify(parsed));
      } catch (e) {}
    }
  } else {
    localStorage.removeItem(DEV_ACCESS_KEY);
    const authUser = localStorage.getItem('vt_auth_user');
    if (authUser) {
      try {
        const parsed = JSON.parse(authUser);
        delete parsed.hasDevAccess;
        localStorage.setItem('vt_auth_user', JSON.stringify(parsed));
      } catch (e) {}
    }
    const brandStr = localStorage.getItem(KEYS.BRAND);
    if (brandStr) {
      try {
        const parsed = JSON.parse(brandStr);
        delete parsed.hasDevAccess;
        localStorage.setItem(KEYS.BRAND, JSON.stringify(parsed));
      } catch (e) {}
    }
  }
}

// Coupon functions
export interface CouponItem {
  code: string;
  discount: number; // e.g. 100 for 100% off, 15 for 15% off
  type: 'bypass' | 'discount';
  isDevAdmin?: boolean; // true ONLY for DEV_ACCESS or explicit admin coupons
}

const COUPON_KEY = 'vt_coupons';
export const DEFAULT_COUPONS: CouponItem[] = [
  { code: 'RHOMANI', discount: 15, type: 'discount', isDevAdmin: false },
  { code: 'ZHARAHT', discount: 15, type: 'discount', isDevAdmin: false },
  { code: 'VERITHREAD100', discount: 100, type: 'bypass', isDevAdmin: false },
  { code: 'DEV_ACCESS', discount: 100, type: 'bypass', isDevAdmin: true }
];

export function getCoupons(): CouponItem[] {
  if (typeof window === 'undefined') return DEFAULT_COUPONS;
  const stored = localStorage.getItem(COUPON_KEY);
  if (!stored) {
    localStorage.setItem(COUPON_KEY, JSON.stringify(DEFAULT_COUPONS));
    return DEFAULT_COUPONS;
  }
  try {
    const parsed: CouponItem[] = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      // Clean obsolete coupons like VIP15, EARLY15, FOUNDER15
      const cleaned = parsed.filter(c => typeof c === 'object' && c.code && c.code !== 'VIP15' && c.code !== 'EARLY15' && c.code !== 'FOUNDER15');
      // Ensure all DEFAULT_COUPONS exist
      DEFAULT_COUPONS.forEach(def => {
        if (!cleaned.some(c => c.code === def.code)) {
          cleaned.push(def);
        }
      });
      localStorage.setItem(COUPON_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
    return DEFAULT_COUPONS;
  } catch (e) {
    localStorage.setItem(COUPON_KEY, JSON.stringify(DEFAULT_COUPONS));
    return DEFAULT_COUPONS;
  }
}

export function saveCoupons(coupons: CouponItem[]) {
  localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
}

export function addCoupon(code: string, discount: number = 100, type: 'bypass' | 'discount' = 'bypass', isDevAdmin: boolean = false): boolean {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;
  const list = getCoupons();
  if (list.some(c => c.code === normalized)) return false;
  list.push({ code: normalized, discount, type, isDevAdmin });
  saveCoupons(list);
  return true;
}

export function revokeCoupon(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  const list = getCoupons();
  const filtered = list.filter(c => c.code !== normalized);
  if (filtered.length === list.length) return false; // not found
  saveCoupons(filtered);
  return true;
}

export function checkCoupon(code: string): CouponItem | null {
  const normalized = code.trim().toUpperCase();
  const list = getCoupons();
  return list.find(c => c.code === normalized) || null;
}

export function isValidCoupon(code: string): boolean {
  return checkCoupon(code) !== null;
}
