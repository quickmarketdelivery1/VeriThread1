import { Invoice, Brand } from '../types';
import { getBrand, saveBrand, getBrandSignups } from './storage';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';

const INVOICES_KEY = 'vt_invoices';

// Sample initial default invoices if empty
const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-sample-1',
    invoiceNumber: 'INV-2026-001',
    brandId: 'b1',
    brandName: 'VeriThread Signature',
    brandEmail: 'billing@verithread.com',
    planName: 'Professional',
    amount: 25000,
    currency: 'NGN',
    status: 'Paid',
    invoiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'Bank Transfer',
    paymentProofRef: 'TRF-88492019',
    notes: 'Professional 1-Month License',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function getInvoices(brandIdFilter?: string): Invoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    let invoices: Invoice[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      invoices = DEFAULT_INVOICES;
      localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    }

    // Check overdue status dynamically
    const nowStr = new Date().toISOString().split('T')[0];
    let updated = false;
    invoices = invoices.map(inv => {
      if (inv.status === 'Pending' && inv.dueDate < nowStr) {
        updated = true;
        return { ...inv, status: 'Overdue' };
      }
      return inv;
    });

    if (updated) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    }

    if (brandIdFilter) {
      return invoices.filter(inv => inv.brandId === brandIdFilter);
    }
    return invoices;
  } catch (e) {
    console.error('Error reading invoices from localStorage:', e);
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving invoices:', e);
  }
}

export function getInvoiceById(id: string): Invoice | null {
  const invoices = getInvoices();
  return invoices.find(i => i.id === id) || null;
}

export function getPendingInvoiceForBrand(brandId: string): Invoice | null {
  const invoices = getInvoices(brandId);
  return invoices.find(i => i.status === 'Pending' || i.status === 'Overdue') || null;
}

export function generateInvoiceNumber(): string {
  const invoices = getInvoices();
  const count = invoices.length + 1;
  const year = new Date().getFullYear();
  const pad = String(count).padStart(3, '0');
  return `INV-${year}-${pad}`;
}

export function createInvoice(
  brandId: string,
  brandName: string,
  brandEmail: string,
  planName: 'Professional' | 'Starter' | 'Enterprise' = 'Professional',
  amount: number = 25000,
  notes: string = 'Professional Monthly Subscription'
): Invoice {
  const invoices = getInvoices();

  // If there's an existing pending invoice for this brand and plan, return it
  const existingPending = invoices.find(i => i.brandId === brandId && i.status === 'Pending' && i.planName === planName);
  if (existingPending) {
    return existingPending;
  }

  const now = new Date();
  const dueDateObj = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber: generateInvoiceNumber(),
    brandId,
    brandName,
    brandEmail,
    planName,
    amount,
    currency: 'NGN',
    status: 'Pending',
    invoiceDate: now.toISOString().split('T')[0],
    dueDate: dueDateObj.toISOString().split('T')[0],
    notes,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const updatedInvoices = [newInvoice, ...invoices];
  saveInvoices(updatedInvoices);

  // Background sync to Firestore
  syncInvoiceToFirestore(newInvoice).catch(err => console.warn('Firestore invoice sync error:', err));

  return newInvoice;
}

export function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status'],
  paymentProofRef?: string,
  paymentMethod: string = 'Bank Transfer'
): Invoice | null {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoiceId);
  if (index === -1) return null;

  const now = new Date();
  const target = invoices[index];

  const updatedInvoice: Invoice = {
    ...target,
    status,
    paymentProofRef: paymentProofRef || target.paymentProofRef,
    paymentMethod: paymentMethod || target.paymentMethod,
    paidAt: status === 'Paid' ? (target.paidAt || now.toISOString()) : target.paidAt,
    updatedAt: now.toISOString()
  };

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);

  syncInvoiceToFirestore(updatedInvoice).catch(err => console.warn('Firestore invoice update error:', err));

  return updatedInvoice;
}

export function markInvoiceAsPaid(
  invoiceId: string,
  paymentProofRef?: string,
  paymentMethod: string = 'Bank Transfer'
): { invoice: Invoice; brand: Brand } | null {
  const updatedInvoice = updateInvoiceStatus(invoiceId, 'Paid', paymentProofRef, paymentMethod);
  if (!updatedInvoice) return null;

  // Upgrade or extend the corresponding brand's subscription
  const currentBrand = getBrand();
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // If the invoice is for the active logged-in brand
  let updatedBrand: Brand = currentBrand;
  if (currentBrand.id === updatedInvoice.brandId || currentBrand.name === updatedInvoice.brandName) {
    updatedBrand = {
      ...currentBrand,
      plan: 'professional',
      subscriptionStartDate: now.toISOString(),
      subscriptionExpiry: expiry.toISOString(),
      qrUsedThisMonth: 0,
      paystackReference: updatedInvoice.invoiceNumber,
      paidAmount: updatedInvoice.amount,
      billingHistory: [
        ...(currentBrand.billingHistory || []),
        {
          id: updatedInvoice.id,
          date: now.toISOString().split('T')[0],
          amount: updatedInvoice.amount,
          planName: 'Professional',
          status: 'Paid'
        }
      ]
    };
    saveBrand(updatedBrand);
  }

  return { invoice: updatedInvoice, brand: updatedBrand };
}

// Sync single invoice to Firestore
export async function syncInvoiceToFirestore(invoice: Invoice): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'invoices', invoice.id), invoice, { merge: true });
  } catch (e) {
    console.warn('Error syncing invoice to Firestore:', e);
  }
}

// Fetch remote invoices from Firestore if available
export async function fetchInvoicesFirestore(): Promise<Invoice[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'invoices'));
    const remote: Invoice[] = [];
    snap.forEach(d => {
      if (d.exists()) {
        remote.push(d.data() as Invoice);
      }
    });
    return remote;
  } catch (e) {
    console.warn('Error fetching remote invoices:', e);
    return [];
  }
}
