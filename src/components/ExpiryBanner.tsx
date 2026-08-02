import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X, Sparkles, ArrowRight, BellRing } from 'lucide-react';
import { Brand } from '../types';
import { getExpiryReminderState, checkAndTriggerReminders, ExpiryReminderState } from '../lib/notifications';

interface ExpiryBannerProps {
  brand: Brand;
  onRenew: () => void;
}

export function ExpiryBanner({ brand, onRenew }: ExpiryBannerProps) {
  const [reminderState, setReminderState] = useState<ExpiryReminderState>(() => getExpiryReminderState(brand));
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(`vt_banner_dismissed_${brand.id}`) === 'true';
  });

  useEffect(() => {
    // Check and trigger reminder email in background
    checkAndTriggerReminders(brand).then((st) => {
      setReminderState(st);
    });
  }, [brand.id, brand.subscriptionExpiry, brand.plan]);

  if (!reminderState.shouldShowBanner || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`vt_banner_dismissed_${brand.id}`, 'true');
    }
  };

  const isExpired = reminderState.type === 'expired';

  return (
    <div
      className={`w-full px-4 py-3 rounded-2xl border mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans transition-all animate-fade-in ${
        isExpired
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : reminderState.type === '1day'
          ? 'bg-amber-50 border-amber-300 text-amber-950'
          : 'bg-amber-50/80 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
            isExpired
              ? 'bg-rose-100 text-rose-700'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isExpired ? (
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          ) : (
            <BellRing className="w-4 h-4 text-amber-700" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                isExpired
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-amber-200 text-amber-900'
              }`}
            >
              {isExpired ? 'Subscription Expired' : 'Renewal Reminder'}
            </span>
            {reminderState.emailSent && (
              <span className="text-[10px] text-gray-500 font-medium">
                · Email notification dispatched
              </span>
            )}
          </div>
          <p className="font-bold mt-0.5 text-xs">
            {reminderState.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={onRenew}
          className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
            isExpired
              ? 'bg-rose-700 hover:bg-rose-800'
              : 'bg-[#0F5132] hover:bg-[#145A32]'
          }`}
        >
          <span>Renew Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDismiss}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-all cursor-pointer"
          title="Dismiss notification for this session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
