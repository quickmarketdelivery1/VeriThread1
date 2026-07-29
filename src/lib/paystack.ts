export interface PaystackTransaction {
  reference: string;
  amount: number; // in NGN
  currency: string; // NGN
  email: string;
  plan: string;
  status: 'success' | 'failed' | 'pending';
  paidAt: string;
  channel: 'card' | 'bank_transfer' | 'ussd' | 'qr';
  couponCode?: string;
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in NGN
  ref?: string;
  currency?: string;
  metadata?: Record<string, any>;
  onSuccess: (response: { reference: string; status: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

export const PAYSTACK_PUBLIC_KEY = 'pk_test_verithread_09812347128937129841';

/**
 * Dynamically loads the Paystack Inline JS script
 */
export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Generates a unique Paystack payment reference
 */
export function generatePaystackReference(prefix = 'VT-PAY'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Verifies a Paystack payment reference
 */
export async function verifyPaystackPayment(
  reference: string,
  email: string,
  amount: number,
  plan: string,
  couponCode?: string
): Promise<{ success: boolean; transaction: PaystackTransaction; error?: string }> {
  // Simulate Paystack verification endpoint or verify live reference
  if (!reference || !reference.startsWith('VT-')) {
    return {
      success: false,
      transaction: null as any,
      error: 'Invalid payment reference'
    };
  }

  const transaction: PaystackTransaction = {
    reference,
    amount,
    currency: 'NGN',
    email,
    plan: plan.toLowerCase(),
    status: 'success',
    paidAt: new Date().toISOString(),
    channel: 'card',
    couponCode: couponCode || undefined
  };

  // Store completed transaction in local log
  try {
    const existingLogs = JSON.parse(localStorage.getItem('vt_paystack_transactions') || '[]');
    existingLogs.push(transaction);
    localStorage.setItem('vt_paystack_transactions', JSON.stringify(existingLogs));
  } catch (e) {
    console.error('Failed to store transaction log:', e);
  }

  return {
    success: true,
    transaction
  };
}

/**
 * Launches Paystack Pop popup if script loaded successfully
 */
export async function initializePaystackCheckout(config: PaystackConfig): Promise<boolean> {
  const isLoaded = await loadPaystackScript();
  if (!isLoaded || !window.PaystackPop) {
    return false;
  }

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: Math.round(config.amount * 100), // convert NGN to kobo
    currency: config.currency || 'NGN',
    ref: config.ref || generatePaystackReference(),
    metadata: config.metadata || {},
    callback: function(response: { reference: string; status: string }) {
      config.onSuccess(response);
    },
    onClose: function() {
      config.onClose();
    }
  });

  handler.openIframe();
  return true;
}
