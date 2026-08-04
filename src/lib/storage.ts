import { Brand, Collection, Product, QRCode, Customer, Ownership, AnalyticsEvent, Campaign, BrandSignupRecord, Report } from '../types';
import {
  saveBrandFirestore,
  saveUserProfileFirestore,
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
  BRAND_SIGNUPS: 'vt_brand_signups',
  REPORTS: 'vt_reports'
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
  let brandObj: Brand;

  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        brandObj = {
          ...sampleBrand,
          ...parsed,
          logoUrl: typeof parsed.logoUrl === 'string' ? parsed.logoUrl : ''
        };
      } else {
        brandObj = { ...sampleBrand, logoUrl: '' };
      }
    } catch (e) {
      brandObj = { ...sampleBrand, logoUrl: '' };
    }
  } else {
    brandObj = { ...sampleBrand, logoUrl: '' };
  }

  // Ensure vt_auth_user and single source of truth stay aligned
  if (typeof window !== 'undefined') {
    try {
      const authUserStr = localStorage.getItem('vt_auth_user');
      if (authUserStr) {
        const u = JSON.parse(authUserStr);
        let updated = false;
        if (u.brandName && (!brandObj.name || brandObj.name === 'Atelier Store')) {
          brandObj.name = u.brandName;
          updated = true;
        }
        if (u.brandType && !brandObj.type) {
          brandObj.type = u.brandType;
          updated = true;
        }
        if (u.brandDescription && !brandObj.description) {
          brandObj.description = u.brandDescription;
          updated = true;
        }
        if (u.brandLocation && !brandObj.location) {
          brandObj.location = u.brandLocation;
          updated = true;
        }
        if (u.plan && brandObj.plan !== u.plan.toLowerCase()) {
          brandObj.plan = u.plan.toLowerCase() as any;
          updated = true;
        }
        if (updated) {
          localStorage.setItem(KEYS.BRAND, JSON.stringify(brandObj));
        }
      }
    } catch (e) {}
  }

  return brandObj;
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
  
  try {
    const authUserStr = localStorage.getItem('vt_auth_user');
    if (authUserStr) {
      const parsed = JSON.parse(authUserStr);
      parsed.brandName = cleanBrand.name;
      parsed.brandType = cleanBrand.type || parsed.brandType;
      parsed.brandDescription = cleanBrand.description || parsed.brandDescription;
      parsed.brandLocation = cleanBrand.location || parsed.brandLocation;
      parsed.plan = cleanBrand.plan || parsed.plan;
      localStorage.setItem('vt_auth_user', JSON.stringify(parsed));
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }

  saveBrandFirestore(cleanBrand).catch(err => console.warn('Firestore sync brand warning:', err));
  if (cleanBrand.id) {
    saveUserProfileFirestore(cleanBrand.id, {
      brandName: cleanBrand.name,
      brandType: cleanBrand.type,
      brandDescription: cleanBrand.description,
      brandLocation: cleanBrand.location,
      plan: cleanBrand.plan,
      email: cleanBrand.supportEmail
    }).catch(err => console.warn('Firestore sync user profile warning:', err));
  }
}

// Subscription & Plan Limits Logic
export function checkQRLimit(brand: Brand): { allowed: boolean; remaining: number; message?: string } {
  const qrs = getQRCodes(brand.id);
  const totalCount = qrs.length;

  if (brand.plan === 'starter') {
    const used = Math.max(brand.qrUsed ?? 0, totalCount);
    const limit = 5;
    if (used >= limit) {
      return { 
        allowed: false, 
        remaining: 0, 
        message: 'You have reached your 5 free QR limit. Please upgrade to Professional.' 
      };
    }
    return { allowed: true, remaining: limit - used };
  }
  
  if (brand.plan === 'professional') {
    const expiry = checkSubscriptionExpiry(brand);
    if (expiry.isExpired) {
      return {
        allowed: false,
        remaining: 0,
        message: 'Your Professional subscription has expired. Please renew your plan to generate new QR codes.'
      };
    }

    const used = brand.qrUsedThisMonth || 0;
    const limit = 250;
    if (used >= limit) {
      return { 
        allowed: false, 
        remaining: 0, 
        message: 'You have reached your monthly QR limit of 250. Please wait until next month or contact support.' 
      };
    }
    return { allowed: true, remaining: limit - used };
  }
  
  return { allowed: true, remaining: Infinity };
}

