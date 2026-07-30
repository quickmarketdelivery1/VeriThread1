import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Brand, Product, Collection as CollectionType, QRCode, Customer, Ownership, AnalyticsEvent, Campaign } from '../types';

// Firebase Config with environment variables or safe fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB19vNxPc1T65_dSVrxOe9quKsVsRCYca8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'verithread-fde6c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'verithread-fde6c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'verithread-fde6c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '729232977904',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:729232977904:web:c12f40bb5a8c72b9d1f735',
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

/**
 * Format errors nicely so they don't produce `{}`
 */
function formatError(err: any): string {
  if (!err) return 'An unexpected authentication error occurred';
  
  const code = err.code || err.message || '';
  if (typeof code === 'string') {
    if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) {
      return 'Invalid email or password';
    }
    if (code.includes('auth/email-already-in-use')) {
      return 'An account with this email address already exists. Please log in.';
    }
    if (code.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (code.includes('auth/invalid-email')) {
      return 'The provided email address is invalid.';
    }
    if (code.includes('auth/api-key-not-valid') || code.includes('api-key-not-valid') || code.includes('invalid-api-key')) {
      return 'Firebase API key is invalid or unconfigured.';
    }
  }

  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string') return err.message;
  if (err.code && typeof err.code === 'string') return err.code;
  try {
    const str = JSON.stringify(err, Object.getOwnPropertyNames(err));
    return str === '{}' ? String(err) : str;
  } catch {
    return String(err);
  }
}

/**
 * Register User: Create user with email and password, send email verification, and store profile in Firestore users/{uid}
 */
export async function registerUser(userData: {
  fullName: string;
  brandName: string;
  brandType: string;
  brandDescription: string;
  brandLocation: string;
  email: string;
  password: string;
  plan: string;
  couponCode?: string;
  hasDevAccess?: boolean;
  paystackReference?: string;
  paidAmount?: number;
}): Promise<{ user: User }> {
  const cleanEmail = userData.email.trim().toLowerCase();

  try {
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, userData.password);
    const user = userCred.user;

    // Set user display name
    try {
      await updateProfile(user, { displayName: userData.fullName.trim() });
    } catch (e) {
      console.warn('Update profile display name error:', e);
    }

    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.warn('Verification email send error:', e);
    }

    // Save user profile in Firestore under collection `users`, doc `{uid}`
    const userDocRef = doc(db, 'users', user.uid);
    const userPayload = {
      uid: user.uid,
      fullName: userData.fullName.trim(),
      brandName: userData.brandName.trim(),
      brandType: userData.brandType,
      brandDescription: userData.brandDescription.trim(),
      brandLocation: userData.brandLocation.trim(),
      plan: userData.plan.toLowerCase(),
      couponCode: userData.couponCode || null,
      hasDevAccess: !!userData.hasDevAccess,
      paystackReference: userData.paystackReference || null,
      paidAmount: userData.paidAmount || null,
      email: cleanEmail,
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, userPayload, { merge: true });

    // Also sync brand document for application compatibility
    const brandRef = doc(db, 'brands', user.uid);
    const normalizedPlan = userData.plan.toLowerCase() as 'starter' | 'professional' | 'enterprise';
    const newBrand: Brand = {
      id: user.uid,
      userId: user.uid,
      name: userData.brandName.trim(),
      slug: userData.brandName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
      type: userData.brandType,
      description: userData.brandDescription.trim(),
      location: userData.brandLocation.trim(),
      logoUrl: '',
      primaryColor: '#0F5132',
      secondaryColor: '#145A32',
      supportEmail: cleanEmail,
      defaultBuyNowType: 'whatsapp',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slogan: 'Digital Product Passport Atelier',
      plan: normalizedPlan,
      hasDevAccess: !!userData.hasDevAccess,
      paystackReference: userData.paystackReference,
      paidAmount: userData.paidAmount,
      qrUsedThisMonth: 0,
      aiUsedThisMonth: 0,
      lastResetDate: new Date().toISOString()
    };
    await setDoc(brandRef, newBrand, { merge: true });

    // Ensure newly registered user is signed out until they verify email
    try {
      await signOut(auth);
    } catch (e) {}

    return { user };
  } catch (err: any) {
    throw new Error(formatError(err));
  }
}

