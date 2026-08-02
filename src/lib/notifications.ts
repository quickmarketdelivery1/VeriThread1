import { Brand } from '../types';
import { checkSubscriptionExpiry, getBrand } from './storage';
import { sendSubscriptionReminderEmail } from './firebase';

export interface ExpiryReminderState {
  shouldShowBanner: boolean;
  type: '3day' | '1day' | 'expired' | 'none';
  message: string;
  daysRemaining: number;
  emailSent: boolean;
}

const REMINDER_SENT_KEY = 'vt_reminder_logs';

function getSentLogs(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REMINDER_SENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function markReminderSent(brandId: string, reminderType: string) {
  if (typeof window === 'undefined') return;
  try {
    const logs = getSentLogs();
    const key = `${brandId}_${reminderType}_${new Date().toISOString().split('T')[0]}`;
    logs[key] = new Date().toISOString();
    localStorage.setItem(REMINDER_SENT_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('Error saving reminder log:', e);
  }
}

function hasSentToday(brandId: string, reminderType: string): boolean {
  const logs = getSentLogs();
  const key = `${brandId}_${reminderType}_${new Date().toISOString().split('T')[0]}`;
  return !!logs[key];
}

export function getExpiryReminderState(brand: Brand): ExpiryReminderState {
  if (brand.plan === 'starter') {
    return {
      shouldShowBanner: false,
      type: 'none',
      message: '',
      daysRemaining: Infinity,
      emailSent: false
    };
  }

  const { isExpired, daysRemaining } = checkSubscriptionExpiry(brand);

  if (isExpired) {
    return {
      shouldShowBanner: true,
      type: 'expired',
      message: 'Your Professional plan has expired. Renew now to continue generating QR codes.',
      daysRemaining,
      emailSent: hasSentToday(brand.id, 'expired')
    };
  }

  if (daysRemaining <= 1) {
    return {
      shouldShowBanner: true,
      type: '1day',
      message: 'Your Professional plan expires tomorrow. Renew now to keep your Pro features.',
      daysRemaining,
      emailSent: hasSentToday(brand.id, '1day')
    };
  }

  if (daysRemaining <= 3) {
    return {
      shouldShowBanner: true,
      type: '3day',
      message: `Your Professional plan expires in ${daysRemaining} days. Renew now to avoid interruption.`,
      daysRemaining,
      emailSent: hasSentToday(brand.id, '3day')
    };
  }

  return {
    shouldShowBanner: false,
    type: 'none',
    message: '',
    daysRemaining,
    emailSent: false
  };
}

export async function checkAndTriggerReminders(brand: Brand): Promise<ExpiryReminderState> {
  const state = getExpiryReminderState(brand);

  if (state.shouldShowBanner && state.type !== 'none' && !state.emailSent) {
    const email = brand.supportEmail || 'billing@verithread.com';
    try {
      await sendSubscriptionReminderEmail(
        email,
        brand.name,
        state.daysRemaining
      );
      markReminderSent(brand.id, state.type);
      state.emailSent = true;
    } catch (e) {
      console.warn('Failed to send subscription reminder email:', e);
    }
  }

  return state;
}
