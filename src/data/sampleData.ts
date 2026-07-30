import { Brand, Collection, Product, QRCode, Customer, Ownership, AnalyticsEvent } from '../types';

export const sampleBrand: Brand = {
  id: 'default-brand-id',
  userId: 'default-user-id',
  name: '',
  slug: '',
  logoUrl: '',
  description: '',
  websiteUrl: '',
  primaryColor: '#0F5132',
  secondaryColor: '#145A32',
  supportEmail: '',
  supportPhone: '',
  defaultBuyNowType: 'whatsapp',
  defaultBuyNowUrl: '',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  plan: 'starter',
  qrUsedThisMonth: 0,
  aiUsedThisMonth: 0,
  lastResetDate: new Date().toISOString(),
  billingHistory: []
};

export const sampleCollections: Collection[] = [];
export const sampleProducts: Product[] = [];
export const sampleQRCodes: QRCode[] = [];
export const sampleCustomers: Customer[] = [];
export const sampleOwnerships: Ownership[] = [];
export const sampleAnalyticsEvents: AnalyticsEvent[] = [];