export function checkSubscriptionExpiry(brand: Brand): { isExpired: boolean; daysRemaining: number } {
  if (brand.plan === 'starter') {
    return { isExpired: false, daysRemaining: Infinity };
  }
  
  if (brand.plan === 'professional') {
    if (!brand.subscriptionExpiry) {
      const start = brand.subscriptionStartDate 
        ? new Date(brand.subscriptionStartDate).getTime() 
        : (brand.createdAt ? new Date(brand.createdAt).getTime() : Date.now());
      const expiryDate = new Date(start + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isExpired: daysRemaining < 0, daysRemaining };
    }

    const expiryDate = new Date(brand.subscriptionExpiry);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { isExpired: daysRemaining < 0, daysRemaining };
  }
  
  return { isExpired: false, daysRemaining: Infinity };
}

export function incrementQRUsage(explicitBrandId?: string): Brand {
  const brand = getBrand();
  const targetId = explicitBrandId || brand.id;
  const currentCount = getQRCodes(targetId).length;

  const updatedBrand: Brand = {
    ...brand,
    qrUsed: Math.max((brand.qrUsed || 0) + 1, currentCount + 1),
    qrUsedThisMonth: (brand.qrUsedThisMonth || 0) + 1
  };

  saveBrand(updatedBrand);
  return updatedBrand;
}

import { createInvoice, updateInvoiceStatus } from './invoices';

export function upgradeBrandToProfessional(paymentRef?: string, paidAmount: number = 25000): Brand {
  const brand = getBrand();
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Generate and record paid invoice
  const inv = createInvoice(
    brand.id,
    brand.name,
    brand.supportEmail || 'billing@verithread.com',
    'Professional',
    paidAmount,
    'Professional Monthly License'
  );
  updateInvoiceStatus(inv.id, 'Paid', paymentRef || `ref-${Date.now()}`);

  const updatedBrand: Brand = {
    ...brand,
    plan: 'professional',
    subscriptionStartDate: now.toISOString(),
    subscriptionExpiry: expiry.toISOString(),
    qrUsedThisMonth: 0,
    paystackReference: paymentRef || `pay-${Date.now()}`,
    paidAmount: paidAmount,
    billingHistory: [
      ...(brand.billingHistory || []),
      {
        id: inv.id,
        date: now.toISOString().split('T')[0],
        amount: paidAmount,
        planName: 'Professional',
        status: 'Paid'
      }
    ]
  };

  saveBrand(updatedBrand);
  return updatedBrand;
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

export function clearUserDataOnLogout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.BRAND);
  localStorage.removeItem(KEYS.COLLECTIONS);
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.QRCODES);
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.OWNERSHIPS);
  localStorage.removeItem(KEYS.ANALYTICS);
  localStorage.removeItem(KEYS.CAMPAIGNS);
  localStorage.removeItem(KEYS.BRAND_SIGNUPS);
  localStorage.removeItem(KEYS.REPORTS);
  localStorage.removeItem('vt_auth_user');
  localStorage.removeItem('vt_signup_metadata');
  localStorage.removeItem('vt_fresh_slate');
  localStorage.removeItem('vt_has_dev_access');
  localStorage.removeItem('vt_invoices');
  localStorage.removeItem('vt_reminder_logs');
  localStorage.removeItem('vt_liked_products');
  localStorage.removeItem('vt_paystack_transactions');
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
}

// Collection functions
export function getCollections(explicitBrandId?: string): Collection[] {
  initStorage();
  const data = localStorage.getItem(KEYS.COLLECTIONS);
  let list: Collection[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) list = parsed;
    } catch {}
  }

  const currentBrand = getBrand();
  const targetBrandId = explicitBrandId || currentBrand.id;

  if (isUserRegisteredSession()) {
    return list.filter(c => c && (c.brandId === targetBrandId || !c.brandId));
  }
  return list.length > 0 ? list : sampleCollections;
}