/**
 * Login User with Email and Password & Check Email Verification
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; userData: any }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCred.user;

    // Force reload user account state from Firebase Auth backend to refresh emailVerified status
    try {
      await user.reload();
    } catch (reloadErr) {
      console.warn('User reload error:', reloadErr);
    }

    if (!user.emailVerified) {
      // Re-send email verification link
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.warn('Could not re-send verification:', e);
      }
      try {
        await signOut(auth);
      } catch (e) {}
      throw new Error('Please verify your email before logging in. A new verification link has been sent to your email.');
    }

    // Fetch user document from Firestore collection `users`, doc ID `{uid}`
    let userData: any = null;
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        userData = userSnap.data();
      } else {
        // Fallback: check localStorage metadata
        let meta: any = null;
        try {
          const stored = localStorage.getItem('vt_signup_metadata');
          if (stored) meta = JSON.parse(stored);
        } catch (e) {}

        const brandSnap = await getDoc(doc(db, 'brands', user.uid));
        if (brandSnap.exists()) {
          const bData = brandSnap.data();
          userData = {
            uid: user.uid,
            fullName: meta?.fullName || user.displayName || '',
            brandName: bData.name || meta?.brandName || '',
            brandType: bData.type || meta?.brandType || '',
            brandDescription: bData.description || meta?.brandDescription || '',
            brandLocation: bData.location || meta?.brandLocation || '',
            plan: bData.plan || meta?.plan || 'starter',
            email: cleanEmail
          };
        } else if (meta) {
          userData = {
            uid: user.uid,
            fullName: meta.fullName || user.displayName || '',
            brandName: meta.brandName || '',
            brandType: meta.brandType || '',
            brandDescription: meta.brandDescription || '',
            brandLocation: meta.brandLocation || '',
            plan: meta.plan || 'starter',
            email: cleanEmail
          };
        }
      }
    } catch (e) {
      console.warn('Firestore user fetch error:', e);
    }

    return { user, userData };
  } catch (err: any) {
    throw new Error(formatError(err));
  }
}

/**
 * Fetch User Data from Firestore users/{uid}
 */
export async function getUserFirestoreDoc(uid: string): Promise<any> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data();
    }
    let meta: any = null;
    try {
      const stored = localStorage.getItem('vt_signup_metadata');
      if (stored) meta = JSON.parse(stored);
    } catch (e) {}

    const brandSnap = await getDoc(doc(db, 'brands', uid));
    if (brandSnap.exists()) {
      const b = brandSnap.data();
      return {
        uid,
        fullName: meta?.fullName || '',
        brandName: b.name || meta?.brandName || '',
        brandType: b.type || meta?.brandType || '',
        brandDescription: b.description || meta?.brandDescription || '',
        brandLocation: b.location || meta?.brandLocation || '',
        plan: b.plan || meta?.plan || 'starter',
        email: b.supportEmail || meta?.email || ''
      };
    } else if (meta) {
      return {
        uid,
        fullName: meta.fullName,
        brandName: meta.brandName,
        brandType: meta.brandType,
        brandDescription: meta.brandDescription,
        brandLocation: meta.brandLocation,
        plan: meta.plan,
        email: meta.email
      };
    }
  } catch (e) {
    console.warn('Error fetching user document from Firestore:', e);
  }
  return null;
}

/**
 * Resend Email Verification to current or signed in user
 */
export async function resendUserEmailVerification(user: User): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch (err: any) {
    throw new Error(formatError(err));
  }
}

/**
 * Send Password Reset Email
 */
export async function sendUserPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err: any) {
    const code = err?.code || err?.message || String(err);
    if (
      code.includes('auth/api-key-not-valid') || 
      code.includes('api-key-not-valid') || 
      code.includes('invalid-api-key') || 
      code.includes('auth/configuration-not-found')
    ) {
      console.warn('[VeriThread Auth] Local preview password reset.');
      return;
    }
    throw new Error(formatError(err));
  }
}

