export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'brand_owner' | 'admin' | 'editor' | 'viewer';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type?: string;
  location?: string;
  logoUrl?: string;
  websiteUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail?: string;
  supportPhone?: string;
  defaultBuyNowType: string;
  defaultBuyNowUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  slogan?: string;
  coverUrl?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  hasDevAccess?: boolean;
  paystackReference?: string;
  paidAmount?: number;
  qrUsedThisMonth: number;
  aiUsedThisMonth: number;
  lastResetDate: string;
  billingHistory?: { id: string; date: string; amount: number; planName: string; status: string }[];
}

export interface Collection {
  id: string;
  brandId: string;
  name: string;
  season: string;
  year: number;
  description?: string;
  coverImage: string;
  colorPalette?: string[]; // Array of hex strings
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  brandId: string;
  collectionId?: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  priceMin?: number;
  priceMax?: number;
  fabric: string;
  material: string;
  gsm?: string;
  color: string;
  fit: string;
  careInstructions: string[];
  sizeGuide?: string; // Text or file link
  story?: string;
  founderMessage?: string;
  founderPhoto?: string;
  collectionStory?: string;
  heroImage: string;
  galleryImages: string[];
  videoUrl?: string;
  buyNowType: string; // whatsapp, instagram, website, etc.
  buyNowValue: string; // phone number, URL, etc.
  warrantyPeriod: number; // in months
  likeCount?: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QRCode {
  id: string;
  productId: string;
  code: string; // Unique URL or code token
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isVIP?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ownership {
  id: string;
  productId: string;
  customerId: string;
  registrationDate: string;
  warrantyExpiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'welcome' | 'product_care' | 'new_collection' | 'birthday' | 'vip_drop' | 'review_request' | 'referral';
  status: 'Active' | 'Paused';
  timing: string;
  audience: string;
  subject: string;
  body: string;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenueInfluenced: number;
  sentCount: number;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  productId: string;
  eventType: 'scan' | 'view' | 'share' | 'register' | 'like';
  timestamp: string;
  metadata?: {
    location?: string;
    referrer?: string;
    browser?: string;
    ownerName?: string;
  };
}

export interface BrandSignupRecord {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  signedUpAt: string;
  status: 'Active' | 'Pending Verification' | 'Magic Link Sent';
  hasDevAccess?: boolean;
}

export interface Report {
  id: string;
  brandId: string;
  brandName: string;
  productId: string;
  productName: string;
  reason: string;
  details: string;
  email?: string;
  imageEvidence?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
}