export function saveCollection(collection: Collection) {
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return getCollections();
  }
  const brand = getBrand();
  const collectionWithBrand: Collection = {
    ...collection,
    brandId: collection.brandId || brand.id
  };
  const list = getCollections(brand.id);
  const index = list.findIndex(c => c.id === collectionWithBrand.id);
  if (index >= 0) {
    list[index] = collectionWithBrand;
  } else {
    list.push(collectionWithBrand);
  }
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(list));
  saveCollectionFirestore(collectionWithBrand, brand.id).catch(err => console.warn('Firestore sync collection warning:', err));
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
export function getProducts(explicitBrandId?: string): Product[] {
  initStorage();
  const data = localStorage.getItem(KEYS.PRODUCTS);
  let products: Product[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) products = parsed;
    } catch (e) {
      console.error('[Storage] Error parsing vt_products:', e);
    }
  }

  const currentBrand = getBrand();
  const targetBrandId = explicitBrandId || currentBrand.id;

  if (isUserRegisteredSession()) {
    return products.filter(p => p && p.brandId === targetBrandId);
  }

  const matched = products.filter(p => !p.brandId || p.brandId === targetBrandId || p.brandId === 'brand-1' || p.brandId === 'brand-sample');
  return matched.length > 0 ? matched : sampleProducts;
}

export function getProductsByBrand(brandId?: string): Product[] {
  return getProducts(brandId);
}

export function getCollectionsWithProducts(brandId?: string): (Collection & { products: Product[] })[] {
  const collections = getCollections(brandId);
  const products = getProductsByBrand(brandId);
  return collections.map(col => ({
    ...col,
    products: products.filter(p => p.collectionId === col.id)
  }));
}

export function getProductById(id: string): Product | undefined {
  if (!id) return undefined;
  const cleanId = id.replace(/^#\/?/, '').replace(/^passport\//, '').trim();
  
  // First search raw localStorage products to support cross-brand or public views
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find(p => p && (p.id === cleanId || p.id === id));
        if (found) return found;
      }
    }
  } catch (e) {}

  const products = getProducts();
  return products.find(p => p && (p.id === cleanId || p.id === id));
}

export function syncProductsWithRemote(fsProducts: Product[], brandId: string): Product[] {
  console.log('[DEBUG] syncProductsWithRemote called with fsProducts count:', Array.isArray(fsProducts) ? fsProducts.length : 0, 'brandId:', brandId);
  if (!Array.isArray(fsProducts)) return getProducts(brandId);

  // Filter local storage strictly for this brandId
  let currentLocal: Product[] = [];
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        currentLocal = parsed.filter(p => p && p.brandId === brandId);
      }
    }
  } catch (e) {}

  const fsMap = new Map<string, Product>();
  fsProducts.forEach(p => {
    if (p && p.id) fsMap.set(p.id, { ...p, brandId });
  });

  const updatedBrandProds: Product[] = [];

  // 1. Process items present in Firestore
  fsProducts.forEach(fp => {
    const local = currentLocal.find(l => l.id === fp.id);
    if (!local) {
      updatedBrandProds.push({ ...fp, brandId });
    } else {
      const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
      const fsTime = fp.updatedAt ? new Date(fp.updatedAt).getTime() : 0;
      if (fsTime >= localTime) {
        updatedBrandProds.push({ ...fp, brandId });
      } else {
        const merged = { ...fp, ...local, brandId };
        updatedBrandProds.push(merged);
        saveProductFirestore(merged).catch(e => console.warn('[Storage] Push newer local product to Firestore:', e));
      }
    }
  });

  // 2. Process local items for this brand not in Firestore
  const now = Date.now();
  currentLocal.forEach(lp => {
    if (!fsMap.has(lp.id)) {
      const createdTime = lp.createdAt ? new Date(lp.createdAt).getTime() : 0;
      if (createdTime === 0 || (now - createdTime < 10 * 60 * 1000) || fsProducts.length === 0) {
        const fixedProduct = { ...lp, brandId };
        updatedBrandProds.push(fixedProduct);
        saveProductFirestore(fixedProduct).catch(e => console.warn('[Storage] Background push local product to Firestore:', e));
      }
    }
  });

  try {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updatedBrandProds));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.warn('[Storage] Error saving synced products to localStorage:', e);
  }

  return updatedBrandProds;
}