/**
 * Sign out current Firebase user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    window.localStorage.removeItem('vt_auth_user');
    window.localStorage.removeItem('vt_signup_metadata');
  } catch (err: any) {
    console.error('Error signing out:', formatError(err));
  }
}

// ==========================================
// FIRESTORE BRAND & USER DATA SYNCHRONIZATION
// ==========================================

export async function syncBrandInFirestore(
  firebaseUser: User,
  metadata?: any
): Promise<Brand> {
  const uid = firebaseUser.uid;
  const email = firebaseUser.email || '';
  const brandRef = doc(db, 'brands', uid);

  // Attempt to load profile from users/{uid} first
  let userProfile: any = null;
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      userProfile = userSnap.data();
    }
  } catch (e) {
    console.warn('Firestore user fetch warning:', e);
  }

  const brandName = userProfile?.brandName || metadata?.brandName || firebaseUser.displayName || '';
  const brandType = userProfile?.brandType || metadata?.brandType || '';
  const brandDesc = userProfile?.brandDescription || metadata?.brandDescription || '';
  const brandLocation = userProfile?.brandLocation || metadata?.brandLocation || '';
  const plan = (userProfile?.plan?.toLowerCase() || metadata?.plan?.toLowerCase() || 'starter') as 'starter' | 'professional' | 'enterprise';

  try {
    const docSnap = await getDoc(brandRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data() as Brand;
      const updated: Brand = {
        ...existingData,
        id: uid,
        userId: uid,
        name: userProfile?.brandName || brandName || existingData.name || '',
        type: userProfile?.brandType || brandType || existingData.type || '',
        description: userProfile?.brandDescription || brandDesc || existingData.description || '',
        location: userProfile?.brandLocation || brandLocation || existingData.location || '',
        plan: plan || existingData.plan || 'starter',
        supportEmail: email || existingData.supportEmail || email,
        logoUrl: typeof existingData.logoUrl === 'string' ? existingData.logoUrl : '',
      };
      await setDoc(brandRef, updated, { merge: true });
      return updated;
    }
  } catch (e) {
    console.warn('Firestore read brand warning:', e);
  }

  // Create brand document for new signup / first login
  const newBrand: Brand = {
    id: uid,
    userId: uid,
    name: brandName,
    type: brandType,
    description: brandDesc,
    location: brandLocation,
    slug: brandName.toLowerCase().replace(/\s+/g, '-'),
    logoUrl: '',
    primaryColor: '#0F5132',
    secondaryColor: '#D4AF37',
    supportEmail: email,
    defaultBuyNowType: 'whatsapp',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slogan: 'Digital Product Passport Atelier',
    plan: plan,
    qrUsedThisMonth: 0,
    aiUsedThisMonth: 0,
    lastResetDate: new Date().toISOString()
  };

  try {
    await setDoc(brandRef, newBrand);
  } catch (e) {
    console.error('Firestore create brand error:', e);
  }

  return newBrand;
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (_key, value) => {
    return value === undefined ? null : value;
  }));
}

export async function saveBrandFirestore(brand: Brand): Promise<void> {
  try {
    const cleanBrand = sanitizeForFirestore(brand);
    await setDoc(doc(db, 'brands', brand.id), cleanBrand, { merge: true });
  } catch (e) {
    console.warn('Firestore saveBrand error:', e);
  }
}

export async function saveProductFirestore(product: Product): Promise<void> {
  console.log('[Firestore] saveProductFirestore called for product ID:', product.id);
  try {
    const cleanProduct = sanitizeForFirestore(product);
    await setDoc(doc(db, 'products', product.id), cleanProduct, { merge: true });
    console.log('[Firestore] saveProductFirestore successfully written to Firestore for product ID:', product.id);
  } catch (e: any) {
    console.warn('[Firestore] saveProductFirestore error:', e?.message || e);
  }
}

export async function deleteProductFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (e) {
    console.warn('Firestore deleteProduct error:', e);
  }
}

export async function fetchProductsFirestore(brandId: string): Promise<Product[]> {
  console.log('[Firestore] fetchProductsFirestore called for brandId:', brandId);
  try {
    const q = query(collection(db, 'products'), where('brandId', '==', brandId));
    const snap = await getDocs(q);
    const products = snap.docs.map(d => d.data() as Product);
    console.log('[Firestore] fetchProductsFirestore returned', products.length, 'products from Firestore');
    return products;
  } catch (e: any) {
    console.warn('[Firestore] fetchProductsFirestore error:', e?.message || e);
    return [];
  }
}

export async function fetchProductByIdFirestore(productId: string): Promise<Product | null> {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (docSnap.exists()) {
      return docSnap.data() as Product;
    }
  } catch (e) {
    console.warn('Firestore fetchProductById warning:', e);
  }
  return null;
}

export async function saveCollectionFirestore(coll: CollectionType): Promise<void> {
  try {
    await setDoc(doc(db, 'collections', coll.id), coll, { merge: true });
  } catch (e) {
    console.warn('Firestore saveCollection error:', e);
  }
}

export async function fetchCollectionsFirestore(brandId: string): Promise<CollectionType[]> {
  try {
    const q = query(collection(db, 'collections'), where('brandId', '==', brandId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as CollectionType);
  } catch (e) {
    console.warn('Firestore fetchCollections warning:', e);
    return [];
  }
}

export async function saveQRCodeFirestore(qrcode: QRCode, brandId?: string): Promise<void> {
  try {
    const payload = brandId ? { ...qrcode, brandId } : qrcode;
    await setDoc(doc(db, 'qrcodes', qrcode.id), payload, { merge: true });
  } catch (e) {
    console.warn('Firestore saveQRCode error:', e);
  }
}

export async function fetchQRCodesFirestore(brandId: string): Promise<QRCode[]> {
  try {
    const q = query(collection(db, 'qrcodes'), where('brandId', '==', brandId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as QRCode);
  } catch (e) {
    console.warn('Firestore fetchQRCodes warning:', e);
    return [];
  }
}

export async function saveCustomerFirestore(customer: Customer, brandId?: string): Promise<void> {
  try {
    const payload = brandId ? { ...customer, brandId } : customer;
    await setDoc(doc(db, 'customers', customer.id), payload, { merge: true });
  } catch (e) {
    console.warn('Firestore saveCustomer error:', e);
  }
}

export async function fetchCustomersFirestore(brandId: string): Promise<Customer[]> {
  try {
    const q = query(collection(db, 'customers'), where('brandId', '==', brandId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Customer);
  } catch (e) {
    console.warn('Firestore fetchCustomers warning:', e);
    return [];
  }
}

export async function saveOwnershipFirestore(ownership: Ownership, brandId?: string): Promise<void> {
  try {
    const payload = brandId ? { ...ownership, brandId } : ownership;
    await setDoc(doc(db, 'ownerships', ownership.id), payload, { merge: true });
  } catch (e) {
    console.warn('Firestore saveOwnership error:', e);
  }
}

export async function fetchOwnershipsFirestore(brandId: string): Promise<Ownership[]> {
  try {
    const q = query(collection(db, 'ownerships'), where('brandId', '==', brandId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Ownership);
  } catch (e) {
    console.warn('Firestore fetchOwnerships warning:', e);
    return [];
  }
}

export async function saveAnalyticsEventFirestore(event: AnalyticsEvent, brandId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'analytics', event.id), { ...event, brandId }, { merge: true });
  } catch (e) {
    console.warn('Firestore saveAnalyticsEvent error:', e);
  }
}

export async function fetchAnalyticsEventsFirestore(brandId: string): Promise<AnalyticsEvent[]> {
  try {
    const q = query(collection(db, 'analytics'), where('brandId', '==', brandId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as AnalyticsEvent);
  } catch (e) {
    console.warn('Firestore fetchAnalyticsEvents warning:', e);
    return [];
  }
}

export { onAuthStateChanged };