export function saveProduct(product: Product): Product[] {
  console.log('[DEBUG] saveProduct called with product:', product);
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return getProducts();
  }
  
  // Get active brand ID (prefer authed user UID if available)
  const brand = getBrand();
  let effectiveBrandId = brand.id;
  try {
    const authUser = localStorage.getItem('vt_auth_user');
    if (authUser) {
      const parsed = JSON.parse(authUser);
      if (parsed.uid) effectiveBrandId = parsed.uid;
    }
  } catch (e) {}

  const finalBrandId = (product.brandId && product.brandId !== 'brand-1' && product.brandId !== 'brand-sample')
    ? product.brandId
    : (effectiveBrandId || brand.id || 'brand-1');

  const productWithBrand: Product = { 
    ...product, 
    brandId: finalBrandId,
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
    console.log('[DEBUG] localStorage setItem called with:', list);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(list));
    console.log('[Storage] Product successfully saved to localStorage. Total products:', list.length);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('[Storage] Error writing product to localStorage:', e);
  }

  // Mandatory Firestore persistence
  console.log('[DEBUG] Calling saveProductFirestore for product ID:', productWithBrand.id);
  saveProductFirestore(productWithBrand).catch(err => 
    console.warn('[Storage] Firestore sync product warning:', err)
  );

  // Also ensure a QR Code exists for this product
  try {
    getOrCreateQRCode(productWithBrand.id);
  } catch (e) {
    console.warn('[Storage] Error creating QR code:', e);
  }
  
  return list;
}

export function deleteProduct(id: string) {
  console.log('[Storage] deleteProduct called for product ID:', id);
  if (isPreviewModeReadOnly()) {
    alert('Preview Mode (View-Only): Data modifications are disabled in preview mode.');
    return;
  }
  const list = getProducts();
  const filtered = list.filter(p => p.id !== id);
  try {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('[Storage] Error removing product from localStorage:', e);
  }

  deleteProductFirestore(id).then(() => {
    console.log('[Storage] deleteProductFirestore completed for ID:', id);
  }).catch(err => {
    console.warn('[Storage] Firestore delete product warning:', err);
  });
}


// QR Code functions
export function getQRCodes(explicitBrandId?: string): QRCode[] {
  initStorage();
  const data = localStorage.getItem(KEYS.QRCODES);
  let codes: QRCode[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) codes = parsed;
    } catch {}
  }

  const currentBrand = getBrand();
  const targetBrandId = explicitBrandId || currentBrand.id;

  if (isUserRegisteredSession()) {
    const products = getProducts(targetBrandId);
    const productIds = new Set(products.map(p => p.id));
    return codes.filter(q => q && (q.brandId === targetBrandId || (q.productId && productIds.has(q.productId))));
  }
  return codes.length > 0 ? codes : sampleQRCodes;
}

export function getOrCreateQRCode(productId: string): QRCode {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  const brand = getBrand();
  const targetBrandId = product?.brandId || brand.id;

  const codes = getQRCodes(targetBrandId);
  let code = codes.find(q => q.productId === productId);
  if (!code) {
    code = {
      id: `qr-${productId}`,
      productId: productId,
      brandId: targetBrandId,
      code: `https://verithread.net/passport/${productId}`,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    codes.push(code);
    localStorage.setItem(KEYS.QRCODES, JSON.stringify(codes));
    saveQRCodeFirestore(code, targetBrandId).catch(err => console.warn('[Storage] Firestore sync qrcode warning:', err));
  } else if (!code.brandId) {
    code.brandId = targetBrandId;
  }
  return code;
}

export function recordQRCodeScan(productId: string, explicitBrandId?: string) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  const brand = getBrand();
  const targetBrandId = explicitBrandId || product?.brandId || brand.id;

  const codes = getQRCodes(targetBrandId);
  let code = codes.find(q => q.productId === productId);
  if (!code) {
    code = {
      id: `qr-${productId}`,
      productId: productId,
      brandId: targetBrandId,
      code: `https://verithread.net/passport/${productId}`,
      scanCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    codes.push(code);
  } else {
    code.brandId = targetBrandId;
  }

  code.scanCount = (code.scanCount || 0) + 1;
  code.updatedAt = new Date().toISOString();
  localStorage.setItem(KEYS.QRCODES, JSON.stringify(codes));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }

  // Save to Firestore with canonical targetBrandId
  saveQRCodeFirestore(code, targetBrandId).catch(err => 
    console.warn('[Storage] Firestore sync qrcode scan warning:', err)
  );

  // Record scan analytics event
  const newEvent: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId,
    eventType: 'scan',
    timestamp: new Date().toISOString(),
    metadata: {
      location: getRandomNigerianCity(),
      referrer: Math.random() > 0.5 ? 'WhatsApp' : 'Instagram'
    }
  };

  recordAnalyticsEvent(newEvent, targetBrandId);
}

// Customer & Ownership functions
export function getCustomers(explicitBrandId?: string): Customer[] {
  initStorage();
  const data = localStorage.getItem(KEYS.CUSTOMERS);
  let customers: Customer[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) customers = parsed;
    } catch {}
  }

  const currentBrand = getBrand();
  const targetBrandId = explicitBrandId || currentBrand.id;

  if (isUserRegisteredSession()) {
    return customers.filter(c => c && (c.brandId === targetBrandId || !c.brandId));
  }
  return customers.length > 0 ? customers : sampleCustomers;
}

export function getOwnerships(explicitBrandId?: string): Ownership[] {
  initStorage();
  const data = localStorage.getItem(KEYS.OWNERSHIPS);
  let ownerships: Ownership[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) ownerships = parsed;
    } catch {}
  }

  const currentBrand = getBrand();
  const targetBrandId = explicitBrandId || currentBrand.id;

  if (isUserRegisteredSession()) {
    return ownerships.filter(o => o && (o.brandId === targetBrandId || !o.brandId));
  }
  return ownerships.length > 0 ? ownerships : sampleOwnerships;
}

export function registerWarranty(productId: string, customerData: { email: string; firstName: string; lastName: string; phone?: string }) {
  const brand = getBrand();
  const customers = getCustomers();
  const ownerships = getOwnerships();
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  const targetBrandId = product?.brandId || brand.id;

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
    saveCustomerFirestore(customer, targetBrandId).catch(err => console.warn('Firestore sync customer warning:', err));
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
  saveOwnershipFirestore(ownership, targetBrandId).catch(err => console.warn('Firestore sync ownership warning:', err));

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
  }, targetBrandId);

  return { success: true, message: 'Successfully registered warranty!', ownership, customer };
}

// Analytics functions
export function getAnalyticsEvents(explicitBrandId?: string): AnalyticsEvent[] {
  initStorage();
  const data = localStorage.getItem(KEYS.ANALYTICS);
  let events: AnalyticsEvent[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) events = parsed;
    } catch {}
  }

  const currentBrand = getBrand();
  const targetBrandId = explicitBrandId || currentBrand.id;

  if (isUserRegisteredSession()) {
    return events.filter(e => e && (e.brandId === targetBrandId || !e.brandId));
  }
  return events.length > 0 ? events : sampleAnalyticsEvents;
}

export function recordAnalyticsEvent(event: AnalyticsEvent, explicitBrandId?: string) {
  const brand = getBrand();
  const products = getProducts();
  const product = event.productId ? products.find(p => p.id === event.productId) : null;
  const targetBrandId = explicitBrandId || product?.brandId || brand.id;

  const list = getAnalyticsEvents();
  // Avoid duplicate event addition if already present
  if (!list.some(e => e.id === event.id)) {
    list.unshift(event); // Put newest first
  }
  localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(list));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }

  saveAnalyticsEventFirestore(event, targetBrandId).catch(err => console.warn('Firestore sync analytics warning:', err));
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
  const limitCheck = checkQRLimit(resetBrand);

  if (!limitCheck.allowed) {
    return {
      allowed: false,
      brand: resetBrand,
      message: limitCheck.message
    };
  }

  const currentQRs = getQRCodes(resetBrand.id).length;
  const newTotalUsed = Math.max((resetBrand.qrUsed || 0) + 1, currentQRs + 1);

  const updatedBrand: Brand = {
    ...resetBrand,
    qrUsed: newTotalUsed,
    qrUsedThisMonth: (resetBrand.qrUsedThisMonth || 0) + 1
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

export function getReports(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading reports from localStorage', e);
    return [];
  }
}

export function saveReport(report: Report): Report[] {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === report.id);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.unshift(report);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
  }
  return reports;
}

